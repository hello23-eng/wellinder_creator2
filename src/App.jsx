import { BrowserRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Menu, X, Instagram, Send, Gem, Lock, LayoutDashboard, ShoppingBag, Users, Sparkles, Diamond, TrendingUp } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from './lib/supabase';
import AdminPage from './pages/AdminPage';
import LoungePage from './pages/LoungePage';
import ResetPasswordPage from './pages/ResetPasswordPage';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

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
          <span className="text-lg md:text-2xl font-serif tracking-tighter text-wellinder-dark leading-none">Join Wellinder Creators</span>
          <span className="text-[9px] md:text-[11px] tracking-[0.2em] text-wellinder-dark/50 mt-1 font-medium">Share your rituals. Inspire others.</span>
        </div>
      </Link>

      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 hover:bg-wellinder-dark/5 rounded-full transition-colors"
      >
        {isOpen ? <X /> : <Menu />}
      </button>

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
                to="/apply"
                onClick={() => setIsOpen(false)}
                className="text-xl font-serif hover:text-wellinder-gold transition-colors"
              >Apply</Link>
              <Link
                to="/lounge"
                onClick={() => setIsOpen(false)}
                className="text-xl font-serif hover:text-wellinder-gold transition-colors flex items-center justify-center gap-2"
              >
                Lounge
                <span className="text-[9px] uppercase tracking-widest font-bold text-wellinder-dark/30 border border-wellinder-dark/20 px-2 py-0.5 rounded-full">Members</span>
              </Link>
              {session ? (
                <button
                  onClick={handleLogout}
                  className="text-xl font-serif text-wellinder-dark/40 hover:text-wellinder-dark transition-colors"
                >Sign Out</button>
              ) : (
                <Link
                  to="/lounge"
                  onClick={() => setIsOpen(false)}
                  className="text-xl font-serif text-wellinder-dark/40 hover:text-wellinder-dark transition-colors"
                >Member Login</Link>
              )}
              <div className="pt-4 border-t border-wellinder-dark/5 flex justify-center gap-6">
                <Instagram className="w-5 h-5 opacity-50" />
                <Send className="w-5 h-5 opacity-50" />
              </div>
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
            Join the Wellinder Creators
          </motion.div>
        </Link>
        <p className="text-center text-[10px] uppercase tracking-widest mt-3 text-wellinder-dark/60 font-medium">
          Currently accepting applications for Singapore
        </p>
      </div>
    </div>
  );
};

// --- Apply Page ---
const ApplyPage = () => {
  return (
    <div className="min-h-screen pb-32">

      {/* Hero Section */}
      <section className="relative w-full bg-wellinder-dark overflow-hidden pt-[72px]">
        <div className="w-full aspect-video max-h-[90vh]">
          <img
            src="https://i.ibb.co/rfNsKKtD/Gemini-Generated-Image-xwsfv7xwsfv7xwsf.png"
            alt="Wellinder - The Diamond Vault"
            className="w-full h-full object-cover object-top"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute inset-0 bg-black/10" />
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/60 to-transparent text-white text-center">
          <p className="text-xs uppercase tracking-[0.3em] font-semibold mb-2 opacity-80">WELLINDER</p>
          <h1 className="text-2xl md:text-4xl font-serif text-white mb-1">Korean Inner Beauty Collagen</h1>
          <p className="text-sm md:text-base opacity-80">8-Week Creator Challenge — Now Open 🇸🇬</p>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-32 px-6 bg-wellinder-cream">
        <div className="max-w-4xl mx-auto text-center">
          <span className="text-wellinder-dark uppercase tracking-[0.3em] text-xs font-semibold mb-4 block">Our Philosophy</span>
          <h2 className="text-3xl md:text-4xl font-serif mb-8 italic text-wellinder-dark">"Wellinder: Wellness in wonder."</h2>
          <div className="text-wellinder-dark/70 leading-relaxed text-lg space-y-6">
            <p className="font-medium text-wellinder-dark">We believe.</p>
            <p>
              That life is transformed not by grand gestures,<br />
              but by the power of small daily rituals.
            </p>
            <p>
              Just as a raw stone is refined into a brilliant jewel,<br />
              human beauty begins to radiate through consistent, mindful care.
            </p>
            <p>
              WELLINDER stands with creators who cherish their own rituals<br />
              and dare to share those stories with the world.
            </p>
            <p>
              If your ritual can become an inspiration to others,<br />
              we invite you to begin your brilliant journey with us.
            </p>
          </div>
        </div>
      </section>

      {/* Jewellery Tier System */}
      <section className="py-24 px-6 bg-wellinder-cream">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl font-serif text-center mb-16 text-wellinder-dark">The Jewellery Tier System</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: 'The Raw',
                desc: 'Your journey begins here — a natural origin with boundless potential.',
                icon: <Diamond className="w-8 h-8 text-wellinder-dark" />,
                status: 'THE ORIGIN'
              },
              {
                title: 'The Crystal',
                desc: 'Growth begins to take shape. Radiating clarity and ambition.',
                icon: <Sparkles className="w-8 h-8 text-wellinder-dark" />,
                status: 'THE GROWTH'
              },
              {
                title: 'The Jewel',
                desc: 'The pinnacle of brilliance. A true masterpiece within our community.',
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
                status: 'THE MASTERPIECE'
              }
            ].map((tier, i) => (
              <div key={i} className="bg-white p-8 rounded-3xl border border-wellinder-dark/5 hover:border-wellinder-dark/20 transition-all hover:shadow-xl group">
                <div className="mb-6 transform transition-transform group-hover:scale-110 duration-500">{tier.icon}</div>
                <h3 className="text-xl font-serif mb-2 text-wellinder-dark">{tier.title}</h3>
                <p className="text-[10px] text-wellinder-dark/40 uppercase tracking-widest font-bold mb-4">{tier.status}</p>
                <p className="text-wellinder-dark/60 text-sm leading-relaxed italic">{tier.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Creator Benefits */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-serif text-wellinder-dark mb-4">Creator Benefits</h2>
            <p className="text-wellinder-dark/60 text-lg">Our commitment to your growth and brilliance.</p>
          </div>
          <div className="space-y-10">
            {[
              {
                icon: <ShoppingBag className="w-6 h-6 text-wellinder-dark" />,
                title: 'Product Seeding',
                desc: 'Receive a curated selection of our finest products to experience and share with your audience, free of charge.'
              },
              {
                icon: <Sparkles className="w-6 h-6 text-wellinder-dark" />,
                title: 'Exclusive Events',
                desc: 'Get invited to private workshops, launch parties, and creator retreats designed to inspire and connect.'
              },
              {
                icon: <TrendingUp className="w-6 h-6 text-wellinder-dark" />,
                title: 'Growth Support',
                desc: 'Access our team of experts for personalized guidance on content strategy, audience engagement, and monetization.'
              },
              {
                icon: <Users className="w-6 h-6 text-wellinder-dark" />,
                title: 'Community & Collaboration',
                desc: 'Join a vibrant community of like-minded creators. Collaborate on exciting projects and build lasting relationships.'
              }
            ].map((benefit, i) => (
              <div key={i} className="flex items-start gap-6">
                <div className="w-12 h-12 bg-wellinder-cream rounded-full flex items-center justify-center flex-shrink-0">
                  {benefit.icon}
                </div>
                <div>
                  <h3 className="text-xl font-serif mb-2 text-wellinder-dark">{benefit.title}</h3>
                  <p className="text-wellinder-dark/60 leading-relaxed">{benefit.desc}</p>
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
  const [formData, setFormData] = useState({
    fullName: '',
    tiktok: '',
    instagram: '',
    email: '',
    country: '',
    agreed: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const { error } = await supabase.from('applications').insert([{
      full_name: formData.fullName,
      tiktok_handle: formData.tiktok,
      instagram_handle: formData.instagram,
      email: formData.email,
      country: formData.country,
    }]);

    setSubmitting(false);
    if (error) {
      setError('Something went wrong. Please try again.');
    } else {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-wellinder-cream pt-24 pb-32 px-6">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-10">
          <span className="text-wellinder-dark/50 uppercase tracking-[0.3em] text-xs font-semibold mb-4 block">Application</span>
          <p className="text-wellinder-dark/70 mb-6">
            If your daily ritual can inspire others, we invite you to begin your brilliant transformation with us.
          </p>
          <h2 className="text-3xl md:text-4xl font-serif italic text-wellinder-dark">Join the Wellness Collective</h2>
        </div>

        {submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16"
          >
            <div className="text-5xl mb-6">✨</div>
            <h3 className="text-3xl font-serif italic text-wellinder-dark mb-4">Application Received</h3>
            <p className="text-wellinder-dark/70 text-base leading-relaxed mb-2">
              Your application has been received.
            </p>
            <p className="text-wellinder-dark/50 text-sm leading-relaxed">
              We'll review it and get back to you by email.<br />
              Thank you for applying.
            </p>
            <div className="mt-10 pt-8 border-t border-wellinder-dark/10">
              <p className="text-[10px] uppercase tracking-[0.3em] text-wellinder-dark/30 font-semibold">Wellinder Creators</p>
            </div>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-wellinder-dark/50 block mb-2">Full Name</label>
              <input
                type="text"
                placeholder="e.g., Tan Wei Kiat"
                value={formData.fullName}
                onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full bg-white border border-wellinder-dark/10 rounded-2xl py-4 px-5 text-wellinder-dark outline-none focus:border-wellinder-dark transition-colors placeholder:text-wellinder-dark/30"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-wellinder-dark/50 block mb-2">TikTok Handle</label>
              <input
                type="text"
                placeholder="@username"
                value={formData.tiktok}
                onChange={e => setFormData({ ...formData, tiktok: e.target.value })}
                className="w-full bg-white border border-wellinder-dark/10 rounded-2xl py-4 px-5 text-wellinder-dark outline-none focus:border-wellinder-dark transition-colors placeholder:text-wellinder-dark/30"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-wellinder-dark/50 block mb-2">Instagram Handle</label>
              <input
                type="text"
                placeholder="@username"
                value={formData.instagram}
                onChange={e => setFormData({ ...formData, instagram: e.target.value })}
                className="w-full bg-white border border-wellinder-dark/10 rounded-2xl py-4 px-5 text-wellinder-dark outline-none focus:border-wellinder-dark transition-colors placeholder:text-wellinder-dark/30"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-wellinder-dark/50 block mb-2">Email Address</label>
              <input
                type="email"
                placeholder="email@example.com"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-white border border-wellinder-dark/10 rounded-2xl py-4 px-5 text-wellinder-dark outline-none focus:border-wellinder-dark transition-colors placeholder:text-wellinder-dark/30"
              />
            </div>
            <div>
              <label className="text-[10px] uppercase tracking-widest font-bold text-wellinder-dark/50 block mb-2">Country</label>
              <select
                value={formData.country}
                onChange={e => setFormData({ ...formData, country: e.target.value })}
                className="w-full bg-white border border-wellinder-dark/10 rounded-2xl py-4 px-5 text-wellinder-dark outline-none focus:border-wellinder-dark transition-colors appearance-none"
              >
                <option value="">Select your country</option>
                <option value="SG">🇸🇬 Singapore — Now Open</option>
                <option value="KR" disabled>🇰🇷 South Korea — Coming Soon</option>
                <option value="MY" disabled>🇲🇾 Malaysia — Coming Soon</option>
                <option value="JP" disabled>🇯🇵 Japan — Coming Soon</option>
                <option value="TW" disabled>🇹🇼 Taiwan — Coming Soon</option>
                <option value="HK" disabled>🇭🇰 Hong Kong — Coming Soon</option>
                <option value="TH" disabled>🇹🇭 Thailand — Coming Soon</option>
                <option value="ID" disabled>🇮🇩 Indonesia — Coming Soon</option>
                <option value="PH" disabled>🇵🇭 Philippines — Coming Soon</option>
                <option value="VN" disabled>🇻🇳 Vietnam — Coming Soon</option>
                <option value="AU" disabled>🇦🇺 Australia — Coming Soon</option>
                <option value="US" disabled>🇺🇸 United States — Coming Soon</option>
                <option value="GB" disabled>🇬🇧 United Kingdom — Coming Soon</option>
                <option value="CA" disabled>🇨🇦 Canada — Coming Soon</option>
                <option value="FR" disabled>🇫🇷 France — Coming Soon</option>
              </select>
              {formData.country && formData.country !== 'SG' && (
                <p className="text-[11px] text-amber-600 mt-2 px-1 font-medium">
                  ✦ We're launching in your region soon. Stay tuned!
                </p>
              )}
              {!formData.country && (
                <p className="text-[11px] text-wellinder-dark/40 mt-2 px-1">
                  * Currently accepting applications from Singapore.
                </p>
              )}
            </div>
            <div className="flex items-start gap-3 pt-2">
              <input
                type="checkbox"
                id="terms"
                checked={formData.agreed}
                onChange={e => setFormData({ ...formData, agreed: e.target.checked })}
                className="mt-1 w-4 h-4 accent-wellinder-dark"
              />
              <label htmlFor="terms" className="text-sm text-wellinder-dark/60 leading-relaxed">
                I agree to the <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
              </label>
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
              type="submit"
              disabled={!formData.agreed || submitting || formData.country !== 'SG'}
              className={cn(
                "w-full py-4 rounded-full font-sans font-semibold tracking-wide transition-all mt-4",
                formData.agreed && !submitting && formData.country === 'SG'
                  ? "bg-wellinder-dark text-white shadow-lg hover:bg-wellinder-dark/90"
                  : "bg-wellinder-dark/20 text-wellinder-dark/40 cursor-not-allowed"
              )}
            >
              {submitting ? 'Submitting...' : 'Submit Application'}
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

// --- Auth Redirect Handler ---
function AuthRedirectHandler() {
  const navigate = useNavigate();
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        navigate('/reset-password');
      }
    });
    return () => subscription.unsubscribe();
  }, [navigate]);
  return null;
}

// --- Main App ---
export default function App() {
  return (
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
          </Routes>
        </main>
        <FooterCTA />
      </div>
    </Router>
  );
}
