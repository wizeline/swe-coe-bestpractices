const TOOLING_SECTION_BY_CATEGORY_ID: Record<string, string> = {
  "pillar-1-ideation": "pillar-1-ideation-requirements",
  "pillar-2-design": "pillar-2-design-architecture",
  "pillar-3-development": "pillar-3-development-hygiene",
  "pillar-4-quality": "pillar-4-quality-engineering",
  "pillar-5-operations": "pillar-5-operations-maintenance",
};

export function getToolingHrefForCategory(categoryId: string): string {
  const anchor = TOOLING_SECTION_BY_CATEGORY_ID[categoryId];

  return anchor ? `/tooling#${anchor}` : "/tooling";
}