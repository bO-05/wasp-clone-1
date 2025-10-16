"use client";

import { useState, useEffect, useCallback, useRef, memo } from "react";
import { useSession } from "@/lib/auth-client";

const GRID_SIZE = 20;
const CELL_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 1, y: 0 };
const GAME_SPEED = 100;

interface Position {
  x: number;
  y: number;
}

interface LeaderboardEntry {
  id: number;
  playerName: string;
  score: number;
  createdAt: string;
}

// Memoized cell component for performance
const Cell = memo(({ isSnake, isFood }: { isSnake: boolean; isFood: boolean }) => (
  <div
    className={`w-5 h-5 border border-white/10 transition-colors duration-75 ${
      isSnake ? "bg-[#FECC00]" : isFood ? "bg-white" : "bg-transparent"
    }`}
  />
));
Cell.displayName = "Cell";

export default function SnakeApp() {
  const { data: session } = useSession();
  const [snake, setSnake] = useState<Position[]>(INITIAL_SNAKE);
  const [direction, setDirection] = useState<Position>(INITIAL_DIRECTION);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [personalBest, setPersonalBest] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [playerName, setPlayerName] = useState("");
  const [showNameInput, setShowNameInput] = useState(false);

  const directionRef = useRef(direction);
  const gameLoopRef = useRef<number>();

  // Load leaderboard and personal best on mount
  useEffect(() => {
    loadLeaderboard();
    if (session?.user) {
      loadPersonalBest();
      setPlayerName(session.user.name || "");
    }
  }, [session?.user]);

  const loadLeaderboard = async () => {
    try {
      const response = await fetch("/api/game/scores?game_type=snake&limit=10");
      if (response.ok) {
        const data = await response.json();
        setLeaderboard(data);
      }
    } catch (error) {
      console.error("Failed to load leaderboard:", error);
    }
  };

  const loadPersonalBest = async () => {
    if (!session?.user?.id) return;
    
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/game/scores/user?game_type=snake", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setPersonalBest(data.score);
      }
    } catch (error) {
      // No personal best yet
      setPersonalBest(null);
    }
  };

  const saveScore = async () => {
    if (score === 0) return;
    
    const name = playerName.trim() || session?.user?.name || "Guest";
    setIsSaving(true);
    
    try {
      const token = localStorage.getItem("bearer_token");
      const response = await fetch("/api/game/scores", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
          playerName: name,
          score,
          gameType: "snake",
          userId: session?.user?.id || null,
        }),
      });

      if (response.ok) {
        await loadLeaderboard();
        if (session?.user?.id) {
          await loadPersonalBest();
        }
        setShowNameInput(false);
      }
    } catch (error) {
      console.error("Failed to save score:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const generateFood = useCallback((currentSnake: Position[]): Position => {
    let newFood: Position;
    do {
      newFood = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };
    } while (currentSnake.some((segment) => segment.x === newFood.x && segment.y === newFood.y));
    return newFood;
  }, []);

  const checkCollision = useCallback((head: Position, body: Position[]): boolean => {
    // Wall collision
    if (head.x < 0 || head.x >= GRID_SIZE || head.y < 0 || head.y >= GRID_SIZE) {
      return true;
    }
    // Self collision
    return body.some((segment) => segment.x === head.x && segment.y === head.y);
  }, []);

  const gameLoop = useCallback(() => {
    setSnake((prevSnake) => {
      const head = prevSnake[0];
      const newHead = {
        x: head.x + directionRef.current.x,
        y: head.y + directionRef.current.y,
      };

      if (checkCollision(newHead, prevSnake)) {
        setGameOver(true);
        setShowNameInput(true);
        return prevSnake;
      }

      const newSnake = [newHead, ...prevSnake];

      // Check if food is eaten
      if (newHead.x === food.x && newHead.y === food.y) {
        setScore((prev) => prev + 10);
        setFood(generateFood(newSnake));
      } else {
        newSnake.pop();
      }

      return newSnake;
    });
  }, [food, checkCollision, generateFood]);

  // Game loop with RAF
  useEffect(() => {
    if (!gameStarted || gameOver || isPaused) {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
      return;
    }

    let lastTime = 0;
    const animate = (currentTime: number) => {
      if (currentTime - lastTime >= GAME_SPEED) {
        gameLoop();
        lastTime = currentTime;
      }
      gameLoopRef.current = requestAnimationFrame(animate);
    };

    gameLoopRef.current = requestAnimationFrame(animate);

    return () => {
      if (gameLoopRef.current) {
        cancelAnimationFrame(gameLoopRef.current);
      }
    };
  }, [gameStarted, gameOver, isPaused, gameLoop]);

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!gameStarted && e.key === " ") {
        e.preventDefault();
        startGame();
        return;
      }

      if (gameOver) return;

      if (e.key === " ") {
        e.preventDefault();
        setIsPaused((prev) => !prev);
        return;
      }

      const newDirection = { ...directionRef.current };

      switch (e.key) {
        case "ArrowUp":
        case "w":
        case "W":
          if (directionRef.current.y === 0) {
            newDirection.x = 0;
            newDirection.y = -1;
          }
          break;
        case "ArrowDown":
        case "s":
        case "S":
          if (directionRef.current.y === 0) {
            newDirection.x = 0;
            newDirection.y = 1;
          }
          break;
        case "ArrowLeft":
        case "a":
        case "A":
          if (directionRef.current.x === 0) {
            newDirection.x = -1;
            newDirection.y = 0;
          }
          break;
        case "ArrowRight":
        case "d":
        case "D":
          if (directionRef.current.x === 0) {
            newDirection.x = 1;
            newDirection.y = 0;
          }
          break;
      }

      directionRef.current = newDirection;
      setDirection(newDirection);
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [gameStarted, gameOver]);

  const startGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    directionRef.current = INITIAL_DIRECTION;
    setFood(generateFood(INITIAL_SNAKE));
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    setIsPaused(false);
    setShowNameInput(false);
  };

  const handleSaveScore = (e: React.FormEvent) => {
    e.preventDefault();
    saveScore();
  };

  return (
    <div className="h-full bg-black text-white font-mono flex">
      {/* Game Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Score Display */}
        <div className="mb-4 text-center">
          <div className="text-2xl font-bold text-[#FECC00] mb-1">
            SCORE: {score}
          </div>
          {personalBest !== null && (
            <div className="text-sm text-white/60">
              Your Best: {personalBest}
            </div>
          )}
        </div>

        {/* Game Grid */}
        <div
          className="grid gap-0 border border-[#FECC00] relative"
          style={{
            gridTemplateColumns: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
            gridTemplateRows: `repeat(${GRID_SIZE}, ${CELL_SIZE}px)`,
            width: `${GRID_SIZE * CELL_SIZE}px`,
            height: `${GRID_SIZE * CELL_SIZE}px`,
          }}
        >
          {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, index) => {
            const x = index % GRID_SIZE;
            const y = Math.floor(index / GRID_SIZE);
            const isSnake = snake.some((segment) => segment.x === x && segment.y === y);
            const isFood = food.x === x && food.y === y;

            return <Cell key={index} isSnake={isSnake} isFood={isFood} />;
          })}

          {/* Overlays */}
          {!gameStarted && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
              <div className="text-center">
                <div className="text-4xl font-bold text-[#FECC00] mb-4">
                  TERMINAL SNAKE
                </div>
                <div className="text-white/80 mb-6">
                  <div>Use Arrow Keys or WASD to move</div>
                  <div>Press SPACE to start</div>
                </div>
                <button
                  onClick={startGame}
                  className="px-6 py-3 bg-[#FECC00] text-black font-bold hover:bg-[#FECC00]/80 transition-colors"
                >
                  START GAME
                </button>
              </div>
            </div>
          )}

          {isPaused && gameStarted && !gameOver && (
            <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
              <div className="text-center">
                <div className="text-3xl font-bold text-[#FECC00] mb-2">PAUSED</div>
                <div className="text-white/80">Press SPACE to continue</div>
              </div>
            </div>
          )}

          {gameOver && (
            <div className="absolute inset-0 bg-black/90 flex items-center justify-center">
              <div className="text-center p-6">
                <div className="text-3xl font-bold text-[#FECC00] mb-2">
                  GAME OVER
                </div>
                <div className="text-xl text-white mb-4">Final Score: {score}</div>

                {showNameInput && !isSaving && (
                  <form onSubmit={handleSaveScore} className="mb-4">
                    <input
                      type="text"
                      value={playerName}
                      onChange={(e) => setPlayerName(e.target.value)}
                      placeholder="Enter your name"
                      className="px-3 py-2 bg-black border border-[#FECC00] text-white outline-none mb-2 w-full"
                      maxLength={20}
                      autoFocus
                    />
                    <button
                      type="submit"
                      className="w-full px-4 py-2 bg-[#FECC00] text-black font-bold hover:bg-[#FECC00]/80 transition-colors"
                    >
                      SAVE SCORE
                    </button>
                  </form>
                )}

                {isSaving && (
                  <div className="text-[#FECC00] mb-4">Saving score...</div>
                )}

                <button
                  onClick={startGame}
                  className="px-6 py-3 bg-white text-black font-bold hover:bg-white/80 transition-colors"
                >
                  PLAY AGAIN
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Controls Info */}
        <div className="mt-4 text-xs text-white/50 text-center">
          <div>Arrow Keys / WASD: Move | Space: {gameStarted ? "Pause" : "Start"}</div>
        </div>
      </div>

      {/* Leaderboard Sidebar */}
      <div className="w-64 border-l border-white/20 p-4 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-[#FECC00] mb-4 border-b border-[#FECC00] pb-2">
            LEADERBOARD
          </h2>
          {leaderboard.length === 0 ? (
            <div className="text-white/50 text-sm text-center py-8">
              No scores yet.
              <br />
              Be the first!
            </div>
          ) : (
            <div className="space-y-2">
              {leaderboard.map((entry, index) => (
                <div
                  key={entry.id}
                  className={`flex items-center justify-between p-2 border border-white/10 ${
                    index === 0
                      ? "bg-[#FECC00]/10 border-[#FECC00]"
                      : "bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-bold ${
                        index === 0
                          ? "text-[#FECC00]"
                          : index === 1
                          ? "text-white"
                          : index === 2
                          ? "text-white/60"
                          : "text-white/40"
                      }`}
                    >
                      {index + 1}.
                    </span>
                    <span className="text-sm truncate max-w-[120px]">
                      {entry.playerName}
                    </span>
                  </div>
                  <span className="font-bold text-[#FECC00]">{entry.score}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {session?.user && (
          <div className="mt-6 pt-6 border-t border-white/20">
            <div className="text-sm text-white/60 mb-2">Signed in as:</div>
            <div className="text-sm font-bold text-[#FECC00] truncate">
              {session.user.name || session.user.email}
            </div>
            {personalBest !== null && (
              <div className="text-sm text-white/80 mt-2">
                Personal Best: <span className="font-bold">{personalBest}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}