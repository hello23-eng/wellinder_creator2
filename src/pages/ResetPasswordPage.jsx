import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { useNavigate, useLocation } from 'react-router-dom';

// ─── Content ───────────────────────────────────────────────────────────────

const COUNTRIES = [
  { value: 'Singapore', label: { en: 'Singapore', zh: '新加坡' }, enabled: true },
  { value: 'Malaysia', label: { en: 'Malaysia', zh: '马来西亚' }, enabled: false },
  { value: 'Indonesia', label: { en: 'Indonesia', zh: '印度尼西亚' }, enabled: false },
  { value: 'Philippines', label: { en: 'Philippines', zh: '菲律宾' }, enabled: false },
  { value: 'Thailand', label: { en: 'Thailand', zh: '泰国' }, enabled: false },
  { value: 'Vietnam', label: { en: 'Vietnam', zh: '越南' }, enabled: false },
  { value: 'South Korea', label: { en: 'South Korea', zh: '韩国' }, enabled: false },
  { value: 'China', label: { en: 'China', zh: '中国' }, enabled: false },
  { value: 'United States', label: { en: 'United States', zh: '美国' }, enabled: false },
  { value: 'Other', label: { en: 'Other', zh: '其他' }, enabled: false },
];

const SURVEY_A = [
  { value: 'I want to learn more about K-beauty', en: 'I want to learn more about K-beauty', zh: '想更深入地了解 K-beauty' },
  { value: 'I want to improve my content creation skills', en: 'I want to improve my content creation skills', zh: '想提升内容创作能力' },
  { value: 'I want to gain real brand collaboration experience', en: 'I want to gain real brand collaboration experience', zh: '想积累与品牌真实合作的经验' },
  { value: 'I want to build a consistent content posting habit', en: 'I want to build a consistent content posting habit', zh: '想养成持续发布内容的习惯' },
  { value: 'I want to grow alongside other creators', en: 'I want to grow alongside other creators', zh: '想与其他创作者一起成长' },
  { value: "I'm excited to be part of the Wellinder brand journey", en: "I'm excited to be part of the Wellinder brand journey", zh: '期待参与 Wellinder 品牌的成长旅程' },
  { value: 'I hope to create future opportunities for paid collaborations, affiliate partnerships, or ambassador roles', en: 'I hope to create future opportunities for paid collaborations, affiliate partnerships, or ambassador roles', zh: '希望获得未来的付费合作、联盟合作或品牌大使机会' },
  { value: 'Other', en: 'Other', zh: '其他' },
];

const SURVEY_B = [
  { value: 'Complete all missions from start to finish', en: 'Complete all missions from start to finish', zh: '完成所有任务，坚持到最后' },
  { value: 'Create more natural and persuasive content', en: 'Create more natural and persuasive content', zh: '创作出更自然、更有说服力的内容' },
  { value: 'Strengthen my short-form content planning skills', en: 'Strengthen my short-form content planning skills', zh: '提升短视频内容的策划能力' },
  { value: 'Improve my filming and editing skills', en: 'Improve my filming and editing skills', zh: '提高拍摄与剪辑技巧' },
  { value: 'Become a more brand-ready creator', en: 'Become a more brand-ready creator', zh: '成为更适合品牌合作的创作者' },
  { value: 'Develop my own unique content style', en: 'Develop my own unique content style', zh: '找到属于自己的内容风格' },
  { value: 'Build a consistent upload routine', en: 'Build a consistent upload routine', zh: '建立稳定的发布节奏' },
  { value: 'Turn this experience into real collaboration opportunities', en: 'Turn this experience into real collaboration opportunities', zh: '将本次经历转化为真实的合作机会' },
  { value: 'Other', en: 'Other', zh: '其他' },
];

const content = {
  en: {
    badge: 'Wellinder Creators',
    sectionAccount: 'Account Setup',
    emailLabel: 'Email',
    emailNote: 'Your invitation email will be pre-filled automatically and cannot be changed.',
    namePlaceholder: 'Name',
    passwordPlaceholder: 'Password',
    confirmPlaceholder: 'Confirm Password',
    countryLabel: 'Country / Region',
    countryNote: 'This program is currently open to participants based in Singapore only.',
    countryPlaceholder: 'Select your country',
    countryDisabledNote: 'Not available in this region',
    sectionAbout: 'About You',
    aboutIntro: 'Help us make this program better for you. Feel free to select all that apply.',
    sectionA: 'A. Why did you join this challenge? (Multiple selections allowed)',
    aOtherPlaceholder: 'Is there anything else you\'d like to share? (Optional)',
    sectionB: 'B. What do you hope to achieve in these 8 weeks? (Multiple selections allowed)',
    bOtherPlaceholder: 'Any other goals you\'d like to add? (Optional)',
    cta: 'Complete Sign-Up',
    processing: 'Setting up your account...',
    done: 'Welcome to Wellinder!',
    doneSubtitle: 'Taking you to the Lounge...',
    verifying: 'Verifying your link...',
    errPasswordMatch: 'Passwords do not match.',
    errPasswordLength: 'Password must be at least 8 characters.',
    errNameRequired: 'Please enter your name.',
    errCountryRequired: 'Please select your country.',
  },
  zh: {
    badge: 'Wellinder 创作者',
    sectionAccount: '账户设置',
    emailLabel: '邮箱',
    emailNote: '将自动填入您收到邀请的邮箱地址，无法修改。',
    namePlaceholder: '姓名',
    passwordPlaceholder: '密码',
    confirmPlaceholder: '确认密码',
    countryLabel: '国家/地区',
    countryNote: '本项目目前仅对新加坡地区的参与者开放。',
    countryPlaceholder: '请选择您所在的国家/地区',
    countryDisabledNote: '该地区暂不开放',
    sectionAbout: '关于你',
    aboutIntro: '请简单分享以下信息，帮助我们为您提供更好的体验。每道题均可多选。',
    sectionA: 'A. 您为什么参加本次挑战赛？（可多选）',
    aOtherPlaceholder: '如有其他想补充的内容，欢迎自由填写。（选填）',
    sectionB: 'B. 您希望在这 8 周内实现什么目标？（可多选）',
    bOtherPlaceholder: '如有其他目标，欢迎自由填写。（选填）',
    cta: '完成注册',
    processing: '正在设置您的账户…',
    done: '欢迎加入 Wellinder！',
    doneSubtitle: '正在跳转至 Lounge…',
    verifying: '正在验证您的链接…',
    errPasswordMatch: '两次输入的密码不一致。',
    errPasswordLength: '密码至少需要 8 位字符。',
    errNameRequired: '请输入您的姓名。',
    errCountryRequired: '请选择您所在的国家/地区。',
  },
};

// ─── Checkbox component ────────────────────────────────────────────────────

function Checkbox({ checked, onChange, label }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group py-1" onClick={onChange}>
      <div
        className={`mt-0.5 w-4.5 h-4.5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-all
          ${checked
            ? 'bg-wellinder-dark border-wellinder-dark'
            : 'border-wellinder-dark/20 group-hover:border-wellinder-dark/40'
          }`}
        style={{ minWidth: '18px', minHeight: '18px', width: '18px', height: '18px' }}
      >
        {checked && (
          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className="text-sm text-wellinder-dark/70 leading-snug select-none">{label}</span>
    </label>
  );
}

// ─── Main component ────────────────────────────────────────────────────────

export default function ResetPasswordPage() {
  const [lang, setLang] = useState('en');
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [country, setCountry] = useState('');
  const [surveyA, setSurveyA] = useState(new Set());
  const [surveyAOther, setSurveyAOther] = useState('');
  const [surveyB, setSurveyB] = useState(new Set());
  const [surveyBOther, setSurveyBOther] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [ready, setReady] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (error) document.getElementById('form-error')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [error]);

  const t = content[lang];

  useEffect(() => {
    const hasMagicLink = window.location.hash.includes('access_token=');

    if (!hasMagicLink) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session) {
          setReady(true);
          setEmail(session.user.email ?? '');
        }
      });
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') && session) {
        setReady(true);
        setEmail(session.user.email ?? '');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const toggleA = (value) => {
    setSurveyA(prev => {
      const next = new Set(prev);
      next.has(value) ? next.delete(value) : next.add(value);
      return next;
    });
  };

  const toggleB = (value) => {
    setSurveyB(prev => {
      const next = new Set(prev);
      next.has(value) ? next.delete(value) : next.add(value);
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) { setError(t.errNameRequired); return; }
    if (password.length < 8) { setError(t.errPasswordLength); return; }
    if (password !== confirm) { setError(t.errPasswordMatch); return; }
    if (!country) { setError(t.errCountryRequired); return; }

    setLoading(true);

    // 세션 강제 갱신 후 함수 호출
    await supabase.auth.refreshSession();
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      setLoading(false);
      setError('Session expired. Please use your invitation link again.');
      return;
    }

    // 비밀번호 설정 + 프로필 저장을 Edge Function에서 admin API로 처리
    const { data, error: fnError } = await supabase.functions.invoke('complete-signup', {
      body: {
        email: session.user.email,
        password,
        name: name.trim(),
        country,
        survey_a_reasons: [...surveyA],
        survey_a_other: surveyAOther.trim() || null,
        survey_b_goals: [...surveyB],
        survey_b_other: surveyBOther.trim() || null,
      },
    });

    setLoading(false);

    if (fnError) {
      setError(data?.error || fnError.message || 'Something went wrong. Please try again.');
      return;
    }

    setDone(true);
    setTimeout(() => navigate('/lounge'), 2000);
  };

  // ── Done state ─────────────────────────────────────────────────────────

  if (done) {
    return (
      <div className="min-h-screen bg-wellinder-cream flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <p className="text-3xl mb-4">✓</p>
          <h2 className="text-2xl font-serif italic text-wellinder-dark">{t.done}</h2>
          <p className="text-wellinder-dark/40 text-sm mt-2">{t.doneSubtitle}</p>
        </motion.div>
      </div>
    );
  }

  // ── Verifying state ────────────────────────────────────────────────────

  if (!ready) {
    return (
      <div className="min-h-screen bg-wellinder-cream flex items-center justify-center px-6">
        <p className="text-wellinder-dark/40 text-sm">{t.verifying}</p>
      </div>
    );
  }

  // ── Main form ──────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-wellinder-cream pt-24 pb-16 px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="max-w-lg mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <p className="text-[10px] uppercase tracking-[0.3em] text-wellinder-dark/40 font-semibold">
              {t.badge}
            </p>
            <div className="flex items-center bg-white border border-wellinder-dark/10 rounded-full overflow-hidden text-[10px] font-semibold">
              <button
                onClick={() => setLang('en')}
                className={`px-3 py-1.5 transition-colors ${lang === 'en' ? 'bg-wellinder-dark text-white' : 'text-wellinder-dark/40 hover:text-wellinder-dark'}`}
              >
                EN
              </button>
              <button
                onClick={() => setLang('zh')}
                className={`px-3 py-1.5 transition-colors ${lang === 'zh' ? 'bg-wellinder-dark text-white' : 'text-wellinder-dark/40 hover:text-wellinder-dark'}`}
              >
                中文
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Account Setup ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={lang + '-account'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <SectionLabel>{t.sectionAccount}</SectionLabel>

              <div className="bg-white rounded-3xl border border-wellinder-dark/8 shadow-sm overflow-hidden divide-y divide-wellinder-dark/5">

                {/* Email */}
                <div className="px-6 py-5">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-wellinder-dark/30 mb-1.5">
                    {t.emailLabel}
                  </p>
                  <p className="text-sm text-wellinder-dark font-medium">{email}</p>
                  <p className="text-[11px] text-wellinder-dark/35 mt-1 leading-relaxed">{t.emailNote}</p>
                </div>

                {/* Name */}
                <div className="px-6 py-1">
                  <input
                    type="text"
                    placeholder={t.namePlaceholder}
                    value={name}
                    onChange={e => setName(e.target.value)}
                    required
                    className="w-full py-4 outline-none text-sm text-wellinder-dark placeholder:text-wellinder-dark/30 bg-transparent"
                  />
                </div>

                {/* Password */}
                <div className="px-6 py-1">
                  <input
                    type="password"
                    placeholder={t.passwordPlaceholder}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full py-4 outline-none text-sm text-wellinder-dark placeholder:text-wellinder-dark/30 bg-transparent"
                  />
                </div>

                {/* Confirm password */}
                <div className="px-6 py-1">
                  <input
                    type="password"
                    placeholder={t.confirmPlaceholder}
                    value={confirm}
                    onChange={e => setConfirm(e.target.value)}
                    required
                    className="w-full py-4 outline-none text-sm text-wellinder-dark placeholder:text-wellinder-dark/30 bg-transparent"
                  />
                </div>

                {/* Country */}
                <div className="px-6 py-5">
                  <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-wellinder-dark/30 mb-2">
                    {t.countryLabel}
                  </p>
                  <div className="relative">
                    <select
                      value={country}
                      onChange={e => setCountry(e.target.value)}
                      required
                      className="w-full text-sm bg-wellinder-cream/60 border border-wellinder-dark/10 rounded-2xl py-3 px-4 outline-none appearance-none cursor-pointer text-wellinder-dark focus:border-wellinder-dark transition-colors"
                    >
                      <option value="" disabled>{t.countryPlaceholder}</option>
                      {COUNTRIES.map(c => (
                        <option
                          key={c.value}
                          value={c.value}
                          disabled={!c.enabled}
                          style={!c.enabled ? { color: '#bbb' } : {}}
                        >
                          {c.enabled ? c.label[lang] : `${c.label[lang]}  —  ${t.countryDisabledNote}`}
                        </option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-wellinder-dark/30">
                      <svg width="12" height="7" viewBox="0 0 12 7" fill="none">
                        <path d="M1 1L6 6L11 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-[11px] text-wellinder-dark/35 mt-2 leading-relaxed">{t.countryNote}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* ── About You ── */}
          <AnimatePresence mode="wait">
            <motion.div
              key={lang + '-about'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              <SectionLabel>{t.sectionAbout}</SectionLabel>
              <p className="text-sm text-wellinder-dark/50 mb-4 leading-relaxed">{t.aboutIntro}</p>

              {/* Survey A */}
              <div className="bg-white rounded-3xl border border-wellinder-dark/8 shadow-sm p-6 mb-4">
                <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-wellinder-dark mb-4">
                  {t.sectionA}
                </p>
                <div className="space-y-0.5">
                  {SURVEY_A.map(item => (
                    <Checkbox
                      key={item.value}
                      checked={surveyA.has(item.value)}
                      onChange={() => toggleA(item.value)}
                      label={item[lang]}
                    />
                  ))}
                </div>
                <textarea
                  value={surveyAOther}
                  onChange={e => setSurveyAOther(e.target.value)}
                  placeholder={t.aOtherPlaceholder}
                  rows={3}
                  className="mt-5 w-full border border-wellinder-dark/10 rounded-2xl py-3 px-4 text-sm text-wellinder-dark placeholder:text-wellinder-dark/30 outline-none focus:border-wellinder-dark transition-colors resize-none bg-wellinder-cream/40"
                />
              </div>

              {/* Survey B */}
              <div className="bg-white rounded-3xl border border-wellinder-dark/8 shadow-sm p-6">
                <p className="text-[11px] uppercase tracking-[0.2em] font-semibold text-wellinder-dark mb-4">
                  {t.sectionB}
                </p>
                <div className="space-y-0.5">
                  {SURVEY_B.map(item => (
                    <Checkbox
                      key={item.value}
                      checked={surveyB.has(item.value)}
                      onChange={() => toggleB(item.value)}
                      label={item[lang]}
                    />
                  ))}
                </div>
                <textarea
                  value={surveyBOther}
                  onChange={e => setSurveyBOther(e.target.value)}
                  placeholder={t.bOtherPlaceholder}
                  rows={3}
                  className="mt-5 w-full border border-wellinder-dark/10 rounded-2xl py-3 px-4 text-sm text-wellinder-dark placeholder:text-wellinder-dark/30 outline-none focus:border-wellinder-dark transition-colors resize-none bg-wellinder-cream/40"
                />
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Error */}
          {error && (
            <p id="form-error" className="text-red-500 text-sm text-center font-medium bg-red-50 border border-red-200 rounded-2xl py-3 px-4">{error}</p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-wellinder-dark text-white py-4 rounded-full font-semibold text-sm disabled:opacity-40 transition-opacity"
          >
            {loading ? t.processing : t.cta}
          </button>

          <div className="h-4" />
        </form>
      </motion.div>
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-wellinder-dark/40 mb-3">
      {children}
    </p>
  );
}
