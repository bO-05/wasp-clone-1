import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { notes, session, user } from '@/db/schema';
import { eq, and, lt } from 'drizzle-orm';

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

    const userSession = sessionResult[0];
    
    if (new Date(userSession.expiresAt) < new Date()) {
      return null;
    }

    return { id: userSession.userId };
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authenticatedUser = await authenticateRequest(request);
    if (!authenticatedUser) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const noteId = parseInt(id);

    const existingNote = await db
      .select()
      .from(notes)
      .where(and(eq(notes.id, noteId), eq(notes.userId, authenticatedUser.id)))
      .limit(1);

    if (existingNote.length === 0) {
      return NextResponse.json(
        { error: 'Note not found', code: 'NOTE_NOT_FOUND' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, content } = body;

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        {
          error: 'User ID cannot be provided in request body',
          code: 'USER_ID_NOT_ALLOWED',
        },
        { status: 400 }
      );
    }

    const updateData: { title?: string; content?: string; updatedAt: string } =
      {
        updatedAt: new Date().toISOString(),
      };

    if (title !== undefined) {
      updateData.title = title;
    }

    if (content !== undefined) {
      updateData.content = content;
    }

    const updated = await db
      .update(notes)
      .set(updateData)
      .where(and(eq(notes.id, noteId), eq(notes.userId, authenticatedUser.id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Note not found', code: 'NOTE_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authenticatedUser = await authenticateRequest(request);
    if (!authenticatedUser) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { id } = params;

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const noteId = parseInt(id);

    const existingNote = await db
      .select()
      .from(notes)
      .where(and(eq(notes.id, noteId), eq(notes.userId, authenticatedUser.id)))
      .limit(1);

    if (existingNote.length === 0) {
      return NextResponse.json(
        { error: 'Note not found', code: 'NOTE_NOT_FOUND' },
        { status: 404 }
      );
    }

    const deleted = await db
      .delete(notes)
      .where(and(eq(notes.id, noteId), eq(notes.userId, authenticatedUser.id)))
      .returning();

    if (deleted.length === 0) {
      return NextResponse.json(
        { error: 'Note not found', code: 'NOTE_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        message: 'Note deleted successfully',
        deleted: deleted[0],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}