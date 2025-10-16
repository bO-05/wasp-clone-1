import { db } from '@/db';
import { terminalSessions, user } from '@/db/schema';

async function main() {
    // Query the first user from the database
    const firstUser = await db.select().from(user).limit(1);
    
    if (firstUser.length === 0) {
        throw new Error('No users found in database. Please seed users first.');
    }
    
    const userId = firstUser[0].id;
    
    const sampleTerminalSessions = [
        {
            userId: userId,
            command: 'help',
            output: 'Available commands:\nls - list files\ncd - change directory\npwd - print working directory\nmkdir - make directory\ntouch - create file\ncat - display file contents\nclear - clear terminal\nhelp - show this help',
            currentPath: '/home',
            executedAt: new Date('2024-01-15T10:00:00').toISOString(),
        },
        {
            userId: userId,
            command: 'pwd',
            output: '/home',
            currentPath: '/home',
            executedAt: new Date('2024-01-15T10:01:30').toISOString(),
        },
        {
            userId: userId,
            command: 'ls',
            output: 'documents/\ndownloads/',
            currentPath: '/home',
            executedAt: new Date('2024-01-15T10:02:15').toISOString(),
        },
        {
            userId: userId,
            command: 'cd documents',
            output: 'Changed directory to /home/documents',
            currentPath: '/home',
            executedAt: new Date('2024-01-15T10:03:00').toISOString(),
        },
        {
            userId: userId,
            command: 'ls',
            output: 'readme.txt\nnotes.txt\ntodo.md',
            currentPath: '/home/documents',
            executedAt: new Date('2024-01-15T10:03:45').toISOString(),
        },
        {
            userId: userId,
            command: 'cat readme.txt',
            output: 'Welcome to your virtual desktop!\n\nThis is a demo file system.',
            currentPath: '/home/documents',
            executedAt: new Date('2024-01-15T10:04:30').toISOString(),
        },
        {
            userId: userId,
            command: 'cd ..',
            output: 'Changed directory to /home',
            currentPath: '/home/documents',
            executedAt: new Date('2024-01-15T10:05:15').toISOString(),
        },
        {
            userId: userId,
            command: 'clear',
            output: '',
            currentPath: '/home',
            executedAt: new Date('2024-01-15T10:06:00').toISOString(),
        },
    ];

    await db.insert(terminalSessions).values(sampleTerminalSessions);
    
    console.log('✅ Terminal sessions seeder completed successfully');
}

main().catch((error) => {
    console.error('❌ Seeder failed:', error);
});