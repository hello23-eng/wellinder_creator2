import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { CheckCircle, XCircle, Clock, Mail, Instagram } from 'lucide-react';
import { supabase } from '../lib/supabase';

const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'wellinder2025';

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
  const [authed, setAuthed] = useState(false);
  const [pw, setPw] = useState('');
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState('pending');
  const [actionLoading, setActionLoading] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchApplications = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });
    setApplications(data || []);
    setLoading(false);
  };

  useEffect(() => {
    if (authed) fetchApplications();
  }, [authed]);

  const handleAction = async (app, action) => {
    setActionLoading(app.id);
    try {
      const { error } = await supabase.functions.invoke('handle-application', {
        body: { application_id: app.id, action },
      });
      if (error) throw error;
      showToast(action === 'approved' ? `✓ Approved & email sent to ${app.email}` : `✕ Rejected & email sent to ${app.email}`);
      fetchApplications();
    } catch (e) {
      showToast('Something went wrong. Try again.', 'error');
    }
    setActionLoading(null);
  };

  if (!authed) {
    return (
      <div className="min-h-screen bg-wellinder-cream flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-10 w-full max-w-sm shadow-xl border border-wellinder-dark/5"
        >
          <h1 className="text-2xl font-serif text-wellinder-dark mb-2">Admin</h1>
          <p className="text-wellinder-dark/40 text-sm mb-8">Wellinder Creators Dashboard</p>
          <input
            type="password"
            placeholder="Password"
            value={pw}
            onChange={e => setPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && pw === ADMIN_PASSWORD && setAuthed(true)}
            className="w-full border border-wellinder-dark/10 rounded-2xl py-4 px-5 outline-none focus:border-wellinder-dark transition-colors mb-4 text-wellinder-dark"
          />
          <button
            onClick={() => pw === ADMIN_PASSWORD ? setAuthed(true) : showToast('Wrong password', 'error')}
            className="w-full bg-wellinder-dark text-white py-4 rounded-full font-semibold"
          >
            Enter
          </button>
          {toast && <p className="text-red-500 text-sm text-center mt-4">{toast.msg}</p>}
        </motion.div>
      </div>
    );
  }

  const filtered = applications.filter(a => a.status === filter);

  const counts = {
    pending: applications.filter(a => a.status === 'pending').length,
    approved: applications.filter(a => a.status === 'approved').length,
    rejected: applications.filter(a => a.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen bg-wellinder-cream pt-8 pb-20 px-6">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <p className="text-[11px] uppercase tracking-[0.3em] text-wellinder-dark/40 font-semibold mb-1">Wellinder Creators</p>
          <h1 className="text-3xl font-serif italic text-wellinder-dark">Applications</h1>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {Object.entries(counts).map(([status, count]) => (
            <div key={status} className="bg-white rounded-2xl p-5 border border-wellinder-dark/5">
              <p className="text-3xl font-serif text-wellinder-dark">{count}</p>
              <p className="text-[10px] uppercase tracking-widest font-bold text-wellinder-dark/40 mt-1">{statusLabels[status]}</p>
            </div>
          ))}
        </div>

        {/* Filter Tabs */}
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

        {/* Applications List */}
        {loading ? (
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
                      <span className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" />
                        {app.email}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Instagram className="w-3.5 h-3.5" />
                        {app.instagram}
                      </span>
                      {app.tiktok && (
                        <span className="text-wellinder-dark/40">TikTok: {app.tiktok}</span>
                      )}
                      <span className="text-wellinder-dark/30">{app.country}</span>
                    </div>
                    <p className="text-[11px] text-wellinder-dark/30 mt-2">
                      {new Date(app.created_at).toLocaleDateString('en-SG', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>

                  {app.status === 'pending' && (
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => handleAction(app, 'approved')}
                        disabled={actionLoading === app.id}
                        className="flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 border border-green-200 rounded-full text-sm font-medium hover:bg-green-100 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="w-4 h-4" />
                        Approve
                      </button>
                      <button
                        onClick={() => handleAction(app, 'rejected')}
                        disabled={actionLoading === app.id}
                        className="flex items-center gap-1.5 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-full text-sm font-medium hover:bg-red-100 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
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
