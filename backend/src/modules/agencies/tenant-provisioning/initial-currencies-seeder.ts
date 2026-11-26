import { eq } from 'drizzle-orm';
import { currencies } from '../../../infrastructure/database/schemas/public.js';

export interface SeededCurrenciesResult {
  inrCurrencyId: string;
}

const DEFAULT_GLOBAL_CURRENCIES = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', exchangeRate: '1.0000', isBase: true, isActive: true },
  { code: 'USD', name: 'US Dollar', symbol: '$', exchangeRate: '86.5000', isBase: false, isActive: true },
  { code: 'EUR', name: 'Euro', symbol: '€', exchangeRate: '94.0000', isBase: false, isActive: true },
  { code: 'GBP', name: 'British Pound', symbol: '£', exchangeRate: '110.0000', isBase: false, isActive: true },
  { code: 'AED', name: 'UAE Dirham', symbol: 'د.إ', exchangeRate: '23.5500', isBase: false, isActive: true },
];

/**
 * Guarantees that public.currencies contains INR as base currency
 * and standard international trade currencies, returning the INR currency ID.
 */
export async function seedInitialCurrenciesIfMissing(
  tx: any,
  logger?: any
): Promise<SeededCurrenciesResult> {
  let [inrRow] = await tx
    .select()
    .from(currencies)
    .where(eq(currencies.code, 'INR'))
    .limit(1);

  if (!inrRow) {
    const inserted = await tx
      .insert(currencies)
      .values(DEFAULT_GLOBAL_CURRENCIES)
      .returning();

    inrRow = inserted.find((c: any) => c.code === 'INR') || inserted[0];
    if (logger) {
      logger.info('Seeded base currency INR and standard currencies table.');
    }
  }

  return {
    inrCurrencyId: inrRow.id,
  };
}
