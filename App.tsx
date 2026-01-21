
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  CANVAS_WIDTH, 
  CANVAS_HEIGHT, 
  PLAYER_SPEED, 
  PLAYER_RADIUS, 
  PLAYER_COLOR, 
  ZOMBIE_BASE_SPEED, 
  ZOMBIE_RADIUS, 
  ZOMBIE_COLOR,
  ZOMBIE_DAMAGE,
  INITIAL_LEVEL,
  SURVIVAL_GOAL_PER_LEVEL,
  OBSTACLE_COLOR
} from './constants.ts';
import { 
  GameState, 
  Player, 
  Zombie, 
  Obstacle 
} from './types.ts';
import { MainMenu, GameOver, HUD, LevelSuccess } from './components/UI.tsx';
import { getSurvivalTip } from './services/geminiService.ts';

const App: React.FC = () => {
  const [gameState, setGameState] = useState<GameState>(GameState.MENU);
  const [level, setLevel] = useState(INITIAL_LEVEL);
  const [score, setScore] = useState(0);
  const [health, setHealth] = useState(100);
  const [timeLeft, setTimeLeft] = useState(SURVIVAL_GOAL_PER_LEVEL);
  const [tip, setTip] = useState<string>('');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const requestRef = useRef<number>(null);
  const lastTimeRef = useRef<number>(0);
  const keysPressed = useRef<Record<string, boolean>>({});

  // Game Entities
  const playerRef = useRef<Player>({
    id: 'player',
    pos: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 },
    radius: PLAYER_RADIUS,
    speed: PLAYER_SPEED,
    color: PLAYER_COLOR,
    health: 100,
    maxHealth: 100
  });

  const zombiesRef = useRef<Zombie[]>([]);
  const obstaclesRef = useRef<Obstacle[]>([]);
  const lastDamageTimeRef = useRef<number>(0);

  const spawnZombies = useCallback((count: number, currentLevel: number) => {
    const newZombies: Zombie[] = [];
    const zombieSpeed = ZOMBIE_BASE_SPEED + (currentLevel * 0.15);
    
    for (let i = 0; i < count; i++) {
      let x, y;
      const edge = Math.floor(Math.random() * 4);
      if (edge === 0) { x = Math.random() * CANVAS_WIDTH; y = -ZOMBIE_RADIUS; }
      else if (edge === 1) { x = CANVAS_WIDTH + ZOMBIE_RADIUS; y = Math.random() * CANVAS_HEIGHT; }
      else if (edge === 2) { x = Math.random() * CANVAS_WIDTH; y = CANVAS_HEIGHT + ZOMBIE_RADIUS; }
      else { x = -ZOMBIE_RADIUS; y = Math.random() * CANVAS_HEIGHT; }

      newZombies.push({
        id: `zombie-${i}-${Date.now()}`,
        pos: { x, y },
        radius: ZOMBIE_RADIUS,
        speed: zombieSpeed + (Math.random() * 0.5),
        color: ZOMBIE_COLOR,
        damage: ZOMBIE_DAMAGE
      });
    }
    zombiesRef.current = newZombies;
  }, []);

  const generateObstacles = useCallback((currentLevel: number) => {
    const newObstacles: Obstacle[] = [];
    const count = Math.min(Math.floor(currentLevel / 2) + 2, 8);
    
    for (let i = 0; i < count; i++) {
      const width = 40 + Math.random() * 80;
      const height = 40 + Math.random() * 80;
      const x = 100 + Math.random() * (CANVAS_WIDTH - 200);
      const y = 100 + Math.random() * (CANVAS_HEIGHT - 200);

      const dx = x + width / 2 - playerRef.current.pos.x;
      const dy = y + height / 2 - playerRef.current.pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      
      if (dist < 100) continue;

      newObstacles.push({ x, y, width, height });
    }
    obstaclesRef.current = newObstacles;
  }, []);

  const resetGame = useCallback(async () => {
    setLevel(INITIAL_LEVEL);
    setScore(0);
    setHealth(100);
    setTimeLeft(SURVIVAL_GOAL_PER_LEVEL);
    playerRef.current.pos = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };
    spawnZombies(5, INITIAL_LEVEL);
    generateObstacles(INITIAL_LEVEL);
    setGameState(GameState.PLAYING);
    setTip('');
  }, [spawnZombies, generateObstacles]);

  const nextLevel = useCallback(async () => {
    const nextLvl = level + 1;
    setLevel(nextLvl);
    setHealth(100); // 다음 레벨 시 체력 회복
    setTimeLeft(SURVIVAL_GOAL_PER_LEVEL);
    playerRef.current.pos = { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2 };
    spawnZombies(5 + nextLvl * 2, nextLvl);
    generateObstacles(nextLvl);
    setGameState(GameState.PLAYING);
    setTip('');
  }, [level, spawnZombies, generateObstacles]);

  const handleLevelComplete = useCallback(async () => {
    setGameState(GameState.LEVEL_COMPLETE);
    const newTip = await getSurvivalTip(level);
    setTip(newTip);
  }, [level]);

  const handleGameOver = useCallback(async () => {
    setGameState(GameState.GAME_OVER);
    const newTip = await getSurvivalTip(level);
    setTip(newTip);
  }, [level]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => { keysPressed.current[e.code] = true; };
    const handleKeyUp = (e: KeyboardEvent) => { keysPressed.current[e.code] = false; };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  const update = useCallback((deltaTime: number) => {
    if (gameState !== GameState.PLAYING) return;

    const player = playerRef.current;
    const moveX = (keysPressed.current['ArrowRight'] || keysPressed.current['KeyD'] ? 1 : 0) - 
                (keysPressed.current['ArrowLeft'] || keysPressed.current['KeyA'] ? 1 : 0);
    const moveY = (keysPressed.current['ArrowDown'] || keysPressed.current['KeyS'] ? 1 : 0) - 
                (keysPressed.current['ArrowUp'] || keysPressed.current['KeyW'] ? 1 : 0);

    if (moveX !== 0 || moveY !== 0) {
      const length = Math.sqrt(moveX * moveX + moveY * moveY);
      const nextX = player.pos.x + (moveX / length) * player.speed;
      const nextY = player.pos.y + (moveY / length) * player.speed;

      let canMoveX = true;
      let canMoveY = true;

      obstaclesRef.current.forEach(obs => {
        const closestX = Math.max(obs.x, Math.min(nextX, obs.x + obs.width));
        const closestY = Math.max(obs.y, Math.min(nextY, obs.y + obs.height));
        const distanceX = nextX - closestX;
        const distanceY = nextY - closestY;
        const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);

        if (distanceSquared < player.radius * player.radius) {
          canMoveX = false;
          canMoveY = false;
        }
      });

      if (canMoveX) player.pos.x = Math.max(player.radius, Math.min(CANVAS_WIDTH - player.radius, nextX));
      if (canMoveY) player.pos.y = Math.max(player.radius, Math.min(CANVAS_HEIGHT - player.radius, nextY));
    }

    zombiesRef.current.forEach(zombie => {
      const dx = player.pos.x - zombie.pos.x;
      const dy = player.pos.y - zombie.pos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist > 1) {
        zombie.pos.x += (dx / dist) * zombie.speed;
        zombie.pos.y += (dy / dist) * zombie.speed;
      }

      obstaclesRef.current.forEach(obs => {
        const closestX = Math.max(obs.x, Math.min(zombie.pos.x, obs.x + obs.width));
        const closestY = Math.max(obs.y, Math.min(zombie.pos.y, obs.y + obs.height));
        const distanceX = zombie.pos.x - closestX;
        const distanceY = zombie.pos.y - closestY;
        const distanceSquared = (distanceX * distanceX) + (distanceY * distanceY);

        if (distanceSquared < zombie.radius * zombie.radius) {
          const angle = Math.atan2(zombie.pos.y - closestY, zombie.pos.x - closestX);
          zombie.pos.x = closestX + Math.cos(angle) * (zombie.radius + 1);
          zombie.pos.y = closestY + Math.sin(angle) * (zombie.radius + 1);
        }
      });

      if (dist < player.radius + zombie.radius) {
        const now = Date.now();
        if (now - lastDamageTimeRef.current > 500) {
          setHealth(prev => {
            const newHealth = prev - 15;
            if (newHealth <= 0) {
              handleGameOver();
              return 0;
            }
            return newHealth;
          });
          lastDamageTimeRef.current = now;
        }
      }
    });

    setTimeLeft(prev => {
      const nextTime = prev - deltaTime / 1000;
      if (nextTime <= 0) {
        handleLevelComplete();
        return 0;
      }
      return nextTime;
    });
    setScore(prev => prev + 1);

  }, [gameState, handleGameOver, handleLevelComplete]);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    ctx.strokeStyle = '#18181b';
    ctx.lineWidth = 1;
    for (let i = 0; i < CANVAS_WIDTH; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, CANVAS_HEIGHT);
      ctx.stroke();
    }
    for (let i = 0; i < CANVAS_HEIGHT; i += 40) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(CANVAS_WIDTH, i);
      ctx.stroke();
    }

    ctx.fillStyle = OBSTACLE_COLOR;
    ctx.strokeStyle = '#374151';
    ctx.lineWidth = 2;
    obstaclesRef.current.forEach(obs => {
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      ctx.strokeRect(obs.x, obs.y, obs.width, obs.height);
    });

    zombiesRef.current.forEach(zombie => {
      ctx.fillStyle = zombie.color;
      ctx.beginPath();
      ctx.arc(zombie.pos.x, zombie.pos.y, zombie.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 10;
      ctx.shadowColor = zombie.color;
      ctx.stroke();
      ctx.shadowBlur = 0;
    });

    const player = playerRef.current;
    ctx.fillStyle = player.color;
    ctx.beginPath();
    ctx.arc(player.pos.x, player.pos.y, player.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 15;
    ctx.shadowColor = player.color;
    ctx.stroke();
    ctx.shadowBlur = 0;

    const moveX = (keysPressed.current['ArrowRight'] || keysPressed.current['KeyD'] ? 1 : 0) - 
                (keysPressed.current['ArrowLeft'] || keysPressed.current['KeyA'] ? 1 : 0);
    const moveY = (keysPressed.current['ArrowDown'] || keysPressed.current['KeyS'] ? 1 : 0) - 
                (keysPressed.current['ArrowUp'] || keysPressed.current['KeyW'] ? 1 : 0);
    if (moveX !== 0 || moveY !== 0) {
      const angle = Math.atan2(moveY, moveX);
      ctx.strokeStyle = '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(player.pos.x, player.pos.y);
      ctx.lineTo(player.pos.x + Math.cos(angle) * 20, player.pos.y + Math.sin(angle) * 20);
      ctx.stroke();
    }

  }, []);

  const animate = useCallback((time: number) => {
    if (lastTimeRef.current !== undefined) {
      const deltaTime = time - lastTimeRef.current;
      update(deltaTime);
      draw();
    }
    lastTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animate);
  }, [update, draw]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [animate]);

  return (
    <div className="relative w-screen h-screen bg-[#09090b] flex items-center justify-center overflow-hidden">
      <div className="relative w-[800px] h-[600px] bg-black shadow-2xl overflow-hidden rounded-lg border border-zinc-800">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="block"
        />

        {gameState === GameState.MENU && (
          <MainMenu onStart={resetGame} gameState={gameState} level={level} score={score} />
        )}

        {gameState === GameState.GAME_OVER && (
          <GameOver onStart={resetGame} gameState={gameState} level={level} score={score} tip={tip} />
        )}

        {gameState === GameState.LEVEL_COMPLETE && (
          <LevelSuccess level={level} onNext={nextLevel} tip={tip} />
        )}

        {gameState === GameState.PLAYING && (
          <HUD level={level} score={score} health={health} timeLeft={timeLeft} />
        )}
      </div>

      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-zinc-600 text-[10px] tracking-[0.2em] uppercase font-bold text-center">
        이동: WASD / 방향키 • 탈출 시점까지 생존하십시오
      </div>
    </div>
  );
};

export default App;
