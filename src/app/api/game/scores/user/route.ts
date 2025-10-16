import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { gameScores, session } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Extract Bearer token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);

    // Validate session token
    const sessions = await db
      .select()
      .from(session)
      .where(eq(session.token, token))
      .limit(1);

    if (sessions.length === 0) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const userSession = sessions[0];

    // Check if session is expired
    if (userSession.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const userId = userSession.userId;

    // Get game_type query parameter
    const searchParams = request.nextUrl.searchParams;
    const gameType = searchParams.get('game_type');

    if (!gameType) {
      return NextResponse.json(
        { error: 'game_type parameter is required', code: 'MISSING_GAME_TYPE' },
        { status: 400 }
      );
    }

    // Query for user's highest score for the specified game type
    const bestScore = await db
      .select({
        id: gameScores.id,
        playerName: gameScores.playerName,
        score: gameScores.score,
        gameType: gameScores.gameType,
        createdAt: gameScores.createdAt,
      })
      .from(gameScores)
      .where(and(eq(gameScores.userId, userId), eq(gameScores.gameType, gameType)))
      .orderBy(desc(gameScores.score))
      .limit(1);

    if (bestScore.length === 0) {
      return NextResponse.json(
        { error: 'No scores found for this game', code: 'NO_SCORES_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(bestScore[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}