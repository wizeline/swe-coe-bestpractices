import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AssessmentForm } from "@/components/assessment/AssessmentForm";

interface AssessmentPageProps {
  searchParams: Promise<{ session?: string }>;
}

export default async function AssessmentPage({ searchParams }: AssessmentPageProps) {
  const session = await auth();
  const userEmail = session?.user?.email;
  const params = await searchParams;

  if (!userEmail) {
    redirect("/login?callbackUrl=/assessment");
  }

  return (
    <section className="page-container">
      <div className="page-header">
        <h1>Assessment Form</h1>
        <p>Fill out this form to evaluate your engineering team&apos;s Best Practices Framework maturity.</p>
      </div>
      <AssessmentForm userEmail={userEmail} initialSessionCode={params.session?.toUpperCase() ?? null} />
    </section>
  );
}
