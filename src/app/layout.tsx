import type { Metadata } from "next";
import Link from "next/link";
import { Space_Grotesk, IBM_Plex_Mono } from "next/font/google";
import { auth, signOut } from "@/auth";
import { isAdminEmail } from "@/lib/admin";
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
    "Internal POC to assess engineering best practices and improvement opportunities.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();
  const userEmail = session?.user?.email;
  const canViewAdmin = isAdminEmail(userEmail);

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
              {userEmail ? (
                <>
                  <li>
                    <Link href="/dashboard">Dashboard</Link>
                  </li>
                  <li>
                    <Link href="/playbook">Playbook</Link>
                  </li>
                  {canViewAdmin && (
                    <li>
                      <Link href="/admin">Admin</Link>
                    </li>
                  )}
                  <li>
                    <span className="email-badge">{userEmail}</span>
                  </li>
                  <li>
                    <form
                      action={async () => {
                        "use server";
                        await signOut({ redirectTo: "/login" });
                      }}
                    >
                      <button type="submit" className="button ghost">Sign out</button>
                    </form>
                  </li>
                </>
              ) : (
                <li>
                  <Link href="/login">Login</Link>
                </li>
              )}
            </ul>
          </nav>
          {children}
        </div>
      </body>
    </html>
  );
}
