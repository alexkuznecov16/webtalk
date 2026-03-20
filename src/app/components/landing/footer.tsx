import Link from 'next/link';
import styles from './styles/Footer.module.scss';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <div className="landing-logo landing-logo--sm">
            <div className="landing-logo__mark">WT</div>
            <div>
              <div className="landing-logo__text">WebTalk</div>
              <p className={styles.brandSubtitle}>Minimal social messaging platform</p>
            </div>
          </div>
        </div>

        <div className={styles.navLinks}>
          <Link href="/home">Home</Link>
          <Link href="#about">About</Link>
          <Link href="/auth">Auth</Link>
        </div>

        <div className={styles.copy}>© 2026 WebTalk. Built with Next.js + Supabase.</div>
      </div>
    </footer>
  );
}
