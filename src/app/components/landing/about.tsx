import styles from './styles/About.module.scss';

export default function About() {
  return (
    <section className={styles.about} id="about">
      <div className={styles.container}>
        <div className={styles.heading}>
          <span className="landing-pill landing-pill--accent">About platform</span>
          <h2>Everything you need for a small social messenger</h2>
          <p>
            Clean onboarding, unique usernames, quick account search and a lightweight chat system
            built for speed.
          </p>
        </div>

        <div className={styles.grid} id="features">
          <article className={`${styles.card} landing-glass--strong`}>
            <div className={styles.icon}>@</div>
            <h3>Unique usernames</h3>
            <p>
              Every user gets a searchable identity through a unique @username. Easy to find, easy
              to remember.
            </p>
          </article>

          <article className={styles.card}>
            <div className={styles.icon}>✦</div>
            <h3>Fast auth flow</h3>
            <p>
              Register with name, username, email and password. Then jump into the app without extra
              noise.
            </p>
          </article>

          <article className={styles.card}>
            <div className={styles.icon}>💬</div>
            <h3>Direct messaging</h3>
            <p>
              Find another account and instantly create or open a direct chat in one clean
              interface.
            </p>
          </article>

          <article className={styles.card}>
            <div className={styles.icon}>⚡</div>
            <h3>Realtime ready</h3>
            <p>
              Perfect for Supabase realtime subscriptions, presence and live updates as your project
              grows.
            </p>
          </article>
        </div>
      </div>
    </section>
  );
}
