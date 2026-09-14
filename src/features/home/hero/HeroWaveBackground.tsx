import styles from './Hero.module.css';

/**
 * Pure-CSS/SVG atmospheric backdrop for the Hero. Purely decorative: every
 * shape is `aria-hidden`, ignores pointer events, and stays below the product
 * stage and content in the stacking order (see Hero.module.css z-index
 * values).
 */
export function HeroWaveBackground() {
  return (
    <div className={styles.waves} aria-hidden="true">
      <svg
        className={styles.waveSvg}
        viewBox="0 0 1440 900"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="hero-wave-deep" x1="0%" y1="20%" x2="100%" y2="80%">
            <stop offset="0%" stopColor="var(--hero-ink)" />
            <stop offset="100%" stopColor="var(--hero-deep)" />
          </linearGradient>
          <linearGradient id="hero-wave-mid" x1="10%" y1="0%" x2="90%" y2="100%">
            <stop offset="0%" stopColor="var(--hero-deep)" />
            <stop offset="55%" stopColor="var(--hero-teal)" />
            <stop offset="100%" stopColor="var(--hero-aqua)" />
          </linearGradient>
          <linearGradient id="hero-wave-light" x1="30%" y1="10%" x2="100%" y2="90%">
            <stop offset="0%" stopColor="var(--hero-teal)" stopOpacity="0.55" />
            <stop offset="100%" stopColor="var(--hero-aqua)" stopOpacity="0.35" />
          </linearGradient>
          <linearGradient id="hero-wave-edge" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="var(--hero-aqua)" stopOpacity="0.28" />
            <stop offset="100%" stopColor="var(--hero-cyan)" stopOpacity="0.12" />
          </linearGradient>
        </defs>

        {/* Deep back ribbon — anchors the left atmosphere */}
        <path
          className={styles.waveLayer1}
          d="M0,0 L1440,0 L1440,520 C1180,640 980,580 720,620 C460,660 220,720 0,680 L0,0 Z"
          fill="url(#hero-wave-deep)"
        />

        {/* Mid flowing contour — ribbon-like sweep across center */}
        <path
          className={styles.waveLayer2}
          d="M0,280 C320,180 580,340 860,300 C1080,270 1260,360 1440,320 L1440,700 C1200,760 940,700 680,740 C420,780 180,820 0,760 L0,280 Z"
          fill="url(#hero-wave-mid)"
        />

        {/* Translucent upper flow — adds depth without blob feel */}
        <path
          className={styles.waveLayer3}
          d="M0,380 C280,300 520,420 800,380 C1040,350 1240,440 1440,400 L1440,580 C1180,640 900,600 620,640 C340,680 120,700 0,660 L0,380 Z"
          fill="url(#hero-wave-light)"
        />

        {/* Lower-edge contour ribbons — refined bottom flow language */}
        <path
          className={styles.waveEdge1}
          d="M0,620 C240,680 480,640 720,680 C960,720 1200,660 1440,700 L1440,900 L0,900 Z"
          fill="url(#hero-wave-edge)"
        />
        <path
          className={styles.waveEdge2}
          d="M0,700 C300,740 560,710 820,750 C1060,785 1260,730 1440,770 L1440,900 L0,900 Z"
          fill="var(--hero-cyan)"
          opacity="0.14"
        />
      </svg>

      <div className={styles.lightField} />
      <div className={styles.bottomFade} />
    </div>
  );
}
