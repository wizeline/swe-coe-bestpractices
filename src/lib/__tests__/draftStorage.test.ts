import { beforeEach, describe, expect, it } from "vitest";
import { clearDraft, loadDraft, saveDraft } from "@/lib/draftStorage";

beforeEach(() => {
  localStorage.clear();
});

describe("local draft storage", () => {
  it("saves and loads draft answers by session key", async () => {
    await saveDraft({ q1: 2, q2: 4 }, "TEAM42");

    await expect(loadDraft("TEAM42")).resolves.toEqual({ q1: 2, q2: 4 });
  });

  it("clears draft answers by session key", async () => {
    await saveDraft({ q1: 1 }, "personal");

    await clearDraft("personal");

    await expect(loadDraft("personal")).resolves.toEqual({});
  });

  it("ignores broken stored payloads", async () => {
    localStorage.setItem("assessment-draft:personal", "not-json");

    await expect(loadDraft("personal")).resolves.toEqual({});
    expect(localStorage.getItem("assessment-draft:personal")).toBeNull();
  });
});