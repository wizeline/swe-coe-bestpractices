import { readFile } from "node:fs/promises";
import path from "node:path";

export type PlaybookCalloutKind = "do-this" | "why-it-works" | "how-to";

export interface PlaybookCallout {
  kind: PlaybookCalloutKind;
  title: string;
  markdown: string;
}

export interface PlaybookPlay {
  slug: string;
  title: string;
  introMarkdown: string;
  callouts: PlaybookCallout[];
}

export interface PlaybookSection {
  slug: string;
  title: string;
  introMarkdown: string;
  plays: PlaybookPlay[];
}

export interface PlaybookContent {
  title: string;
  introMarkdown: string;
  sections: PlaybookSection[];
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function splitByHeading(source: string, pattern: RegExp) {
  const matches = [...source.matchAll(pattern)];

  if (matches.length === 0) {
    return {
      introMarkdown: source.trim(),
      entries: [],
    };
  }

  const introMarkdown = source.slice(0, matches[0].index ?? 0).trim();
  const entries = matches.map((match, index) => {
    const heading = match[1].trim();
    const start = (match.index ?? 0) + match[0].length;
    const end = matches[index + 1]?.index ?? source.length;

    return {
      heading,
      markdown: source.slice(start, end).trim(),
    };
  });

  return {
    introMarkdown,
    entries,
  };
}

function toCalloutKind(heading: string): PlaybookCalloutKind | null {
  const normalized = heading.trim().toLowerCase().replace(/[?!]/g, "");

  if (normalized === "do this") {
    return "do-this";
  }

  if (normalized === "why this works") {
    return "why-it-works";
  }

  if (normalized === "how to") {
    return "how-to";
  }

  return null;
}

function parsePlaybookPlay(title: string, markdown: string): PlaybookPlay {
  const { introMarkdown, entries } = splitByHeading(markdown, /^####\s+(.+)$/gm);

  return {
    slug: slugify(title),
    title,
    introMarkdown,
    callouts: entries.flatMap((entry) => {
      const kind = toCalloutKind(entry.heading);

      if (!kind) {
        return [];
      }

      return [
        {
          kind,
          title: entry.heading,
          markdown: entry.markdown,
        },
      ];
    }),
  };
}

export function parsePlaybookMarkdown(source: string): PlaybookContent {
  const normalized = source.trim();

  if (!normalized) {
    return {
      title: "Engineering Action Playbook",
      introMarkdown: "",
      sections: [],
    };
  }

  const lines = normalized.split(/\r?\n/);
  const hasTitle = lines[0]?.startsWith("# ");
  const title = hasTitle ? lines[0].slice(2).trim() : "Engineering Action Playbook";
  const body = (hasTitle ? lines.slice(1) : lines).join("\n").trim();
  const { introMarkdown, entries } = splitByHeading(body, /^##\s+(.+)$/gm);

  if (entries.length === 0) {
    return {
      title,
      introMarkdown,
      sections: [],
    };
  }

  return {
    title,
    introMarkdown,
    sections: entries.map((entry) => {
      const playBlocks = splitByHeading(entry.markdown, /^###\s+(.+)$/gm);

      return {
        slug: slugify(entry.heading),
        title: entry.heading,
        introMarkdown: playBlocks.introMarkdown,
        plays:
          playBlocks.entries.length > 0
            ? playBlocks.entries.map((play) => parsePlaybookPlay(play.heading, play.markdown))
            : [parsePlaybookPlay(entry.heading, entry.markdown)],
      };
    }),
  };
}

export async function loadPlaybookContent(): Promise<PlaybookContent> {
  const filePath = path.join(process.cwd(), "content", "playbook.md");
  const source = await readFile(filePath, "utf8");
  return parsePlaybookMarkdown(source);
}