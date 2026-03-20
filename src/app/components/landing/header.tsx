import Link from 'next/link';
import styles from './styles/Header.module.scss';

export default function Header() {
  return (
    <header className={styles.header}>
      <div className={`${styles.headerContainer} landing-container`}>
        <Link href="/" className="landing-logo landing-logo--md">
          <div className="landing-logo__mark">WT</div>
          <span className="landing-logo__text">WebTalk</span>
        </Link>

        <nav className={styles.nav}>
          <Link href="#about">About</Link>
          <Link href="#features">Features</Link>
          <Link href="#start">Start</Link>
        </nav>

        <div className={styles.actions}>
          <Link href="/auth" className="landing-btn landing-btn--sm landing-btn--soft">
            Log in
          </Link>
          <Link href="/auth" className="landing-btn landing-btn--sm landing-btn--primary">
            Get started
          </Link>
        </div>
      </div>
    </header>
  );
}
