import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import Input from '../components/ui/Input';

import puchoLogo from '/assets/brand/logo.png';
import UserIcon from '/assets/icons/Property 2=Users, Property 1=Default.png';
import LockIcon from '/assets/icons/Property 2=Lock, Property 1=Default.png';
import ArrowRightIcon from '/assets/icons/Property 2=Arrow Right, Property 1=Default.png';
import MoonIcon from '/assets/icons/Property 2=Moon, Property 1=Default.png';
import SparklesIcon from '/assets/icons/Property 2=Magic-pen, Property 1=Default.png';
import CircleIcon from '/assets/icons/Property 2=agent.png';

import mascot1 from '/assets/mascots/mascot_1.png';
import mascot3 from '/assets/mascots/mascot_3.png';
import mascot4 from '/assets/mascots/mascot_4.png';
import mascot5 from '/assets/mascots/mascot_5.png';

const Mascot = ({ imageSrc, delay, x, y, size = "w-16 h-16", cursorColor = "text-blue-500", cursorRotation = "0deg" }) => {
  return (
    <div
      className={`absolute ${x} ${y} z-20 animate-float transition-all duration-300 hover:scale-110 hover:rotate-6 cursor-pointer pointer-events-auto`}
      style={{ animationDelay: `${delay}s` }}
    >
      <div className={`${size} rounded-full overflow-hidden shadow-lg relative bg-white/50 backdrop-blur-sm border border-white/40`}>
        <img src={imageSrc} alt="User" className="w-full h-full object-cover" />
      </div>
      <div
        className={`absolute -bottom-3 -right-3 ${cursorColor} drop-shadow-md`}
        style={{ transform: `rotate(${cursorRotation})` }}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
          <path d="M3.5 3.5L10.5 20.5L13.5 13.5L20.5 10.5L3.5 3.5Z" stroke="white" strokeWidth="2" strokeLinejoin="round" />
        </svg>
      </div>
    </div>
  );
};

const Login = () => {
  const { login, loginWithToken } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Magic-link token handling — runs once on mount
  // Token is extracted from the URL, then validated server-side by W-Validate-Token.
  // The URL itself is never trusted — email/role come only from the workflow response.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) return;

    // Clean the token from the URL immediately to prevent sharing/bookmarking
    window.history.replaceState({}, document.title, window.location.pathname);

    setTokenLoading(true);
    setError('');

    loginWithToken(token).then(result => {
      if (result.success) {
        // If the workflow returned a companyId, go straight to dashboard
        if (result.companyId) {
          navigate('/dashboard');
        } else {
          navigate('/company-selection');
        }
      } else {
        setError(result.error || 'This invitation link is invalid or has been revoked.');
        setTokenLoading(false);
      }
    });
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(email, password);

    if (result.success) {
      navigate('/company-selection');
    } else {
      setError(result.error || 'Login failed');
      setLoading(false);
    }
  };

  return (
    <div className="h-screen w-full bg-slate-50 relative flex items-center justify-center p-4 lg:p-8 overflow-hidden font-sans">
      <div className="absolute inset-0 z-0 opacity-100 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(#cbd5e1 1px, transparent 1px), linear-gradient(90deg, #cbd5e1 1px, transparent 1px)`,
          backgroundSize: '64px 64px',
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0) 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 40%, rgba(0,0,0,0) 100%)'
        }}>
      </div>

      <div className="absolute inset-0 z-0 pointer-events-none opacity-50"
        style={{ background: `radial-gradient(600px circle at ${mousePos.x}px ${mousePos.y}px, rgba(139, 92, 246, 0.15), transparent 40%)` }}>
      </div>

      <div className="absolute top-0 left-0 w-[500px] lg:w-[800px] h-[500px] lg:h-[800px] bg-purple-600/30 rounded-full blur-[80px] lg:blur-[120px] pointer-events-none -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-[500px] lg:w-[800px] h-[500px] lg:h-[800px] bg-blue-600/30 rounded-full blur-[80px] lg:blur-[120px] pointer-events-none translate-x-1/2 translate-y-1/2"></div>

      <div className="absolute top-6 right-6 z-20">
        <button className="p-3 bg-white rounded-full shadow-sm border border-gray-100 text-gray-400 hover:text-ink-900 transition-colors">
          <img src={MoonIcon} alt="Theme" className="w-5 h-5 opacity-60" />
        </button>
      </div>

      <div className="absolute inset-0 pointer-events-none overflow-hidden h-full w-full">
        <Mascot imageSrc={mascot1} x="top-[4%] left-4 md:top-[2%] md:left-[1%]" delay={0} size="w-12 h-12 md:w-16 md:h-16" cursorColor="text-blue-500" cursorRotation="-10deg" />
        <Mascot imageSrc={mascot5} x="top-[4%] right-4 md:top-[2%] md:right-[1%]" delay={1.5} size="w-12 h-12 md:w-16 md:h-16" cursorColor="text-purple-500" cursorRotation="15deg" />
        <Mascot imageSrc={mascot3} x="bottom-[4%] left-2 md:bottom-[2%] md:left-[2%]" delay={0.8} size="w-10 h-10 md:w-16 md:h-16" cursorColor="text-yellow-500" cursorRotation="-5deg" />
        <Mascot imageSrc={mascot4} x="bottom-[4%] right-2 md:bottom-[2%] md:right-[2%]" delay={2.2} size="w-10 h-10 md:w-16 md:h-16" cursorColor="text-green-500" cursorRotation="10deg" />
      </div>

      <div className="absolute top-6 left-0 right-0 flex justify-center md:hidden z-20">
        <img src={puchoLogo} alt="Pucho.ai" className="h-6" />
      </div>

      <div className="w-full max-w-7xl mx-auto grid md:grid-cols-2 gap-6 md:gap-12 lg:gap-24 relative z-10 items-center h-full md:h-auto content-center">
        <div className="text-center md:text-left space-y-4 md:space-y-8 md:pl-8 lg:pl-16">
          <div className="hidden md:flex justify-start mb-8 lg:mb-16">
            <img src={puchoLogo} alt="Pucho.ai" className="h-7 lg:h-9" />
          </div>

          <div className="space-y-2 md:space-y-4 lg:space-y-6">
            <div className="space-y-1 md:space-y-2">
              <div className="font-bold text-ink-900 text-sm md:text-base lg:text-lg">Multi-Company Accounting Dashboard</div>
              <div className="text-[10px] md:text-[11px] lg:text-xs font-bold text-kinetic-primary tracking-wider uppercase drop-shadow-sm">BUILT ON PUCHO.AI</div>
            </div>

            <h1 className="text-3xl md:text-5xl lg:text-[70px] font-display font-bold text-ink-900 leading-[1.1] md:leading-[1] lg:leading-[0.95] tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-ink-900 to-kinetic-primary">
              Build.<br />
              <span className="text-kinetic-primary/80">Automate.</span><br />
              Scale.
            </h1>

            <p className="text-ink-900 text-xs md:text-sm lg:text-base leading-relaxed max-w-md mx-auto md:mx-0 opacity-70 hidden md:block">
              Transform your Tally data into actionable intelligence. Access your financial command center to manage your business with real-time insights.
            </p>
          </div>

          <div className="hidden md:flex flex-wrap justify-center md:justify-start gap-2 md:gap-3 lg:gap-4 pt-2 md:pt-3 lg:pt-4">
            <div className="flex items-center gap-2 px-3 lg:px-4 py-1.5 lg:py-2 bg-kinetic-primary/10 border border-kinetic-primary/20 rounded-full text-[10px] lg:text-xs font-bold text-kinetic-primary">
              <img src={SparklesIcon} alt="Sparkles" className="w-4 h-4" />
              AI-Powered Intelligence
            </div>
            <div className="flex items-center gap-2 px-3 lg:px-4 py-1.5 lg:py-2 bg-green-50 border border-green-100 rounded-full text-[10px] lg:text-xs font-bold text-green-700">
              <img src={CircleIcon} alt="Operational" className="w-3 h-3" />
              System Operational
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center md:justify-end w-full">
          <div className="bg-white/70 backdrop-blur-xl p-6 md:p-8 lg:p-12 rounded-3xl shadow-card w-full max-w-sm md:max-w-md border border-white relative overflow-hidden group">

            {/* Magic-link validation loading overlay */}
            {tokenLoading && (
              <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-10 flex flex-col items-center justify-center gap-3 rounded-3xl">
                <div className="w-8 h-8 border-3 border-kinetic-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium text-ink-900">Validating your invitation link…</p>
              </div>
            )}

            <div className="space-y-2 mb-6 md:mb-8">
              <h2 className="text-2xl font-display font-bold text-ink-900">Welcome Back</h2>
              <p className="text-kinetic-neutral font-medium text-sm">Enter your credentials to access the dashboard.</p>
            </div>

            {/* Error banner — shown for both token and password errors */}
            {error && (
              <div className="mb-4 px-4 py-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-medium">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <Input
                label="Username"
                type="text"
                icon={UserIcon}
                placeholder="Your Username"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <Input
                label="Password"
                type="password"
                icon={LockIcon}
                placeholder="Your Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />

              {error && (
                <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={`
                  relative w-full h-[52px] flex items-center justify-center gap-3 rounded-full
                  transition-all duration-300 ease-in-out
                  font-sans font-semibold text-[18px] leading-[150%] text-white
                  overflow-hidden group
                  disabled:opacity-70 disabled:cursor-not-allowed
                `}
                style={{
                  background: 'linear-gradient(180deg, #5833EF 0%, #3A10CE 100%)',
                  boxShadow: '0px 4.4px 8.8px rgba(58, 16, 206, 0.3)',
                }}
              >
                <div
                  className="absolute top-[1px] left-[1px] right-[1px] h-[26px] rounded-full pointer-events-none transition-opacity duration-300 group-hover:opacity-0 group-active:opacity-0"
                  style={{
                    background: 'linear-gradient(180deg, rgba(255, 255, 255, 0.25) 0%, rgba(255, 255, 255, 0) 100%)',
                    zIndex: 1,
                  }}
                />

                <span className="relative z-10 flex items-center gap-2 drop-shadow-md">
                  {loading ? 'Signing in...' : 'Sign In'}
                  {!loading && <img src={ArrowRightIcon} alt="Arrow" className="w-5 h-5 -rotate-45 invert brightness-0" />}
                </span>
              </button>
            </form>

            <div className="mt-4 text-center">
              <p className="text-xs text-ink-600">
                Demo: demo@bizanalyzt.com / demo123
              </p>
            </div>
          </div>

          <div className="block md:hidden text-center mt-8 space-y-4">
            <p className="text-ink-900 text-xs leading-relaxed max-w-xs mx-auto opacity-70">
              Transform your Tally data into actionable intelligence. Access your financial command center to manage your business with real-time insights.
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-kinetic-primary/10 border border-kinetic-primary/20 rounded-full text-[10px] font-bold text-kinetic-primary">
                <img src={SparklesIcon} alt="Sparkles" className="w-4 h-4" />
                AI-Powered Intelligence
              </div>
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 border border-green-100 rounded-full text-[10px] font-medium text-green-700">
                <img src={CircleIcon} alt="Operational" className="w-3 h-3" />
                System Operational
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
