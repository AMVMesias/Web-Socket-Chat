import { loginStyles } from '../../styles/classNames';

interface FeedbackBannerProps {
  error: string;
  feedback: string;
}

export default function FeedbackBanner({ error, feedback }: FeedbackBannerProps) {
  if (!error && !feedback) return null;

  return (
    <div className={loginStyles.feedback(Boolean(error))}>
      <div className={loginStyles.feedbackBody}>
        <div className={loginStyles.feedbackDot(Boolean(error))} />
        {error || feedback}
      </div>
    </div>
  );
}
