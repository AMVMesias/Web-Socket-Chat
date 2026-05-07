import { errorTemplateStyles } from '../../styles/classNames';

export default function ErrorTemplate({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={errorTemplateStyles.page}>
      <div className={errorTemplateStyles.card}>
        <h1 className={errorTemplateStyles.title}>{title}</h1>
        <p className={errorTemplateStyles.subtitle}>{subtitle}</p>
        {children}
      </div>
    </div>
  );
}
