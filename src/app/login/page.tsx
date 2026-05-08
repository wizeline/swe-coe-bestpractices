import { redirect } from "next/navigation";
import { auth, signIn } from "@/auth";

interface LoginPageProps {
  searchParams: Promise<{ callbackUrl?: string }>;
}

function normalizeCallbackUrl(value?: string): string {
  if (!value || !value.startsWith("/")) {
    return "/dashboard";
  }
  return value;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const session = await auth();
  const params = await searchParams;
  const callbackUrl = normalizeCallbackUrl(params.callbackUrl);

  if (session?.user?.email) {
    redirect(callbackUrl);
  }

  return (
    <section className="page-container login-page">
      <div className="page-header login-header">
        <h1>Sign in</h1>
        <p>Use your Google account to access your assessment data.</p>
      </div>
      <article className="card form-card login-card">
        <div className="login-card-top">
          <span className="login-badge" aria-hidden="true">
            Secure access
          </span>
          <h2>Welcome back</h2>
          <p>Sign in with your Wizeline Google account to continue your assessment.</p>
        </div>

        <ul className="login-points" aria-label="Login benefits">
          <li>Your progress is saved per account.</li>
          <li>Only you can view your personal results.</li>
          <li>Fast and secure Google sign-in.</li>
        </ul>

        <form
          className="login-form"
          action={async () => {
            "use server";
            await signIn("google", { redirectTo: callbackUrl });
          }}
        >
          <button type="submit" className="button solid login-google-btn">
            <span className="login-google-mark" aria-hidden="true">
              G
            </span>
            <span>Continue with Google</span>
          </button>
          <p className="login-footnote">
            We only use your account identity to scope your own results.
          </p>
        </form>
      </article>
    </section>
  );
}
