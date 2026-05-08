"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { assessmentTemplate } from "@/data/assessmentTemplate";
import { buildAdminReportHrefWithPage, buildAdminTeamDetailHref } from "@/lib/admin";
import { formatSessionCreatedAt } from "@/lib/sessionDisplay";
import { AdminPagination, AdminSessionFilters, CrossTeamComparison, SessionComparisonRecord } from "@/types/assessment";

type ResetStatus = "invalid-confirmation" | "reset-success" | null;

interface AdminOverviewProps {
  data: CrossTeamComparison;
  sessions: SessionComparisonRecord[];
  filters: AdminSessionFilters;
  pagination: AdminPagination;
  resetStatus: ResetStatus;
  resetConfirmation: string;
  onResetDatabase: (formData: FormData) => void | Promise<void>;
}

export function AdminOverview({
  data,
  sessions,
  filters,
  pagination,
  resetStatus,
  resetConfirmation,
  onResetDatabase,
}: AdminOverviewProps) {
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const router = useRouter();
  const { databaseStats } = data;

  return (
    <div className="admin-overview">
      <section className="card team-summary admin-summary">
        <h3>Database Stats</h3>
        <div className="summary-stats">
          <div className="stat-item">
            <span className="stat-label">Assessments</span>
            <strong className="stat-value">{databaseStats.totalAssessments}</strong>
          </div>
          <div className="stat-item">
            <span className="stat-label">Sessions</span>
            <strong className="stat-value">{databaseStats.totalSessions}</strong>
          </div>
          <div className="stat-item">
            <span className="stat-label">Participants</span>
            <strong className="stat-value">{databaseStats.uniqueParticipants}</strong>
          </div>
          <div className="stat-item">
            <span className="stat-label">Session Owners</span>
            <strong className="stat-value">{databaseStats.uniqueSessionOwners}</strong>
          </div>
        </div>
        <div className="admin-reset-inline-actions">
          <button
            type="button"
            className="button ghost admin-reset-trigger"
            onClick={() => {
              setIsResetModalOpen(true);
            }}
          >
            Reset database
          </button>
        </div>
        {resetStatus === "invalid-confirmation" && (
          <p className="form-error">Confirmation text does not match. Database was not modified.</p>
        )}
        {resetStatus === "reset-success" && (
          <p className="admin-reset-success">Database data deleted successfully.</p>
        )}
      </section>

      <section className="card results-content-card admin-filter-card">
        <h3>Report Filters</h3>
        <form method="GET" className="admin-filter-form">
          <div className="admin-filter-field">
            <label htmlFor="admin-filter-from">From</label>
            <input id="admin-filter-from" type="date" name="from" defaultValue={filters.fromDate ?? ""} />
          </div>
          <div className="admin-filter-field">
            <label htmlFor="admin-filter-to">To</label>
            <input id="admin-filter-to" type="date" name="to" defaultValue={filters.toDate ?? ""} />
          </div>
          <div className="admin-filter-field">
            <label htmlFor="admin-filter-sort">Order</label>
            <select id="admin-filter-sort" name="sort" defaultValue={filters.sort}>
              <option value="created-desc">Newest first</option>
              <option value="created-asc">Oldest first</option>
              <option value="score-desc">Highest score first</option>
              <option value="score-asc">Lowest score first</option>
            </select>
          </div>
          <div className="admin-filter-actions">
            <button type="submit" className="button solid">Apply</button>
            <a href="/admin" className="button ghost">Clear</a>
          </div>
        </form>
        <p className="admin-page-meta">
          Showing {sessions.length} of {pagination.totalItems} sessions · Page {pagination.page} of {pagination.totalPages}
        </p>
      </section>

      {isResetModalOpen && (
        <div
          className="modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-labelledby="admin-reset-title"
        >
          <div className="modal-content">
            <h3 id="admin-reset-title">Confirm Database Reset</h3>
            <p>
              This permanently deletes submissions, sessions, last results, and any legacy draft records.
            </p>
            <form action={onResetDatabase}>
              <div className="form-group">
                <label htmlFor="admin-reset-confirmation">Type confirmation phrase</label>
                <input
                  id="admin-reset-confirmation"
                  name="confirmation"
                  placeholder={`Type ${resetConfirmation} to confirm`}
                  aria-label="Reset database confirmation"
                />
              </div>
              <div className="modal-actions">
                <button
                  type="button"
                  className="button ghost"
                  onClick={() => {
                    setIsResetModalOpen(false);
                  }}
                >
                  Cancel
                </button>
                <button type="submit" className="button solid admin-reset-button">
                  Delete database data
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <section className="submissions-table admin-table-section">
        <h3>Cross-Team Comparison</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Session</th>
                <th>Owner</th>
                <th>Avg Score</th>
                <th>Participants</th>
                <th>Submissions</th>
                <th>Completion</th>
                <th>Score Level</th>
                <th>Last Submission</th>
              </tr>
            </thead>
            <tbody>
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="admin-empty-cell">No team sessions match the selected filters.</td>
                </tr>
              ) : (
                sessions.map((session) => (
                  <tr
                    key={session.id}
                    className="admin-clickable-row"
                    onClick={() => {
                      router.push(buildAdminTeamDetailHref(session.code, filters, pagination.page));
                    }}
                  >
                    <td>
                      <div className="admin-session-cell">
                        <strong>{session.name}</strong>
                        <span className="session-code-badge">{session.code}</span>
                      </div>
                    </td>
                    <td>{session.ownerEmail}</td>
                    <td className="score-cell">
                      <strong>{session.averageTotalScore}/{session.maxScore}</strong>
                    </td>
                    <td>{session.uniqueParticipants}</td>
                    <td>{session.totalSubmissions}</td>
                    <td>{session.averageCompletion}%</td>
                    <td>
                      <span className="status-badge">{session.scoreLevel}</span>
                    </td>
                    <td className="date-cell">
                      {session.latestSubmissionAt
                        ? formatSessionCreatedAt(session.latestSubmissionAt)
                        : "No submissions"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pagination.totalPages > 1 && (
          <div className="admin-pagination">
            <a
              href={buildAdminReportHrefWithPage(filters, Math.max(1, pagination.page - 1))}
              className={`button ghost ${pagination.page === 1 ? "button-disabled" : ""}`}
              aria-disabled={pagination.page === 1}
            >
              Previous
            </a>
            <a
              href={buildAdminReportHrefWithPage(filters, Math.min(pagination.totalPages, pagination.page + 1))}
              className={`button ghost ${pagination.page === pagination.totalPages ? "button-disabled" : ""}`}
              aria-disabled={pagination.page === pagination.totalPages}
            >
              Next
            </a>
          </div>
        )}
      </section>

      <section className="submissions-table admin-table-section">
        <h3>Pillar Comparison</h3>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Session</th>
                {assessmentTemplate.categories.map((category) => (
                  <th key={category.id}>{category.title}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sessions.length === 0 ? (
                <tr>
                  <td colSpan={assessmentTemplate.categories.length + 1} className="admin-empty-cell">
                    No category averages available yet.
                  </td>
                </tr>
              ) : (
                sessions.map((session) => (
                  <tr key={`${session.id}-categories`}>
                    <td>
                      <div className="admin-session-cell">
                        <strong>{session.name}</strong>
                        <span className="session-code-badge">{session.code}</span>
                      </div>
                    </td>
                    {assessmentTemplate.categories.map((category) => (
                      <td key={`${session.id}-${category.id}`} className="score-cell">
                        {session.categoryAverages[category.id]?.toFixed(2) ?? "-"}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}