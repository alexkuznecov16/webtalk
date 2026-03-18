import Link from 'next/link';
import styles from './styles/Footer.module.scss';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.container}>
        <div className={styles.brand}>
          <div className={styles.logo}>S</div>
          <div>
            <h4>WebTalk</h4>
            <p>Minimal social messaging platform</p>
          </div>
        </div>

        <div className={styles.links}>
          <Link href="/">Home</Link>
          <Link href="#about">About</Link>
          <Link href="/auth">Auth</Link>
        </div>

        <div className={styles.copy}>© 2025 WebTalk. Built with Next.js + Supabase.</div>
      </div>
    </footer>
  );
}
