import { db } from '@/db';
import { desktopSettings, user } from '@/db/schema';

async function main() {
    // Query to get the first user's ID
    const firstUser = await db.select({ id: user.id }).from(user).limit(1);
    
    if (!firstUser || firstUser.length === 0) {
        console.error('❌ No users found in database. Please run user seeder first.');
        return;
    }

    const userId = firstUser[0].id;

    const sampleDesktopSettings = [
        {
            userId: userId,
            windowsState: '{"terminal":{"x":100,"y":100,"width":600,"height":400,"minimized":false},"notes":{"x":200,"y":150,"width":500,"height":500,"minimized":false},"files":{"x":150,"y":200,"width":700,"height":600,"minimized":true}}',
            theme: 'light',
            updatedAt: new Date().toISOString(),
        }
    ];

    await db.insert(desktopSettings).values(sampleDesktopSettings);
    
    console.log('✅ Desktop settings seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});