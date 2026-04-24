"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { assessmentTemplate } from "@/data/assessmentTemplate";
import { formatSessionCreatedAt } from "@/lib/sessionDisplay";
import {
  buildTeamStats,
  createAssessmentSession,
  deleteAssessmentSession,
  getLatestSubmissionByEmail,
  getSessionByCode,
  loadOwnedSessions,
  loadTeamSubmissions,
} from "@/lib/storage";
import { AssessmentResult, AssessmentSessionRecord, SubmissionRecord, TeamStats } from "@/types/assessment";

interface DashboardViewProps {
  userEmail: string;
  initialSessionCode: string | null;
}

const emptyTeamStats: TeamStats = {
  totalSubmissions: 0,
  uniqueParticipants: 0,
  averageTotalScore: 0,
  maxTotalScore: 0,
  categoryAverages: {},
  categorySuggestions: {},
  submissionsByEmail: {},
};

export function DashboardView({ userEmail, initialSessionCode }: DashboardViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userSubmission, setUserSubmission] = useState<SubmissionRecord | null>(null);
  const [teamStats, setTeamStats] = useState<TeamStats>(emptyTeamStats);
  const [ownedSessions, setOwnedSessions] = useState<AssessmentSessionRecord[]>([]);
  const [selectedSession, setSelectedSession] = useState<AssessmentSessionRecord | null>(null);
  const [newSessionName, setNewSessionName] = useState("");
  const [joinSessionCode, setJoinSessionCode] = useState("");
  const [sessionError, setSessionError] = useState("");
  const [joinSessionError, setJoinSessionError] = useState("");
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const sessionCode = searchParams.get("session")?.trim().toUpperCase() ?? initialSessionCode;
  const canShowTeamView = Boolean(selectedSession?.isOwner);
  const isSessionView = Boolean(selectedSession);

  useEffect(() => {
    let active = true;

    async function fetchData() {
      setIsLoading(true);
      try {
        const [sessions, sessionRecord, latest] = await Promise.all([
          loadOwnedSessions(),
          sessionCode ? getSessionByCode(sessionCode) : Promise.resolve(null),
          getLatestSubmissionByEmail(sessionCode ?? undefined),
        ]);

        let nextTeamStats = emptyTeamStats;
        if (sessionCode && sessionRecord?.isOwner) {
          const teamSubmissions = await loadTeamSubmissions(sessionCode);
          nextTeamStats = buildTeamStats(teamSubmissions);
        }

        if (active) {
          setOwnedSessions(sessions);
          setSelectedSession(sessionRecord);
          setUserSubmission(latest);
          setTeamStats(nextTeamStats);
          setSessionError(sessionCode && !sessionRecord ? "Session not found." : "");
        }
      } catch (error) {
        console.error("Dashboard load error:", error);
        if (active) {
          setUserSubmission(null);
          setSelectedSession(null);
          setOwnedSessions([]);
          setTeamStats(emptyTeamStats);
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
  }, [sessionCode]);

  const handleCreateSession = async () => {
    if (!newSessionName.trim()) {
      setSessionError("Session name is required.");
      return;
    }

    setIsCreatingSession(true);
    setSessionError("");
    try {
      const created = await createAssessmentSession(newSessionName.trim());
      router.push(`/dashboard?session=${encodeURIComponent(created.code)}`);
    } catch (error) {
      console.error("Session create error:", error);
      setSessionError("Failed to create session. Please try again.");
      setIsCreatingSession(false);
    }
  };

  const handleJoinSession = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmed = joinSessionCode.trim().toUpperCase();
    if (!trimmed) {
      setJoinSessionError("Enter a session code.");
      return;
    }

    setJoinSessionError("");
    window.location.assign(`/assessment?session=${encodeURIComponent(trimmed)}`);
  };

  const handleDeleteSession = async (session: AssessmentSessionRecord) => {
    const shouldDelete = window.confirm(`Delete session \"${session.name}\"? This cannot be undone.`);
    if (!shouldDelete) {
      return;
    }

    setSessionError("");
    setDeletingSessionId(session.id);

    try {
      await deleteAssessmentSession(session.id);
      setOwnedSessions((current) => current.filter((item) => item.id !== session.id));

      if (selectedSession?.id === session.id) {
        router.push("/dashboard");
        return;
      }
    } catch (error) {
      console.error("Session delete error:", error);
      setSessionError("Failed to delete session. Please try again.");
    } finally {
      setDeletingSessionId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="card form-card">
        <p>Loading results...</p>
      </div>
    );
  }

  if (!userSubmission && !canShowTeamView) {
    return (
      <div className="dashboard-shell">
        {!isSessionView && (
          <SessionHub
            ownedSessions={ownedSessions}
            onDeleteSession={handleDeleteSession}
            deletingSessionId={deletingSessionId}
            joinSessionCode={joinSessionCode}
            onJoinSessionCodeChange={(value) => {
              setJoinSessionCode(value);
              setJoinSessionError("");
            }}
            onJoinSession={handleJoinSession}
            newSessionName={newSessionName}
            onNewSessionNameChange={setNewSessionName}
            onCreateSession={handleCreateSession}
            isCreatingSession={isCreatingSession}
            sessionError={sessionError}
            joinSessionError={joinSessionError}
          />
        )}
        <div className="card form-card empty-state-card">
          <div className="empty-state-option">
            <div>
              <strong>Individual assessment</strong>
              <p>Complete the assessment on your own without a session.</p>
            </div>
            <a href="/assessment" className="button solid">
              Start assessment
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-shell">
      {!isSessionView && (
        <SessionHub
          ownedSessions={ownedSessions}
          selectedSession={selectedSession}
          onDeleteSession={handleDeleteSession}
          deletingSessionId={deletingSessionId}
          joinSessionCode={joinSessionCode}
          onJoinSessionCodeChange={(value) => {
            setJoinSessionCode(value);
            setJoinSessionError("");
          }}
          onJoinSession={handleJoinSession}
          newSessionName={newSessionName}
          onNewSessionNameChange={setNewSessionName}
          onCreateSession={handleCreateSession}
          isCreatingSession={isCreatingSession}
          sessionError={sessionError}
          joinSessionError={joinSessionError}
        />
      )}
      {canShowTeamView && selectedSession ? (
        <TeamView stats={teamStats} selectedSession={selectedSession} />
      ) : userSubmission ? (
        <ScoreCard result={userSubmission.result} email={userEmail} />
      ) : null}
    </div>
  );
}

interface SessionHubProps {
  ownedSessions: AssessmentSessionRecord[];
  selectedSession?: AssessmentSessionRecord | null;
  onDeleteSession: (session: AssessmentSessionRecord) => Promise<void>;
  deletingSessionId: string | null;
  joinSessionCode: string;
  onJoinSessionCodeChange: (value: string) => void;
  onJoinSession: (event: FormEvent<HTMLFormElement>) => void;
  newSessionName: string;
  onNewSessionNameChange: (value: string) => void;
  onCreateSession: () => void;
  isCreatingSession: boolean;
  sessionError: string;
  joinSessionError: string;
}

function SessionHub({
  ownedSessions,
  selectedSession,
  onDeleteSession,
  deletingSessionId,
  joinSessionCode,
  onJoinSessionCodeChange,
  onJoinSession,
  newSessionName,
  onNewSessionNameChange,
  onCreateSession,
  isCreatingSession,
  sessionError,
  joinSessionError,
}: SessionHubProps) {
  return (
    <section className="card results-content-card session-hub-card">
      <div className="session-hub-header">
        <div>
          <h3>Team Sessions</h3>
          <p>Join with a session code, or create your own voting session for the team.</p>
        </div>
      </div>

      <div className="session-list-heading">Join with code</div>
      <form className="session-create-row" onSubmit={onJoinSession}>
        <input
          name="session"
          value={joinSessionCode}
          onChange={(event) => onJoinSessionCodeChange(event.target.value)}
          placeholder="e.g. A1B2C3"
          aria-label="Session code"
          style={{ textTransform: "uppercase" }}
        />
        <button type="submit" className="button solid">
          Join session
        </button>
      </form>
      {joinSessionError && <p className="form-error">{joinSessionError}</p>}

      <div className="session-list-heading session-subsection-spacing">Create new session</div>
      <div className="session-create-row">
        <input
          value={newSessionName}
          onChange={(event) => onNewSessionNameChange(event.target.value)}
          placeholder="Team - Quarter"
          aria-label="Session name"
        />
        <button type="button" className="button solid" onClick={onCreateSession} disabled={isCreatingSession}>
          {isCreatingSession ? "Creating…" : "Create Session"}
        </button>
      </div>
      {sessionError && <p className="form-error">{sessionError}</p>}

      {ownedSessions.length > 0 && (
        <div className="session-list">
          <p className="session-list-heading">Your sessions</p>
          {ownedSessions.map((session) => (
            <article key={session.id} className={`session-list-item ${selectedSession?.code === session.code ? "session-list-item--active" : ""}`}>
              <div>
                <strong>{session.name}</strong>
                <span className="session-code-badge">{session.code}</span>
                <span className="session-created-at">Created {formatSessionCreatedAt(session.createdAt)}</span>
              </div>
              <div className="session-list-actions">
                <a href={`/assessment?session=${encodeURIComponent(session.code)}`} className="button ghost">
                  Voting link
                </a>
                <a href={`/dashboard?session=${encodeURIComponent(session.code)}`} className="button solid">
                  Team report
                </a>
                <button
                  type="button"
                  className="button ghost"
                  onClick={() => {
                    void onDeleteSession(session);
                  }}
                  disabled={deletingSessionId === session.id}
                >
                  {deletingSessionId === session.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

interface ScoreCardProps {
  result: AssessmentResult;
  email: string;
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
        <p className="email-badge">Submitted by: {email}</p>
      </article>

      <aside className="card dashboard-side-card">
        <section className="dashboard-side-section">
          <div className="score-breakdown">
            <h3>Category Breakdown</h3>
            {result.categories.map((category) => (
              <div key={category.id} className="breakdown-row">
                <span>{category.title}</span>
                <strong>{category.score.toFixed(1)}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="dashboard-side-section dashboard-side-section--actions">
          <h3>Actions</h3>
          <div className="actions">
            <a href="/assessment" className="button solid">
              New Assessment
            </a>
          </div>
        </section>
      </aside>

      <article className="card results-content-card results-content-card--suggestions">
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
  selectedSession: AssessmentSessionRecord;
}

function TeamView({ stats, selectedSession }: TeamViewProps) {
  return (
    <div>
      <div className="team-session-banner card form-card">
        <div className="team-session-banner-copy">
          <h3>{selectedSession.name}</h3>
          <p>
            Session code <strong>{selectedSession.code}</strong>. Share <a href={`/assessment?session=${encodeURIComponent(selectedSession.code)}`}>this voting link</a> with your team.
          </p>
        </div>
        <a href="/dashboard" className="button ghost">
          Back to dashboard
        </a>
      </div>

      <div className="view-toggle">
        <button className="toggle-btn active">Team Overview ({stats.uniqueParticipants} people)</button>
      </div>

      <div className="team-view">
        <div className="dashboard-grid team-dashboard-grid">
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
                const avgScore = stats.categoryAverages[category.id] ?? 0;
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

        <article className="card results-content-card">
          <section className="suggestions">
            <h3>Team Action Items</h3>
            {assessmentTemplate.categories.flatMap((category) =>
              (stats.categorySuggestions[category.id] ?? []).map((suggestion) => (
                <article key={suggestion.id} className="suggestion-item">
                  <p className="suggestion-category">{category.title}</p>
                  <h4>{suggestion.title}</h4>
                  <p>{suggestion.action}</p>
                </article>
              )),
            )}
            {assessmentTemplate.categories.every((category) => (stats.categorySuggestions[category.id] ?? []).length === 0) && (
              <p className="no-suggestions">Not enough team data yet to generate action items.</p>
            )}
          </section>
        </article>

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
                      <td className="date-cell">{new Date(latest.submittedAt).toLocaleDateString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
