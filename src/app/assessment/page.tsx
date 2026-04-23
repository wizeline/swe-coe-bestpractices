"use client";

import { useRouter } from "next/navigation";
import { AssessmentForm } from "@/components/assessment/AssessmentForm";

export default function AssessmentPage() {
  const router = useRouter();

  const handleSubmit = (email: string) => {
    router.push(`/dashboard?email=${encodeURIComponent(email)}`);
  };

  return (
    <section className="page-container">
      <div className="page-header">
        <h1>Assessment Form</h1>
        <p>Fill out this form to evaluate your engineering team&apos;s Best Practices Framework maturity.</p>
      </div>
      <AssessmentForm onSubmit={handleSubmit} />
    </section>
  );
}
