import { useState } from 'react';
import { motion } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const navigate = useNavigate();

  const handleReset = async (e) => {
    e.preventDefault();
    if (password !== confirm) {
      setError('비밀번호가 일치하지 않아요.');
      return;
    }
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 해요.');
      return;
    }
    setLoading(true);
    setError('');
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError('오류가 발생했어요. 링크가 만료됐을 수 있어요.');
    } else {
      setDone(true);
      setTimeout(() => navigate('/admin'), 2000);
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
            <h2 className="text-xl font-serif italic text-wellinder-dark">비밀번호 설정 완료!</h2>
            <p className="text-wellinder-dark/40 text-sm mt-2">어드민 페이지로 이동 중...</p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <p className="text-[10px] uppercase tracking-[0.3em] text-wellinder-dark/40 font-semibold mb-2">Wellinder</p>
              <h1 className="text-2xl font-serif italic text-wellinder-dark">비밀번호 설정</h1>
            </div>
            <form onSubmit={handleReset} className="space-y-3">
              <input
                type="password"
                placeholder="새 비밀번호"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-wellinder-dark/10 rounded-2xl py-4 px-5 outline-none focus:border-wellinder-dark transition-colors text-wellinder-dark placeholder:text-wellinder-dark/30"
              />
              <input
                type="password"
                placeholder="비밀번호 확인"
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
                {loading ? '저장 중...' : '비밀번호 설정'}
              </button>
            </form>
          </>
        )}
      </motion.div>
    </div>
  );
}
