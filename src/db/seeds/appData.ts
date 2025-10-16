import { db } from '@/db';
import { appData, user } from '@/db/schema';

async function main() {
    // Query the first user to get their ID
    const users = await db.select({ id: user.id }).from(user).limit(1);
    
    if (users.length === 0) {
        console.error('❌ No users found. Please seed users first.');
        return;
    }
    
    const userId = users[0].id;
    const now = new Date().toISOString();
    
    const sampleAppData = [
        {
            userId: userId,
            appId: 'calculator',
            dataKey: 'history',
            dataValue: '["42 + 8 = 50", "100 / 4 = 25", "15 * 3 = 45"]',
            createdAt: now,
            updatedAt: now,
        },
        {
            userId: userId,
            appId: 'settings',
            dataKey: 'notifications',
            dataValue: '{"enabled":true,"sound":true,"desktop":true}',
            createdAt: now,
            updatedAt: now,
        },
        {
            userId: userId,
            appId: 'settings',
            dataKey: 'display',
            dataValue: '{"fontSize":"medium","animations":true,"highContrast":false}',
            createdAt: now,
            updatedAt: now,
        },
        {
            userId: userId,
            appId: 'music',
            dataKey: 'playlist',
            dataValue: '{"current":"Favorites","songs":["Song 1","Song 2","Song 3"]}',
            createdAt: now,
            updatedAt: now,
        },
        {
            userId: userId,
            appId: 'music',
            dataKey: 'preferences',
            dataValue: '{"volume":75,"repeat":false,"shuffle":true}',
            createdAt: now,
            updatedAt: now,
        },
        {
            userId: userId,
            appId: 'clock',
            dataKey: 'alarms',
            dataValue: '{"alarms":[{"time":"07:00","enabled":true,"label":"Wake up"},{"time":"12:00","enabled":false,"label":"Lunch"}]}',
            createdAt: now,
            updatedAt: now,
        }
    ];

    await db.insert(appData).values(sampleAppData);
    
    console.log('✅ App data seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});