import { act } from "react";
import { createRoot, Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { RepositoryAnalysisSubmission } from "@/components/assessment/RepositoryAnalysisSubmission";

const push = vi.fn();
const submitRepositoryAnalysis = vi.fn();
const promptContent = `# Prompt

Use this`;

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push }),
}));

vi.mock("@/lib/storage", () => ({
  submitRepositoryAnalysis: (...args: unknown[]) => submitRepositoryAnalysis(...args),
}));

describe("RepositoryAnalysisSubmission", () => {
  let container: HTMLDivElement;
  let root: Root;
  let writeText: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    (globalThis as unknown as { IS_REACT_ACT_ENVIRONMENT: boolean }).IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, "clipboard", {
      configurable: true,
      value: { writeText },
    });
    push.mockReset();
    submitRepositoryAnalysis.mockReset();
  });

  afterEach(() => {
    act(() => {
      root.unmount();
    });
    container.remove();
  });

  it("renders the prompt inside a collapsible section", async () => {
    await act(async () => {
      root.render(<RepositoryAnalysisSubmission userEmail="dev@example.com" promptContent={promptContent} />);
    });

    const summary = container.querySelector("details summary");
    const promptTextarea = container.querySelector("textarea[aria-label='Repository analysis prompt']") as HTMLTextAreaElement | null;

    expect(summary?.textContent).toBe("Open Prompt");
    expect(promptTextarea?.value).toContain("# Prompt");
  });

  it("copies the prompt to the clipboard", async () => {
    await act(async () => {
      root.render(<RepositoryAnalysisSubmission userEmail="dev@example.com" promptContent={promptContent} />);
    });

    const copyButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent === "Copy Prompt");
    expect(copyButton).toBeDefined();

    await act(async () => {
      copyButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(writeText).toHaveBeenCalledWith(promptContent);
    expect(container.textContent).toContain("Prompt copied to clipboard.");
  });

  it("shows toast message when submission route fails", async () => {
    submitRepositoryAnalysis.mockRejectedValueOnce(new Error("Failed to create submission"));

    await act(async () => {
      root.render(<RepositoryAnalysisSubmission userEmail="dev@example.com" promptContent={promptContent} />);
    });

    const jsonTextarea = container.querySelector("textarea.json-textarea:not(.prompt-textarea)") as HTMLTextAreaElement | null;
    expect(jsonTextarea).not.toBeNull();

    await act(async () => {
      if (jsonTextarea) {
        const setValue = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, "value")?.set;
        setValue?.call(jsonTextarea, '{"analysis":{"pillars":{},"raw_score":0,"maturity_level":"Foundational"}}');
        jsonTextarea.dispatchEvent(new Event("input", { bubbles: true }));
      }
    });

    const submitButton = Array.from(container.querySelectorAll("button")).find((button) => button.textContent === "Submit Analysis");
    expect(submitButton).toBeDefined();

    await act(async () => {
      submitButton?.dispatchEvent(new MouseEvent("click", { bubbles: true }));
    });

    expect(container.textContent).toContain("Failed to create submission");
  });
});