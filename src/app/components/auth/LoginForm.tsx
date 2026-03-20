'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import styles from './AuthForm.module.scss';
import { useDatabase } from '@/context/DatabaseContext';
import { useRouter } from 'next/navigation';

type LoginFormProps = {
  onSwitchToRegister: () => void;
};

const loginSchema = z.object({
  identifier: z
    .string()
    .trim()
    .min(1, 'Enter email or username')
    .refine(
      (value) => {
        const normalized = value.startsWith('@') ? value.slice(1) : value;

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const usernameRegex = /^(?!.*[_.]{2})[a-zA-Z0-9._]{3,20}$/;

        return emailRegex.test(value) || usernameRegex.test(normalized);
      },
      {
        message: 'Enter a valid email or username',
      }
    ),
  password: z.string().min(1, 'Enter your password'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginForm({ onSwitchToRegister }: LoginFormProps) {
  const router = useRouter();
  const { signIn, authLoading } = useDatabase();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onChange',
    defaultValues: {
      identifier: '',
      password: '',
    },
  });

  async function onSubmit(values: LoginFormValues) {
    const result = await signIn(values.identifier, values.password);

    if (result.error) {
      setError('root', {
        type: 'manual',
        message: result.error,
      });
      return;
    }

    router.replace('/home');
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className={styles.field}>
        <label htmlFor="login-identifier">Nickname or email</label>
        <input
          id="login-identifier"
          type="text"
          placeholder="@username or email@example.com"
          autoComplete="username"
          {...register('identifier')}
          className={errors.identifier ? styles.inputError : ''}
        />
        {errors.identifier ? <p className={styles.error}>{errors.identifier.message}</p> : null}
      </div>

      <div className={styles.field}>
        <label htmlFor="login-password">Password</label>
        <input
          id="login-password"
          type="password"
          placeholder="Enter your password"
          autoComplete="current-password"
          {...register('password')}
          className={errors.password ? styles.inputError : ''}
        />
        {errors.password ? <p className={styles.error}>{errors.password.message}</p> : null}
      </div>

      <button type="submit" className={styles.primaryButton} disabled={authLoading}>
        {authLoading ? 'Signing in...' : 'Log in'}
      </button>

      {/* <div className={styles.bottomText}>
        <span>Don&apos;t have an account?</span>
        <button type="button" onClick={onSwitchToRegister}>
          Create one
        </button>
      </div> */}
    </form>
  );
}
