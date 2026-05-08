"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { assessmentTemplate } from "@/data/assessmentTemplate";
import { calculateAssessment } from "@/lib/scoring";
import { AnswerMap, ScoreValue } from "@/types/assessment";

const STORAGE_KEY = "wizeline.best-practices-framework.assessment.v1";
const LEGACY_STORAGE_KEY = "wizeline.dx.assessment.v1";

const scaleValues: ScoreValue[] = [1, 2, 3, 4];

export function AssessmentApp() {
  const [answers, setAnswers] = useState<AnswerMap>(() => {
    if (typeof window === "undefined") {
      return {};
    }

    const stored = sessionStorage.getItem(STORAGE_KEY);
    const legacyStored = stored ? null : sessionStorage.getItem(LEGACY_STORAGE_KEY);
    const raw = stored ?? legacyStored;

    if (!raw) {
      return {};
    }

    try {
      const parsed = JSON.parse(raw) as AnswerMap;

      if (!stored && legacyStored) {
        sessionStorage.setItem(STORAGE_KEY, legacyStored);
        sessionStorage.removeItem(LEGACY_STORAGE_KEY);
      }

      return parsed;
    } catch {
      sessionStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(LEGACY_STORAGE_KEY);
      return {};
    }
  });
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
  }, [answers]);

  const result = useMemo(
    () => calculateAssessment(assessmentTemplate, answers),
    [answers],
  );

  const answered = result.categories.reduce(
    (acc, category) => acc + category.answered,
    0,
  );
  const total = result.categories.reduce((acc, category) => acc + category.total, 0);

  const updateAnswer = (questionId: string, value: ScoreValue) => {
    setAnswers((current) => ({ ...current, [questionId]: value }));
  };

  const clearAll = () => {
    setAnswers({});
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(LEGACY_STORAGE_KEY);
  };

  const exportResult = () => {
    const payload = {
      generatedAt: new Date().toISOString(),
      answers,
      result,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "best-practices-framework-assessment-results.json";
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="app-grid">
      <article className="card form-card">
        <header className="card-header">
          <h2>{assessmentTemplate.title}</h2>
          <p>{assessmentTemplate.description}</p>
          <p className="meta">{assessmentTemplate.scaleLabel}</p>
        </header>

        <div className="question-groups">
          {assessmentTemplate.categories.map((category) => (
            <section key={category.id} className="category-block">
              <div className="category-title-row">
                <h3>{category.title}</h3>
                <span>
                  Weight {Math.round(category.weight * 100)}%
                </span>
              </div>
              <p className="category-description">{category.description}</p>

              {category.questions.map((question) => {
                const selected = answers[question.id];
                return (
                  <fieldset key={question.id} className="question-row">
                    <legend>{question.text}</legend>
                    {question.hint ? <p className="hint">{question.hint}</p> : null}
                    <div className="scale-row" role="radiogroup" aria-label={question.text}>
                      {scaleValues.map((value) => (
                        <label key={value} className="scale-option">
                          <input
                            type="radio"
                            name={question.id}
                            checked={selected === value}
                            onChange={() => updateAnswer(question.id, value)}
                          />
                          <span>{value}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                );
              })}
            </section>
          ))}
        </div>
      </article>

      <aside className="card score-card">
        <header className="score-header">
          <h2>Best Practices Framework Score</h2>
          <p>
            {answered}/{total} answered
          </p>
        </header>

        <div className="score-ring" aria-label="overall score">
          <strong>{result.totalScore}</strong>
          <small>/ {result.maxScore}</small>
        </div>

        <p className="score-level">{result.scoreLevel}</p>

        <div className="progress-wrap" aria-label="completion">
          <div
            className="progress-bar"
            style={{ width: `${result.completion}%` }}
          />
        </div>
        <p className="progress-label">Completion {result.completion}%</p>

        <section className="score-breakdown">
          <h3>Category Breakdown</h3>
          {result.categories.map((category) => (
            <div key={category.id} className="breakdown-row">
              <span>{category.title}</span>
              <strong>{category.score.toFixed(1)}</strong>
            </div>
          ))}
        </section>

        <section className="suggestions">
          <h3>Suggestions to Improve</h3>
          {result.categories.flatMap((category) =>
            category.suggestions.map((suggestion) => (
              <article key={suggestion.id} className="suggestion-item">
                <p className="suggestion-category">{category.title}</p>
                <h4>{suggestion.title}</h4>
                <p>{suggestion.action}</p>
              </article>
            )),
          )}
        </section>

        <div className="actions">
          <button type="button" onClick={clearAll} className="button ghost">
            Reset Answers
          </button>
          <button type="button" onClick={exportResult} className="button solid">
            Export JSON
          </button>
        </div>
      </aside>
    </section>
  );
}
