import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { notes, session, user } from '@/db/schema';
import { eq, and, lt, desc } from 'drizzle-orm';

async function authenticateRequest(request: NextRequest) {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);

  try {
    const sessionResult = await db
      .select({
        userId: session.userId,
        expiresAt: session.expiresAt,
      })
      .from(session)
      .where(eq(session.token, token))
      .limit(1);

    if (sessionResult.length === 0) {
      return null;
    }

    const sessionData = sessionResult[0];

    if (new Date(sessionData.expiresAt) < new Date()) {
      return null;
    }

    return { userId: sessionData.userId };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const userNotes = await db
      .select()
      .from(notes)
      .where(eq(notes.userId, auth.userId))
      .orderBy(desc(notes.createdAt));

    return NextResponse.json(userNotes, { status: 200 });
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
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    const { title, content } = body;

    if (!title || typeof title !== 'string' || title.trim() === '') {
      return NextResponse.json(
        {
          error: 'Title is required and cannot be empty',
          code: 'MISSING_TITLE',
        },
        { status: 400 }
      );
    }

    if (!content || typeof content !== 'string' || content.trim() === '') {
      return NextResponse.json(
        {
          error: 'Content is required and cannot be empty',
          code: 'MISSING_CONTENT',
        },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const newNote = await db
      .insert(notes)
      .values({
        userId: auth.userId,
        title: title.trim(),
        content: content.trim(),
        createdAt: now,
        updatedAt: now,
      })
      .returning();

    return NextResponse.json(newNote[0], { status: 201 });
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
    {
      error: 'Use PUT /api/desktop/notes/[id] to update notes',
      code: 'INVALID_ENDPOINT',
    },
    { status: 400 }
  );
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'Use DELETE /api/desktop/notes/[id] to delete notes',
      code: 'INVALID_ENDPOINT',
    },
    { status: 400 }
  );
}