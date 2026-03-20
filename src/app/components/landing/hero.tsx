import Link from 'next/link';
import styles from './styles/Hero.module.scss';

export default function Hero() {
  return (
    <section className={styles.hero} id="start">
      <div className={styles.bgGlowOne} />
      <div className={styles.bgGlowTwo} />

      <div className={styles.container}>
        <div className={styles.left}>
          <div className="landing-pill landing-pill--soft">Fast. Private. Minimal.</div>

          <h1 className={styles.title}>
            Build your own
            <span> social chat space</span>
          </h1>

          <p className={styles.subtitle}>
            Register with your name and @username, find people instantly, and start real-time
            conversations in a clean Telegram-inspired interface.
            <br />
            <br />
            Your messages are protected with end-to-end encryption — only you and the recipient can
            read them. No servers, no third parties, just private communication.
          </p>

          <div className={styles.buttons}>
            <Link href="/auth" className="landing-btn landing-btn--md landing-btn--primary">
              Create account
            </Link>
            <Link href="#about" className="landing-btn landing-btn--md landing-btn--ghost">
              See how it works
            </Link>
          </div>

          <div className={styles.meta}>
            <div>
              <strong>@username</strong>
              <span>Unique identity</span>
            </div>
            <div>
              <strong>Realtime chat</strong>
              <span>Instant messages</span>
            </div>
            <div>
              <strong>Supabase</strong>
              <span>Auth + database</span>
            </div>
          </div>
        </div>

        <div className={styles.right}>
          <div className={styles.phone}>
            <div className={styles.phoneTop}>
              <div className={styles.dots}>
                <span />
                <span />
                <span />
              </div>
              <div className={styles.phoneTitle}>WebTalk</div>
            </div>

            <div className={styles.chatArea}>
              <div className={styles.search}>Search by @username</div>

              <div className={`${styles.card} landing-glass`}>
                <div className={styles.avatar}>A</div>
                <div>
                  <h4>@alexdev</h4>
                  <p>Online now</p>
                </div>
              </div>

              <div className={`${styles.message} ${styles.received}`}>
                Hey, found you by your @username 👋
              </div>

              <div className={`${styles.message} ${styles.sent}`}>
                Nice. Let&apos;s build this app.
              </div>

              <div className={styles.input}>Write a message...</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
