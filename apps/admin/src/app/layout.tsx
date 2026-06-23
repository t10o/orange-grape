import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "orange-grape Admin",
  description: "ブログ管理ダッシュボード",
  robots: "noindex, nofollow",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body className="min-h-screen bg-gray-50 font-sans text-gray-900 dark:bg-gray-950 dark:text-gray-100">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-brand-500 focus:text-white focus:rounded-md"
        >
          コンテンツへスキップ
        </a>
        {children}
      </body>
    </html>
  );
}
