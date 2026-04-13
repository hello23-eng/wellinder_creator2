import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setReady(true);
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError('Something went wrong: ' + error.message);
    } else {
      setDone(true);
      setTimeout(() => navigate('/lounge'), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-wellinder-cream flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-10 w-full max-w-sm shadow-xl border border-wellinder-dark/5"
      >
        {done ? (
          <div className="text-center">
            <p className="text-2xl mb-3">✓</p>
            <h2 className="text-xl font-serif italic text-wellinder-dark">Welcome to Wellinder!</h2>
            <p className="text-wellinder-dark/40 text-sm mt-2">Taking you to the Lounge...</p>
          </div>
        ) : !ready ? (
          <div className="text-center">
            <p className="text-wellinder-dark/40 text-sm">Verifying your link...</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <p className="text-[10px] uppercase tracking-[0.3em] text-wellinder-dark/40 font-semibold mb-2">Wellinder Creators</p>
              <h1 className="text-2xl font-serif italic text-wellinder-dark">Create Your Account</h1>
              <p className="text-wellinder-dark/50 text-sm mt-2">Set a password to complete your sign-up.</p>
            </div>
            <form onSubmit={handleReset} className="space-y-3">
              <input
                type="password"
                placeholder="Create password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-wellinder-dark/10 rounded-2xl py-4 px-5 outline-none focus:border-wellinder-dark transition-colors text-wellinder-dark placeholder:text-wellinder-dark/30"
              />
              <input
                type="password"
                placeholder="Confirm password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                className="w-full border border-wellinder-dark/10 rounded-2xl py-4 px-5 outline-none focus:border-wellinder-dark transition-colors text-wellinder-dark placeholder:text-wellinder-dark/30"
              />
              {error && <p className="text-red-500 text-xs text-center">{error}</p>}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-wellinder-dark text-white py-4 rounded-full font-semibold disabled:opacity-50"
              >
                {loading ? 'Signing up...' : 'Sign Up'}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
