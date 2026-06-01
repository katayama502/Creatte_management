import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNavProvider } from "@/components/layout/MobileNavContext";
import FirebaseProvider from "@/components/providers/FirebaseProvider";

export const metadata: Metadata = {
  title: {
    default: "クリエット - プログラミング教室管理システム",
    template: "%s | クリエット",
  },
  description: "クリエットプログラミング教室の生徒・スケジュール・入会管理システム",
  keywords: ["プログラミング教室", "Scratch", "Canva", "Mbot", "スケジュール管理", "生徒管理"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+JP:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased bg-gray-50 min-h-screen">
        <FirebaseProvider>
          <MobileNavProvider>
            <div className="flex h-screen overflow-hidden">
              {/* Sidebar */}
              <Sidebar />

              {/* Main content area */}
              <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
                {/* Top header */}
                <Header />

                {/* Page content */}
                <main className="flex-1 overflow-y-auto">
                  {children}
                </main>
              </div>
            </div>
          </MobileNavProvider>
        </FirebaseProvider>
      </body>
    </html>
  );
}
