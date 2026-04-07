const LOCAL_SITE_URL = "http://localhost:3000";

function withProtocol(value: string): string {
  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return `https://${value}`;
}

export function getSiteUrl(): string {
  const envValue =
    process.env.SITE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL ||
    process.env.VERCEL_URL;

  return withProtocol(envValue || LOCAL_SITE_URL);
}

export function getSiteUrlObject(): URL {
  return new URL(getSiteUrl());
}