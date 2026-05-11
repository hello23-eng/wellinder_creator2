import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export default function AdminResetPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const isAdmin = location.state?.isAdmin ?? true;

  useEffect(() => {
    if (!location.state?.fromRecovery) {
      navigate(isAdmin ? '/admin' : '/lounge');
      return;
    }

    // 이미 복구 세션이 있으면 바로 준비
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') && session) {
        setReady(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError('Something went wrong: ' + updateError.message);
      return;
    }

    setDone(true);
    setTimeout(() => navigate(isAdmin ? '/admin' : '/lounge'), 2000);
  };

  if (done) {
    return (
      <div className="min-h-screen bg-wellinder-cream flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <p className="text-4xl mb-4">✓</p>
          <h2 className="text-xl font-serif italic text-wellinder-dark">Password updated!</h2>
          <p className="text-wellinder-dark/40 text-sm mt-2">{isAdmin ? 'Redirecting to admin...' : 'Taking you to the Lounge...'}</p>
        </motion.div>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="min-h-screen bg-wellinder-cream flex items-center justify-center px-6">
        <p className="text-wellinder-dark/40 text-sm">Verifying your link...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wellinder-cream flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-10 w-full max-w-sm shadow-xl border border-wellinder-dark/5"
      >
        <div className="text-center mb-8">
          <p className="text-[10px] uppercase tracking-[0.3em] text-wellinder-dark/40 font-semibold mb-2">Wellinder Creators</p>
          <h1 className="text-2xl font-serif italic text-wellinder-dark">Set New Password</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3" autoComplete="off">
          <input
            type="password"
            placeholder="New password (min. 8 characters)"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoComplete="new-password"
            required
            className="w-full border border-wellinder-dark/10 rounded-2xl py-4 px-5 outline-none focus:border-wellinder-dark transition-colors text-wellinder-dark placeholder:text-wellinder-dark/30"
          />
          <input
            type="password"
            placeholder="Confirm new password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            autoComplete="new-password"
            required
            className="w-full border border-wellinder-dark/10 rounded-2xl py-4 px-5 outline-none focus:border-wellinder-dark transition-colors text-wellinder-dark placeholder:text-wellinder-dark/30"
          />
          {error && <p className="text-red-500 text-xs text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-wellinder-dark text-white py-4 rounded-full font-semibold disabled:opacity-50"
          >
            {loading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
