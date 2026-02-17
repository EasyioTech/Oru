
import { db } from './src/infrastructure/database/index.js';
import { systemSettings } from './src/infrastructure/database/schemas/system.js';

async function checkBranding() {
    try {
        const [settings] = await db.select().from(systemSettings).limit(1);
        console.log('--- System Settings ---');
        console.log('Logo URL:', settings?.logoUrl);
        console.log('Favicon URL:', settings?.faviconUrl);
        console.log('Logo Light URL:', settings?.logoLightUrl);
        console.log('Logo Dark URL:', settings?.logoDarkUrl);
        console.log('File Storage Path:', settings?.fileStoragePath);
        process.exit(0);
    } catch (error) {
        console.error('Error fetching settings:', error);
        process.exit(1);
    }
}

checkBranding();
