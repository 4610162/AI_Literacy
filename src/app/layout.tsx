import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";

export const metadata: Metadata = {
  title: "AI Literacy Quiz",
  description: "KBI 금융 AI 리터러시 시험 대비 문제은행 기반 Mock 시험",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen flex flex-col">
        <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-sm">
          <div className="mx-auto flex h-12 max-w-4xl items-center justify-between px-3 sm:h-14 sm:px-6">
            <Link
              href="/"
              className="text-sm font-bold text-gray-900 transition-colors hover:text-blue-600 sm:text-base"
            >
              AI Literacy Quiz
            </Link>
            <nav className="flex items-center gap-1">
              <Link
                href="/"
                className="rounded-lg px-2.5 py-1.5 text-xs text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900 sm:px-3 sm:text-sm"
              >
                Mock 시험
              </Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto w-full max-w-4xl flex-1 px-3 py-3 sm:px-6 sm:py-8">
          {children}
        </main>

        <footer className="hidden border-t border-gray-200 bg-white py-4 sm:block">
          <p className="text-center text-xs text-gray-400">
            AI Literacy Quiz - 문제은행 기반 자동 출제 시스템
          </p>
        </footer>
      </body>
    </html>
  );
}
