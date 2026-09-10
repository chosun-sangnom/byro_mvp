import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Felore — Build Your Real Offline Identity",
  description: "타인이 검증·작성하는 신뢰 기반 오프라인 프로페셔널 네트워킹 프로필 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <head>
        {/* Pretendard — 디자인 시스템 기준 서체(Figma 전체 Pretendard). 한글 dynamic subset. */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/npm/pretendard@1.3.9/dist/web/static/pretendard-dynamic-subset.min.css"
        />
      </head>
      <body className="antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
