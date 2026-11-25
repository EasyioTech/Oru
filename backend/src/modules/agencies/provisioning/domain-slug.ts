import { eq } from 'drizzle-orm';
import { agencies } from '../../../infrastructure/database/schema.js';

/**
 * Normalizes input text into a URL-safe subdomain slug.
 */
export function sanitizeDomainSlug(input: string): string {
  const cleaned = (input || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  return cleaned || `agency-${Date.now().toString(36)}`;
}

/**
 * Resolves a guaranteed unique domain slug against the database.
 * If collision occurs, increments -1, -2, etc.
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
