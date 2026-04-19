import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { LogOut, ExternalLink, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

// ─── Config ────────────────────────────────────────────────────────────────
const CHALLENGE_START = null; // 날짜 확정 시 'YYYY-MM-DD' 입력
const TOTAL_WEEKS = 8;
const REQUIRED_UPLOADS_TOTAL = 5;
const REQUIRED_SESSIONS_TOTAL = 3;

// ─── TikTok mock data (나중에 DB로 교체) ────────────────────────────────────
const MOCK_TIKTOK_UPLOADS = [
  { id: 1, handle: '@creator.sg', video_url: 'https://www.tiktok.com', thumbnail: null, views: 52000, likes: 3200, saves: 180, uploaded_at: '2026-04-14', week: 2 },
  { id: 2, handle: '@beauty.daily', video_url: 'https://www.tiktok.com', thumbnail: null, views: 38500, likes: 2100, saves: 95, uploaded_at: '2026-04-13', week: 2 },
  { id: 3, handle: '@glow.sg', video_url: 'https://www.tiktok.com', thumbnail: null, views: 27000, likes: 1750, saves: 67, uploaded_at: '2026-04-12', week: 1 },
  { id: 4, handle: '@skincare.routine', video_url: 'https://www.tiktok.com', thumbnail: null, views: 15200, likes: 890, saves: 42, uploaded_at: '2026-04-11', week: 1 },
  { id: 5, handle: '@creator.sg', video_url: 'https://www.tiktok.com', thumbnail: null, views: 12300, likes: 780, saves: 35, uploaded_at: '2026-04-10', week: 1 },
  { id: 6, handle: '@glow.sg', video_url: 'https://www.tiktok.com', thumbnail: null, views: 9800, likes: 560, saves: 23, uploaded_at: '2026-04-09', week: 1 },
  { id: 7, handle: '@beauty.daily', video_url: 'https://www.tiktok.com', thumbnail: null, views: 7300, likes: 420, saves: 18, uploaded_at: '2026-04-08', week: 1 },
  { id: 8, handle: '@wellinder.picks', video_url: 'https://www.tiktok.com', thumbnail: null, views: 5100, likes: 280, saves: 9, uploaded_at: '2026-04-07', week: 1 },
];

function formatCount(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + 'M';
  if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'K';
  return n.toString();
}

// ─── Speaker options ────────────────────────────────────────────────────────
const SPEAKER_OPTIONS = [
  { value: 'brand_pro', en: 'A brand professional who has experience collaborating with K-beauty creators', zh: '拥有与 K-beauty 创作者合作经验的品牌专业人士' },
  { value: 'collab_creator', en: 'A creator with experience in brand partnerships or paid collaborations (including early-stage experiences)', zh: '具有品牌合作或付费合作经验的创作者（包括初期经验）' },
  { value: 'shortform_creator', en: 'A creator who excels at short-form content (Reels, TikTok, etc.)', zh: '擅长短视频内容的创作者（Reels、TikTok 等）' },
  { value: 'hook_creator', en: 'A creator who is strong in content planning and creating engaging hooks', zh: '擅长内容策划与制作吸引眼球开场的创作者' },
  { value: 'sea_marketer', en: 'A marketer with strong knowledge of the Singapore and Southeast Asian market', zh: '深谙新加坡及东南亚市场的营销专家' },
  { value: 'actionable_speaker', en: 'A speaker who can share real, actionable advice for early-stage creators', zh: '能为初期创作者提供实用建议的演讲嘉宾' },
  { value: 'other', en: 'Other (please specify)', zh: '其他（请注明）' },
];

// ─── i18n ────────────────────────────────────────────────────────────────────
const T = {
  en: {
    badge: 'Wellinder Creators',
    challengeTitle: 'Creator Challenge',
    weekLabel: (n) => n ? `Week ${n} of ${TOTAL_WEEKS}` : `Week — of ${TOTAL_WEEKS}`,
    scheduleSection: 'Challenge Schedule',
    weekNum: (n) => `Week ${n}`,
    datesTbd: 'Dates TBD',
    statusDone: 'Completed',
    statusActive: 'In Progress',
    statusUpcoming: 'Upcoming',
    progressSection: 'My Progress',
    requiredUploads: 'Required Uploads',
    requiredSessions: 'Required Sessions',
    missionsSection: 'Required Missions',
    optionalSection: 'Optional Uploads',
    schedSection: 'Schedule',
    webinars: 'Webinars',
    expertSessions: 'Expert Sessions',
    noSchedule: 'Schedule to be announced.',
    noMissions: 'New missions coming soon.',
    noOptional: 'Feel free to share additional content at any time.',
    due: (d) => `Due ${new Date(d).toLocaleDateString('en-SG', { month: 'short', day: 'numeric' })}`,
    closed: 'Closed',
    participate: 'Participate',
    done: 'Done',
    guide: 'Content Guide',
    submitVideo: 'Submit',
    videoPlaceholder: 'Paste your TikTok video link...',
    videoSubmitted: 'Video submitted',
    videoSubmitError: 'Please enter a valid TikTok link.',
    shippingSection: 'Shipping & Survey',
    shippingDeadline: 'Please complete by April 21',
    shippingDiscord: 'Also, join our Discord community:',
    shippingNote: 'We\'ll use this address to ship your Wellinder products.',
    shippingName: 'Full Name',
    shippingAddress: 'Address (including unit number)',
    shippingPhone: 'Contact Number',
    speakerQ: 'Which type of speaker would you like to meet in this session? (Multiple selections allowed)',
    speakerOtherPlaceholder: 'Please specify',
    privacyNote: 'Your shipping information will be used solely for product delivery and will be deleted within one week after the program ends.',
    submit: 'Submit',
    submitting: 'Submitting...',
    submittedLabel: 'Submitted',
    submittedNote: 'Your information has been received.',
    errName: 'Please enter your full name.',
    errAddress: 'Please enter your address.',
    errPhone: 'Please enter your contact number.',
    faqSection: 'FAQ',
    noFaq: 'FAQs coming soon.',
    signOut: 'Sign out',
    enterLounge: 'Enter the Lounge',
    signingIn: 'Signing in...',
    incorrectAuth: 'Incorrect email or password.',
    accessPending: 'Access Pending',
    accessPendingNote: "Your application is still being reviewed. We'll reach out via email once you're approved.",
  },
  zh: {
    badge: 'Wellinder 创作者',
    challengeTitle: '创作者挑战赛',
    weekLabel: (n) => n ? `第 ${n} 周 / 共 ${TOTAL_WEEKS} 周` : `第 — 周 / 共 ${TOTAL_WEEKS} 周`,
    scheduleSection: '挑战赛日程',
    weekNum: (n) => `第 ${n} 周`,
    datesTbd: '日期待确认',
    statusDone: '已完成',
    statusActive: '进行中',
    statusUpcoming: '待开始',
    progressSection: '我的进度',
    requiredUploads: '必须上传',
    requiredSessions: '必须参与',
    missionsSection: '必须任务',
    optionalSection: '自由上传',
    schedSection: '日程安排',
    webinars: '网络研讨会',
    expertSessions: '专家分享',
    noSchedule: '日程安排待公布。',
    noMissions: '新任务即将发布。',
    noOptional: '欢迎随时分享额外的内容。',
    due: (d) => `截止 ${new Date(d).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })}`,
    closed: '已截止',
    participate: '参与',
    done: '已完成',
    guide: '内容指南',
    submitVideo: '提交',
    videoPlaceholder: '粘贴 TikTok 视频链接...',
    videoSubmitted: '视频已提交',
    videoSubmitError: '请输入有效的 TikTok 链接。',
    shippingSection: '配送信息与调查',
    shippingDeadline: '请于 4 月 21 日前填写',
    shippingDiscord: '同时，请加入我们的 Discord 社群：',
    shippingNote: '我们将使用此地址为您寄送 Wellinder 产品。',
    shippingName: '姓名',
    shippingAddress: '地址（含门牌号）',
    shippingPhone: '联系电话',
    speakerQ: '您希望在本次课程中见到哪种类型的嘉宾？（可多选）',
    speakerOtherPlaceholder: '请注明',
    privacyNote: '您提供的配送信息仅用于产品寄送，并将在项目结束后一周内删除。',
    submit: '提交',
    submitting: '提交中...',
    submittedLabel: '已提交',
    submittedNote: '您的信息已收到。',
    errName: '请输入您的姓名。',
    errAddress: '请输入您的地址。',
    errPhone: '请输入您的联系电话。',
    faqSection: '常见问题',
    noFaq: '常见问题即将发布。',
    signOut: '退出登录',
    enterLounge: '进入 Lounge',
    signingIn: '登录中...',
    incorrectAuth: '邮箱或密码有误。',
    accessPending: '审核中',
    accessPendingNote: '您的申请仍在审核中。审核通过后，我们将通过邮件通知您。',
  },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getWeeks(lang) {
  if (!CHALLENGE_START) {
    return Array.from({ length: TOTAL_WEEKS }, (_, i) => ({
      num: i + 1,
      range: lang === 'zh' ? '日期待确认' : 'Dates TBD',
      status: 'upcoming',
    }));
  }
  const start = new Date(CHALLENGE_START);
  const now = new Date();
  const msPerWeek = 7 * 24 * 60 * 60 * 1000;
  const currentWeekNum = Math.min(Math.max(Math.ceil((now - start) / msPerWeek), 1), TOTAL_WEEKS);
  const locale = lang === 'zh' ? 'zh-CN' : 'en-SG';
  const fmt = { month: 'short', day: 'numeric' };

  return Array.from({ length: TOTAL_WEEKS }, (_, i) => {
    const weekStart = new Date(start.getTime() + i * msPerWeek);
    const weekEnd = new Date(start.getTime() + (i + 1) * msPerWeek - 86400000);
    const range = `${weekStart.toLocaleDateString(locale, fmt)} – ${weekEnd.toLocaleDateString(locale, fmt)}`;
    const status = i + 1 < currentWeekNum ? 'done' : i + 1 === currentWeekNum ? 'active' : 'upcoming';
    return { num: i + 1, range, status };
  });
}

function getCurrentWeekNum() {
  if (!CHALLENGE_START) return null;
  const start = new Date(CHALLENGE_START);
  const now = new Date();
  return Math.min(Math.max(Math.ceil((now - start) / (7 * 24 * 60 * 60 * 1000)), 1), TOTAL_WEEKS);
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function SectionHeader({ children }) {
  return <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-wellinder-dark/40 mb-4">{children}</p>;
}

function ProgressRow({ label, done, total }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-wellinder-dark/70">{label}</span>
        <span className="text-sm font-semibold text-wellinder-dark">{done} / {total}</span>
      </div>
      <div className="flex gap-1.5">
        {Array.from({ length: total }, (_, i) => (
          <div key={i} className={`h-2 flex-1 rounded-full transition-all ${i < done ? 'bg-wellinder-dark' : 'bg-wellinder-dark/10'}`} />
        ))}
      </div>
    </div>
  );
}

function Checkbox({ checked, onChange, label }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer group py-1" onClick={onChange}>
      <div
        className={`mt-0.5 flex-shrink-0 border-2 flex items-center justify-center rounded transition-all`}
        style={{ minWidth: '18px', minHeight: '18px', width: '18px', height: '18px', ...(checked ? { background: '#1a1a1a', borderColor: '#1a1a1a' } : { borderColor: 'rgba(26,26,26,0.2)' }) }}
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

// ─── TikTok sections ──────────────────────────────────────────────────────────
function ViralKingSection({ uploads }) {
  const top3 = [...uploads].sort((a, b) => b.views - a.views).slice(0, 3);
  const rankColors = ['text-amber-400', 'text-gray-400', 'text-amber-700'];

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-wellinder-dark/40">TikTok Viral King 👑</p>
        <span className="text-[10px] text-wellinder-dark/30">by cumulative video views</span>
      </div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {top3.map((video, i) => (
          <div key={video.id} className="flex-shrink-0 w-44">
            <div className="relative aspect-[9/16] bg-wellinder-dark/5 rounded-2xl overflow-hidden mb-2 border border-wellinder-dark/5">
              {video.thumbnail ? (
                <img src={video.thumbnail} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-wellinder-dark/15 text-[11px]">thumbnail</span>
                </div>
              )}
              <span className={`absolute top-2 left-2 text-[10px] font-bold ${rankColors[i]} bg-white/90 backdrop-blur-sm rounded-full px-2 py-0.5 shadow-sm`}>
                #{i + 1}
              </span>
            </div>
            <a href={video.video_url} target="_blank" rel="noopener noreferrer"
              className="text-xs font-semibold text-wellinder-dark hover:opacity-60 transition-opacity block truncate">
              {video.handle}
            </a>
            <p className="text-rose-400 font-bold text-sm mt-0.5">{formatCount(video.views)}</p>
            <p className="text-[10px] text-wellinder-dark/30">views</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function LeaderboardSection({ uploads }) {
  const viewsMap = {};
  const uploadsMap = {};
  uploads.forEach(u => {
    viewsMap[u.handle] = (viewsMap[u.handle] || 0) + u.views;
    uploadsMap[u.handle] = (uploadsMap[u.handle] || 0) + 1;
  });
  const viewsTop5 = Object.entries(viewsMap).sort(([, a], [, b]) => b - a).slice(0, 5);
  const uploadsTop5 = Object.entries(uploadsMap).sort(([, a], [, b]) => b - a).slice(0, 5);
  const medal = (i) => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : null;

  const RankTable = ({ title, sub, rows, valueLabel }) => (
    <div className="bg-white rounded-2xl border border-wellinder-dark/8 shadow-sm p-4">
      <p className="text-[11px] font-semibold text-wellinder-dark mb-0.5">{title}</p>
      <p className="text-[9px] text-wellinder-dark/30 mb-3">{sub}</p>
      <div className="space-y-2.5">
        {rows.map(([handle, val], i) => (
          <div key={handle} className="flex items-center gap-2">
            <span className="w-5 text-center flex-shrink-0">
              {medal(i) ? <span className="text-sm">{medal(i)}</span> : <span className="text-[11px] font-bold text-wellinder-dark/25">{i + 1}</span>}
            </span>
            <span className="text-xs text-wellinder-dark/70 flex-1 truncate">{handle}</span>
            <span className="text-xs font-semibold text-wellinder-dark flex-shrink-0">{typeof val === 'number' && val >= 1000 ? formatCount(val) : val}{valueLabel}</span>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <section className="mb-8">
      <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-wellinder-dark/40 mb-4">Leaderboard 🏆</p>
      <div className="grid grid-cols-2 gap-3">
        <RankTable title="Top 5 Views" sub="by total views" rows={viewsTop5} valueLabel="" />
        <RankTable title="Top 5 Uploads" sub="by upload count" rows={uploadsTop5} valueLabel="" />
      </div>
    </section>
  );
}

function UploadTrackerSection({ uploads }) {
  const [activeWeek, setActiveWeek] = useState('all');
  const weeks = Array.from(new Set(uploads.map(u => u.week))).sort();
  const filtered = activeWeek === 'all' ? uploads : uploads.filter(u => u.week === Number(activeWeek));

  return (
    <section className="mb-8">
      <p className="text-[10px] uppercase tracking-[0.25em] font-semibold text-wellinder-dark/40 mb-4">All Uploads</p>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {['all', ...weeks].map(w => (
          <button key={w} onClick={() => setActiveWeek(String(w))}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
              String(activeWeek) === String(w)
                ? 'bg-wellinder-dark text-white'
                : 'bg-white border border-wellinder-dark/10 text-wellinder-dark/40 hover:text-wellinder-dark'
            }`}>
            {w === 'all' ? 'All' : `Wk ${w}`}
          </button>
        ))}
      </div>
      <div className="bg-white rounded-2xl border border-wellinder-dark/8 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-wellinder-dark/5 bg-wellinder-cream/30">
                <th className="text-left px-4 py-3 text-wellinder-dark/40 font-semibold whitespace-nowrap">Account</th>
                <th className="text-left px-4 py-3 text-wellinder-dark/40 font-semibold whitespace-nowrap">Date</th>
                <th className="text-right px-4 py-3 text-wellinder-dark/40 font-semibold whitespace-nowrap">Views</th>
                <th className="text-right px-4 py-3 text-wellinder-dark/40 font-semibold whitespace-nowrap">Likes</th>
                <th className="text-right px-4 py-3 text-wellinder-dark/40 font-semibold whitespace-nowrap">Saves</th>
                <th className="text-center px-4 py-3 text-wellinder-dark/40 font-semibold whitespace-nowrap">Link</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-wellinder-dark/5">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-wellinder-cream/20 transition-colors">
                  <td className="px-4 py-3 font-medium text-wellinder-dark whitespace-nowrap">{u.handle}</td>
                  <td className="px-4 py-3 text-wellinder-dark/50 whitespace-nowrap">{u.uploaded_at}</td>
                  <td className="px-4 py-3 text-right font-semibold text-wellinder-dark">{formatCount(u.views)}</td>
                  <td className="px-4 py-3 text-right text-wellinder-dark/60">{formatCount(u.likes)}</td>
                  <td className="px-4 py-3 text-right text-wellinder-dark/60">{u.saves}</td>
                  <td className="px-4 py-3 text-center">
                    <a href={u.video_url} target="_blank" rel="noopener noreferrer"
                      className="text-rose-400 font-semibold hover:text-rose-500 transition-colors">
                      View ↗
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function LoungePage() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isApproved, setIsApproved] = useState(false);
  const [lang, setLang] = useState('en');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [posts, setPosts] = useState([]);
  const [participated, setParticipated] = useState([]);

  const [videoSubmissions, setVideoSubmissions] = useState({});
  const [videoInputs, setVideoInputs] = useState({});
  const [submittingVideo, setSubmittingVideo] = useState(null);
  const [videoError, setVideoError] = useState(null);

  const [shippingInfo, setShippingInfo] = useState(undefined);
  const [shpName, setShpName] = useState('');
  const [shpAddress, setShpAddress] = useState('');
  const [shpPhone, setShpPhone] = useState('+65 ');
  const [speakerPrefs, setSpeakerPrefs] = useState(new Set());
  const [speakerOther, setSpeakerOther] = useState('');
  const [shpLoading, setShpLoading] = useState(false);
  const [shpError, setShpError] = useState('');

  const t = T[lang];

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return;
    checkApproval();
    fetchData();
  }, [session]);

  const checkApproval = async () => {
    // 1. 가입 완료한 유저 (creator_profiles 있음)
    const { data: profiles } = await supabase
      .from('creator_profiles').select('id').eq('id', session.user.id).limit(1);
    if (profiles?.length > 0) { setIsApproved(true); return; }

    // 2. 초대받은 유저 (invites 있음 = 어드민이 승인함)
    const { data: invites } = await supabase
      .from('invites').select('id').eq('email', session.user.email).limit(1);
    if (invites?.length > 0) { setIsApproved(true); return; }

    // 3. fallback: applications 테이블
    const { data: apps } = await supabase
      .from('applications').select('status').eq('email', session.user.email).limit(1);
    setIsApproved(apps?.[0]?.status === 'approved');
  };

  const fetchData = async () => {
    const [postsRes, partRes, shipRes, vsRes] = await Promise.all([
      supabase.from('lounge_posts').select('*').order('created_at', { ascending: false }),
      supabase.from('mission_participations').select('post_id').eq('user_id', session.user.id),
      supabase.from('shipping_info').select('*').eq('user_id', session.user.id).maybeSingle(),
      supabase.from('video_submissions').select('post_id, video_url, submitted_at').eq('user_id', session.user.id),
    ]);
    setPosts(postsRes.data || []);
    setParticipated((partRes.data || []).map(d => d.post_id));
    setShippingInfo(shipRes.data ?? null);
    const vsMap = {};
    (vsRes.data || []).forEach(s => { vsMap[s.post_id] = s; });
    setVideoSubmissions(vsMap);
  };

  const handleVideoSubmit = async (postId) => {
    const url = videoInputs[postId]?.trim();
    if (!url) return;
    setVideoError(null);
    setSubmittingVideo(postId);
    const { error } = await supabase.from('video_submissions').insert([{
      user_id: session.user.id,
      user_email: session.user.email,
      post_id: postId,
      video_url: url,
    }]);
    if (error) {
      setVideoError(postId);
    } else {
      setVideoSubmissions(prev => ({ ...prev, [postId]: { video_url: url, submitted_at: new Date().toISOString() } }));
      if (!participated.includes(postId)) {
        await supabase.from('mission_participations').insert([{ user_id: session.user.id, post_id: postId }]);
        setParticipated(prev => [...prev, postId]);
      }
    }
    setSubmittingVideo(null);
  };

  const handleParticipate = async (postId) => {
    if (participated.includes(postId)) return;
    await supabase.from('mission_participations').insert([{ user_id: session.user.id, post_id: postId }]);
    setParticipated(prev => [...prev, postId]);
  };

  const toggleSpeaker = (value) => {
    setSpeakerPrefs(prev => {
      const next = new Set(prev);
      next.has(value) ? next.delete(value) : next.add(value);
      return next;
    });
  };

  const handleShippingSubmit = async (e) => {
    e.preventDefault();
    setShpError('');
    if (!shpName.trim()) { setShpError(t.errName); return; }
    if (!shpAddress.trim()) { setShpError(t.errAddress); return; }
    if (!shpPhone.trim()) { setShpError(t.errPhone); return; }
    setShpLoading(true);
    const { data, error } = await supabase.from('shipping_info').insert([{
      user_id: session.user.id,
      email: session.user.email,
      recipient_name: shpName.trim(),
      address: shpAddress.trim(),
      phone: shpPhone.trim(),
      speaker_preferences: [...speakerPrefs],
      speaker_other: speakerOther.trim() || null,
    }]).select().single();
    setShpLoading(false);
    if (error) { setShpError('Something went wrong. Please try again.'); return; }
    setShippingInfo(data);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError('');
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) setAuthError(t.incorrectAuth);
    setAuthLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setIsApproved(false);
  };

  // ── Loading ─────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-wellinder-cream flex items-center justify-center">
        <p className="text-wellinder-dark/40 text-sm">Loading...</p>
      </div>
    );
  }

  // ── Not logged in ───────────────────────────────────────────────────────
  if (!session) {
    return (
      <div className="min-h-screen bg-wellinder-cream flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-10 w-full max-w-sm shadow-xl border border-wellinder-dark/5">
          <div className="text-center mb-8">
            <p className="text-[10px] uppercase tracking-[0.3em] text-wellinder-dark/40 font-semibold mb-2">Members Only</p>
            <h1 className="text-2xl font-serif italic text-wellinder-dark">The Lounge</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-3">
            <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)}
              className="w-full border border-wellinder-dark/10 rounded-2xl py-4 px-5 outline-none focus:border-wellinder-dark transition-colors text-wellinder-dark placeholder:text-wellinder-dark/30" />
            <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
              className="w-full border border-wellinder-dark/10 rounded-2xl py-4 px-5 outline-none focus:border-wellinder-dark transition-colors text-wellinder-dark placeholder:text-wellinder-dark/30" />
            {authError && <p className="text-red-500 text-xs text-center">{authError}</p>}
            <button type="submit" disabled={authLoading}
              className="w-full bg-wellinder-dark text-white py-4 rounded-full font-semibold tracking-wide disabled:opacity-50">
              {authLoading ? t.signingIn : t.enterLounge}
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // ── Access pending ───────────────────────────────────────────────────────
  if (!isApproved) {
    return (
      <div className="min-h-screen bg-wellinder-cream flex items-center justify-center px-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-sm">
          <p className="text-4xl mb-6">✦</p>
          <h2 className="text-2xl font-serif italic text-wellinder-dark mb-3">{t.accessPending}</h2>
          <p className="text-wellinder-dark/50 text-sm leading-relaxed">{t.accessPendingNote}</p>
          <button onClick={handleLogout} className="mt-8 text-wellinder-dark/30 hover:text-wellinder-dark text-sm transition-colors">{t.signOut}</button>
        </motion.div>
      </div>
    );
  }

  // ── Derived data ─────────────────────────────────────────────────────────
  const required = posts.filter(p => p.type === 'required' || p.type === 'mission');
  const optional = posts.filter(p => p.type === 'optional');
  const sessions = posts.filter(p => p.type === 'session');
  const webinars = posts.filter(p => p.type === 'webinar');
  const announcements = posts.filter(p => p.type === 'announcement');

  const requiredDone = participated.filter(id => required.some(p => p.id === id)).length;
  const sessionsDone = participated.filter(id => sessions.some(p => p.id === id)).length;

  const weeks = getWeeks(lang);
  const currentWeek = getCurrentWeekNum();

  // ── Main lounge ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-wellinder-cream pt-24 pb-24 px-6">
      <div className="max-w-2xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] uppercase tracking-[0.3em] text-wellinder-dark/40 font-semibold">{t.badge}</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center bg-white border border-wellinder-dark/10 rounded-full overflow-hidden text-[10px] font-semibold">
                <button onClick={() => setLang('en')} className={`px-3 py-1.5 transition-colors ${lang === 'en' ? 'bg-wellinder-dark text-white' : 'text-wellinder-dark/40 hover:text-wellinder-dark'}`}>EN</button>
                <button onClick={() => setLang('zh')} className={`px-3 py-1.5 transition-colors ${lang === 'zh' ? 'bg-wellinder-dark text-white' : 'text-wellinder-dark/40 hover:text-wellinder-dark'}`}>中文</button>
              </div>
              <button onClick={handleLogout} className="flex items-center gap-1.5 text-wellinder-dark/30 hover:text-wellinder-dark text-sm transition-colors">
                <LogOut className="w-4 h-4" />{t.signOut}
              </button>
            </div>
          </div>
          <h1 className="text-3xl font-serif italic text-wellinder-dark">{t.challengeTitle}</h1>
          <p className="text-wellinder-dark/40 text-sm mt-1">{t.weekLabel(currentWeek)}</p>
        </div>

        {/* Announcements */}
        {announcements.length > 0 && (
          <section className="mb-8">
            {announcements.map(post => (
              <motion.div key={post.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                className="bg-wellinder-dark text-white rounded-2xl p-5 mb-3">
                <h3 className="font-serif mb-1">{post.title}</h3>
                {post.content && <p className="text-white/70 text-sm leading-relaxed">{post.content}</p>}
                {post.link && (
                  <a href={post.link} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 mt-2 text-xs text-white/60 hover:text-white transition-colors">
                    <ExternalLink className="w-3.5 h-3.5" /> View
                  </a>
                )}
              </motion.div>
            ))}
          </section>
        )}

        {/* Shipping & Survey */}
        <section className="mb-8">
          <SectionHeader>{t.shippingSection}</SectionHeader>
          <div className="bg-wellinder-dark text-white rounded-2xl px-5 py-4 mb-4 space-y-2">
            <p className="text-sm font-semibold">⏰ {t.shippingDeadline}</p>
            <p className="text-sm text-white/70">{t.shippingDiscord} <a href="https://discord.gg/hHDUf6Uv" target="_blank" rel="noopener noreferrer" className="underline text-white hover:text-white/80">discord.gg/hHDUf6Uv</a></p>
          </div>
          {shippingInfo ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="bg-white rounded-3xl border border-wellinder-dark/8 shadow-sm p-10 text-center">
              <p className="text-3xl mb-3">✓</p>
              <h3 className="font-serif italic text-wellinder-dark text-lg mb-1">{t.submittedLabel}</h3>
              <p className="text-wellinder-dark/40 text-sm">{t.submittedNote}</p>
            </motion.div>
          ) : shippingInfo === undefined ? null : (
            <>
              <p className="text-sm text-wellinder-dark/50 mb-3">{t.shippingNote}</p>
              <form onSubmit={handleShippingSubmit}
                className="bg-white rounded-3xl border border-wellinder-dark/8 shadow-sm overflow-hidden">
                <div className="divide-y divide-wellinder-dark/5">
                  <input type="text" placeholder={t.shippingName} value={shpName} onChange={e => setShpName(e.target.value)}
                    className="w-full px-6 py-4 outline-none text-sm text-wellinder-dark placeholder:text-wellinder-dark/30 bg-transparent" />
                  <textarea placeholder={t.shippingAddress} value={shpAddress} onChange={e => setShpAddress(e.target.value)}
                    rows={3} className="w-full px-6 py-4 outline-none text-sm text-wellinder-dark placeholder:text-wellinder-dark/30 bg-transparent resize-none" />
                  <input type="tel" placeholder={t.shippingPhone} value={shpPhone} onChange={e => setShpPhone(e.target.value)}
                    className="w-full px-6 py-4 outline-none text-sm text-wellinder-dark placeholder:text-wellinder-dark/30 bg-transparent" />
                </div>
                <div className="px-6 py-6 border-t border-wellinder-dark/5">
                  <p className="text-[11px] uppercase tracking-[0.15em] font-semibold text-wellinder-dark mb-4 leading-relaxed">{t.speakerQ}</p>
                  <div className="space-y-0.5">
                    {SPEAKER_OPTIONS.map(opt => (
                      <Checkbox key={opt.value} checked={speakerPrefs.has(opt.value)} onChange={() => toggleSpeaker(opt.value)} label={opt[lang]} />
                    ))}
                  </div>
                  {speakerPrefs.has('other') && (
                    <input type="text" placeholder={t.speakerOtherPlaceholder} value={speakerOther} onChange={e => setSpeakerOther(e.target.value)}
                      className="mt-3 w-full border border-wellinder-dark/10 rounded-2xl py-3 px-4 text-sm text-wellinder-dark placeholder:text-wellinder-dark/30 outline-none focus:border-wellinder-dark transition-colors bg-wellinder-cream/40" />
                  )}
                </div>
                <div className="px-6 pb-6">
                  <p className="text-[11px] text-wellinder-dark/35 leading-relaxed mb-4">{t.privacyNote}</p>
                  {shpError && <p className="text-red-500 text-xs text-center mb-3">{shpError}</p>}
                  <button type="submit" disabled={shpLoading}
                    className="w-full bg-wellinder-dark text-white py-4 rounded-full font-semibold text-sm disabled:opacity-40 transition-opacity">
                    {shpLoading ? t.submitting : t.submit}
                  </button>
                </div>
              </form>
            </>
          )}
        </section>

        {/* Challenge Schedule */}
        <section className="mb-8">
          <SectionHeader>{t.scheduleSection}</SectionHeader>
          <div className="bg-white rounded-3xl border border-wellinder-dark/8 shadow-sm overflow-hidden divide-y divide-wellinder-dark/5">
            {weeks.map((w) => (
              <div key={w.num} className={`flex items-center gap-4 px-6 py-4 ${w.status === 'active' ? 'bg-wellinder-dark/[0.03]' : ''}`}>
                <span className="text-[11px] font-semibold text-wellinder-dark/25 w-6 flex-shrink-0">
                  {String(w.num).padStart(2, '0')}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium ${w.status === 'active' ? 'text-wellinder-dark' : 'text-wellinder-dark/70'}`}>
                    {t.weekNum(w.num)}
                  </p>
                  <p className="text-[11px] text-wellinder-dark/35 mt-0.5">{w.range}</p>
                </div>
                <span className={`text-[10px] font-semibold px-3 py-1 rounded-full flex-shrink-0 ${
                  w.status === 'done' ? 'bg-green-50 text-green-600'
                  : w.status === 'active' ? 'bg-wellinder-dark text-white'
                  : 'bg-wellinder-dark/5 text-wellinder-dark/30'
                }`}>
                  {w.status === 'done' ? t.statusDone : w.status === 'active' ? t.statusActive : t.statusUpcoming}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* My Progress */}
        <section className="mb-8">
          <SectionHeader>{t.progressSection}</SectionHeader>
          <div className="bg-white rounded-3xl border border-wellinder-dark/8 shadow-sm p-6 space-y-5">
            <ProgressRow label={t.requiredUploads} done={requiredDone} total={REQUIRED_UPLOADS_TOTAL} />
            <ProgressRow label={t.requiredSessions} done={sessionsDone} total={REQUIRED_SESSIONS_TOTAL} />
          </div>
        </section>

        {/* TikTok Viral King */}
        <ViralKingSection uploads={MOCK_TIKTOK_UPLOADS} />

        {/* Leaderboard */}
        <LeaderboardSection uploads={MOCK_TIKTOK_UPLOADS} />

        {/* Upload Tracker */}
        <UploadTrackerSection uploads={MOCK_TIKTOK_UPLOADS} />

        {/* Required Missions */}
        <section className="mb-8">
          <SectionHeader>{t.missionsSection}</SectionHeader>
          {required.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-wellinder-dark/5">
              <p className="text-wellinder-dark/30 font-serif italic">{t.noMissions}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {required.map(post => {
                const done = participated.includes(post.id);
                const isExpired = post.deadline && new Date(post.deadline) < new Date();
                return (
                  <motion.div key={post.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-6 border border-wellinder-dark/5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-serif text-wellinder-dark mb-1">{post.title}</h3>
                        {post.content && <p className="text-wellinder-dark/60 text-sm leading-relaxed mb-3">{post.content}</p>}
                        <div className="flex flex-wrap items-center gap-3">
                          {post.link && (
                            <a href={post.link} target="_blank" rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 text-xs font-medium text-wellinder-dark hover:opacity-70 transition-opacity">
                              <ExternalLink className="w-3.5 h-3.5" />{t.guide}
                            </a>
                          )}
                          {post.deadline && (
                            <span className={`text-[10px] uppercase tracking-widest font-bold ${isExpired ? 'text-red-400' : 'text-wellinder-dark/30'}`}>
                              {isExpired ? t.closed : t.due(post.deadline)}
                            </span>
                          )}
                        </div>
                      </div>
                      <button onClick={() => !done && !isExpired && handleParticipate(post.id)} disabled={done || isExpired}
                        className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                          done ? 'bg-green-50 text-green-600 border border-green-200'
                          : isExpired ? 'bg-wellinder-dark/5 text-wellinder-dark/30 cursor-not-allowed'
                          : 'bg-wellinder-dark text-white hover:bg-wellinder-dark/80'
                        }`}>
                        <CheckCircle className="w-3.5 h-3.5" />
                        {done ? t.done : t.participate}
                      </button>
                    </div>
                    {/* TikTok Video Link Submission */}
                    <div className="mt-4 pt-4 border-t border-wellinder-dark/5">
                      {videoSubmissions[post.id] ? (
                        <div className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-green-500 flex-shrink-0 mt-0.5" />
                          <div className="min-w-0">
                            <p className="text-xs text-green-600 font-medium">{t.videoSubmitted}</p>
                            <a href={videoSubmissions[post.id].video_url} target="_blank" rel="noopener noreferrer"
                              className="text-[11px] text-wellinder-dark/40 hover:text-wellinder-dark truncate block mt-0.5 transition-colors">
                              {videoSubmissions[post.id].video_url}
                            </a>
                          </div>
                        </div>
                      ) : (
                        <div className="flex gap-2">
                          <input
                            type="url"
                            placeholder={t.videoPlaceholder}
                            value={videoInputs[post.id] || ''}
                            onChange={e => setVideoInputs(prev => ({ ...prev, [post.id]: e.target.value }))}
                            className="flex-1 min-w-0 border border-wellinder-dark/10 rounded-2xl py-2.5 px-4 text-sm outline-none focus:border-wellinder-dark transition-colors placeholder:text-wellinder-dark/30"
                          />
                          <button
                            onClick={() => handleVideoSubmit(post.id)}
                            disabled={submittingVideo === post.id || !videoInputs[post.id]?.trim()}
                            className="flex-shrink-0 px-4 py-2.5 bg-wellinder-dark text-white rounded-full text-xs font-semibold disabled:opacity-40 transition-opacity"
                          >
                            {submittingVideo === post.id ? '...' : t.submitVideo}
                          </button>
                        </div>
                      )}
                      {videoError === post.id && (
                        <p className="text-red-400 text-xs mt-1.5">{t.videoSubmitError}</p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* Optional Uploads */}
        <section className="mb-8">
          <SectionHeader>{t.optionalSection}</SectionHeader>
          {optional.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 text-center border border-wellinder-dark/5">
              <p className="text-wellinder-dark/30 text-sm">{t.noOptional}</p>
            </div>
          ) : (
            <div className="space-y-3">
              {optional.map(post => {
                const done = participated.includes(post.id);
                return (
                  <motion.div key={post.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-2xl p-5 border border-wellinder-dark/5 flex items-center justify-between gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-wellinder-dark">{post.title}</h3>
                      {post.content && <p className="text-wellinder-dark/50 text-xs mt-0.5">{post.content}</p>}
                    </div>
                    <button onClick={() => !done && handleParticipate(post.id)} disabled={done}
                      className={`flex-shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                        done ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-wellinder-dark text-white hover:bg-wellinder-dark/80'
                      }`}>
                      <CheckCircle className="w-3.5 h-3.5" />
                      {done ? t.done : t.participate}
                    </button>
                  </motion.div>
                );
              })}
            </div>
          )}
        </section>

        {/* Schedule */}
        <section className="mb-8">
          <SectionHeader>{t.schedSection}</SectionHeader>
          <div className="bg-white rounded-3xl border border-wellinder-dark/8 shadow-sm overflow-hidden divide-y divide-wellinder-dark/5">
            {[{ label: t.webinars, items: webinars }, { label: t.expertSessions, items: sessions }].map(({ label, items }) => (
              <div key={label} className="px-6 py-5">
                <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-wellinder-dark/40 mb-3">{label}</p>
                {items.length === 0 ? (
                  <p className="text-sm text-wellinder-dark/30">{t.noSchedule}</p>
                ) : (
                  <div className="space-y-3">
                    {items.map(post => {
                      const done = participated.includes(post.id);
                      const isExpired = post.deadline && new Date(post.deadline) < new Date();
                      return (
                        <div key={post.id} className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-sm text-wellinder-dark">{post.title}</p>
                            {post.deadline && (
                              <p className={`text-[11px] mt-0.5 ${isExpired ? 'text-red-400' : 'text-wellinder-dark/40'}`}>
                                {isExpired ? t.closed : t.due(post.deadline)}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            {post.link && (
                              <a href={post.link} target="_blank" rel="noopener noreferrer"
                                className="text-wellinder-dark/40 hover:text-wellinder-dark transition-colors">
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            )}
                            <button onClick={() => !done && !isExpired && handleParticipate(post.id)} disabled={done || isExpired}
                              className={`px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all ${
                                done ? 'bg-green-50 text-green-600'
                                : isExpired ? 'text-wellinder-dark/20 cursor-not-allowed'
                                : 'bg-wellinder-dark text-white hover:bg-wellinder-dark/80'
                              }`}>
                              {done ? t.done : t.participate}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section>
          <SectionHeader>{t.faqSection}</SectionHeader>
          <div className="bg-white rounded-2xl p-10 text-center border border-wellinder-dark/5">
            <p className="text-wellinder-dark/30 font-serif italic">{t.noFaq}</p>
          </div>
        </section>

      </div>
    </div>
  );
}
