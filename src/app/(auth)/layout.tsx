import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-12">
      <Link href="/" className="mb-8 flex items-center justify-center gap-2 font-bold text-brand-700">
        <span className="flex h-9 w-9 items-center justify-center rounded-md bg-brand-600 text-sm text-white">
          AL
        </span>
        <span className="text-xl">AgriLoop</span>
      </Link>
      {children}
    </div>
  );
}
