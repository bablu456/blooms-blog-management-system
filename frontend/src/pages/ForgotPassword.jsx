import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';

const getApiErrorMessage = (error, fallbackMessage) => {
  const payload = error?.response?.data;
  if (typeof payload === 'string') return payload;
  if (payload?.message) return payload.message;
  return fallbackMessage;
};

const ForgotPassword = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    phoneNumber: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
  });

  const requestOtp = async (event) => {
    event.preventDefault();
    setLoading(true);
    try {
      const response = await api.post('/user/password/forgot/request', {
        phoneNumber: formData.phoneNumber.trim(),
      });
      setStep(2);
      toast.success(response.data?.message || 'OTP sent for password reset');
      if (response.data?.debugOtp) {
        toast.success(`Dev OTP: ${response.data.debugOtp}`, { duration: 5000 });
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to send OTP'));
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (event) => {
    event.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await api.post('/user/password/forgot/reset', {
        phoneNumber: formData.phoneNumber.trim(),
        otp: formData.otp.trim(),
        newPassword: formData.newPassword,
      });
      toast.success('Password reset successful. Please login.');
      navigate('/login');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to reset password'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-6.5rem)] flex items-center justify-center px-4 py-10">
      <div className="mesh-card w-full max-w-md rounded-3xl p-8">
        <h2 className="text-3xl font-bold text-slate-900">Reset password</h2>
        <p className="mt-2 text-sm text-slate-600">
          {step === 1
            ? 'Enter your registered phone number to receive OTP.'
            : 'Enter OTP and create your new password.'}
        </p>

        {step === 1 ? (
          <form className="mt-6 space-y-5" onSubmit={requestOtp}>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Phone number</label>
              <input
                type="text"
                className="input-surface w-full rounded-xl px-4 py-3 text-sm"
                placeholder="e.g. 9876543210"
                value={formData.phoneNumber}
                onChange={(event) => setFormData((prev) => ({ ...prev, phoneNumber: event.target.value }))}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="button-primary w-full rounded-xl py-3 text-sm font-semibold disabled:opacity-70"
            >
              {loading ? 'Sending OTP...' : 'Send Reset OTP'}
            </button>
          </form>
        ) : (
          <form className="mt-6 space-y-5" onSubmit={resetPassword}>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">OTP</label>
              <input
                type="text"
                className="input-surface w-full rounded-xl px-4 py-3 text-sm"
                placeholder="Enter OTP"
                value={formData.otp}
                onChange={(event) => setFormData((prev) => ({ ...prev, otp: event.target.value }))}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">New password</label>
              <input
                type="password"
                className="input-surface w-full rounded-xl px-4 py-3 text-sm"
                placeholder="At least 6 characters"
                value={formData.newPassword}
                onChange={(event) => setFormData((prev) => ({ ...prev, newPassword: event.target.value }))}
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Confirm new password</label>
              <input
                type="password"
                className="input-surface w-full rounded-xl px-4 py-3 text-sm"
                placeholder="Re-enter password"
                value={formData.confirmPassword}
                onChange={(event) => setFormData((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="rounded-xl border border-slate-200 bg-white py-3 text-sm font-semibold text-slate-700 transition hover:border-slate-300"
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading}
                className="button-primary rounded-xl py-3 text-sm font-semibold disabled:opacity-70"
              >
                {loading ? 'Resetting...' : 'Reset password'}
              </button>
            </div>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-600">
          Remembered your password?
          <Link to="/login" className="ml-1 font-semibold text-sky-700 hover:underline">
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
