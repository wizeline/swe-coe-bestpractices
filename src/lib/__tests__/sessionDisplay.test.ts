import { describe, expect, it } from "vitest";
import { formatSessionCreatedAt } from "@/lib/sessionDisplay";

describe("formatSessionCreatedAt", () => {
  it("formats an ISO date into a short readable label", () => {
    expect(formatSessionCreatedAt("2026-04-24T12:00:00.000Z")).toBe("Apr 24, 2026");
  });

  it("preserves the date portion for midnight UTC timestamps", () => {
    expect(formatSessionCreatedAt("2026-01-05T00:00:00.000Z")).toBe("Jan 5, 2026");
  });
});
