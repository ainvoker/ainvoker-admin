import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { signupSchema, type SignupFormValues } from '../types/authSchemas';
import AuthService from '../services/AuthService';
import { useAuth } from '../contexts/AuthContext';
import { AuthField, AuthShell, OAuthButtons, OrDivider } from '../components/auth/AuthUI';
import { Button } from '../components/common/Button';
import { CLIENT_URL } from '../utils/auth';

function signupHasSession(data: unknown): boolean {
  return Boolean(
    data &&
      typeof data === 'object' &&
      'session' in data &&
      (data as { session?: unknown }).session,
  );
}

export default function Signup() {
  const navigate = useNavigate();
  const { refresh, setAuth } = useAuth();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const { register, handleSubmit, formState, setError } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: 'onTouched',
  });
  const { errors, isDirty, isValid, isSubmitting } = formState;

  const onSubmit: SubmitHandler<SignupFormValues> = async ({ name, email, password }) => {
    const [data, err] = await AuthService.signup({ name, email, password });

    if (err && err !== 'Email verification required') {
      setError('email', {
        type: 'server',
        message: err.startsWith('User already exists.') ? 'User already exists.' : err,
      });
      return;
    }

    if (signupHasSession(data)) {
      await refresh();
      return;
    }

    // Neon blocks a session until the email is verified — do not refresh (clears the stub).
    setAuth({
      id: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      email,
      emailVerified: false,
      name: '',
    });
    navigate('/verify-email', { replace: true });
  };

  return (
    <AuthShell
      title="Create your AInvoker account"
      subtitle="New accounts start on the AInvoker dashboard. Admin access is granted separately."
    >
      <OAuthButtons callbackPath="/signup" />
      <OrDivider />
      <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
        <AuthField type="text" label="Name" placeholder="Your name" autoComplete="name" error={errors.name?.message} {...register('name')} />
        <AuthField type="email" label="Email" placeholder="you@company.com" autoComplete="email" error={errors.email?.message} {...register('email')} />
        <AuthField type="password" label="Password" placeholder="At least 8 characters" autoComplete="new-password" error={errors.password?.message} {...register('password')} />
        <AuthField type="password" label="Confirm password" placeholder="Repeat your password" autoComplete="new-password" error={errors.confirmPassword?.message} {...register('confirmPassword')} />

        <label className="flex items-start gap-2 text-xs text-gray-600">
          <input
            type="checkbox"
            checked={acceptedTerms}
            onChange={(e) => setAcceptedTerms(e.target.checked)}
            className="mt-0.5 accent-neutral-900"
          />
          <span>
            I agree to the{' '}
            <a href={`${CLIENT_URL}/terms`} target="_blank" rel="noreferrer" className="font-semibold text-accent hover:underline">Terms of Service</a>{' '}
            and{' '}
            <a href={`${CLIENT_URL}/privacy`} target="_blank" rel="noreferrer" className="font-semibold text-accent hover:underline">Privacy Policy</a>.
          </span>
        </label>

        <Button type="submit" className="py-3" loading={isSubmitting} disabled={!isDirty || !isValid || !acceptedTerms}>
          Create account
        </Button>
      </form>
      <p className="py-3 text-center text-xs text-gray-600">
        Already have an account?{' '}
        <Link to="/login" className="font-semibold text-accent hover:underline">
          Sign in
        </Link>
      </p>
    </AuthShell>
  );
}
