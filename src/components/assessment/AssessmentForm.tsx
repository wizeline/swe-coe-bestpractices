"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { assessmentTemplate } from "@/data/assessmentTemplate";
import { calculateAssessment } from "@/lib/scoring";
import { addSubmission, clearDraft, getSessionByCode, loadDraft, saveDraft, saveLastResult } from "@/lib/storage";
import { AnswerMap, AssessmentSessionRecord, ScoreValue } from "@/types/assessment";

const scaleConfig: { value: ScoreValue; label: string; color: string }[] = [
  { value: 1, label: "Foundational", color: "#999" },
  { value: 2, label: "Disciplined",  color: "#f59e0b" },
  { value: 3, label: "Optimized",    color: "#3b82f6" },
  { value: 4, label: "Strategic",    color: "#e32c27" },
];

interface AssessmentFormProps {
  userEmail: string;
  initialSessionCode: string | null;
}

const SCORE_COLORS: Record<string, string> = {
  "1": "#888",
  "2": "#d97706",
  "3": "#2563eb",
  "4": "#e32c27",
};

const SCORE_LABELS: Record<string, string> = {
  "1": "Foundational",
  "2": "Disciplined",
  "3": "Optimized",
  "4": "Strategic",
};

/** Parses "1 = foo · 2 = bar · 3 = baz" into [{score, text}] */
function parseHintBullets(text: string) {
  return text
    .split(" · ")
    .map((chunk) => {
      const match = chunk.match(/^(\d+)\s*=\s*(.+)$/);
      if (!match) return null;
      return { score: match[1], description: match[2].trim() };
    })
    .filter(Boolean) as { score: string; description: string }[];
}

function HintToggle({ text }: { text: string }) {
  const [open, setOpen] = useState(false);
  const bullets = parseHintBullets(text);
  const hasBullets = bullets.length > 0;

  return (
    <span className="hint-wrap">
      <button
        type="button"
        className="hint-toggle"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        aria-label="Show scoring guide for this question"
      >
        {open ? "Hide guide ↑" : "Scoring guide ↓"}
      </button>
      {open && (
        hasBullets ? (
          <ul className="hint-bullets" role="list">
            {bullets.map(({ score, description }) => (
              <li key={score} className="hint-bullet">
                <span
                  className="hint-bullet-score"
                  style={{ color: SCORE_COLORS[score] }}
                  aria-label={`Score ${score}: ${SCORE_LABELS[score] ?? ""}`}
                >
                  {score}
                </span>
                <span className="hint-bullet-label" style={{ color: SCORE_COLORS[score] }}>
                  {SCORE_LABELS[score]}
                </span>
                <span className="hint-bullet-text">{description}</span>
              </li>
            ))}
          </ul>
        ) : (
          <span className="hint-body">{text}</span>
        )
      )}
    </span>
  );
}

export function AssessmentForm({ userEmail, initialSessionCode }: AssessmentFormProps) {
  const router = useRouter();
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [currentPillar, setCurrentPillar] = useState(0);
  const [formError, setFormError] = useState("");
  const [isLoadingDraft, setIsLoadingDraft] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assessmentSession, setAssessmentSession] = useState<AssessmentSessionRecord | null>(null);
  const [sessionError, setSessionError] = useState("");

  const totalPillars = assessmentTemplate.categories.length;
  const activeCategory = assessmentTemplate.categories[currentPillar];
  const sessionKey = initialSessionCode ?? "personal";

  useEffect(() => {
    let active = true;

    async function fetchDraft() {
      setIsLoadingDraft(true);
      try {
        const [draft, sessionRecord] = await Promise.all([
          loadDraft(sessionKey),
          initialSessionCode ? getSessionByCode(initialSessionCode) : Promise.resolve(null),
        ]);
        if (active) {
          setAnswers(draft);
          setAssessmentSession(sessionRecord);
          setSessionError(initialSessionCode && !sessionRecord ? "Team session not found. Your answers will stay local until you join a valid session." : "");
        }
      } catch (error) {
        console.error("Draft load error:", error);
      } finally {
        if (active) {
          setIsLoadingDraft(false);
        }
      }
    }

    void fetchDraft();

    return () => {
      active = false;
    };
  }, [initialSessionCode, sessionKey]);

  const updateAnswer = (questionId: string, value: ScoreValue) => {
    const updated = { ...answers, [questionId]: value };
    const currentQuestions = assessmentTemplate.categories[currentPillar]?.questions ?? [];
    const isCurrentPillarDone =
      currentQuestions.length > 0 &&
      currentQuestions.every((question) => updated[question.id] !== undefined);

    setAnswers(updated);

    void saveDraft(updated, sessionKey).catch((error) => {
      console.error("Draft save error:", error);
    });

    if (isCurrentPillarDone && currentPillar < totalPillars - 1) {
      setCurrentPillar(currentPillar + 1);
    }

    if (formError) setFormError("");
  };

  const goToPreviousPillar = () => {
    setCurrentPillar((prev) => Math.max(prev - 1, 0));
  };

  const goToNextPillar = () => {
    setCurrentPillar((prev) => Math.min(prev + 1, totalPillars - 1));
  };

  const handleSubmit = async () => {
    if (answered < total) {
      setFormError(`${total - answered} question${total - answered > 1 ? "s" : ""} still need a score.`);
      return;
    }
    setIsSubmitting(true);
    setFormError("");
    try {
      const result = calculateAssessment(assessmentTemplate, answers);
      await addSubmission(answers, result, initialSessionCode ?? undefined);
      await saveLastResult(result, sessionKey);
      await clearDraft(sessionKey);
      router.push(initialSessionCode ? `/dashboard?session=${encodeURIComponent(initialSessionCode)}` : "/dashboard");
    } catch (error) {
      setFormError("Failed to submit. Please try again.");
      console.error("Submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setAnswers({});
    void clearDraft(sessionKey).catch((error) => {
      console.error("Draft clear error:", error);
    });
    setFormError("");
  };

  const answered = Object.values(answers).filter((v) => v !== undefined).length;
  const total = assessmentTemplate.categories.reduce(
    (acc, cat) => acc + cat.questions.length, 0,
  );
  const progressPct = total === 0 ? 0 : Math.round((answered / total) * 100);
  const activeAnswered = activeCategory
    ? activeCategory.questions.filter((question) => answers[question.id] !== undefined).length
    : 0;
  const activeTotal = activeCategory?.questions.length ?? 0;

  return (
    <div>
      <article className="card form-card">
        {/* ── Header ── */}
        <header className="card-header">
          <div className="form-header-row">
            <h2>{assessmentTemplate.title}</h2>
            <span className="email-badge">{userEmail}</span>
          </div>
          <p>{assessmentTemplate.description}</p>
          {isLoadingDraft && <p>Loading your saved draft...</p>}
          {assessmentSession && (
            <div className="session-banner">
              <strong>Team session:</strong> {assessmentSession.name} ({assessmentSession.code})
            </div>
          )}
          {sessionError && <p className="form-error">{sessionError}</p>}

          {/* Scale legend strip */}
          <div className="scale-legend" aria-label="Scoring scale reference">
            {scaleConfig.map(({ value, label, color }) => (
              <span key={value} className="scale-legend-item">
                <span className="scale-legend-dot" style={{ background: color }} aria-hidden="true" />
                <span><strong>{value}</strong> {label}</span>
              </span>
            ))}
          </div>

          {/* Visual progress bar */}
          <div className="form-progress" aria-label={`Progress: ${answered} of ${total} questions answered`}>
            <div className="form-progress-bar">
              <div className="form-progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
            <span className="form-progress-label" aria-live="polite">
              {answered}/{total} answered
            </span>
          </div>

          <div className="wizard-steps" aria-label="Pillar wizard navigation">
            {assessmentTemplate.categories.map((category, index) => {
              const categoryAnswered = category.questions.filter((q) => answers[q.id] !== undefined).length;
              const isDone = categoryAnswered === category.questions.length;
              const isActive = index === currentPillar;

              return (
                <button
                  key={category.id}
                  type="button"
                  className={`wizard-step ${isActive ? "wizard-step--active" : ""} ${isDone ? "wizard-step--done" : ""}`}
                  onClick={() => setCurrentPillar(index)}
                  aria-current={isActive ? "step" : undefined}
                >
                  <span className="wizard-step-index">{index + 1}</span>
                  <span className="wizard-step-title">Pillar {index + 1}</span>
                  <span className="wizard-step-count">{categoryAnswered}/{category.questions.length}</span>
                </button>
              );
            })}
          </div>
        </header>

        {/* ── Wizard slide (active pillar) ── */}
        <div className="question-groups">
          {activeCategory && (
            <section key={activeCategory.id} className={`category-block ${activeAnswered === activeTotal ? "category-block--done" : ""}`}>
              <div className="category-title-row">
                <h3>{activeCategory.title}</h3>
                <span className={`cat-progress-pill ${activeAnswered === activeTotal ? "cat-progress-pill--done" : ""}`}>
                  {activeAnswered}/{activeTotal}
                </span>
              </div>
              <p className="category-description">{activeCategory.description}</p>

              {activeCategory.questions.map((question, qi) => {
                const selected = answers[question.id];
                const isAnswered = selected !== undefined;
                return (
                  <fieldset
                    key={question.id}
                    id={`question-${question.id}`}
                    className={`question-row ${isAnswered ? "question-row--answered" : ""}`}
                  >
                    <legend>
                      <span className="q-index">{qi + 1}</span>
                      {question.text}
                      <span className={`question-status ${isAnswered ? "question-status--done" : ""}`}>
                        {isAnswered ? "Answered" : "Pending"}
                      </span>
                    </legend>

                    {question.hint && <HintToggle text={question.hint} />}

                    <div className="scale-row" role="radiogroup" aria-label={question.text}>
                      {scaleConfig.map(({ value, label, color }) => (
                        <label
                          key={value}
                          className={`scale-option ${selected === value ? "scale-option--checked" : ""}`}
                          style={selected === value ? ({ "--dot-color": color } as React.CSSProperties) : {}}
                        >
                          <input
                            type="radio"
                            name={question.id}
                            value={value}
                            checked={selected === value}
                            onChange={() => updateAnswer(question.id, value)}
                            aria-label={`${value} – ${label}`}
                          />
                          <span className="scale-num" aria-hidden="true">{value}</span>
                          <span className="scale-label-text" aria-hidden="true">{label}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                );
              })}
            </section>
          )}
        </div>

        {/* ── Footer ── */}
        <div className="form-actions">
          <button type="button" onClick={handleReset} className="button ghost" aria-label="Reset all answers">
            Reset
          </button>

          <div className="wizard-actions">
            <button
              type="button"
              onClick={goToPreviousPillar}
              className="button ghost"
              disabled={currentPillar === 0}
            >
              Previous pillar
            </button>

            {currentPillar < totalPillars - 1 ? (
              <button type="button" onClick={goToNextPillar} className="button solid">
                Next pillar
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="button solid"
                aria-label="Submit assessment"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting…" : "Submit"}
              </button>
            )}
          </div>
        </div>
        {formError && (
          <p className="form-error" role="alert" aria-live="assertive">{formError}</p>
        )}
      </article>
    </div>
  );
}
