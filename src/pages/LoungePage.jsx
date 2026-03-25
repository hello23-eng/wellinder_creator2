import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LogOut, ExternalLink, Bell, Target, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function LoungePage() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isApproved, setIsApproved] = useState(false);

  // 로그인 폼
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // 라운지 콘텐츠
  const [posts, setPosts] = useState([]);
  const [participated, setParticipated] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    checkApproval();
    fetchPosts();
    fetchParticipations();
  }, [session]);

  const checkApproval = async () => {
    const { data } = await supabase
      .from('applications')
      .select('status')
      .eq('email', session.user.email)
      .single();
    setIsApproved(data?.status === 'approved');
  };

  const fetchPosts = async () => {
    const { data } = await supabase
      .from('lounge_posts')
      .select('*')
      .order('created_at', { ascending: false });
    setPosts(data || []);
  };

  const fetchParticipations = async () => {
    const { data } = await supabase
      .from('mission_participations')
      .select('post_id')
      .eq('user_id', session.user.id);
    setParticipated((data || []).map(d => d.post_id));
  };

  const handleParticipate = async (postId) => {
    if (participated.includes(postId)) return;
    await supabase.from('mission_participations').insert([{
      user_id: session.user.id,
      post_id: postId,
    }]);
    setParticipated(prev => [...prev, postId]);
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
    setIsApproved(false);
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
            <p className="text-[10px] uppercase tracking-[0.3em] text-wellinder-dark/40 font-semibold mb-2">Members Only</p>
            <h1 className="text-2xl font-serif italic text-wellinder-dark">The Lounge</h1>
            <p className="text-wellinder-dark/40 text-sm mt-2">Wellinder Creators</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="w-full border border-wellinder-dark/10 rounded-2xl py-4 px-5 outline-none focus:border-wellinder-dark transition-colors text-wellinder-dark placeholder:text-wellinder-dark/30"
            />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full border border-wellinder-dark/10 rounded-2xl py-4 px-5 outline-none focus:border-wellinder-dark transition-colors text-wellinder-dark placeholder:text-wellinder-dark/30"
            />
            {authError && <p className="text-red-500 text-xs text-center">{authError}</p>}
            <button
              type="submit"
              disabled={authLoading}
              className="w-full bg-wellinder-dark text-white py-4 rounded-full font-semibold tracking-wide disabled:opacity-50"
            >
              {authLoading ? 'Signing in...' : 'Enter the Lounge'}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // 로그인은 됐지만 승인 안 된 경우
  if (!isApproved) {
    return (
      <div className="min-h-screen bg-wellinder-cream flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center max-w-sm"
        >
          <p className="text-4xl mb-6">✦</p>
          <h2 className="text-2xl font-serif italic text-wellinder-dark mb-3">Access Pending</h2>
          <p className="text-wellinder-dark/50 text-sm leading-relaxed">
            Your application is still being reviewed. We'll reach out via email once you're approved.
          </p>
          <button
            onClick={handleLogout}
            className="mt-8 text-wellinder-dark/30 hover:text-wellinder-dark text-sm transition-colors"
          >
            Sign out
          </button>
        </motion.div>
      </div>
    );
  }

  const missions = posts.filter(p => p.type === 'mission');
  const announcements = posts.filter(p => p.type === 'announcement');

  // 라운지 메인
  return (
    <div className="min-h-screen bg-wellinder-cream pt-24 pb-20 px-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between mb-12">
          <div>
            <p className="text-[10px] uppercase tracking-[0.3em] text-wellinder-dark/40 font-semibold mb-1">Welcome back</p>
            <h1 className="text-3xl font-serif italic text-wellinder-dark">The Lounge</h1>
            <p className="text-wellinder-dark/40 text-xs mt-1">{session.user.email}</p>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-wellinder-dark/30 hover:text-wellinder-dark text-sm transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Sign out
          </button>
        </div>

        {/* Announcements */}
        {announcements.length > 0 && (
          <section className="mb-10">
            <div className="flex items-center gap-2 mb-4">
              <Bell className="w-4 h-4 text-wellinder-dark/50" />
              <h2 className="text-xs uppercase tracking-widest font-bold text-wellinder-dark/50">Announcements</h2>
            </div>
            <div className="space-y-3">
              {announcements.map(post => (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-2xl p-5 border border-wellinder-dark/5"
                >
                  <h3 className="font-serif text-wellinder-dark mb-1">{post.title}</h3>
                  {post.content && <p className="text-wellinder-dark/60 text-sm leading-relaxed">{post.content}</p>}
                  {post.link && (
                    <a href={post.link} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 mt-3 text-xs font-medium text-wellinder-dark hover:opacity-70 transition-opacity"
                    >
                      <ExternalLink className="w-3.5 h-3.5" /> View Details
                    </a>
                  )}
                </motion.div>
              ))}
            </div>
          </section>
        )}

        {/* Missions */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Target className="w-4 h-4 text-wellinder-dark/50" />
            <h2 className="text-xs uppercase tracking-widest font-bold text-wellinder-dark/50">Active Missions</h2>
          </div>
          {missions.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-wellinder-dark/5">
              <p className="text-wellinder-dark/30 font-serif italic">New missions coming soon.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {missions.map(post => {
                const done = participated.includes(post.id);
                const isExpired = post.deadline && new Date(post.deadline) < new Date();
                return (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-6 border border-wellinder-dark/5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-serif text-wellinder-dark mb-1">{post.title}</h3>
                        {post.content && <p className="text-wellinder-dark/60 text-sm leading-relaxed mb-3">{post.content}</p>}
                        <div className="flex flex-wrap items-center gap-3">
                          {post.link && (
                            <a href={post.link} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-wellinder-dark hover:opacity-70 transition-opacity"
                            >
                              <ExternalLink className="w-3.5 h-3.5" /> Mission Link
                            </a>
                          )}
                          {post.deadline && (
                            <span className={`text-[10px] uppercase tracking-widest font-bold ${isExpired ? 'text-red-400' : 'text-wellinder-dark/30'}`}>
                              {isExpired ? 'Closed' : `Due ${new Date(post.deadline).toLocaleDateString('en-SG', { month: 'short', day: 'numeric' })}`}
                            </span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => !done && !isExpired && handleParticipate(post.id)}
                        disabled={done || isExpired}
                        className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                          done
                            ? 'bg-green-50 text-green-600 border border-green-200'
                            : isExpired
                            ? 'bg-wellinder-dark/5 text-wellinder-dark/30 cursor-not-allowed'
                            : 'bg-wellinder-dark text-white hover:bg-wellinder-dark/80'
                        }`}
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        {done ? 'Done' : 'Participate'}
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
