import React, { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  KeyRound,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Smartphone,
} from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const LOGIN_TABS = {
  password: 'password',
  otp: 'otp',
};

const getApiErrorMessage = (error, fallbackMessage) => {
  const payload = error?.response?.data;
  if (typeof payload === 'string') return payload;
  if (payload?.message) return payload.message;
  return fallbackMessage;
};

const tabCopy = {
  [LOGIN_TABS.password]: {
    title: 'Login with Password',
    description: 'Use your existing password-based session for quick access.',
    accent: 'from-sky-500/20 to-cyan-400/10',
    icon: LockKeyhole,
  },
  [LOGIN_TABS.otp]: {
    title: 'Login with OTP',
    description: 'Get a secure 6-digit code by email and sign in without a password.',
    accent: 'from-emerald-500/20 to-teal-400/10',
    icon: Mail,
  },
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [activeTab, setActiveTab] = useState(LOGIN_TABS.password);
  const [passwordForm, setPasswordForm] = useState({
    phoneNumber: '',
    password: '',
  });
  const [otpForm, setOtpForm] = useState({
    email: '',
    otp: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [lastOtpEmail, setLastOtpEmail] = useState('');

  const activeTabMeta = useMemo(() => tabCopy[activeTab], [activeTab]);

  const afterLoginNavigate = (authPayload) => {
    login(authPayload);
    const user = authPayload?.user || authPayload;
    const fallbackRoute = user?.role === 'ROLE_ADMIN' ? '/dashboard' : '/';
    navigate(location.state?.from?.pathname || fallbackRoute);
  };

  const handlePasswordLogin = async (event) => {
    event.preventDefault();

    if (!passwordForm.phoneNumber.trim()) {
      toast.error('Phone number is required');
      return;
    }

    if (!passwordForm.password.trim()) {
      toast.error('Password is required');
      return;
    }

    setPasswordLoading(true);
    try {
      const response = await api.post('/user/login/password', {
        phoneNumber: passwordForm.phoneNumber.trim(),
        password: passwordForm.password,
      });
      afterLoginNavigate(response.data);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Invalid phone number or password'));
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleSendOtp = async () => {
    const normalizedEmail = otpForm.email.trim();
    if (!normalizedEmail) {
      toast.error('Email is required');
      return;
    }

    setOtpSending(true);
    try {
      const response = await api.post('/auth/send-otp', {
        email: normalizedEmail,
      });
      setOtpSent(true);
      setLastOtpEmail(normalizedEmail.toLowerCase());
      toast.success(response?.data?.message || 'OTP sent successfully');
      if (response?.data?.debugOtp) {
        toast.success(`Dev OTP: ${response.data.debugOtp}`, { duration: 5000 });
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to send OTP'));
    } finally {
      setOtpSending(false);
    }
  };

  const handleOtpLogin = async (event) => {
    event.preventDefault();

    if (!otpSent) {
      toast.error('Send the OTP first');
      return;
    }

    if (!otpForm.otp.trim()) {
      toast.error('Enter the 6-digit OTP');
      return;
    }

    setOtpVerifying(true);
    try {
      const response = await api.post('/auth/verify-otp', {
        email: otpForm.email.trim(),
        otp: otpForm.otp.trim(),
      });
      afterLoginNavigate(response.data);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Invalid or expired OTP'));
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleTabChange = (nextTab) => {
    setActiveTab(nextTab);
    if (nextTab === LOGIN_TABS.password) {
      setOtpVerifying(false);
      setOtpSending(false);
    }
  };

  const handleOtpEmailChange = (value) => {
    setOtpForm((previous) => ({
      ...previous,
      email: value,
      otp:
        previous.email.trim().toLowerCase() === value.trim().toLowerCase()
          ? previous.otp
          : '',
    }));

    if (lastOtpEmail && value.trim().toLowerCase() !== lastOtpEmail) {
      setOtpSent(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-6.5rem)] px-4 py-10">
      <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[minmax(0,1.15fr)_480px] lg:items-center">
        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28 }}
          className="hidden overflow-hidden rounded-[2rem] border border-white/60 bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.22),_transparent_38%),radial-gradient(circle_at_bottom_left,_rgba(16,185,129,0.18),_transparent_36%),linear-gradient(180deg,_rgba(255,255,255,0.85),_rgba(240,249,255,0.75))] p-8 shadow-[0_30px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl lg:block"
        >
          <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-sky-700">
            <ShieldCheck size={14} />
            Secure Access
          </div>

          <h1 className="mt-6 max-w-xl text-5xl font-semibold tracking-tight text-slate-950">
            Welcome back to Blooms.
          </h1>
          <p className="mt-4 max-w-xl text-base leading-8 text-slate-600">
            Continue with your password or switch to a polished email OTP flow for a fast, secure sign-in experience.
          </p>

          <div className="mt-10 grid gap-4">
            {[
              {
                title: 'Password Login',
                description: 'Best for frequent users who already sign in with their registered phone number.',
                icon: KeyRound,
              },
              {
                title: 'OTP Login',
                description: 'Perfect when you want a clean email-based access flow with a one-time code.',
                icon: Mail,
              },
              {
                title: 'Smart Redirects',
                description: 'Admins go to the dashboard, everyone else lands back in the reading flow.',
                icon: ArrowRight,
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className="flex items-start gap-4 rounded-[1.5rem] border border-white/60 bg-white/72 p-5 shadow-[0_16px_32px_rgba(15,23,42,0.05)]"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 to-teal-500 text-white">
                    <Icon size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{item.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.04 }}
          className="mesh-card relative overflow-hidden rounded-[2rem] p-6 shadow-[0_28px_70px_rgba(15,23,42,0.12)] sm:p-8"
        >
          <div className="absolute -left-10 top-0 h-40 w-40 rounded-full bg-sky-300/20 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-44 w-44 rounded-full bg-teal-300/20 blur-3xl" />

          <div className="relative">
            <div className="mb-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-600">
                <SparkIcon />
                Account Access
              </div>
              <h2 className="mt-4 text-3xl font-semibold tracking-tight text-slate-950">Sign in</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Choose the login method that fits how you want to access Blooms today.
              </p>
            </div>

            <div className="relative mb-6 grid grid-cols-2 rounded-2xl border border-white/70 bg-white/65 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.55)]">
              <motion.div
                layout
                transition={{ type: 'spring', stiffness: 280, damping: 28 }}
                className={`absolute top-1.5 h-[calc(100%-0.75rem)] w-[calc(50%-0.375rem)] rounded-[1rem] bg-slate-950 shadow-[0_16px_30px_rgba(15,23,42,0.18)] ${
                  activeTab === LOGIN_TABS.password ? 'left-1.5' : 'left-[calc(50%+0.125rem)]'
                }`}
              />

              {[
                { id: LOGIN_TABS.password, label: 'Login with Password', icon: LockKeyhole },
                { id: LOGIN_TABS.otp, label: 'Login with OTP', icon: Mail },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabChange(tab.id)}
                    className={`relative z-10 inline-flex items-center justify-center gap-2 rounded-[1rem] px-3 py-3 text-sm font-semibold transition ${
                      isActive ? 'text-white' : 'text-slate-600'
                    }`}
                  >
                    <Icon size={16} />
                    <span className="hidden sm:inline">{tab.label}</span>
                    <span className="sm:hidden">{tab.id === LOGIN_TABS.password ? 'Password' : 'OTP'}</span>
                  </button>
                );
              })}
            </div>

            <div className={`mb-6 rounded-[1.5rem] border border-white/65 bg-gradient-to-br ${activeTabMeta.accent} bg-white/75 p-4 shadow-[0_18px_36px_rgba(15,23,42,0.06)]`}>
              <div className="flex items-start gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/60 bg-white/75 text-slate-800">
                  <activeTabMeta.icon size={18} />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-900">{activeTabMeta.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{activeTabMeta.description}</p>
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {activeTab === LOGIN_TABS.password ? (
                <motion.form
                  key="password-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handlePasswordLogin}
                  className="space-y-5"
                >
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Phone Number</label>
                    <div className="relative">
                      <Smartphone
                        size={17}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="text"
                        inputMode="tel"
                        placeholder="Enter your registered phone number"
                        className="input-surface w-full rounded-2xl py-3 pl-11 pr-4 text-sm"
                        value={passwordForm.phoneNumber}
                        onChange={(event) =>
                          setPasswordForm((previous) => ({
                            ...previous,
                            phoneNumber: event.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                    <p className="mt-2 text-xs leading-5 text-slate-500">
                      Your current password endpoint still signs in with phone number.
                    </p>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Password</label>
                    <div className="relative">
                      <LockKeyhole
                        size={17}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="password"
                        placeholder="Enter your password"
                        className="input-surface w-full rounded-2xl py-3 pl-11 pr-4 text-sm"
                        value={passwordForm.password}
                        onChange={(event) =>
                          setPasswordForm((previous) => ({
                            ...previous,
                            password: event.target.value,
                          }))
                        }
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={passwordLoading}
                    className="button-primary inline-flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {passwordLoading ? <LoaderCircle size={17} className="animate-spin" /> : <KeyRound size={17} />}
                    {passwordLoading ? 'Signing in...' : 'Sign In with Password'}
                  </button>
                </motion.form>
              ) : (
                <motion.form
                  key="otp-form"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  onSubmit={handleOtpLogin}
                  className="space-y-5"
                >
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-700">Email Address</label>
                    <div className="relative">
                      <Mail
                        size={17}
                        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                      />
                      <input
                        type="email"
                        placeholder="Enter your account email"
                        className="input-surface w-full rounded-2xl py-3 pl-11 pr-4 text-sm"
                        value={otpForm.email}
                        onChange={(event) => handleOtpEmailChange(event.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="rounded-[1.5rem] border border-slate-200/80 bg-white/78 p-4 shadow-[0_14px_30px_rgba(15,23,42,0.05)]">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Step 1: Send OTP</p>
                        <p className="mt-1 text-xs leading-5 text-slate-500">
                          We&apos;ll send a 6-digit code to your email.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={otpSending}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {otpSending ? <LoaderCircle size={16} className="animate-spin" /> : <Mail size={16} />}
                        {otpSending ? 'Sending...' : otpSent ? 'Resend OTP' : 'Send OTP'}
                      </button>
                    </div>
                  </div>

                  <AnimatePresence>
                    {otpSent ? (
                      <motion.div
                        initial={{ opacity: 0, height: 0, y: 10 }}
                        animate={{ opacity: 1, height: 'auto', y: 0 }}
                        exit={{ opacity: 0, height: 0, y: -10 }}
                        transition={{ duration: 0.22 }}
                        className="overflow-hidden rounded-[1.5rem] border border-emerald-200/80 bg-emerald-50/80 p-4 shadow-[0_16px_32px_rgba(16,185,129,0.08)]"
                      >
                        <div className="mb-4 flex items-start gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-700">
                            <ShieldCheck size={18} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-emerald-900">Step 2: Verify &amp; Login</p>
                            <p className="mt-1 text-xs leading-5 text-emerald-800/80">
                              OTP sent to <span className="font-semibold">{otpForm.email.trim()}</span>. Enter it below to continue.
                            </p>
                          </div>
                        </div>

                        <div>
                          <label className="mb-2 block text-sm font-medium text-slate-700">6-Digit OTP</label>
                          <div className="relative">
                            <ShieldCheck
                              size={17}
                              className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                            />
                            <input
                              type="text"
                              inputMode="numeric"
                              maxLength={6}
                              placeholder="Enter the OTP"
                              className="input-surface w-full rounded-2xl py-3 pl-11 pr-4 text-sm tracking-[0.3em]"
                              value={otpForm.otp}
                              onChange={(event) =>
                                setOtpForm((previous) => ({
                                  ...previous,
                                  otp: event.target.value.replace(/\D/g, '').slice(0, 6),
                                }))
                              }
                              required
                            />
                          </div>
                        </div>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>

                  <button
                    type="submit"
                    disabled={otpVerifying || !otpSent}
                    className="button-primary inline-flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {otpVerifying ? <LoaderCircle size={17} className="animate-spin" /> : <ShieldCheck size={17} />}
                    {otpVerifying ? 'Verifying...' : 'Verify & Login'}
                  </button>
                </motion.form>
              )}
            </AnimatePresence>

            <div className="mt-5 text-center text-sm">
              <Link to="/forgot-password" className="font-semibold text-sky-700 hover:underline">
                Forgot password?
              </Link>
            </div>

            <p className="mt-6 text-center text-sm text-slate-600">
              Don&apos;t have an account?
              <Link to="/register" className="ml-1 font-semibold text-sky-700 hover:underline">
                Register
              </Link>
            </p>
          </div>
        </motion.section>
      </div>
    </div>
  );
};

const SparkIcon = () => (
  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-slate-900 text-[10px] font-bold text-white">
    BL
  </span>
);

export default Login;
