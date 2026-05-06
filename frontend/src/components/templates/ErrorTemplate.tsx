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
    <div className="flex min-h-screen items-center justify-center bg-gray-900 p-4 text-white">
      <div className="w-full max-w-md rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-xl">
        <h1 className="text-xl font-semibold">{title}</h1>
        <p className="mt-2 text-sm text-gray-300">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}
