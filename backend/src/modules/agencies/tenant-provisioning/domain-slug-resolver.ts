import { eq } from 'drizzle-orm';
import { agencies } from '../../../infrastructure/database/schema.js';

/**
 * System subdomains that are reserved and cannot be claimed by individual tenants.
 */
export const RESERVED_SUBDOMAINS = new Set([
  'admin',
  'administrator',
  'api',
  'app',
  'assets',
  'auth',
  'billing',
  'cdn',
  'dashboard',
  'dev',
  'docs',
  'help',
  'login',
  'mail',
  'meili',
  'minio',
  'monitoring',
  'oru',
  'oruerp',
  'portal',
  'postgres',
  'public',
  'redis',
  'root',
  'sauth',
  'staging',
  'static',
  'status',
  'superadmin',
  'support',
  'system',
  'test',
  'webhook',
  'ws',
  'www',
]);

/**
 * Normalizes input business name or subdomain into a clean, URL-safe slug.
 * Removes common legal appendages (pvt ltd, limited, llc, inc) if isolated,
 * and strips special punctuation.
 */
export function sanitizeDomainSlug(input: string): string {
  let cleaned = (input || '')
    .toLowerCase()
    .trim()
    // Replace typical legal suffixes if separated by spaces/punctuation
    .replace(/\b(private\s+limited|pvt\s+ltd|pvt\s+limited|ltd|llc|inc|corp|co)\b/gi, '')
    // Replace non-alphanumeric chars with hyphens
    .replace(/[^a-z0-9]+/g, '-')
    // Clean leading/trailing hyphens and collapse multiple hyphens
    .replace(/-+/g, '-')
    .replace(/(^-|-$)/g, '');

  if (!cleaned) {
    cleaned = `agency-${Date.now().toString(36)}`;
  }

  // If the sanitized slug matches a reserved system domain, prefix with 'agency-'
  if (RESERVED_SUBDOMAINS.has(cleaned)) {
    cleaned = `agency-${cleaned}`;
  }

  return cleaned;
}

/**
 * Resolves a guaranteed unique domain slug against the database.
 * If collision occurs, appends -1, -2, etc.
 */
export async function resolveUniqueDomainSlug(
  dbOrTx: any,
  rawNameOrDomain: string,
  excludeAgencyId?: string
): Promise<string> {
  const baseDomain = sanitizeDomainSlug(rawNameOrDomain);
  let candidate = baseDomain;
  let counter = 0;

  while (true) {
    const existing = await dbOrTx.query.agencies.findFirst({
      where: eq(agencies.domain, candidate),
    });

    if (!existing || (excludeAgencyId && existing.id === excludeAgencyId)) {
      return candidate;
    }

    counter++;
    candidate = `${baseDomain}-${counter}`;
  }
}
