import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const getApiErrorMessage = (error, fallbackMessage) => {
  const payload = error?.response?.data;
  if (typeof payload === 'string') return payload;
  if (payload?.message) return payload.message;
  return fallbackMessage;
};

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [mode, setMode] = useState('password');
  const [formData, setFormData] = useState({
    phoneNumber: '',
    password: '',
    otp: '',
  });
  const [loading, setLoading] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpRequested, setOtpRequested] = useState(false);

  const afterLoginNavigate = (user) => {
    login(user);
    const fallbackRoute = user?.role === 'ROLE_ADMIN' ? '/dashboard' : '/';
    navigate(location.state?.from?.pathname || fallbackRoute);
  };

  const handlePasswordLogin = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/user/login/password', {
        phoneNumber: formData.phoneNumber.trim(),
        password: formData.password,
      });
      afterLoginNavigate(response.data);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Invalid phone number or password'));
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async () => {
    if (!formData.phoneNumber.trim()) {
      toast.error('Phone number is required');
      return;
    }
    setOtpSending(true);
    try {
      const response = await api.post('/user/login/otp/request', {
        phoneNumber: formData.phoneNumber.trim(),
      });
      setOtpRequested(true);
      toast.success(response.data?.message || 'OTP sent');
      if (response.data?.debugOtp) {
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
    if (!otpRequested) {
      toast.error('Request OTP first');
      return;
    }
    setLoading(true);
    try {
      const response = await api.post('/user/login/otp/verify', {
        phoneNumber: formData.phoneNumber.trim(),
        otp: formData.otp.trim(),
      });
      afterLoginNavigate(response.data);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Invalid or expired OTP'));
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (nextMode) => {
    setMode(nextMode);
    setOtpRequested(false);
    setFormData((previous) => ({ ...previous, otp: '' }));
  };

  return (
    <div className="min-h-[calc(100vh-6.5rem)] flex items-center justify-center px-4 py-10">
      <div className="mesh-card w-full max-w-md rounded-3xl p-8">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900">Welcome back</h2>
          <p className="mt-2 text-slate-600">Login with password or one-time OTP.</p>
        </div>

        <div className="mb-6 grid grid-cols-2 rounded-xl bg-white/60 p-1 surface-ring">
          <button
            type="button"
            onClick={() => handleModeChange('password')}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              mode === 'password' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            Password
          </button>
          <button
            type="button"
            onClick={() => handleModeChange('otp')}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition ${
              mode === 'otp' ? 'bg-slate-900 text-white' : 'text-slate-600'
            }`}
          >
            OTP
          </button>
        </div>

        <form onSubmit={mode === 'password' ? handlePasswordLogin : handleOtpLogin} className="space-y-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Phone number</label>
            <input
              type="text"
              placeholder="e.g. 9876543210"
              className="input-surface w-full rounded-xl px-4 py-3 text-sm"
              value={formData.phoneNumber}
              onChange={(event) => setFormData((prev) => ({ ...prev, phoneNumber: event.target.value }))}
              required
            />
          </div>

          {mode === 'password' ? (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
              <input
                type="password"
                placeholder="Enter password"
                className="input-surface w-full rounded-xl px-4 py-3 text-sm"
                value={formData.password}
                onChange={(event) => setFormData((prev) => ({ ...prev, password: event.target.value }))}
                required
              />
            </div>
          ) : (
            <>
              <div className="rounded-xl border border-slate-200 bg-white/70 p-3">
                <button
                  type="button"
                  onClick={handleRequestOtp}
                  disabled={otpSending}
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-sky-300 hover:text-sky-700 disabled:opacity-60"
                >
                  {otpSending ? 'Sending OTP...' : otpRequested ? 'Resend OTP' : 'Send OTP'}
                </button>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">OTP</label>
                <input
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  className="input-surface w-full rounded-xl px-4 py-3 text-sm"
                  value={formData.otp}
                  onChange={(event) => setFormData((prev) => ({ ...prev, otp: event.target.value }))}
                  required
                />
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading || (mode === 'otp' && !otpRequested)}
            className="button-primary w-full rounded-xl py-3 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Signing in...' : mode === 'password' ? 'Sign in with password' : 'Verify OTP & Sign in'}
          </button>
        </form>

        <div className="mt-4 text-center text-sm">
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
    </div>
  );
};

export default Login;
