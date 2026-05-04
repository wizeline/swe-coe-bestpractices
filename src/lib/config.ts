/**
 * Application configuration from environment variables
 */

export const MAX_RECOMMENDATIONS_PER_PILLAR = (() => {
  const envValue = process.env.NEXT_PUBLIC_MAX_RECOMMENDATIONS;
  const parsed = envValue ? parseInt(envValue, 10) : 1;
  
  if (isNaN(parsed) || parsed < 1) {
    console.warn(
      `Invalid NEXT_PUBLIC_MAX_RECOMMENDATIONS value: "${envValue}". Using default of 1.`,
    );
    return 1;
  }
  
  return parsed;
})();
