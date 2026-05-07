import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, XCircle, Mail, Instagram, LogOut, Trash2, ExternalLink, ChevronDown, ChevronUp, Package, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ADMIN_EMAIL = 'hello@wellinder.co.kr';

const SPEAKER_LABELS = {
  brand_pro: 'Brand professional (K-beauty creator collab)',
  collab_creator: 'Creator with brand partnership experience',
  shortform_creator: 'Short-form content creator (Reels, TikTok)',
  hook_creator: 'Content planning & hooks creator',
  sea_marketer: 'Singapore & SEA market marketer',
  actionable_speaker: 'Actionable advice for early-stage creators',
  other: 'Other',
};

const statusColors = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
};

const statusLabels = {
  pending: 'Pending',
  approved: 'Approved',
  rejected: 'Rejected',
};

export default function AdminPage() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [activeTab, setActiveTab] = useState('applications');

  // Applications
  const [applications, setApplications] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [filter, setFilter] = useState('pending');
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);

  // Lounge posts
  const [posts, setPosts] = useState([]);
  const [postsLoading, setPostsLoading] = useState(false);
  const [postForm, setPostForm] = useState({ title: '', content: '', type: 'required', link: '', deadline: '' });
  const [postSubmitting, setPostSubmitting] = useState(false);
  const [deletingPost, setDeletingPost] = useState(null);

  // Video submissions
  const [videoSubmissions, setVideoSubmissions] = useState([]);
  const [videoSubmissionsLoading, setVideoSubmissionsLoading] = useState(false);

  // Creators
  const [creators, setCreators] = useState([]);
  const [creatorsLoading, setCreatorsLoading] = useState(false);
  const [expandedCreator, setExpandedCreator] = useState(null);
  const [resendLoading, setResendLoading] = useState(null);

  // Shipping
  const [shippingList, setShippingList] = useState([]);
  const [shippingLoading, setShippingLoading] = useState(false);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (session?.user?.email !== ADMIN_EMAIL) return;

    fetchApplications();
    fetchPosts();
    fetchVideoSubmissions();
    fetchCreators();
    fetchShipping();

    const channel = supabase
      .channel('admin-applications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'applications' }, () => {
        fetchApplications();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [session]);

  const fetchApplications = async () => {
    setDataLoading(true);
    const { data: { session: s } } = await supabase.auth.getSession();
    const res = await fetch(
      `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/get-applications`,
      {
        headers: {
          'Authorization': `Bearer ${s.access_token}`,
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
        },
      }
    );
    const json = await res.json();
    setApplications(json.data || []);
    setDataLoading(false);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError('이메일 또는 비밀번호가 올바르지 않아요.');
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const fetchCreators = async () => {
    setCreatorsLoading(true);
    const [appsRes, invitesRes, profilesRes] = await Promise.all([
      supabase.from('applications').select('*').eq('status', 'approved').order('created_at', { ascending: false }),
      supabase.from('invites').select('email, consented_at, used_at'),
      supabase.from('creator_profiles').select('*'),
    ]);
    const inviteMap = {};
    (invitesRes.data || []).forEach(inv => { inviteMap[inv.email] = inv; });
    const profileMap = {};
    (profilesRes.data || []).forEach(p => { if (p.email) profileMap[p.email] = p; });
    const list = (appsRes.data || []).map(app => ({
      ...app,
      invite: inviteMap[app.email] || null,
      profile: profileMap[app.email] || null,
    }));
    setCreators(list);
    setCreatorsLoading(false);
  };

  const fetchShipping = async () => {
    setShippingLoading(true);
    const { data } = await supabase
      .from('shipping_info')
      .select('*')
      .order('submitted_at', { ascending: false });
    setShippingList(data || []);
    setShippingLoading(false);
  };

  const fetchVideoSubmissions = async () => {
    setVideoSubmissionsLoading(true);
    const { data } = await supabase
      .from('video_submissions')
      .select('*, lounge_posts(title, type)')
      .order('submitted_at', { ascending: false });
    setVideoSubmissions(data || []);
    setVideoSubmissionsLoading(false);
  };

  const fetchPosts = async () => {
    setPostsLoading(true);
    const { data } = await supabase.from('lounge_posts').select('*').order('created_at', { ascending: false });
    setPosts(data || []);
    setPostsLoading(false);
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postForm.title.trim()) return;
    setPostSubmitting(true);
    await supabase.from('lounge_posts').insert([{
      title: postForm.title.trim(),
      content: postForm.content.trim() || null,
      type: postForm.type,
      link: postForm.link.trim() || null,
      deadline: postForm.deadline || null,
    }]);
    setPostForm({ title: '', content: '', type: 'required', link: '', deadline: '' });
    setPostSubmitting(false);
    fetchPosts();
    showToast('Post created');
  };

  const handleDeletePost = async (postId) => {
    setDeletingPost(postId);
    await supabase.from('lounge_posts').delete().eq('id', postId);
    setPosts(prev => prev.filter(p => p.id !== postId));
    setDeletingPost(null);
    showToast('Post deleted');
  };

  const handleResendInvite = async (creator) => {
    setResendLoading(creator.id);
    try {
      const { data: { session: freshSession } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/resend-invite`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${freshSession.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ application_id: creator.id }),
        }
      );
      if (!res.ok) throw new Error(`${res.status}`);
      showToast(`Invite resent to ${creator.email}`);
      fetchCreators();
    } catch {
      showToast('Failed to resend. Try again.', 'error');
    }
    setResendLoading(null);
  };

  const handleAction = async (app, action) => {
    setActionLoading(app.id);
    try {
      const { data: { session: freshSession } } = await supabase.auth.getSession();
      const res = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/handle-application`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${freshSession.access_token}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ application_id: app.id, action }),
        }
      );
      if (!res.ok) throw new Error(`${res.status}`);
      showToast(action === 'approved'
        ? `✓ Approved & email sent to ${app.email}`
        : `✕ Rejected & email sent to ${app.email}`
      );
      fetchApplications();
    } catch {
      showToast('Something went wrong. Try again.', 'error');
    }
    setActionLoading(null);
  };

  // 로딩
  if (loading) {
    return (
      <div className="min-h-screen bg-wellinder-cream flex items-center justify-center">
        <p className="text-wellinder-dark/40 text-sm">Loading...</p>
      </div>
    );
  }

  // 비로그인
  if (!session) {
    return (
      <div className="min-h-screen bg-wellinder-cream flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-10 w-full max-w-sm shadow-xl border border-wellinder-dark/5"
        >
          <div className="text-center mb-8">
            <p className="text-[10px] uppercase tracking-[0.3em] text-wellinder-dark/40 font-semibold mb-2">Wellinder</p>
            <h1 className="text-2xl font-serif italic text-wellinder-dark">Admin</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-3" autoComplete="off">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="username"
              className="w-full border border-wellinder-dark/10 rounded-2xl py-4 px-5 outline-none focus:border-wellinder-dark transition-colors text-wellinder-dark placeholder:text-wellinder-dark/30"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
              className="w-full border border-wellinder-dark/10 rounded-2xl py-4 px-5 outline-none focus:border-wellinder-dark transition-colors text-wellinder-dark placeholder:text-wellinder-dark/30"
            />
            {authError && <p className="text-red-500 text-xs text-center">{authError}</p>}
            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-wellinder-dark text-white py-4 rounded-full font-semibold disabled:opacity-50"
            >
              {authLoading ? 'Signing in...' : 'Enter'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // 로그인했지만 어드민 아닌 경우
  if (session.user.email !== ADMIN_EMAIL) {
    return (
      <div className="min-h-screen bg-wellinder-cream flex items-center justify-center px-6">
        <div className="text-center">
          <p className="text-wellinder-dark/50 mb-4">Access denied.</p>
          <button onClick={handleLogout} className="text-sm text-wellinder-dark/30 hover:text-wellinder-dark transition-colors">
            Sign out
          </button>
        </div>
      </div>
    );
  }

  const filtered = applications.filter(a => (a.status ?? 'pending') === filter);
  const counts = {
    pending: applications.filter(a => (a.status ?? 'pending') === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-wellinder-cream pt-8 pb-20 px-6">
      <div className="max-w-4xl mx-auto">

        <div className="flex items-end justify-between mb-8">
          <div>
            <p className="text-[11px] uppercase tracking-[0.3em] text-wellinder-dark/40 font-semibold mb-1">Wellinder Creators</p>
            <h1 className="text-3xl font-serif italic text-wellinder-dark">Admin</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-wellinder-dark/30 hover:text-wellinder-dark text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" /> Sign out
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          {[
            { key: 'applications', label: 'Applications' },
            { key: 'creators', label: `Creators${creators.length > 0 ? ` (${creators.length})` : ''}` },
            { key: 'shipping', label: `Shipping${shippingList.length > 0 ? ` (${shippingList.length})` : ''}` },
            { key: 'videos', label: `Videos${videoSubmissions.length > 0 ? ` (${videoSubmissions.length})` : ''}` },
            { key: 'lounge', label: 'Lounge Posts' },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                activeTab === tab.key ? 'bg-wellinder-dark text-white' : 'bg-white text-wellinder-dark/50 border border-wellinder-dark/10 hover:border-wellinder-dark/30'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Applications Tab ── */}
        {activeTab === 'applications' && (<>
        <div className="grid grid-cols-3 gap-4 mb-8">
          {Object.entries(counts).map(([status, count]) => (
            <div key={status} className="bg-white rounded-2xl p-5 border border-wellinder-dark/5">
              <p className="text-3xl font-serif text-wellinder-dark">{count}</p>
              <p className="text-[10px] uppercase tracking-widest font-bold text-wellinder-dark/40 mt-1">{statusLabels[status]}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2 mb-6">
          {['pending', 'approved', 'rejected'].map(s => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-all ${
                filter === s
                  ? 'bg-wellinder-dark text-white'
                  : 'bg-white text-wellinder-dark/50 border border-wellinder-dark/10 hover:border-wellinder-dark/30'
              }`}
            >
              {statusLabels[s]} {counts[s] > 0 && `(${counts[s]})`}
            </button>
          ))}
        </div>

        {dataLoading ? (
          <p className="text-center text-wellinder-dark/40 py-20">Loading...</p>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-wellinder-dark/30">
            <p className="text-lg font-serif italic">No {filter} applications</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(app => (
              <motion.div
                key={app.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl p-6 border border-wellinder-dark/5 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="font-serif text-lg text-wellinder-dark">{app.full_name}</h3>
                      <span className={`text-[10px] px-3 py-1 rounded-full border font-bold uppercase tracking-widest ${statusColors[app.status]}`}>
                        {statusLabels[app.status]}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-wellinder-dark/60">
                      <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" />{app.email}</span>
                      <span className="flex items-center gap-1.5"><Instagram className="w-3.5 h-3.5" />{app.instagram_handle}</span>
                      {app.tiktok_handle && <span className="text-wellinder-dark/40">TikTok: {app.tiktok_handle}</span>}
                      <span className="text-wellinder-dark/30">{app.country}</span>
                    </div>
                    <p className="text-[11px] text-wellinder-dark/30 mt-2">
                      {new Date(app.created_at).toLocaleDateString('en-SG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {(app.status === 'pending' || app.status === null) && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleAction(app, 'approved')}
                        disabled={actionLoading === app.id}
                        className="flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-full text-sm font-medium hover:bg-green-100 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" /> Approve
                      </button>
                      <button
                        onClick={() => handleAction(app, 'rejected')}
                        disabled={actionLoading === app.id}
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-full text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" /> Reject
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
        </>)}

        {/* ── Creators Tab ── */}
        {activeTab === 'creators' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-wellinder-dark/40">
                {creators.length} creator{creators.length !== 1 ? 's' : ''}
              </p>
              <button onClick={fetchCreators} className="text-xs text-wellinder-dark/40 hover:text-wellinder-dark transition-colors">Refresh</button>
            </div>
            {creatorsLoading ? (
              <p className="text-center text-wellinder-dark/40 py-10">Loading...</p>
            ) : creators.length === 0 ? (
              <div className="text-center py-16 text-wellinder-dark/30">
                <p className="font-serif italic">No approved creators yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {creators.map(c => {
                  const isExpanded = expandedCreator === c.id;
                  const signedUp = !!c.invite?.used_at;
                  return (
                    <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="bg-white rounded-2xl border border-wellinder-dark/5 overflow-hidden">
                      {/* Header row */}
                      <div className="p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-serif text-wellinder-dark">{c.full_name}</h3>
                              <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest flex-shrink-0 ${
                                signedUp ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'
                              }`}>
                                {signedUp ? 'Signed up' : 'Invited'}
                              </span>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-wellinder-dark/50 mt-1">
                              <span className="flex items-center gap-1"><Mail className="w-3 h-3" />{c.email}</span>
                              <span className="flex items-center gap-1"><Instagram className="w-3 h-3" />{c.instagram_handle}</span>
                              {c.tiktok_handle && <span>TikTok: {c.tiktok_handle}</span>}
                              <span className="text-wellinder-dark/30">{c.country}</span>
                            </div>
                            <div className="flex flex-wrap gap-x-4 gap-y-0.5 mt-2 text-[11px] text-wellinder-dark/30">
                              <span>Applied: {new Date(c.created_at).toLocaleDateString('en-SG', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              {c.invite?.consented_at && (
                                <span>Consented: {new Date(c.invite.consented_at).toLocaleDateString('en-SG', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              )}
                              {c.invite?.used_at && (
                                <span>Signed up: {new Date(c.invite.used_at).toLocaleDateString('en-SG', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            {!signedUp && (
                              <button
                                onClick={() => handleResendInvite(c)}
                                disabled={resendLoading === c.id}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-xs font-medium hover:bg-blue-100 transition-colors disabled:opacity-50"
                              >
                                <Mail className="w-3.5 h-3.5" />
                                {resendLoading === c.id ? 'Sending...' : 'Resend Invite'}
                              </button>
                            )}
                            {c.profile && (
                              <button
                                onClick={() => setExpandedCreator(isExpanded ? null : c.id)}
                                className="p-2 text-wellinder-dark/30 hover:text-wellinder-dark transition-colors"
                              >
                                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                      {/* Survey accordion */}
                      {isExpanded && c.profile && (
                        <div className="border-t border-wellinder-dark/5 px-5 py-4 bg-wellinder-dark/[0.02] space-y-4">
                          <div>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-wellinder-dark/40 mb-2">A. Why did you join?</p>
                            {c.profile.survey_a_reasons?.length > 0 ? (
                              <ul className="space-y-1">
                                {c.profile.survey_a_reasons.map((r, i) => (
                                  <li key={i} className="text-xs text-wellinder-dark/70 flex items-start gap-1.5">
                                    <span className="text-wellinder-dark/30 flex-shrink-0 mt-0.5">·</span>{r}
                                  </li>
                                ))}
                              </ul>
                            ) : <p className="text-xs text-wellinder-dark/30">—</p>}
                            {c.profile.survey_a_other && (
                              <p className="text-xs text-wellinder-dark/50 mt-1.5 italic">"{c.profile.survey_a_other}"</p>
                            )}
                          </div>
                          <div>
                            <p className="text-[10px] uppercase tracking-widest font-bold text-wellinder-dark/40 mb-2">B. 8-week goals</p>
                            {c.profile.survey_b_goals?.length > 0 ? (
                              <ul className="space-y-1">
                                {c.profile.survey_b_goals.map((g, i) => (
                                  <li key={i} className="text-xs text-wellinder-dark/70 flex items-start gap-1.5">
                                    <span className="text-wellinder-dark/30 flex-shrink-0 mt-0.5">·</span>{g}
                                  </li>
                                ))}
                              </ul>
                            ) : <p className="text-xs text-wellinder-dark/30">—</p>}
                            {c.profile.survey_b_other && (
                              <p className="text-xs text-wellinder-dark/50 mt-1.5 italic">"{c.profile.survey_b_other}"</p>
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Shipping Tab ── */}
        {activeTab === 'shipping' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-wellinder-dark/40">
                {shippingList.length} submission{shippingList.length !== 1 ? 's' : ''}
              </p>
              <button onClick={fetchShipping} className="text-xs text-wellinder-dark/40 hover:text-wellinder-dark transition-colors">Refresh</button>
            </div>
            {shippingLoading ? (
              <p className="text-center text-wellinder-dark/40 py-10">Loading...</p>
            ) : shippingList.length === 0 ? (
              <div className="text-center py-16 text-wellinder-dark/30">
                <p className="font-serif italic">No shipping info submitted yet.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {shippingList.map(s => (
                  <motion.div key={s.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-white rounded-2xl p-5 border border-wellinder-dark/5">
                    <div className="flex items-start gap-3 mb-4">
                      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-wellinder-dark/5 flex items-center justify-center">
                        <Package className="w-4 h-4 text-wellinder-dark/40" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-wellinder-dark">{s.recipient_name}</p>
                        {s.email && <p className="text-xs text-wellinder-dark/40 mt-0.5">{s.email}</p>}
                        <p className="text-[11px] text-wellinder-dark/30 mt-0.5">
                          {new Date(s.submitted_at).toLocaleDateString('en-SG', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm text-wellinder-dark/70">
                      <div className="bg-wellinder-dark/[0.02] rounded-xl px-4 py-3">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-wellinder-dark/30 mb-1">Address</p>
                        <p className="text-sm text-wellinder-dark/80 leading-relaxed">{s.address}</p>
                      </div>
                      <div className="bg-wellinder-dark/[0.02] rounded-xl px-4 py-3">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-wellinder-dark/30 mb-1">Phone</p>
                        <p className="text-sm text-wellinder-dark/80">{s.phone}</p>
                      </div>
                    </div>
                    {s.speaker_preferences?.length > 0 && (
                      <div className="mt-3">
                        <p className="text-[10px] uppercase tracking-widest font-bold text-wellinder-dark/30 mb-2">Speaker Preferences</p>
                        <div className="flex flex-wrap gap-1.5">
                          {s.speaker_preferences.map(pref => (
                            <span key={pref} className="text-[10px] px-2.5 py-1 bg-wellinder-dark/5 text-wellinder-dark/60 rounded-full">
                              {SPEAKER_LABELS[pref] || pref}
                            </span>
                          ))}
                        </div>
                        {s.speaker_other && (
                          <p className="text-xs text-wellinder-dark/50 mt-2 italic">"{s.speaker_other}"</p>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Video Submissions Tab ── */}
        {activeTab === 'videos' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-wellinder-dark/40">
                {videoSubmissions.length} submission{videoSubmissions.length !== 1 ? 's' : ''}
              </p>
              <button onClick={fetchVideoSubmissions}
                className="text-xs text-wellinder-dark/40 hover:text-wellinder-dark transition-colors">
                Refresh
              </button>
            </div>
            {videoSubmissionsLoading ? (
              <p className="text-center text-wellinder-dark/40 py-10">Loading...</p>
            ) : videoSubmissions.length === 0 ? (
              <div className="text-center py-16 text-wellinder-dark/30">
                <p className="font-serif italic">No submissions yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {videoSubmissions.map(sub => (
                  <motion.div key={sub.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-white rounded-2xl p-5 border border-wellinder-dark/5">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <p className="text-sm font-medium text-wellinder-dark">{sub.user_email}</p>
                        <p className="text-xs text-wellinder-dark/40 mt-0.5">
                          {new Date(sub.submitted_at).toLocaleDateString('en-SG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {sub.lounge_posts && (
                        <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest bg-blue-50 text-blue-600 flex-shrink-0">
                          {sub.lounge_posts.type}
                        </span>
                      )}
                    </div>
                    {sub.lounge_posts && (
                      <p className="text-xs text-wellinder-dark/60 mb-2 font-medium">{sub.lounge_posts.title}</p>
                    )}
                    <a href={sub.video_url} target="_blank" rel="noopener noreferrer"
                      className="text-xs text-wellinder-dark hover:opacity-70 transition-opacity break-all flex items-start gap-1.5">
                      <ExternalLink className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                      {sub.video_url}
                    </a>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Lounge Posts Tab ── */}
        {activeTab === 'lounge' && (
          <div>
            <form onSubmit={handleCreatePost} className="bg-white rounded-2xl border border-wellinder-dark/5 p-6 mb-6 space-y-3">
              <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-wellinder-dark/40 mb-2">New Post</p>
              <input type="text" placeholder="Title *" value={postForm.title} onChange={e => setPostForm(p => ({ ...p, title: e.target.value }))} required
                className="w-full border border-wellinder-dark/10 rounded-2xl py-3 px-4 text-sm outline-none focus:border-wellinder-dark transition-colors placeholder:text-wellinder-dark/30" />
              <textarea placeholder="Description (optional)" value={postForm.content} onChange={e => setPostForm(p => ({ ...p, content: e.target.value }))} rows={3}
                className="w-full border border-wellinder-dark/10 rounded-2xl py-3 px-4 text-sm outline-none focus:border-wellinder-dark transition-colors placeholder:text-wellinder-dark/30 resize-none" />
              <div className="grid grid-cols-2 gap-3">
                <select value={postForm.type} onChange={e => setPostForm(p => ({ ...p, type: e.target.value }))}
                  className="border border-wellinder-dark/10 rounded-2xl py-3 px-4 text-sm outline-none focus:border-wellinder-dark transition-colors bg-white text-wellinder-dark">
                  <option value="required">Required Mission</option>
                  <option value="optional">Optional Upload</option>
                  <option value="session">Expert Session</option>
                  <option value="webinar">Webinar</option>
                  <option value="announcement">Announcement</option>
                </select>
                <input type="datetime-local" value={postForm.deadline} onChange={e => setPostForm(p => ({ ...p, deadline: e.target.value }))}
                  className="border border-wellinder-dark/10 rounded-2xl py-3 px-4 text-sm outline-none focus:border-wellinder-dark transition-colors text-wellinder-dark" />
              </div>
              <input type="url" placeholder="Link (content guide, session URL...)" value={postForm.link} onChange={e => setPostForm(p => ({ ...p, link: e.target.value }))}
                className="w-full border border-wellinder-dark/10 rounded-2xl py-3 px-4 text-sm outline-none focus:border-wellinder-dark transition-colors placeholder:text-wellinder-dark/30" />
              <button type="submit" disabled={postSubmitting || !postForm.title.trim()}
                className="w-full bg-wellinder-dark text-white py-3 rounded-full text-sm font-semibold disabled:opacity-40 transition-opacity">
                {postSubmitting ? 'Creating...' : 'Create Post'}
              </button>
            </form>

            {postsLoading ? (
              <p className="text-center text-wellinder-dark/40 py-10">Loading...</p>
            ) : posts.length === 0 ? (
              <div className="text-center py-16 text-wellinder-dark/30">
                <p className="font-serif italic">No posts yet.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {posts.map(post => (
                  <motion.div key={post.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="bg-white rounded-2xl p-5 border border-wellinder-dark/5 flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-widest ${
                          post.type === 'required' || post.type === 'mission' ? 'bg-blue-50 text-blue-600'
                          : post.type === 'optional' ? 'bg-purple-50 text-purple-600'
                          : post.type === 'session' ? 'bg-amber-50 text-amber-600'
                          : post.type === 'webinar' ? 'bg-green-50 text-green-600'
                          : 'bg-wellinder-dark/5 text-wellinder-dark/50'
                        }`}>{post.type}</span>
                        {post.deadline && (
                          <span className={`text-[10px] font-medium ${new Date(post.deadline) < new Date() ? 'text-red-400' : 'text-wellinder-dark/40'}`}>
                            {new Date(post.deadline).toLocaleDateString('en-SG', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-wellinder-dark truncate">{post.title}</p>
                      {post.content && <p className="text-xs text-wellinder-dark/50 mt-0.5 truncate">{post.content}</p>}
                    </div>
                    <button onClick={() => handleDeletePost(post.id)} disabled={deletingPost === post.id}
                      className="flex-shrink-0 p-2 text-wellinder-dark/20 hover:text-red-500 transition-colors disabled:opacity-30">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 rounded-full text-sm font-medium shadow-xl ${
            toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-wellinder-dark text-white'
          }`}
        >
          {toast.msg}
        </motion.div>
      )}
    </div>
  );
}
