"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { assessmentTemplate } from "@/data/assessmentTemplate";
import {
  buildTeamStats,
  getLatestSubmissionByEmail,
  loadAllSubmissions,
} from "@/lib/storage";
import { AssessmentResult, SubmissionRecord, TeamStats } from "@/types/assessment";

interface DashboardState {
  userSubmission: SubmissionRecord | null;
  teamStats: TeamStats;
}

const emptyTeamStats: TeamStats = {
  totalSubmissions: 0,
  uniqueParticipants: 0,
  averageTotalScore: 0,
  maxTotalScore: 0,
  categoryAverages: {},
  submissionsByEmail: {},
};

export function DashboardView() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");

  const [state, setState] = useState<DashboardState>({
    userSubmission: null,
    teamStats: emptyTeamStats,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"individual" | "team">("team");

  useEffect(() => {
    let active = true;

    async function fetchData() {
      setIsLoading(true);
      try {
        const [allSubmissions, userSubmission] = await Promise.all([
          loadAllSubmissions(),
          email ? getLatestSubmissionByEmail(email) : Promise.resolve(null),
        ]);

        if (!active) {
          return;
        }

        const teamStats = buildTeamStats(allSubmissions);
        setState({ userSubmission, teamStats });
        setViewMode(userSubmission ? "individual" : "team");
      } catch (error) {
        console.error("Dashboard load error:", error);
        if (active) {
          setState({ userSubmission: null, teamStats: emptyTeamStats });
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    void fetchData();

    return () => {
      active = false;
    };
  }, [email]);

  if (isLoading) {
    return (
      <div className="card form-card">
        <p>Loading results...</p>
      </div>
    );
  }

  if (!state.userSubmission && !state.teamStats.totalSubmissions) {
    return (
      <div className="card form-card">
        <p>No assessment data found. Please complete the form first.</p>
        <div className="empty-actions">
          <a href="/assessment" className="button solid">
            Go to Assessment Form
          </a>
        </div>
      </div>
    );
  }

  const showTeamMode = state.teamStats && state.teamStats.totalSubmissions > 0;

  return (
    <div>
      {showTeamMode && (
        <div className="view-toggle">
          <button
            className={`toggle-btn ${viewMode === "individual" ? "active" : ""}`}
            onClick={() => setViewMode("individual")}
          >
            My Results
          </button>
          <button
            className={`toggle-btn ${viewMode === "team" ? "active" : ""}`}
            onClick={() => setViewMode("team")}
          >
            Team Overview ({state.teamStats.uniqueParticipants} people)
          </button>
        </div>
      )}

      {viewMode === "individual" && state.userSubmission && (
        <ScoreCard result={state.userSubmission.result} email={state.userSubmission.email} />
      )}

      {viewMode === "team" && state.teamStats && (
        <TeamView stats={state.teamStats} assessmentTemplate={assessmentTemplate} />
      )}
    </div>
  );
}

interface ScoreCardProps {
  result: AssessmentResult;
  email?: string;
}

function ScoreCard({ result, email }: ScoreCardProps) {
  const answered = result.categories.reduce((acc, cat) => acc + cat.answered, 0);
  const total = result.categories.reduce((acc, cat) => acc + cat.total, 0);

  return (
    <div className="dashboard-grid">
      <article className="card score-card primary">
        <header className="score-header">
          <h2>Best Practices Framework Score</h2>
          <p>
            {answered}/{total} answered
          </p>
        </header>

        <div className="score-ring" aria-label="total score">
          <strong>{result.totalScore}</strong>
          <small>/ {result.maxScore}</small>
        </div>

        <p className="maturity">{result.maturityLabel}</p>

        <div className="progress-wrap" aria-label="completion">
          <div className="progress-bar" style={{ width: `${result.completion}%` }} />
        </div>
        <p className="progress-label">Completion {result.completion}%</p>
        {email && <p className="email-badge">Submitted by: {email}</p>}
      </article>

      <article className="card results-content-card">
        <section className="score-breakdown">
          <h3>Category Breakdown</h3>
          {result.categories.map((category) => (
            <div key={category.id} className="breakdown-row">
              <span>{category.title}</span>
              <strong>{category.score.toFixed(1)}</strong>
            </div>
          ))}
        </section>
      </article>

      <aside className="card actions-card">
        <h3>Actions</h3>
        <div className="actions">
          <a href="/assessment" className="button solid">
            New Assessment
          </a>
          <a href="/dashboard" className="button ghost">
            View Team
          </a>
        </div>
      </aside>

      <article className="card results-content-card">
        <section className="suggestions">
          <h3>Actions to Improve</h3>
          {result.categories.flatMap((category) =>
            category.suggestions.map((suggestion) => (
              <article key={suggestion.id} className="suggestion-item">
                <p className="suggestion-category">{category.title}</p>
                <h4>{suggestion.title}</h4>
                <p>{suggestion.action}</p>
              </article>
            )),
          )}
          {result.categories.every((c) => c.suggestions.length === 0) && (
            <p className="no-suggestions">
              Great job! Keep maintaining these high standards.
            </p>
          )}
        </section>
      </article>
    </div>
  );
}

interface TeamViewProps {
  stats: TeamStats;
  assessmentTemplate: typeof assessmentTemplate;
}

function TeamView({ stats, assessmentTemplate }: TeamViewProps) {
  const handleExportTeam = async () => {
    try {
      const allSubmissions = await loadAllSubmissions();
      const payload = {
        generatedAt: new Date().toISOString(),
        teamStats: stats,
        allSubmissions,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "team-best-practices-framework-results.json";
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Export error:", error);
    }
  };

  return (
    <div className="team-view">
      <div className="dashboard-grid">
        <article className="card team-summary">
          <h3>Team Summary</h3>
          <div className="summary-stats">
            <div className="stat-item">
              <span className="stat-label">Team Average Score</span>
              <span className="stat-value">{stats.averageTotalScore.toFixed(1)}/{stats.maxTotalScore}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Participants</span>
              <span className="stat-value">{stats.uniqueParticipants}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Total Responses</span>
              <span className="stat-value">{stats.totalSubmissions}</span>
            </div>
          </div>
        </article>

        <article className="card category-average-card">
          <section className="score-breakdown">
            <h3>Average by Category</h3>
            {assessmentTemplate.categories.map((category) => {
              const avgScore = stats.categoryAverages[category.id] || 0;
              return (
                <div key={category.id} className="breakdown-row">
                  <span>{category.title}</span>
                  <strong>{avgScore.toFixed(1)}</strong>
                </div>
              );
            })}
          </section>
        </article>
      </div>

      <div className="submissions-table">
        <h3>Individual Submissions</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Email</th>
                <th>Overall Score</th>
                <th>Completion</th>
                <th>Status</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stats.submissionsByEmail).map(([emailAddr, submissions]) => {
                const latest = submissions[submissions.length - 1];
                return (
                  <tr key={emailAddr}>
                    <td>{emailAddr}</td>
                    <td className="score-cell">
                      <strong>{latest.result.totalScore}/{latest.result.maxScore}</strong>
                    </td>
                    <td>{latest.result.completion}%</td>
                    <td>
                      <span className="status-badge">{latest.result.maturityLabel}</span>
                    </td>
                    <td className="date-cell">
                      {new Date(latest.submittedAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="team-actions">
        <button onClick={handleExportTeam} className="button solid">
          Export Team Results
        </button>
        <a href="/assessment" className="button ghost">
          New Assessment
        </a>
      </div>
    </div>
  );
}
