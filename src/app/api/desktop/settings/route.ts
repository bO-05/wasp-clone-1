import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { desktopSettings, session, user } from '@/db/schema';
import { eq, and, gt } from 'drizzle-orm';

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

    return sessionData.userId;
  } catch (error) {
    console.error('Authentication error:', error);
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const userId = await authenticateRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const settings = await db
      .select()
      .from(desktopSettings)
      .where(eq(desktopSettings.userId, userId))
      .limit(1);

    if (settings.length === 0) {
      return NextResponse.json(
        { error: 'Desktop settings not found', code: 'SETTINGS_NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(settings[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = await authenticateRequest(request);
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { windowsState, theme } = body;

    if ('userId' in body || 'user_id' in body) {
      return NextResponse.json(
        { error: 'User ID cannot be provided in request body', code: 'USER_ID_NOT_ALLOWED' },
        { status: 400 }
      );
    }

    const existingSettings = await db
      .select()
      .from(desktopSettings)
      .where(eq(desktopSettings.userId, userId))
      .limit(1);

    const updatedAt = new Date().toISOString();

    if (existingSettings.length > 0) {
      const updateData: Record<string, any> = {
        updatedAt,
      };

      if (windowsState !== undefined) {
        updateData.windowsState = windowsState;
      }

      if (theme !== undefined) {
        updateData.theme = theme;
      }

      const updated = await db
        .update(desktopSettings)
        .set(updateData)
        .where(eq(desktopSettings.userId, userId))
        .returning();

      return NextResponse.json(updated[0], { status: 200 });
    } else {
      const insertData = {
        userId,
        windowsState: windowsState || null,
        theme: theme || 'light',
        updatedAt,
      };

      const created = await db
        .insert(desktopSettings)
        .values(insertData)
        .returning();

      return NextResponse.json(created[0], { status: 200 });
    }
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json(
    { error: 'POST method not supported for this endpoint', code: 'METHOD_NOT_SUPPORTED' },
    { status: 400 }
  );
}

export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    { error: 'DELETE method not supported for this endpoint', code: 'METHOD_NOT_SUPPORTED' },
    { status: 400 }
  );
}