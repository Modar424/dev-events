import type { Metadata } from "next";
import "./globals.css";
import LightRays from "@/components/LightRays";
import { PHProvider } from './providers';
import { AuthProvider } from './auth-provider';
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "DevEvent",
  description: "The Hub for Every Dev Event You Mustn't Miss",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen antialiased transition-colors duration-300">
        <AuthProvider>
          <PHProvider>
            <div className="relative z-50">
              <Navbar />
            </div>

            <div className="absolute inset-0 top-0 z-[-1] min-h-screen dark:block hidden">
              <LightRays
                raysOrigin="top-center-offset"
                raysColor="#5dfeca"
                raysSpeed={0.1}
                lightSpread={0.9}
                rayLength={1.4}
                followMouse={false}
                mouseInfluence={0.02}
                noiseAmount={0.0}
                distortion={0.01}
              />
            </div>

            <main className="relative z-10">
              {children}
            </main>
          </PHProvider>
        </AuthProvider>
      </body>
    </html>
  );
}