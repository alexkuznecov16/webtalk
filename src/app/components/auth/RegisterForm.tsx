'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import styles from './AuthForm.module.scss';
import { useDatabase } from '@/context/DatabaseContext';
import { useState } from 'react';
import Modal from '../modal/Modal';

type RegisterFormProps = {
  onSwitchToLogin: () => void;
};

const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[a-z]/, 'Password must include a lowercase letter')
  .regex(/[A-Z]/, 'Password must include an uppercase letter')
  .regex(/[0-9]/, 'Password must include a number')
  .regex(/[^A-Za-z0-9]/, 'Password must include a special character');

const registerSchema = z
  .object({
    name: z.string().trim().min(2, 'Enter your name'),
    email: z.string().trim().min(1, 'Enter your email').email('Enter a valid email'),
    password: passwordSchema,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterForm({ onSwitchToLogin }: RegisterFormProps) {
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const { signUp } = useDatabase();

  const {
    register,
    handleSubmit,
    watch,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onChange',
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password', '');

  async function onSubmit(values: RegisterFormValues) {
    const result = await signUp(
      values.name.trim(),
      values.email.trim().toLowerCase(),
      values.password
    );

    if (result.error) {
      setError('root', {
        type: 'manual',
        message: result.error,
      });
      return;
    }

    reset();
    setIsSuccessModalOpen(true);
  }

  function handleCloseModal() {
    setIsSuccessModalOpen(false);
    onSwitchToLogin();
  }

  const passwordChecks = [
    {
      label: 'At least 8 characters',
      valid: passwordValue.length >= 8,
    },
    {
      label: 'One lowercase letter',
      valid: /[a-z]/.test(passwordValue),
    },
    {
      label: 'One uppercase letter',
      valid: /[A-Z]/.test(passwordValue),
    },
    {
      label: 'One number',
      valid: /[0-9]/.test(passwordValue),
    },
    {
      label: 'One special character',
      valid: /[^A-Za-z0-9]/.test(passwordValue),
    },
  ];

  return (
    <>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className={styles.field}>
          <label htmlFor="register-name">Name</label>
          <input
            id="register-name"
            type="text"
            placeholder="Your name"
            autoComplete="name"
            {...register('name')}
            className={errors.name ? styles.inputError : ''}
          />
          {errors.name ? <p className={styles.error}>{errors.name.message}</p> : null}
        </div>

        <div className={styles.field}>
          <label htmlFor="register-email">Email</label>
          <input
            id="register-email"
            type="email"
            placeholder="email@example.com"
            autoComplete="email"
            {...register('email')}
            className={errors.email ? styles.inputError : ''}
          />
          {errors.email ? <p className={styles.error}>{errors.email.message}</p> : null}
        </div>

        <div className={styles.field}>
          <label htmlFor="register-password">Password</label>
          <input
            id="register-password"
            type="password"
            placeholder="Create a strong password"
            autoComplete="new-password"
            {...register('password')}
            className={errors.password ? styles.inputError : ''}
          />
          {errors.password ? <p className={styles.error}>{errors.password.message}</p> : null}

          <div className={styles.passwordHints}>
            {passwordChecks.map((rule) => (
              <div
                key={rule.label}
                className={`${styles.passwordHint} ${rule.valid ? styles.passwordHintValid : ''}`}
              >
                <span className={styles.passwordDot} />
                {rule.label}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <label htmlFor="register-confirm-password">Confirm password</label>
          <input
            id="register-confirm-password"
            type="password"
            placeholder="Repeat your password"
            autoComplete="new-password"
            {...register('confirmPassword')}
            className={errors.confirmPassword ? styles.inputError : ''}
          />
          {errors.confirmPassword ? (
            <p className={styles.error}>{errors.confirmPassword.message}</p>
          ) : null}
        </div>

        {errors.root ? <p className={styles.error}>{errors.root.message}</p> : null}

        <button type="submit" className={styles.primaryButton} disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </button>

        {/* <div className={styles.bottomText}>
          <span>Already have an account?</span>
          <button type="button" onClick={onSwitchToLogin}>
            Log in
          </button>
        </div> */}
      </form>

      <Modal
        isOpen={isSuccessModalOpen}
        onClose={handleCloseModal}
        title="Confirm your email"
        description="We sent you a confirmation link. Open your email inbox, verify your account, and then log in."
        size="sm"
        footer={
          <button type="button" className={styles.primaryButton} onClick={handleCloseModal}>
            Go to login
          </button>
        }
      >
        <div className={styles.successContent}>
          <p className={styles.successText}>
            Your account was created successfully. Check your email and confirm it before entering
            the app.
          </p>
        </div>
      </Modal>
    </>
  );
}
