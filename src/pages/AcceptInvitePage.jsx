import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';

export default function AcceptInvitePage() {
  const [searchParams] = useSearchParams();
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setError('Invalid invitation link.');
      return;
    }

    const verify = async () => {
      const { data, error: fnError } = await supabase.functions.invoke('accept-invite', {
        body: { token },
      });

      if (fnError || !data?.url) {
        setError(data?.error || 'Something went wrong. Please try again or contact us.');
        return;
      }

      window.location.href = data.url;
    };

    verify();
  }, []);

  return (
    <div className="min-h-screen bg-wellinder-cream flex items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl p-10 w-full max-w-sm shadow-xl border border-wellinder-dark/5 text-center"
      >
        {error ? (
          <>
            <p className="text-2xl mb-3">×</p>
            <h2 className="text-xl font-serif italic text-wellinder-dark mb-2">Link unavailable</h2>
            <p className="text-wellinder-dark/50 text-sm">{error}</p>
          </>
        ) : (
          <>
            <p className="text-[10px] uppercase tracking-[0.3em] text-wellinder-dark/40 font-semibold mb-4">Wellinder Creators</p>
            <h2 className="text-xl font-serif italic text-wellinder-dark mb-2">Verifying your invitation...</h2>
            <p className="text-wellinder-dark/40 text-sm">Just a moment.</p>
          </>
        )}
      </motion.div>
    </div>
  );
}
