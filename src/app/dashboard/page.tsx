"use client";

import dynamic from "next/dynamic";

const DashboardView = dynamic(
  () => import("@/components/assessment/DashboardView").then((mod) => mod.DashboardView),
  {
    ssr: false,
    loading: () => (
      <div className="card form-card">
        <p>Loading results...</p>
      </div>
    ),
  },
);

export default function DashboardPage() {
  return (
    <section className="page-container">
      <div className="page-header">
        <h1>Best Practices Framework Assessment Results</h1>
        <p>Review your assessment results, team metrics, and recommended actions.</p>
      </div>
      <DashboardView />
    </section>
  );
}
