import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { terminalSessions, session, user } from '@/db/schema';
import { eq, and, lt, desc } from 'drizzle-orm';

async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const sessions = await db
      .select({
        userId: session.userId,
        expiresAt: session.expiresAt,
      })
      .from(session)
      .where(eq(session.token, token))
      .limit(1);

    if (sessions.length === 0) {
      return null;
    }

    const userSession = sessions[0];

    if (new Date(userSession.expiresAt) < new Date()) {
      return null;
    }

    return { id: userSession.userId };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limitParam = searchParams.get('limit');
    const limit = limitParam 
      ? Math.min(parseInt(limitParam), 200) 
      : 50;

    if (limitParam && isNaN(parseInt(limitParam))) {
      return NextResponse.json(
        { error: 'Invalid limit parameter', code: 'INVALID_LIMIT' },
        { status: 400 }
      );
    }

    const history = await db
      .select()
      .from(terminalSessions)
      .where(eq(terminalSessions.userId, user.id))
      .orderBy(desc(terminalSessions.executedAt))
      .limit(limit);

    return NextResponse.json(history, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { command, currentPath, output } = body;

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    if (!command || typeof command !== 'string' || command.trim() === '') {
      return NextResponse.json(
        { error: 'Command is required and cannot be empty', code: 'INVALID_COMMAND' },
        { status: 400 }
      );
    }

    if (!currentPath || typeof currentPath !== 'string' || currentPath.trim() === '') {
      return NextResponse.json(
        { error: 'Current path is required and cannot be empty', code: 'INVALID_CURRENT_PATH' },
        { status: 400 }
      );
    }

    const newEntry = await db
      .insert(terminalSessions)
      .values({
        userId: user.id,
        command: command.trim(),
        currentPath: currentPath.trim(),
        output: output || null,
        executedAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newEntry[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  return NextResponse.json(
    { error: 'PUT method is not supported for terminal history', code: 'METHOD_NOT_SUPPORTED' },
    { status: 400 }
  );
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    { error: 'DELETE method is not supported for terminal history', code: 'METHOD_NOT_SUPPORTED' },
    { status: 400 }
  );
}