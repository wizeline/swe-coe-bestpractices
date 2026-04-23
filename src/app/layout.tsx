import type { Metadata } from "next";
import Link from "next/link";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-heading",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  weight: ["400", "500"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wizeline Best Practices Framework Pulse",
  description:
    "Internal POC to assess engineering best practices maturity and improvement opportunities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${ibmPlexMono.variable}`}
    >
      <body>
        <div className="shell">
          <nav className="nav-bar">
            <Link href="/" className="nav-brand">
              Best Practices Pulse
            </Link>
            <ul className="nav-links">
              <li>
                <Link href="/dashboard">Home</Link>
              </li>
              <li>
                <Link href="/assessment">Assessment</Link>
              </li>
              <li>
                <Link href="/dashboard">Dashboard</Link>
              </li>
            </ul>
          </nav>
          {children}
        </div>
      </body>
    </html>
  );
}
