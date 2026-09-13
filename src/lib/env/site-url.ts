const FALLBACK_SITE_URL = 'http://localhost:3000';

let hasLoggedInvalidProductionUrl = false;

function parseAbsoluteUrl(value: string | undefined): URL | null {
  if (!value) {
    return null;
  }

  try {
    return new URL(value);
  } catch {
    return null;
  }
}

export function getSiteUrl(): string {
  const parsed = parseAbsoluteUrl(process.env.NEXT_PUBLIC_SITE_URL?.trim());

  if (parsed) {
    return parsed.origin;
  }

  if (process.env.NODE_ENV === 'production' && !hasLoggedInvalidProductionUrl) {
    hasLoggedInvalidProductionUrl = true;
    console.error(
      '[env] NEXT_PUBLIC_SITE_URL is missing or invalid. Set it to the public site origin (for example https://example.com). Falling back to localhost.',
    );
  }

  return FALLBACK_SITE_URL;
}
