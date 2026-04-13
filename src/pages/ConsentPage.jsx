import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';

const content = {
  en: {
    badge: 'Wellinder Creators',
    title: 'Creator Challenge Participation Guide',
    intro: 'Congratulations on being selected for the Wellinder Creator Challenge! 🎉\nOver the next 8 weeks, you will grow as a hands-on creator through brand-led education, content practice, and feedback. Please review the following information carefully before getting started.',
    section1Title: 'Participation Guidelines & Agreement',
    items: [
      'I understand that this program is an 8-week hands-on Creator Challenge.',
      'I agree to follow the program schedule and complete all required missions.',
      'I understand that I am expected to follow all response deadlines, submission deadlines, and program guidelines. I also understand that consistent participation may lead to greater benefits and opportunities, while two or more delays of over 24 hours or missed requirements may result in limited access to certain sessions or future collaboration opportunities.',
      'I understand that shipping information and required submissions must be provided by the stated deadlines, and that failure to do so may affect my participation in the program.',
      'I understand that training sessions, expert classes, and future collaboration opportunities may be prioritized for participants who meet the activity requirements.',
      'I understand that all program materials — including educational content, guides, templates, expert session content, and community shares — are provided solely for personal learning and participation in this program.',
      'I agree not to share, reproduce, distribute, upload, record, capture, or transfer any program materials or content to third parties without prior approval from the brand.',
      'I agree not to publicly disclose or reuse any non-public operational information, educational content, expert session content, community shares, or internal materials obtained through this program.',
      'I understand that violation of program standards or content protection principles may result in removal from the program and restrictions on future collaborations or brand programs.',
    ],
    section2Title: 'Content Protection Policy',
    policy: 'All materials and information shared through this program are intended exclusively for your learning and growth. To protect the value of the program for every creator, external sharing or commercial reuse of program materials without prior brand approval is not permitted. This policy remains in effect after the program ends to the extent that non-public materials continue to require protection.',
    closing: 'Reviewed everything and ready to begin? Let\'s get started. 🌿',
    agreeLabel: 'I agree',
    disagreeLabel: 'I do not agree',
    cta: 'Get Started',
    processing: 'Processing...',
    mustAgree: 'Please select "I agree" to continue.',
  },
  zh: {
    badge: 'Wellinder 创作者',
    title: '创作者挑战赛参与须知',
    intro: '衷心祝贺您入选 Wellinder 创作者挑战赛！🎉\n在接下来的 8 周内，您将通过品牌主导的培训课程、内容实践与反馈，成长为一名实战型创作者。正式开始前，请仔细阅读以下内容。',
    section1Title: '参与规范与同意事项',
    items: [
      '我了解本项目是为期 8 周的实战型创作者挑战赛。',
      '我同意遵守项目日程，并完成所有必要任务。',
      '我了解需遵守所有回复截止日期、提交截止日期及运营指南。我也了解，积极参与将带来更多福利与机会，而累计 2 次以上延迟（超过 24 小时）或未完成任务，可能导致部分课程参与资格或后续合作机会受到限制。',
      '我了解需在规定期限内提交配送信息及必要资料，未能按时提交可能影响我在项目中的参与资格。',
      '我了解培训课程、专家分享及后续合作机会将优先提供给达到活动标准的参与者。',
      '我了解项目提供的所有资料（包括教育内容、指南、模板、专家分享内容及社群共享内容等）仅供个人学习及完成项目任务之用。',
      '我同意未经品牌事先授权，不对外分享、复制、传播、上传、录制、截取项目相关资料或内容，亦不将其转交给第三方。',
      '我同意不对外披露或再利用在项目期间获悉的任何未公开运营信息、教育内容、专家分享内容、社群共享内容及其他内部资料。',
      '我了解违反运营规范或资料保护原则，可能导致被终止项目参与资格，并限制未来与品牌的合作及项目参与机会。',
    ],
    section2Title: '资料保护须知',
    policy: '本项目提供的所有资料与信息，均专为参与者的学习与成长而准备。为保障每位创作者所获得的同等价值，未经品牌事先授权，不得将项目资料对外分享或用于商业目的。本原则在项目结束后，就未公开资料的保护范围内继续有效。',
    closing: '已确认所有内容，准备好开始了吗？让我们一起出发吧！🌿',
    agreeLabel: '同意',
    disagreeLabel: '不同意',
    cta: '开始吧',
    processing: '处理中...',
    mustAgree: '请选择"同意"以继续。',
  },
};

export default function ConsentPage() {
  const [searchParams] = useSearchParams();
  const [lang, setLang] = useState('en');
  const [agreed, setAgreed] = useState(null); // null | 'yes' | 'no'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const token = searchParams.get('token');
  const t = content[lang];

  const handleSubmit = async () => {
    if (agreed !== 'yes') {
      setError(t.mustAgree);
      return;
    }
    if (!token) return;

    setLoading(true);
    setError('');

    const { data, error: fnError } = await supabase.functions.invoke('accept-invite', {
      body: { token },
    });

    setLoading(false);

    if (fnError || !data?.url) {
      setError(data?.error || 'Something went wrong. Please try again or contact us.');
      return;
    }

    window.location.href = data.url;
  };

  return (
    <div className="min-h-screen bg-wellinder-cream py-20 px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <p className="text-[10px] uppercase tracking-[0.3em] text-wellinder-dark/40 font-semibold">
              {t.badge}
            </p>
            {/* Language toggle */}
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
          <AnimatePresence mode="wait">
            <motion.h1
              key={lang + '-title'}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
              className="text-2xl font-serif italic text-wellinder-dark mb-4"
            >
              {t.title}
            </motion.h1>
          </AnimatePresence>
          <AnimatePresence mode="wait">
            <motion.p
              key={lang + '-intro'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-sm text-wellinder-dark/60 leading-relaxed whitespace-pre-line"
            >
              {t.intro}
            </motion.p>
          </AnimatePresence>
        </div>

        {/* Content Card */}
        <AnimatePresence mode="wait">
          <motion.div
            key={lang + '-card'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-3xl border border-wellinder-dark/8 shadow-sm overflow-hidden mb-6"
          >
            <div className="h-[420px] overflow-y-auto px-8 py-8 text-sm text-wellinder-dark/70 leading-relaxed space-y-6">
              {/* Section 1 */}
              <section>
                <h2 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-wellinder-dark mb-4">
                  {t.section1Title}
                </h2>
                <ul className="space-y-3">
                  {t.items.map((item, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="text-wellinder-dark/20 flex-shrink-0 mt-0.5">•</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {/* Section 2 */}
              <section className="pt-2 border-t border-wellinder-dark/8">
                <h2 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-wellinder-dark mb-3">
                  {t.section2Title}
                </h2>
                <p>{t.policy}</p>
              </section>

              {/* Closing */}
              <p className="pt-2 text-wellinder-dark/50 italic">{t.closing}</p>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Radio buttons */}
        <AnimatePresence mode="wait">
          <motion.div
            key={lang + '-radio'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col gap-3 mb-6"
          >
            {[
              { value: 'yes', label: t.agreeLabel },
              { value: 'no', label: t.disagreeLabel },
            ].map(({ value, label }) => (
              <label key={value} className="flex items-center gap-3 cursor-pointer group">
                <div
                  onClick={() => { setAgreed(value); setError(''); }}
                  className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all
                    ${agreed === value
                      ? 'border-wellinder-dark bg-wellinder-dark'
                      : 'border-wellinder-dark/20 group-hover:border-wellinder-dark/40'
                    }`}
                >
                  {agreed === value && (
                    <div className="w-2 h-2 rounded-full bg-white" />
                  )}
                </div>
                <span
                  onClick={() => { setAgreed(value); setError(''); }}
                  className="text-sm text-wellinder-dark/70 select-none"
                >
                  {label}
                </span>
              </label>
            ))}
          </motion.div>
        </AnimatePresence>

        {error && (
          <p className="text-red-500 text-xs text-center mb-4">{error}</p>
        )}

        {/* CTA */}
        <button
          onClick={handleSubmit}
          disabled={agreed !== 'yes' || loading}
          className="w-full bg-wellinder-dark text-white py-4 rounded-full font-semibold text-sm
            disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
        >
          {loading ? t.processing : t.cta}
        </button>

        <p className="text-center text-wellinder-dark/30 text-xs mt-4">
          {lang === 'en'
            ? 'You will create your account on the next step.'
            : '下一步将创建您的账户。'}
        </p>
      </motion.div>
    </div>
  );
}
