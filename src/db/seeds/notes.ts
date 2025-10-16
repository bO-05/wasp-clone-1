import { db } from '@/db';
import { notes, user } from '@/db/schema';

async function main() {
    // Query the first user from the database
    const firstUser = await db.select({ id: user.id }).from(user).limit(1);
    
    if (!firstUser || firstUser.length === 0) {
        console.error('❌ No users found in database. Please seed users first.');
        return;
    }
    
    const userId = firstUser[0].id;
    
    const sampleNotes = [
        {
            userId: userId,
            title: 'Welcome to Notes App',
            content: 'This is your personal notes application. You can create, edit, and organize your thoughts here. Notes are automatically saved and synced to your desktop.',
            createdAt: new Date('2024-12-15T10:30:00Z').toISOString(),
            updatedAt: new Date('2024-12-15T10:30:00Z').toISOString(),
        },
        {
            userId: userId,
            title: 'Project Ideas',
            content: '- Build a task management system\n- Create a weather dashboard\n- Develop a music player app\n- Design a portfolio website\n- Implement a chat application',
            createdAt: new Date('2024-12-16T14:20:00Z').toISOString(),
            updatedAt: new Date('2024-12-16T14:20:00Z').toISOString(),
        },
        {
            userId: userId,
            title: 'Meeting Notes - 2024',
            content: 'Key Discussion Points:\n\n1. Q1 Goals Review\n   - Completed 85% of objectives\n   - Need to focus on user feedback\n\n2. Upcoming Features\n   - Dark mode implementation\n   - Mobile responsiveness\n   - Performance optimization\n\n3. Action Items\n   - Schedule follow-up meeting\n   - Review design mockups\n   - Update documentation',
            createdAt: new Date('2024-12-17T09:15:00Z').toISOString(),
            updatedAt: new Date('2024-12-17T09:15:00Z').toISOString(),
        }
    ];

    await db.insert(notes).values(sampleNotes);
    
    console.log('✅ Notes seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});