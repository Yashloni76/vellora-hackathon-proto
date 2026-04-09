import "./globals.css";
import Sidebar from "@/components/layout/Sidebar";
import { AuthProvider } from '@/lib/AuthContext'
import { Analytics } from "@vercel/analytics/next"

export const metadata = {
  title: "SYMP - Premium Wealth Tracker",
  description: "Track your wealth with precision and AI-driven insights.",
};

export default function RootLayout({ children }) {
  return (
    <AuthProvider>
      <html lang="en" className="dark">
        <body className="font-sans bg-primary text-white antialiased">
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 ml-[200px] bg-primary min-h-screen">
              {children}
            </main>
          </div>
          <Analytics />
        </body>
      </html>
    </AuthProvider>
  );
}
