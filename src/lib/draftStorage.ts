import { AnswerMap } from "@/types/assessment";

const DRAFT_KEY_PREFIX = "assessment-draft:";

function getDraftKey(sessionKey: string): string {
  return `${DRAFT_KEY_PREFIX}${sessionKey.trim() || "personal"}`;
}

export async function saveDraft(answers: AnswerMap, sessionKey = "personal"): Promise<void> {
  const sanitizedAnswers = Object.fromEntries(
    Object.entries(answers).filter(([, value]) => value !== undefined),
  );

  localStorage.setItem(getDraftKey(sessionKey), JSON.stringify(sanitizedAnswers));
}

export async function loadDraft(sessionKey = "personal"): Promise<AnswerMap> {
  const stored = localStorage.getItem(getDraftKey(sessionKey));
  if (!stored) {
    return {};
  }

  try {
    const parsed = JSON.parse(stored) as AnswerMap;
    return parsed ?? {};
  } catch {
    localStorage.removeItem(getDraftKey(sessionKey));
    return {};
  }
}

export async function clearDraft(sessionKey = "personal"): Promise<void> {
  localStorage.removeItem(getDraftKey(sessionKey));
}