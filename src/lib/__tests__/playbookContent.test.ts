import { describe, expect, it } from "vitest";
import { parsePlaybookMarkdown } from "@/lib/playbookContent";
import { getPlaybookHrefForCategory } from "@/lib/playbookLinks";

describe("parsePlaybookMarkdown", () => {
  it("extracts the page title, intro, and pillar sections", () => {
    const source = `# AI Tooling Playbook

Intro paragraph.

## Pillar 1 - Ideation

Section intro.

### Keep judgment engaged

Play intro.

#### Do this

Do the work.

#### Why this works

Because it prevents drift.

#### How to

Use a checklist.

## Pillar 2 - Design

### Make design visible

#### Do this

Write it down.`;

    const result = parsePlaybookMarkdown(source);

    expect(result.title).toBe("AI Tooling Playbook");
    expect(result.introMarkdown).toContain("Intro paragraph.");
    expect(result.sections).toHaveLength(2);
    expect(result.sections[0]).toMatchObject({
      slug: "pillar-1-ideation",
      title: "Pillar 1 - Ideation",
    });
    expect(result.sections[0].introMarkdown).toContain("Section intro.");
    expect(result.sections[0].plays).toHaveLength(1);
    expect(result.sections[0].plays[0].title).toBe("Keep judgment engaged");
    expect(result.sections[0].plays[0].introMarkdown).toContain("Play intro.");
    expect(result.sections[0].plays[0].callouts.map((callout) => callout.kind)).toEqual([
      "do-this",
      "why-it-works",
      "how-to",
    ]);
    expect(result.sections[1].plays[0].callouts[0].markdown).toContain("Write it down.");
  });

  it("returns intro-only content when the markdown has no pillar headings", () => {
    const result = parsePlaybookMarkdown("# AI Tooling Playbook\n\nOnly intro content.");

    expect(result.title).toBe("AI Tooling Playbook");
    expect(result.introMarkdown).toBe("Only intro content.");
    expect(result.sections).toEqual([]);
  });

  it("builds a tooling href for known and unknown categories", () => {
    expect(getPlaybookHrefForCategory("pillar-2-design")).toBe(
      "/playbook#pillar-2-design-architecture"
    );
    expect(getPlaybookHrefForCategory("unknown-category")).toBe("/playbook");
  });
});
