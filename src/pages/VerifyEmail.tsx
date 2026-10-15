import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthService from '../services/AuthService';
import { AuthField, AuthShell } from '../components/auth/AuthUI';
import { Button } from '../components/common/Button';

export default function VerifyEmail() {
  const { user, refresh, signout } = useAuth();
  const [otp, setOtp] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(60);

  const email = user?.email ?? '';

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const [, err] = await AuthService.verifyEmail({ email, otp });
    setIsSubmitting(false);

    if (err) {
      setError(err);
      return;
    }

    await refresh();
  };

  const handleResend = async () => {
    setOtp('');
    setError(null);
    await AuthService.resendVerifyEmailOTP({ email });
    setResendCountdown(60);
  };

  useEffect(() => {
    if (resendCountdown <= 0) return;
    const id = setInterval(() => setResendCountdown((prev) => prev - 1), 1000);
    return () => clearInterval(id);
  }, [resendCountdown]);

  return (
    <AuthShell
      title="Verify your email"
      subtitle={
        <>
          Enter the six-digit code we sent to <span className="font-medium text-accent">{email}</span>.
        </>
      }
    >
      <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
        <AuthField
          name="otp"
          label="Verification code"
          inputMode="numeric"
          autoComplete="one-time-code"
          autoFocus
          maxLength={6}
          placeholder="000000"
          className="tracking-[0.5em] font-mono"
          value={otp}
          onChange={(e) => {
            setError(null);
            setOtp(e.target.value.replace(/\D/g, '').slice(0, 6));
          }}
          error={error ?? undefined}
        />
        <Button type="submit" className="py-3" loading={isSubmitting} disabled={otp.length !== 6 || !!error}>
          Verify email
        </Button>
      </form>
      <p className="mt-4 text-center text-xs text-gray-600">
        Didn't get the code?{' '}
        {resendCountdown > 0 ? (
          <span>Resend in {resendCountdown}s</span>
        ) : (
          <button type="button" onClick={handleResend} className="cursor-pointer font-semibold text-accent hover:underline">
            Resend code
          </button>
        )}
      </p>
      <Button variant="secondary" className="mt-6 w-full" onClick={() => void signout()}>
        Use a different account
      </Button>
    </AuthShell>
  );
}
