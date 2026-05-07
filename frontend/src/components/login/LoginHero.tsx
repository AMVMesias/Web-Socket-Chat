import { Lock } from 'lucide-react';
import { loginStyles } from '../../styles/classNames';

export default function LoginHero() {
  return (
    <div className={loginStyles.introHeader}>
      <div className={loginStyles.brandIconBox}>
        <Lock className={loginStyles.brandIcon} strokeWidth={1.5} />
        <div className={loginStyles.brandPulse}></div>
      </div>

      <div className={loginStyles.brandContent}>
        <div className={loginStyles.statusBadge}>
          <span className={loginStyles.statusPingBox}>
            <span className={loginStyles.statusPing}></span>
            <span className={loginStyles.statusDot}></span>
          </span>
          Protocolo de Red Activo
        </div>

        <h1 className={loginStyles.title}>
          Nexus{' '}
          <span className={loginStyles.titleAccentBox}>
            <span className={loginStyles.titleAccentText}>ESPE</span>
            <span className={loginStyles.titleAccentGlow}></span>
          </span>
        </h1>

        <p className={loginStyles.subtitle}>
          Puerta de enlace a la comunicación{' '}
          <span className={loginStyles.subtitleHighlight}>encriptada y efímera</span>. Tu rastro
          digital termina aquí.
        </p>
      </div>
    </div>
  );
}
