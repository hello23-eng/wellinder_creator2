import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Gem, Lock, LayoutDashboard, ShoppingBag, Users, Sparkles, Diamond, TrendingUp } from 'lucide-react';
import React, { useState, useEffect, createContext, useContext } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from './lib/supabase';
import heroImg from './assets/hero.png';
import AdminPage from './pages/AdminPage';
import AdminResetPage from './pages/AdminResetPage';
import LoungePage from './pages/LoungePage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import TermsPage from './pages/TermsPage';
import PrivacyPage from './pages/PrivacyPage';
import AboutPage from './pages/AboutPage';
import AcceptInvitePage from './pages/AcceptInvitePage';
import ConsentPage from './pages/ConsentPage';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

// --- Language Context ---
export const LangContext = createContext();
const useLang = () => useContext(LangContext);

const translations = {
  en: {
    // Header
    headerTitle: 'Join Wellinder Creators',
    headerSub: 'Share your rituals. Inspire others.',
    navApply: 'Apply',
    navLounge: 'Lounge',
    navMembers: 'Members',
    navSignOut: 'Sign Out',
    navMemberLogin: 'Member Login',
    // Footer CTA
    footerBtn: 'Join the Wellinder Creators',
    footerSub: 'Currently accepting applications for Singapore',
    // Hero
    heroBrand: 'WELLINDER',
    heroTitle: 'Korean Inner Beauty Collagen',
    heroSub: '8-Week Creator Challenge — Now Open 🇸🇬',
    // Philosophy
    philLabel: 'Our Philosophy',
    philQuote: '"Wellinder: Wellness in wonder."',
    philBelieve: 'We believe.',
    philP1: 'That life is transformed not by grand gestures, but by the power of small daily rituals.',
    philP2: 'Just as a raw stone is refined into a brilliant jewel, human beauty begins to radiate through consistent, mindful care.',
    philP3: 'WELLINDER stands with creators who cherish their own rituals and dare to share those stories with the world.',
    philP4: 'If your ritual can become an inspiration to others, we invite you to begin your brilliant journey with us.',
    // Tier System
    tierTitle: 'The Jewellery Tier System',
    tier1Name: 'The Raw',
    tier1Status: 'THE ORIGIN',
    tier1Desc: 'Your journey begins here — a natural origin with boundless potential.',
    tier2Name: 'The Crystal',
    tier2Status: 'THE GROWTH',
    tier2Desc: 'Growth begins to take shape. Radiating clarity and ambition.',
    tier3Name: 'The Jewel',
    tier3Status: 'THE MASTERPIECE',
    tier3Desc: 'The pinnacle of brilliance. A true masterpiece within our community.',
    // Benefits
    benefitsTitle: 'Creator Benefits',
    benefitsSub: 'Our commitment to your growth and brilliance.',
    b1Title: 'Product Seeding',
    b1Desc: 'Receive a curated selection of our finest products to experience and share with your audience, free of charge.',
    b2Title: 'Exclusive Events',
    b2Desc: 'Get invited to private workshops, launch parties, and creator retreats designed to inspire and connect.',
    b3Title: 'Growth Support',
    b3Desc: 'Access our team of experts for personalized guidance on content strategy, audience engagement, and monetization.',
    b4Title: 'Community & Collaboration',
    b4Desc: 'Join a vibrant community of like-minded creators. Collaborate on exciting projects and build lasting relationships.',
    // Application Form
    appLabel: 'Application',
    appSub: 'If your daily ritual can inspire others, we invite you to begin your brilliant transformation with us.',
    appTitle: 'Join the Wellness Collective',
    fieldName: 'Full Name',
    fieldNamePH: 'e.g., Tan Wei Kiat',
    fieldTikTok: 'TikTok Handle',
    fieldIG: 'Instagram Handle',
    fieldEmail: 'Email Address',
    fieldCountry: 'Country',
    countrySelect: 'Select your country',
    countrySG: '🇸🇬 Singapore — Now Open',
    countryKR: '🇰🇷 South Korea — Coming Soon',
    countryMY: '🇲🇾 Malaysia — Coming Soon',
    countryJP: '🇯🇵 Japan — Coming Soon',
    countryTW: '🇹🇼 Taiwan — Coming Soon',
    countryHK: '🇭🇰 Hong Kong — Coming Soon',
    countryTH: '🇹🇭 Thailand — Coming Soon',
    countryID: '🇮🇩 Indonesia — Coming Soon',
    countryPH: '🇵🇭 Philippines — Coming Soon',
    countryVN: '🇻🇳 Vietnam — Coming Soon',
    countryAU: '🇦🇺 Australia — Coming Soon',
    countryUS: '🇺🇸 United States — Coming Soon',
    countryGB: '🇬🇧 United Kingdom — Coming Soon',
    countryCA: '🇨🇦 Canada — Coming Soon',
    countryFR: '🇫🇷 France — Coming Soon',
    countrySoonNote: '✦ We\'re launching in your region soon. Stay tuned!',
    countryDefaultNote: '* Currently accepting applications from Singapore.',
    // Application Type
    appTypeLabel: 'How would you like to join?',
    appTypeCreatorPool: 'Creator Pool',
    appTypeCreatorPoolDesc: 'Join our growing creator community.',
    appTypeChallenge: '8-Week Creator Challenge',
    appTypeChallengeDesc: 'Applications closed for this season.',
    // Platform
    platformLabel: 'Which platform is this?',
    platformSub: 'Choose your main SNS platform (select all that apply)',
    // Content Type
    contentLabel: 'What kind of content do you enjoy creating most?',
    contentSub: 'Select all that apply',
    // Rate Card
    rateCardLabel: 'If you have a rate card, please share it with us',
    rateCardPH: 'e.g., Nano influencer, $200 per story post...',
    rateCardOptional: 'Optional',
    // Other placeholder
    otherPH: 'Please specify...',
    // Privacy
    privacyNote: 'All information provided will be kept confidential and used solely for our internal creator pool.',
    termsText: 'I agree to the',
    termsLink: 'Terms of Service',
    termsAnd: 'and',
    privacyLink: 'Privacy Policy',
    submitBtn: 'Submit Application',
    submittingBtn: 'Submitting...',
    errorMsg: 'Something went wrong. Please try again.',
    rateLimitedMsg: 'Too many submissions from your network. Please try again after 24 hours.',
    successTitle: 'Application Received',
    successP1: 'Your application has been received.',
    successP2: 'We\'ll review it and get back to you by email.\nThank you for applying.',
    // Newsletter
    navNewsletter: 'Newsletter',
    nlLabel: 'THE WELLINDER LETTER',
    nlHeadline: 'Glow from within.',
    nlSub: 'Weekly insights on K-beauty, inner beauty & wellness — for those who take their rituals seriously.',
    nlPillar1Title: 'K-Beauty Intelligence',
    nlPillar1Desc: 'The latest K-beauty ingredients, trends, and brand discoveries — curated weekly.',
    nlPillar2Title: 'Inner Beauty',
    nlPillar2Desc: 'Collagen, adaptogens, and rituals that nourish you from the inside out.',
    nlPillar3Title: 'Skin & Body',
    nlPillar3Desc: 'Diet, movement, and body care from a skin-first perspective. Looking good starts with feeling good.',
    nlPillar4Title: 'Wellness',
    nlPillar4Desc: 'Sleep, hormones, stress & longevity — the full-body picture behind radiant skin.',
    nlFormTitle: 'Join the letter.',
    nlFormSub: 'No spam. Just glow tips worth reading.',
    nlConsent: 'I agree to receive the Wellinder newsletter and consent to my personal data being used for this purpose. Unsubscribe anytime.',
    nlNamePH: 'Your name',
    nlEmailPH: 'Your email address',
    nlSubmitBtn: 'Subscribe',
    nlSubmittingBtn: 'Subscribing...',
    nlSuccessTitle: 'You\'re in.',
    nlSuccessMsg: 'Thank you for subscribing. You\'ll hear from us soon.',
    nlErrorMsg: 'Something went wrong. Please try again.',
    nlAlreadyMsg: 'This email is already subscribed.',
  },
  zh: {
    // Header
    headerTitle: '加入 Wellinder 创作者',
    headerSub: '分享你的日常，启发他人。',
    navApply: '申请',
    navLounge: '会员专区',
    navMembers: '会员',
    navSignOut: '退出登录',
    navMemberLogin: '会员登录',
    // Footer CTA
    footerBtn: '加入 Wellinder 创作者计划',
    footerSub: '现正接受新加坡地区申请',
    // Hero
    heroBrand: 'WELLINDER',
    heroTitle: '韩国内在美胶原蛋白',
    heroSub: '8周创作者挑战赛 — 现已开放 🇸🇬',
    // Philosophy
    philLabel: '我们的理念',
    philQuote: '"Wellinder：在惊喜中焕发健康之美。"',
    philBelieve: '我们相信。',
    philP1: '生命的改变，不在于宏大的举动，而在于微小日常仪式的力量。',
    philP2: '正如原石被雕琢成璀璨宝石，人的美丽也在持续用心的呵护中绽放。',
    philP3: 'WELLINDER 与珍视自己仪式感、勇于向世界分享故事的创作者同行。',
    philP4: '如果你的日常仪式能够启发他人，我们诚邀你与我们一同开启这段璀璨旅程。',
    // Tier System
    tierTitle: '珠宝等级体系',
    tier1Name: '原石',
    tier1Status: '起源',
    tier1Desc: '旅程从这里开始——天然本质，潜力无限。',
    tier2Name: '水晶',
    tier2Status: '成长',
    tier2Desc: '成长初现雏形，散发清澈与抱负之光。',
    tier3Name: '宝石',
    tier3Status: '杰作',
    tier3Desc: '璀璨之巅，社群中真正的杰作。',
    // Benefits
    benefitsTitle: '创作者福利',
    benefitsSub: '我们对你成长与卓越的承诺。',
    b1Title: '产品体验',
    b1Desc: '免费获得精选优质产品，亲身体验并与你的粉丝分享。',
    b2Title: '专属活动',
    b2Desc: '受邀参加私人工作坊、新品发布会及创作者交流营，激发灵感，建立联系。',
    b3Title: '成长支持',
    b3Desc: '获取专家团队的个性化指导，涵盖内容策略、粉丝互动与变现方向。',
    b4Title: '社群与合作',
    b4Desc: '加入充满活力的同道创作者社群，共同参与精彩项目，建立持久的创作关系。',
    // Application Form
    appLabel: '申请',
    appSub: '如果你的日常仪式能够启发他人，我们诚邀你与我们一同开始这段蜕变之旅。',
    appTitle: '加入健康创作者集体',
    fieldName: '姓名',
    fieldNamePH: '例：陈伟杰',
    fieldTikTok: 'TikTok 账号',
    fieldIG: 'Instagram 账号',
    fieldEmail: '电子邮件',
    fieldCountry: '国家/地区',
    countrySelect: '请选择国家/地区',
    countrySG: '🇸🇬 新加坡 — 现已开放',
    countryKR: '🇰🇷 韩国 — 即将开放',
    countryMY: '🇲🇾 马来西亚 — 即将开放',
    countryJP: '🇯🇵 日本 — 即将开放',
    countryTW: '🇹🇼 台湾 — 即将开放',
    countryHK: '🇭🇰 香港 — 即将开放',
    countryTH: '🇹🇭 泰国 — 即将开放',
    countryID: '🇮🇩 印度尼西亚 — 即将开放',
    countryPH: '🇵🇭 菲律宾 — 即将开放',
    countryVN: '🇻🇳 越南 — 即将开放',
    countryAU: '🇦🇺 澳大利亚 — 即将开放',
    countryUS: '🇺🇸 美国 — 即将开放',
    countryGB: '🇬🇧 英国 — 即将开放',
    countryCA: '🇨🇦 加拿大 — 即将开放',
    countryFR: '🇫🇷 法国 — 即将开放',
    countrySoonNote: '✦ 我们即将在您所在地区开放，敬请期待！',
    countryDefaultNote: '* 目前仅接受新加坡地区的申请。',
    // Application Type
    appTypeLabel: '您希望以哪种方式加入？',
    appTypeCreatorPool: '创作者池',
    appTypeCreatorPoolDesc: '加入我们不断壮大的创作者社群。',
    appTypeChallenge: '8周创作者挑战赛',
    appTypeChallengeDesc: '本季申请已截止。',
    // Platform
    platformLabel: '您使用哪个平台？',
    platformSub: '选择您的主要社交媒体平台（可多选）',
    // Content Type
    contentLabel: '您最喜欢创作哪类内容？',
    contentSub: '可多选',
    // Rate Card
    rateCardLabel: '如您有报价单，欢迎与我们分享',
    rateCardPH: '例：纳米达人，每条Stories 200新元...',
    rateCardOptional: '选填',
    // Other placeholder
    otherPH: '请注明...',
    // Privacy
    privacyNote: '所提供的所有信息将严格保密，仅用于我们内部创作者筛选目的。',
    termsText: '我同意',
    termsLink: '服务条款',
    termsAnd: '和',
    privacyLink: '隐私政策',
    submitBtn: '提交申请',
    submittingBtn: '提交中...',
    errorMsg: '出现错误，请重试。',
    rateLimitedMsg: '您的网络提交次数过多，请24小时后再试。',
    successTitle: '申请已收到',
    successP1: '您的申请已成功提交。',
    successP2: '我们将审核您的申请，并通过电子邮件与您联系。\n感谢您的申请。',
    // Newsletter
    navNewsletter: '电子报',
    nlLabel: 'WELLINDER 电子报',
    nlHeadline: '由内而外，焕发光彩。',
    nlSub: '每周精选 K-美容、内在美与健康生活洞察 — 献给认真对待自己仪式感的你。',
    nlPillar1Title: 'K美容情报',
    nlPillar1Desc: '最新 K-美容成分、趋势与品牌动态，每周精选呈现。',
    nlPillar2Title: '内在美',
    nlPillar2Desc: '胶原蛋白、适应原与由内而外滋养肌肤的日常仪式。',
    nlPillar3Title: '肌肤与体态管理',
    nlPillar3Desc: '从护肤视角出发，探讨饮食、运动与身体管理。好看从感觉好开始。',
    nlPillar4Title: '全方位健康',
    nlPillar4Desc: '睡眠、激素、压力与抗衰老 — 光彩肌肤背后的全身健康图景。',
    nlFormTitle: '订阅电子报',
    nlFormSub: '无垃圾邮件，只有值得一读的美肌小贴士。',
    nlConsent: '我同意接收 Wellinder 电子报，并同意我的个人信息用于此目的。可随时取消订阅。',
    nlNamePH: '您的姓名',
    nlEmailPH: '您的电子邮件地址',
    nlSubmitBtn: '立即订阅',
    nlSubmittingBtn: '订阅中...',
    nlSuccessTitle: '订阅成功！',
    nlSuccessMsg: '感谢订阅，下期电子报将发送至您的邮箱。',
    nlErrorMsg: '出现错误，请重试。',
    nlAlreadyMsg: '此邮箱已订阅。',
  },
};

// --- Diamond Icon ---
const DiamondIcon = ({ className }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M6 3h12l4 6-10 12L2 9z" fill="white" />
    <path d="M11 3v18" />
    <path d="M2 9h20" />
    <path d="M6 3l5 6 7-6" />
  </svg>
);

// --- Header ---
const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [session, setSession] = useState(null);
  const { lang, setLang, t } = useLang();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => setSession(session));
    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsOpen(false);
  };

  return (
    <header className="fixed top-0 left-0 w-full z-50 px-6 py-4 flex justify-between items-center bg-white/80 backdrop-blur-sm border-b border-wellinder-dark/5">
      <Link to="/" className="flex items-center gap-4 group">
        <DiamondIcon className="w-8 h-8 md:w-10 md:h-10 text-wellinder-dark transition-transform group-hover:rotate-12" />
        <div className="flex flex-col">
          <span className="text-lg md:text-2xl font-serif tracking-tighter text-wellinder-dark leading-none">{t('headerTitle')}</span>
          <span className="text-[9px] md:text-[11px] tracking-[0.2em] text-wellinder-dark/50 mt-1 font-medium">
            Share your rituals.<br />Inspire others.
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
          className="text-[10px] tracking-[0.15em] font-medium text-wellinder-dark/35 hover:text-wellinder-dark transition-colors uppercase"
        >
          {lang === 'en' ? '中文' : 'EN'}
        </button>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-wellinder-dark/5 rounded-full transition-colors"
        >
          {isOpen ? <X /> : <Menu />}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 w-full bg-white border-b border-wellinder-dark/10 p-8 shadow-xl"
          >
            <nav className="flex flex-col gap-6 text-center">
              <Link
                to="/about"
                onClick={() => setIsOpen(false)}
                className="text-xl font-serif hover:text-wellinder-gold transition-colors"
              >About</Link>
              <Link
                to="/apply"
                onClick={() => setIsOpen(false)}
                className="text-xl font-serif hover:text-wellinder-gold transition-colors"
              >{t('navApply')}</Link>
              <Link
                to="/newsletter"
                onClick={() => setIsOpen(false)}
                className="text-xl font-serif hover:text-wellinder-gold transition-colors"
              >{t('navNewsletter')}</Link>
              <Link
                to="/lounge"
                onClick={() => setIsOpen(false)}
                className="text-xl font-serif hover:text-wellinder-gold transition-colors flex items-center justify-center gap-2"
              >
                {t('navLounge')}
                <span className="text-[9px] uppercase tracking-widest font-bold text-wellinder-dark/30 border border-wellinder-dark/20 px-2 py-0.5 rounded-full">{t('navMembers')}</span>
              </Link>
              {session ? (
                <button
                  onClick={handleLogout}
                  className="text-xl font-serif text-wellinder-dark/40 hover:text-wellinder-dark transition-colors"
                >{t('navSignOut')}</button>
              ) : (
                <Link
                  to="/lounge"
                  onClick={() => setIsOpen(false)}
                  className="text-xl font-serif text-wellinder-dark/40 hover:text-wellinder-dark transition-colors"
                >{t('navMemberLogin')}</Link>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

// --- Footer CTA ---
const FooterCTA = () => {
  const location = useLocation();
  const { t } = useLang();
  if (location.pathname !== '/') return null;

  return (
    <div className="fixed bottom-0 left-0 w-full p-6 z-40">
      <div className="max-w-md mx-auto">
        <Link to="/apply">
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-wellinder-dark text-white py-4 rounded-full font-sans font-semibold tracking-wide shadow-2xl flex items-center justify-center gap-2 cursor-pointer"
          >
            {t('footerBtn')}
          </motion.div>
        </Link>
        <p className="text-center text-[10px] uppercase tracking-widest mt-3 text-wellinder-dark/60 font-medium">
          {t('footerSub')}
        </p>
      </div>
    </div>
  );
};

// --- Apply Page ---
const ApplyPage = () => {
  const { t } = useLang();

  return (
    <div className="min-h-screen pb-32">

      {/* Hero Section */}
      <section className="w-full bg-wellinder-cream pt-[72px]">
        <img
          src={heroImg}
          alt="Wellinder - Korean Inner Beauty Collagen"
          className="w-full block"
        />
      </section>

      {/* Philosophy Section */}
      <section className="py-16 px-6 bg-wellinder-cream">
        <div className="max-w-xl mx-auto text-center">
          <span className="text-wellinder-dark uppercase tracking-[0.3em] text-xs font-semibold mb-4 block">{t('philLabel')}</span>
          <h2 className="text-xl md:text-2xl font-serif mb-8 italic text-wellinder-dark whitespace-nowrap">{t('philQuote')}</h2>
          <div className="text-wellinder-dark/70 leading-loose text-base space-y-4">
            <p className="font-medium text-wellinder-dark">{t('philBelieve')}</p>
            <p>{t('philP1')}</p>
            <p>{t('philP2')}</p>
            <p>{t('philP3')}</p>
            <p>{t('philP4')}</p>
          </div>
        </div>
      </section>

      {/* Jewellery Tier System */}
      <section className="py-12 px-6 bg-wellinder-cream">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-xl md:text-2xl font-serif text-center mb-10 text-wellinder-dark whitespace-nowrap">{t('tierTitle')}</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: t('tier1Name'),
                desc: t('tier1Desc'),
                icon: <Diamond className="w-8 h-8 text-wellinder-dark" />,
                status: t('tier1Status')
              },
              {
                title: t('tier2Name'),
                desc: t('tier2Desc'),
                icon: <Sparkles className="w-8 h-8 text-wellinder-dark" />,
                status: t('tier2Status')
              },
              {
                title: t('tier3Name'),
                desc: t('tier3Desc'),
                icon: (
                  <div className="relative inline-block">
                    <Gem className="w-8 h-8 text-wellinder-dark fill-wellinder-dark/10 drop-shadow-[0_0_12px_rgba(0,0,0,0.15)]" />
                    <motion.div
                      animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5], rotate: [0, 45, 90] }}
                      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                      className="absolute -top-1 -right-1 text-[10px]"
                    >✨</motion.div>
                    <motion.div
                      animate={{ opacity: [0, 1, 0], scale: [0.5, 1, 0.5], rotate: [0, -45, -90] }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                      className="absolute -bottom-1 -left-1 text-[8px]"
                    >✨</motion.div>
                  </div>
                ),
                status: t('tier3Status')
              }
            ].map((tier, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-wellinder-dark/5 hover:border-wellinder-dark/20 transition-all hover:shadow-xl group">
                <div className="flex items-center gap-4 mb-3">
                  <div className="flex-shrink-0 transform transition-transform group-hover:scale-110 duration-500">{tier.icon}</div>
                  <div>
                    <h3 className="text-xl font-serif text-wellinder-dark">{tier.title}</h3>
                    <p className="text-[10px] text-wellinder-dark/40 uppercase tracking-widest font-bold">{tier.status}</p>
                  </div>
                </div>
                <p className="text-wellinder-dark/60 text-sm leading-relaxed italic">{tier.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Creator Benefits */}
      <section className="py-16 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-xl md:text-2xl font-serif text-wellinder-dark mb-2">{t('benefitsTitle')}</h2>
            <p className="text-wellinder-dark/60 text-sm">{t('benefitsSub')}</p>
          </div>
          <div className="space-y-6">
            {[
              { icon: <ShoppingBag className="w-5 h-5 text-wellinder-dark" />, title: t('b1Title'), desc: t('b1Desc') },
              { icon: <TrendingUp className="w-5 h-5 text-wellinder-dark" />, title: t('b3Title'), desc: t('b3Desc') },
              { icon: <Users className="w-5 h-5 text-wellinder-dark" />, title: t('b4Title'), desc: t('b4Desc') },
            ].map((benefit, i) => (
              <div key={i} className="flex items-start gap-4">
                <div className="w-9 h-9 bg-wellinder-cream rounded-full flex items-center justify-center flex-shrink-0">
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="text-base font-serif mb-1 text-wellinder-dark">{benefit.title}</h3>
                  <p className="text-wellinder-dark/60 text-sm leading-relaxed">{benefit.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
};

// --- Application Page ---
const ApplicationPage = () => {
  const { t } = useLang();
  const [formData, setFormData] = useState({
    fullName: '',
    tiktok: '',
    instagram: '',
    email: '',
    country: '',
    agreed: false,
    platforms: [],
    platformOther: '',
    contentTypes: [],
    contentTypeOther: '',
    rateCard: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const togglePlatform = (platform) => {
    setFormData(prev => ({
      ...prev,
      platforms: prev.platforms.includes(platform)
        ? prev.platforms.filter(p => p !== platform)
        : [...prev.platforms, platform],
    }));
  };

  const toggleContentType = (type) => {
    setFormData(prev => ({
      ...prev,
      contentTypes: prev.contentTypes.includes(type)
        ? prev.contentTypes.filter(c => c !== type)
        : [...prev.contentTypes, type],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { data, error } = await supabase.functions.invoke('submit-application', {
      body: {
        full_name: formData.fullName,
        tiktok_handle: formData.tiktok,
        instagram_handle: formData.instagram,
        email: formData.email,
        country: formData.country,
        application_type: 'creator_pool',
        platforms: formData.platforms,
        platforms_other: formData.platformOther || null,
        content_types: formData.contentTypes,
        content_type_other: formData.contentTypeOther || null,
        rate_card: formData.rateCard || null,
      },
    });

    setSubmitting(false);
    if (error || data?.error) {
      const errCode = data?.error ?? error?.message;
      if (errCode === 'rate_limited') {
        setError(t('rateLimitedMsg'));
      } else {
        setError(t('errorMsg'));
      }
    } else {
      setSubmitted(true);
      if (typeof fbq === 'function') fbq('track', 'SubmitApplication');
    }
  };

  return (
    <div className="min-h-screen bg-wellinder-cream pt-24 pb-32 px-6">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-10">
          <span className="text-wellinder-dark/50 uppercase tracking-[0.3em] text-xs font-semibold mb-4 block">{t('appLabel')}</span>
          <p className="text-wellinder-dark/70 mb-6">
            If your daily ritual can inspire others,<br />we invite you to begin your brilliant transformation with us.
          </p>
          <h2 className="text-xl md:text-2xl font-serif italic text-wellinder-dark whitespace-nowrap">{t('appTitle')}</h2>
        </div>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="text-5xl mb-6">✨</div>
            <h3 className="text-3xl font-serif italic text-wellinder-dark mb-4">{t('successTitle')}</h3>
            <p className="text-wellinder-dark/70 text-base leading-relaxed mb-2">
              {t('successP1')}
            </p>
            <p className="text-wellinder-dark/50 text-sm leading-relaxed">
              {t('successP2').split('\n').map((line, i) => <React.Fragment key={i}>{line}{i === 0 && <br />}</React.Fragment>)}
            </p>
            <div className="mt-10 pt-8 border-t border-wellinder-dark/10">
              <p className="text-[10px] uppercase tracking-[0.3em] text-wellinder-dark/30 font-semibold">Wellinder Creators</p>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Application Type Selector */}
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-wellinder-dark/50 block mb-3">{t('appTypeLabel')}</label>
              <div className="grid grid-cols-2 gap-3">
                <div className="border-2 border-wellinder-dark rounded-2xl p-4 bg-wellinder-dark text-white">
                  <p className="font-semibold text-sm">{t('appTypeCreatorPool')}</p>
                  <p className="text-[11px] opacity-70 mt-1">{t('appTypeCreatorPoolDesc')}</p>
                </div>
                <div className="border border-wellinder-dark/15 rounded-2xl p-4 bg-wellinder-dark/5 cursor-not-allowed relative overflow-hidden">
                  <p className="font-semibold text-sm text-wellinder-dark/35">{t('appTypeChallenge')}</p>
                  <p className="text-[11px] text-wellinder-dark/30 mt-1">{t('appTypeChallengeDesc')}</p>
                </div>
              </div>
            </div>

            {/* Basic Info */}
            <div className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-wellinder-dark/50 block mb-2">{t('fieldName')}</label>
                <input
                  type="text"
                  placeholder={t('fieldNamePH')}
                  value={formData.fullName}
                  onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full bg-white border border-wellinder-dark/10 rounded-2xl py-4 px-5 text-wellinder-dark outline-none focus:border-wellinder-dark transition-colors placeholder:text-wellinder-dark/30"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-wellinder-dark/50 block mb-2">{t('fieldTikTok')}</label>
                <input
                  type="text"
                  placeholder="@username"
                  value={formData.tiktok}
                  onChange={e => setFormData({ ...formData, tiktok: e.target.value })}
                  className="w-full bg-white border border-wellinder-dark/10 rounded-2xl py-4 px-5 text-wellinder-dark outline-none focus:border-wellinder-dark transition-colors placeholder:text-wellinder-dark/30"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-wellinder-dark/50 block mb-2">{t('fieldIG')}</label>
                <input
                  type="text"
                  placeholder="@username"
                  value={formData.instagram}
                  onChange={e => setFormData({ ...formData, instagram: e.target.value })}
                  className="w-full bg-white border border-wellinder-dark/10 rounded-2xl py-4 px-5 text-wellinder-dark outline-none focus:border-wellinder-dark transition-colors placeholder:text-wellinder-dark/30"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-wellinder-dark/50 block mb-2">{t('fieldEmail')}</label>
                <input
                  type="email"
                  placeholder="email@example.com"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white border border-wellinder-dark/10 rounded-2xl py-4 px-5 text-wellinder-dark outline-none focus:border-wellinder-dark transition-colors placeholder:text-wellinder-dark/30"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest font-bold text-wellinder-dark/50 block mb-2">{t('fieldCountry')}</label>
                <select
                  value={formData.country}
                  onChange={e => setFormData({ ...formData, country: e.target.value })}
                  className="w-full bg-white border border-wellinder-dark/10 rounded-2xl py-4 px-5 text-wellinder-dark outline-none focus:border-wellinder-dark transition-colors appearance-none"
                >
                  <option value="">{t('countrySelect')}</option>
                  <option value="SG">{t('countrySG')}</option>
                  <option value="KR" disabled>{t('countryKR')}</option>
                  <option value="MY" disabled>{t('countryMY')}</option>
                  <option value="JP" disabled>{t('countryJP')}</option>
                  <option value="TW" disabled>{t('countryTW')}</option>
                  <option value="HK" disabled>{t('countryHK')}</option>
                  <option value="TH" disabled>{t('countryTH')}</option>
                  <option value="ID" disabled>{t('countryID')}</option>
                  <option value="PH" disabled>{t('countryPH')}</option>
                  <option value="VN" disabled>{t('countryVN')}</option>
                  <option value="AU" disabled>{t('countryAU')}</option>
                  <option value="US" disabled>{t('countryUS')}</option>
                  <option value="GB" disabled>{t('countryGB')}</option>
                  <option value="CA" disabled>{t('countryCA')}</option>
                  <option value="FR" disabled>{t('countryFR')}</option>
                </select>
                {formData.country && formData.country !== 'SG' && (
                  <p className="text-[11px] text-amber-600 mt-2 px-1 font-medium">{t('countrySoonNote')}</p>
                )}
                {!formData.country && (
                  <p className="text-[11px] text-wellinder-dark/40 mt-2 px-1">{t('countryDefaultNote')}</p>
                )}
              </div>
            </div>

            {/* Platform Selection */}
            <div className="bg-white border border-wellinder-dark/10 rounded-2xl p-5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-wellinder-dark/50 block mb-1">{t('platformLabel')}</label>
              <p className="text-[10px] text-wellinder-dark/40 mb-4">{t('platformSub')}</p>
              <div className="space-y-3">
                {['Instagram', 'TikTok', 'YouTube', 'Facebook', 'X (Twitter)'].map(platform => (
                  <label key={platform} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.platforms.includes(platform)}
                      onChange={() => togglePlatform(platform)}
                      className="w-4 h-4 accent-wellinder-dark flex-shrink-0"
                    />
                    <span className="text-sm text-wellinder-dark group-hover:text-wellinder-dark/70 transition-colors">{platform}</span>
                  </label>
                ))}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.platforms.includes('Other')}
                    onChange={() => togglePlatform('Other')}
                    className="w-4 h-4 accent-wellinder-dark flex-shrink-0"
                  />
                  <span className="text-sm text-wellinder-dark group-hover:text-wellinder-dark/70 transition-colors">Other</span>
                </label>
                {formData.platforms.includes('Other') && (
                  <input
                    type="text"
                    placeholder={t('otherPH')}
                    value={formData.platformOther}
                    onChange={e => setFormData({ ...formData, platformOther: e.target.value })}
                    className="w-full bg-wellinder-cream border border-wellinder-dark/10 rounded-xl py-3 px-4 text-wellinder-dark outline-none focus:border-wellinder-dark transition-colors placeholder:text-wellinder-dark/30 text-sm ml-7"
                    style={{ width: 'calc(100% - 1.75rem)' }}
                  />
                )}
              </div>
            </div>

            {/* Content Type */}
            <div className="bg-white border border-wellinder-dark/10 rounded-2xl p-5">
              <label className="text-[10px] uppercase tracking-widest font-bold text-wellinder-dark/50 block mb-1">{t('contentLabel')}</label>
              <p className="text-[10px] text-wellinder-dark/40 mb-4">{t('contentSub')}</p>
              <div className="space-y-3">
                {['Beauty', 'Lifestyle', 'Food', 'Parenting'].map(type => (
                  <label key={type} className="flex items-center gap-3 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={formData.contentTypes.includes(type)}
                      onChange={() => toggleContentType(type)}
                      className="w-4 h-4 accent-wellinder-dark flex-shrink-0"
                    />
                    <span className="text-sm text-wellinder-dark group-hover:text-wellinder-dark/70 transition-colors">{type}</span>
                  </label>
                ))}
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={formData.contentTypes.includes('Other')}
                    onChange={() => toggleContentType('Other')}
                    className="w-4 h-4 accent-wellinder-dark flex-shrink-0"
                  />
                  <span className="text-sm text-wellinder-dark group-hover:text-wellinder-dark/70 transition-colors">Other</span>
                </label>
                {formData.contentTypes.includes('Other') && (
                  <input
                    type="text"
                    placeholder={t('otherPH')}
                    value={formData.contentTypeOther}
                    onChange={e => setFormData({ ...formData, contentTypeOther: e.target.value })}
                    className="w-full bg-wellinder-cream border border-wellinder-dark/10 rounded-xl py-3 px-4 text-wellinder-dark outline-none focus:border-wellinder-dark transition-colors placeholder:text-wellinder-dark/30 text-sm ml-7"
                    style={{ width: 'calc(100% - 1.75rem)' }}
                  />
                )}
              </div>
            </div>

            {/* Rate Card */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <label className="text-[10px] uppercase tracking-widest font-bold text-wellinder-dark/50">{t('rateCardLabel')}</label>
                <span className="text-[9px] uppercase tracking-widest text-wellinder-dark/30 border border-wellinder-dark/20 rounded-full px-2 py-0.5">{t('rateCardOptional')}</span>
              </div>
              <textarea
                placeholder={t('rateCardPH')}
                value={formData.rateCard}
                onChange={e => setFormData({ ...formData, rateCard: e.target.value })}
                rows={3}
                className="w-full bg-white border border-wellinder-dark/10 rounded-2xl py-4 px-5 text-wellinder-dark outline-none focus:border-wellinder-dark transition-colors placeholder:text-wellinder-dark/30 text-sm resize-none"
              />
            </div>

            {/* Privacy Notice */}
            <div className="bg-wellinder-cream rounded-2xl px-5 py-4">
              <p className="text-[11px] text-wellinder-dark/50 leading-relaxed">
                🔒 {t('privacyNote')}
              </p>
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={formData.agreed}
                onChange={e => setFormData({ ...formData, agreed: e.target.checked })}
                className="mt-1 w-4 h-4 accent-wellinder-dark"
              />
              <label htmlFor="terms" className="text-xs text-wellinder-dark/60 whitespace-nowrap">
                {t('termsText')} <Link to="/terms" target="_blank" className="underline hover:text-wellinder-dark transition-colors">{t('termsLink')}</Link> {t('termsAnd')} <Link to="/privacy" target="_blank" className="underline hover:text-wellinder-dark transition-colors">{t('privacyLink')}</Link>.
              </label>
            </div>

            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
              type="submit"
              disabled={!formData.agreed || submitting || formData.country !== 'SG' || !formData.fullName.trim() || !formData.instagram.trim() || !formData.email.trim() || formData.platforms.length === 0}
              className={cn(
                "w-full py-4 rounded-full font-sans font-semibold tracking-wide transition-all",
                formData.agreed && !submitting && formData.country === 'SG' && formData.fullName.trim() && formData.instagram.trim() && formData.email.trim() && formData.platforms.length > 0
                  ? "bg-wellinder-dark text-white shadow-lg hover:bg-wellinder-dark/90"
                  : "bg-wellinder-dark/20 text-wellinder-dark/40 cursor-not-allowed"
              )}
            >
              {submitting ? t('submittingBtn') : t('submitBtn')}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

// --- Portal Page ---
const PortalPage = () => {
  const [isLocked, setIsLocked] = useState(true);
  const [password, setPassword] = useState('');

  if (isLocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-wellinder-cream px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-wellinder-dark/5 rounded-full flex items-center justify-center mx-auto mb-8 border border-wellinder-dark/10">
            <Lock className="w-8 h-8 text-wellinder-dark" />
          </div>
          <h2 className="text-3xl font-serif text-wellinder-dark mb-4 italic">Secret Vault</h2>
          <p className="text-wellinder-dark/50 mb-8 font-light">This portal is exclusive to 'The Jewels'. Please enter your invitation code to enter.</p>
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Vault Key"
              className="w-full bg-white border border-wellinder-dark/10 rounded-full py-4 px-6 text-wellinder-dark outline-none focus:border-wellinder-dark transition-colors text-center tracking-widest"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button
              onClick={() => {
                if (password === 'diamond') setIsLocked(false);
                else alert('Invalid key. Please check your welcome email.');
              }}
              className="w-full bg-wellinder-dark text-white py-4 rounded-full font-sans font-semibold tracking-wide shadow-lg"
            >
              Enter Vault
            </button>
          </div>
          <Link to="/" className="inline-block mt-8 text-wellinder-dark/30 hover:text-wellinder-dark/60 text-sm transition-colors">
            Return to Entrance
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-wellinder-cream pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div>
            <span className="text-wellinder-dark/40 uppercase tracking-[0.3em] text-xs font-semibold mb-2 block">The Jewels Dashboard</span>
            <h1 className="text-4xl font-serif italic text-wellinder-dark">Welcome back, Creator.</h1>
          </div>
          <div className="flex gap-3">
            <div className="px-4 py-2 bg-white rounded-full border border-wellinder-dark/5 text-sm font-medium flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              Active Season
            </div>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-wellinder-dark/5">
              <h3 className="text-xl font-serif mb-6 flex items-center gap-2 text-wellinder-dark">
                <ShoppingBag className="w-5 h-5 text-wellinder-dark" />
                Product Seeding
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { name: 'Diamond Radiance Serum', points: '500 pts', img: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?auto=format&fit=crop&q=80&w=500' },
                  { name: 'Crystal Clarity Mist', points: '350 pts', img: 'https://images.unsplash.com/photo-1556229010-6c3f2c9ca5f8?auto=format&fit=crop&q=80&w=500' }
                ].map((item, i) => (
                  <div key={i} className="group cursor-pointer">
                    <div className="aspect-square rounded-2xl overflow-hidden mb-3">
                      <img src={item.img} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <h4 className="font-medium text-sm text-wellinder-dark">{item.name}</h4>
                    <p className="text-xs text-wellinder-dark/60 font-bold">{item.points}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-wellinder-dark/5">
              <h3 className="text-xl font-serif mb-6 flex items-center gap-2 text-wellinder-dark">
                <LayoutDashboard className="w-5 h-5 text-wellinder-dark" />
                Active Missions
              </h3>
              <div className="space-y-4">
                {[
                  { title: 'TikTok Showcase: The Vault Reveal', deadline: '2 days left', reward: '$50 + 10% Comm' },
                  { title: 'Instagram Reel: Brilliant Shine', deadline: '5 days left', reward: '$30 + 10% Comm' }
                ].map((mission, i) => (
                  <div key={i} className="p-4 bg-wellinder-cream rounded-2xl flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-sm text-wellinder-dark">{mission.title}</h4>
                      <p className="text-[10px] text-wellinder-dark/40 uppercase tracking-widest font-bold">{mission.deadline}</p>
                    </div>
                    <p className="text-xs font-bold text-wellinder-dark">{mission.reward}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-wellinder-dark text-white p-8 rounded-3xl shadow-xl">
              <h3 className="text-lg font-serif mb-6 flex items-center gap-2">
                <Users className="w-5 h-5 text-white" />
                Your Stats
              </h3>
              <div className="space-y-6">
                <div>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-1">Total Earnings</p>
                  <p className="text-3xl font-serif">$1,240.50</p>
                </div>
                <div>
                  <p className="text-white/40 text-[10px] uppercase tracking-widest font-bold mb-1">Conversion Rate</p>
                  <p className="text-3xl font-serif">4.8%</p>
                </div>
                <button className="w-full bg-white/10 hover:bg-white/20 py-3 rounded-xl text-xs font-bold transition-colors">
                  Withdraw Funds
                </button>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-wellinder-dark/5">
              <h3 className="text-lg font-serif mb-4 text-wellinder-dark">Vault Status</h3>
              <div className="w-full bg-wellinder-cream h-2 rounded-full overflow-hidden mb-4">
                <div className="bg-wellinder-dark h-full w-[75%]" />
              </div>
              <p className="text-xs text-wellinder-dark/60 leading-relaxed">
                You are <strong>75%</strong> towards maintaining your 'Jewel' status for next season. Keep it up!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Newsletter Page ---
const NewsletterPage = () => {
  const { t } = useLang();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [consented, setConsented] = useState(false);
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error | duplicate

  const pillars = [
    { title: t('nlPillar1Title'), desc: t('nlPillar1Desc') },
    { title: t('nlPillar2Title'), desc: t('nlPillar2Desc') },
    { title: t('nlPillar3Title'), desc: t('nlPillar3Desc') },
    { title: t('nlPillar4Title'), desc: t('nlPillar4Desc') },
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ name: name.trim(), email: email.trim().toLowerCase() });
    if (!error) {
      setStatus('success');
    } else if (error.code === '23505') {
      setStatus('duplicate');
    } else {
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-wellinder-cream pb-32 pt-[72px]">
      {/* Hero */}
      <section className="py-20 px-6 text-center max-w-2xl mx-auto">
        <span className="text-[10px] uppercase tracking-[0.35em] text-wellinder-dark/40 font-semibold block mb-6">
          {t('nlLabel')}
        </span>
        <h1 className="text-4xl md:text-5xl font-serif italic text-wellinder-dark mb-6 leading-tight">
          {t('nlHeadline')}
        </h1>
        <p className="text-wellinder-dark/60 text-base leading-relaxed max-w-lg mx-auto">
          {t('nlSub')}
        </p>
      </section>

      {/* Pillars */}
      <section className="px-6 max-w-2xl mx-auto mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((p) => (
            <div key={p.title} className="border border-wellinder-dark/10 p-6 bg-white/50">
              <span className="text-[9px] uppercase tracking-[0.3em] text-wellinder-dark/30 font-bold block mb-3">✦</span>
              <h3 className="font-serif text-wellinder-dark text-lg mb-2">{p.title}</h3>
              <p className="text-wellinder-dark/55 text-sm leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Form */}
      <section className="px-6 max-w-md mx-auto">
        <div className="text-center mb-8">
          <h2 className="font-serif text-2xl text-wellinder-dark mb-2">{t('nlFormTitle')}</h2>
          <p className="text-wellinder-dark/45 text-sm">{t('nlFormSub')}</p>
        </div>

        {status === 'success' ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <p className="text-2xl font-serif text-wellinder-dark mb-3">{t('nlSuccessTitle')}</p>
            <p className="text-wellinder-dark/55 text-sm">{t('nlSuccessMsg')}</p>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              required
              placeholder={t('nlNamePH')}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full border border-wellinder-dark/15 bg-white px-4 py-3.5 text-sm text-wellinder-dark placeholder-wellinder-dark/30 focus:outline-none focus:border-wellinder-dark/40 transition-colors"
            />
            <input
              type="email"
              required
              placeholder={t('nlEmailPH')}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-wellinder-dark/15 bg-white px-4 py-3.5 text-sm text-wellinder-dark placeholder-wellinder-dark/30 focus:outline-none focus:border-wellinder-dark/40 transition-colors"
            />
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={consented}
                onChange={(e) => setConsented(e.target.checked)}
                className="mt-0.5 w-4 h-4 accent-wellinder-dark flex-shrink-0"
              />
              <span className="text-xs text-wellinder-dark/50 leading-relaxed">
                {t('nlConsent')}{' '}
                <Link to="/privacy" className="underline hover:text-wellinder-dark transition-colors">
                  Privacy Policy
                </Link>
              </span>
            </label>
            {(status === 'error' || status === 'duplicate') && (
              <p className="text-red-500 text-xs text-center">
                {status === 'duplicate' ? t('nlAlreadyMsg') : t('nlErrorMsg')}
              </p>
            )}
            <button
              type="submit"
              disabled={status === 'submitting' || !consented}
              className="w-full bg-wellinder-dark text-wellinder-cream py-3.5 text-sm tracking-[0.15em] uppercase font-medium hover:bg-wellinder-dark/85 transition-colors disabled:opacity-50"
            >
              {status === 'submitting' ? t('nlSubmittingBtn') : t('nlSubmitBtn')}
            </button>
          </form>
        )}
      </section>
    </div>
  );
};

// --- Auth Redirect Handler ---
const ADMIN_EMAIL = 'hello@wellinder.co.kr';

function AuthRedirectHandler() {
  const navigate = useNavigate();
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        navigate('/admin-reset', { state: { fromRecovery: true, isAdmin: session?.user?.email === ADMIN_EMAIL } });
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  return null;
}

// --- Main App ---
export default function App() {
  const [lang, setLang] = useState('en');
  const t = (key) => translations[lang][key] ?? key;

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      <Router>
        <AuthRedirectHandler />
        <div className="relative">
          <Header />
          <main>
            <Routes>
              <Route path="/" element={<ApplyPage />} />
              <Route path="/apply" element={<ApplicationPage />} />
              <Route path="/portal" element={<PortalPage />} />
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/lounge" element={<LoungePage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/admin-reset" element={<AdminResetPage />} />
              <Route path="/accept-invite" element={<AcceptInvitePage />} />
              <Route path="/consent" element={<ConsentPage />} />
              <Route path="/terms" element={<TermsPage />} />
              <Route path="/privacy" element={<PrivacyPage />} />
              <Route path="/about" element={<AboutPage />} />
              <Route path="/newsletter" element={<NewsletterPage />} />
            </Routes>
          </main>
          <FooterCTA />
        </div>
      </Router>
    </LangContext.Provider>
  );
}
