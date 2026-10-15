import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import { signinSchema, type SigninFormValues } from '../types/authSchemas';
import AuthService from '../services/AuthService';
import { useAuth } from '../contexts/AuthContext';
import { AuthField, AuthShell, OAuthButtons, OrDivider } from '../components/auth/AuthUI';
import { Button } from '../components/common/Button';
import { CLIENT_URL } from '../utils/auth';

export default function Login() {
  const navigate = useNavigate();
  const { refresh, setAuth } = useAuth();
  const { register, handleSubmit, formState, setError } = useForm<SigninFormValues>({
    resolver: zodResolver(signinSchema),
    mode: 'onTouched',
  });
  const { errors, isDirty, isValid, isSubmitting } = formState;

  const onSubmit: SubmitHandler<SigninFormValues> = async ({ email, password }) => {
    const [data, err] = await AuthService.signin({ email, password });

    if (!data && err) {
      setError('email', { type: 'server', message: err });

      if (err === 'Email verification required') {
        setAuth({
          id: '',
          createdAt: new Date(),
          updatedAt: new Date(),
          email,
          emailVerified: false,
          name: '',
        });
        await AuthService.resendVerifyEmailOTP({ email });
        navigate('/verify-email', { replace: true });
      }
      return;
    }

    await refresh();
  };

  return (
    <AuthShell title="Sign in to the admin console" subtitle="Use your AInvoker account.">
      <OAuthButtons callbackPath="/login" />
      <OrDivider />
      <form className="flex flex-col gap-3" onSubmit={handleSubmit(onSubmit)}>
        <AuthField
          type="email"
          label="Email"
          placeholder="you@company.com"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <AuthField
          type="password"
          label="Password"
          placeholder="Your password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <div className="flex justify-end">
          <a href={`${CLIENT_URL}/forgot-password`} className="text-xs text-gray-600 hover:underline">
            Forgot password?
          </a>
        </div>
        <Button type="submit" className="py-3" loading={isSubmitting} disabled={!isDirty || !isValid}>
          Sign in
        </Button>
      </form>
      <p className="py-3 text-center text-xs text-gray-600">
        Don't have an account?{' '}
        <Link to="/signup" className="font-semibold text-accent hover:underline">
          Sign up
        </Link>
      </p>
    </AuthShell>
  );
}
