'use client';

import { useState } from 'react';
import styles from './AuthForm.module.scss';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';

export default function AuthForm() {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  return (
    <section className={styles.authSection}>
      <div className={styles.bgGlowOne} />
      <div className={styles.bgGlowTwo} />

      <div className={styles.authWrapper}>
        <div className={styles.authCard}>
          <div className={styles.authHeader}>
            <div className={styles.authBrand}>
              <div className={styles.logo}>WT</div>
              <span>WebTalk</span>
            </div>
            <h1>{mode === 'login' ? 'Welcome back' : 'Create your account'}</h1>
            <p>
              {mode === 'login'
                ? 'Log in with your nickname or email and continue chatting.'
                : 'Register with your email and password to get started.'}
            </p>
          </div>

          <div className={styles.switcher}>
            <button
              type="button"
              className={mode === 'login' ? styles.switcherActive : ''}
              onClick={() => setMode('login')}
            >
              Log in
            </button>

            <button
              type="button"
              className={mode === 'register' ? styles.switcherActive : ''}
              onClick={() => setMode('register')}
            >
              Register
            </button>
          </div>

          {mode === 'login' ? (
            <LoginForm onSwitchToRegister={() => setMode('register')} />
          ) : (
            <RegisterForm onSwitchToLogin={() => setMode('login')} />
          )}
        </div>
      </div>
    </section>
  );
}
