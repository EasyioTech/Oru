/**
 * Wrapper for bcryptjs to handle CommonJS import in Vite
 * This ensures proper default export handling
 */

// Import bcryptjs - Vite will handle the CommonJS transformation
import bcryptjs from 'bcryptjs';

// Re-export with proper typing
export const hash = bcryptjs.hash;
export const compare = bcryptjs.compare;

// Export default for compatibility
export default bcryptjs;
