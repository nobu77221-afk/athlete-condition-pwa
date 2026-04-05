import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Condition App",
  description: "アスリートのための食事・トレーニング・コンディション管理PWA",
  manifest: "/manifest.json", // next-pwa generated
  appleWebApp: {
    capable: true,
    title: "Condition",
    statusBarStyle: "black-translucent",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false, // ズーム防止（iPhoneアプリライクな挙動）
  viewportFit: "cover",
  themeColor: "#09090b", // zinc-950 (Dark background)
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} antialiased dark`} // 強制ダークモード
    >
      <body className="min-h-[100dvh] w-full flex flex-col bg-zinc-950 text-zinc-50 overflow-x-hidden selection:bg-emerald-500/30">
        <main className="flex-1 w-full max-w-md mx-auto relative pb-[env(safe-area-inset-bottom)]">
          {/* Dashboard content etc goes here */}
          {children}
        </main>
      </body>
    </html>
  );
}
