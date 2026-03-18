import Link from 'next/link';
import styles from './styles/Header.module.scss';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <div className={styles.logoMark}>WT</div>
          <span className={styles.logoText}>WebTalk</span>
        </Link>

        <nav className={styles.nav}>
          <Link href="#about">About</Link>
          <Link href="#features">Features</Link>
          <Link href="#start">Start</Link>
        </nav>

        <div className={styles.actions}>
          <Link href="/auth" className={styles.login}>
            Log in
          </Link>
          <Link href="/auth" className={styles.cta}>
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
