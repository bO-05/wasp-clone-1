import { db } from '@/db';
import { files, user } from '@/db/schema';

async function main() {
    const existingUsers = await db.select({ id: user.id }).from(user).limit(1);
    
    if (existingUsers.length === 0) {
        console.error('❌ No users found in database. Please seed users first.');
        return;
    }

    const userId = existingUsers[0].id;

    const sampleFiles = [
        {
            userId: userId,
            path: '/',
            name: 'root',
            type: 'directory',
            content: null,
            parentPath: null,
            createdAt: new Date('2024-01-10T08:00:00.000Z').toISOString(),
            updatedAt: new Date('2024-01-10T08:00:00.000Z').toISOString(),
        },
        {
            userId: userId,
            path: '/home',
            name: 'home',
            type: 'directory',
            content: null,
            parentPath: '/',
            createdAt: new Date('2024-01-10T08:05:00.000Z').toISOString(),
            updatedAt: new Date('2024-01-10T08:05:00.000Z').toISOString(),
        },
        {
            userId: userId,
            path: '/home/documents',
            name: 'documents',
            type: 'directory',
            content: null,
            parentPath: '/home',
            createdAt: new Date('2024-01-10T08:10:00.000Z').toISOString(),
            updatedAt: new Date('2024-01-10T08:10:00.000Z').toISOString(),
        },
        {
            userId: userId,
            path: '/home/downloads',
            name: 'downloads',
            type: 'directory',
            content: null,
            parentPath: '/home',
            createdAt: new Date('2024-01-10T08:15:00.000Z').toISOString(),
            updatedAt: new Date('2024-01-10T08:15:00.000Z').toISOString(),
        },
        {
            userId: userId,
            path: '/home/documents/readme.txt',
            name: 'readme.txt',
            type: 'file',
            content: 'Welcome to your virtual desktop!\n\nThis is a demo file system. You can create, edit, and delete files and folders.\n\nEnjoy exploring!',
            parentPath: '/home/documents',
            createdAt: new Date('2024-01-11T09:30:00.000Z').toISOString(),
            updatedAt: new Date('2024-01-11T09:30:00.000Z').toISOString(),
        },
        {
            userId: userId,
            path: '/home/documents/notes.txt',
            name: 'notes.txt',
            type: 'file',
            content: 'Quick Notes:\n- Remember to backup files\n- Check downloads folder\n- Update settings',
            parentPath: '/home/documents',
            createdAt: new Date('2024-01-11T10:15:00.000Z').toISOString(),
            updatedAt: new Date('2024-01-12T14:22:00.000Z').toISOString(),
        },
        {
            userId: userId,
            path: '/home/documents/todo.md',
            name: 'todo.md',
            type: 'file',
            content: '# Todo List\n\n- [x] Set up desktop\n- [ ] Create new project\n- [ ] Review documents',
            parentPath: '/home/documents',
            createdAt: new Date('2024-01-12T11:00:00.000Z').toISOString(),
            updatedAt: new Date('2024-01-12T16:45:00.000Z').toISOString(),
        },
        {
            userId: userId,
            path: '/home/downloads/sample-data.json',
            name: 'sample-data.json',
            type: 'file',
            content: '{"message": "Sample download file", "type": "demo", "version": 1.0}',
            parentPath: '/home/downloads',
            createdAt: new Date('2024-01-12T13:20:00.000Z').toISOString(),
            updatedAt: new Date('2024-01-12T13:20:00.000Z').toISOString(),
        },
    ];

    await db.insert(files).values(sampleFiles);
    
    console.log('✅ Files seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});