import { loginStyles } from '../../styles/classNames';

export default function LoginBackground() {
  return (
    <div className={loginStyles.background.wrapper}>
      <div className={loginStyles.background.grid}></div>
      <div className={loginStyles.background.radial}></div>
      <div className={loginStyles.background.mask}></div>
      <div className={loginStyles.background.noise}></div>
    </div>
  );
}
