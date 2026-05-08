import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardView } from "@/components/assessment/DashboardView";

interface DashboardPageProps {
  searchParams: Promise<{ session?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
  const session = await auth();
  const userEmail = session?.user?.email;
  const params = await searchParams;

  if (!userEmail) {
    redirect("/login?callbackUrl=/dashboard");
  }

  return (
    <section className="page-container">
      <div className="page-header dashboard-header">
        <div>
          <h1>Best Practices Framework Assessment Results</h1>
          <p>Review your latest assessment results, manage team sessions, and see team reports for sessions you own.</p>
        </div>
        <Link href="/playbook" className="button ghost dashboard-header-link">
          Open playbook
        </Link>
      </div>
      <DashboardView userEmail={userEmail} initialSessionCode={params.session?.toUpperCase() ?? null} />
    </section>
  );
}
