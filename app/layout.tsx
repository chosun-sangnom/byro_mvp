import type { Metadata } from "next";
import "./globals.css";
import DevResetButton from "@/components/ui/DevResetButton";

export const metadata: Metadata = {
  title: "Byro — Build Your Real Offline Identity",
  description: "타인이 검증·작성하는 신뢰 기반 오프라인 프로페셔널 네트워킹 프로필 서비스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased overflow-x-hidden">
        {children}
        <DevResetButton />
      </body>
    </html>
  );
}
