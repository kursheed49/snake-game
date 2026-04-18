import { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, SkipForward, Volume2, VolumeX, Terminal } from 'lucide-react';

const TRACKS = [
  { id: 1, title: 'NEURAL_SYNTH_v1.0.ogg', url: 'https://actions.google.com/sounds/v1/science_fiction/alien_breath.ogg' },
  { id: 2, title: 'CYBER_GRID_LAMENT.ogg', url: 'https://actions.google.com/sounds/v1/science_fiction/spaceship_engine.ogg' },
  { id: 3, title: 'GHOST_IN_THE_WIRE.ogg', url: 'https://actions.google.com/sounds/v1/science_fiction/scifi_machine_processing.ogg' },
];

const GRID_SIZE = 20;
const INITIAL_SNAKE = [{ x: 10, y: 10 }];
const INITIAL_DIRECTION = { x: 0, y: -1 };
const INITIAL_SPEED = 120;

export default function App() {
  // MUSIC PLAYER STATE
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  // SNAKE GAME STATE
  const [snake, setSnake] = useState(INITIAL_SNAKE);
  const [direction, setDirection] = useState(INITIAL_DIRECTION);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const nextDirection = useRef(INITIAL_DIRECTION);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skipTrack = () => {
    setCurrentTrackIndex((prev) => (prev + 1) % TRACKS.length);
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  useEffect(() => {
    if (isPlaying && audioRef.current) {
      audioRef.current.play().catch(() => setIsPlaying(false));
    }
  }, [currentTrackIndex]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling via arrow keys
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
      }

      if (['ArrowUp', 'w', 'W'].includes(e.key) && direction.y === 0) {
        nextDirection.current = { x: 0, y: -1 };
      } else if (['ArrowDown', 's', 'S'].includes(e.key) && direction.y === 0) {
        nextDirection.current = { x: 0, y: 1 };
      } else if (['ArrowLeft', 'a', 'A'].includes(e.key) && direction.x === 0) {
        nextDirection.current = { x: -1, y: 0 };
      } else if (['ArrowRight', 'd', 'D'].includes(e.key) && direction.x === 0) {
        nextDirection.current = { x: 1, y: 0 };
      } else if (e.key === ' ' && (gameOver || !gameStarted)) {
        resetGame();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [direction, gameOver, gameStarted]);

  const spawnFood = useCallback(() => {
    setFood({
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    });
  }, []);

  const resetGame = () => {
    setSnake(INITIAL_SNAKE);
    setDirection(INITIAL_DIRECTION);
    nextDirection.current = INITIAL_DIRECTION;
    setScore(0);
    setGameOver(false);
    setGameStarted(true);
    spawnFood();
  };

  useEffect(() => {
    if (!gameStarted || gameOver) return;

    const moveSnake = () => {
      setSnake((prevSnake) => {
        const head = prevSnake[0];
        const newDirection = nextDirection.current;
        setDirection(newDirection);

        const newHead = {
          x: head.x + newDirection.x,
          y: head.y + newDirection.y,
        };

        // Wall collision
        if (
          newHead.x < 0 || newHead.x >= GRID_SIZE ||
          newHead.y < 0 || newHead.y >= GRID_SIZE
        ) {
          setGameOver(true);
          return prevSnake;
        }

        // Self collision
        if (prevSnake.some((segment) => segment.x === newHead.x && segment.y === newHead.y)) {
          setGameOver(true);
          return prevSnake;
        }

        const newSnake = [newHead, ...prevSnake];

        // Food collision
        if (newHead.x === food.x && newHead.y === food.y) {
          setScore((s) => s + 10);
          spawnFood();
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    };

    const interval = setInterval(moveSnake, INITIAL_SPEED);
    return () => clearInterval(interval);
  }, [food, gameOver, gameStarted, spawnFood]);

  return (
    <div className="h-full w-full max-w-[1024px] mx-auto relative flex flex-col p-4 md:p-6">
      <div className="scanlines"></div>
      
      <header className="w-full flex flex-col items-center justify-center z-10 hidden sm:flex mb-6">
        <h1 className="text-[24px] tracking-[8px] uppercase text-[#00f3ff]" data-text="B10-SNAKE_OS">
          SNAKE_OS V2.0
        </h1>
        <p className="text-[#666] text-[12px] mt-2 uppercase flex items-center gap-2">
          <Terminal size={12} /> System Status: ONLINE
        </p>
      </header>

      <main className="z-10 w-full grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6">
        
        {/* MUSIC PLAYER MODULE */}
        <div className="bg-white/5 border border-white/10 rounded-[16px] flex flex-col p-5 h-fit order-2 md:order-1 gap-5 backdrop-blur-md hidden sm:flex">
          <div className="pb-2.5 border-b border-white/10">
            <h2 className="text-[14px] text-[#00f3ff] uppercase tracking-[2px] mb-1">
              Playlist
            </h2>
            <p className="text-[12px] text-[#666]">Cyberpunk Chill vol. 1</p>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3">
               {TRACKS.map((track, idx) => (
                 <div key={track.id} onClick={() => { setCurrentTrackIndex(idx); setIsPlaying(true); }} className={`p-2.5 rounded-[8px] border transition-colors cursor-pointer ${idx === currentTrackIndex ? 'bg-[#00f3ff]/10 border-[#00f3ff]' : 'border-transparent hover:bg-white/5'}`}>
                   <div className="text-[14px] font-medium text-white">{track.title}</div>
                   <div className="text-[12px] text-[#888]"> AI Generation • 03:{String(42 + idx * 11).padStart(2, '0')}</div>
                 </div>
               ))}
            </div>

            <div className="flex justify-between items-center mt-2 px-2">
              <button onClick={toggleMute} className="text-white hover:text-[#00f3ff] transition-colors cursor-pointer p-2 bg-transparent border-none">
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
              
              <div className="flex gap-4 items-center">
                <button onClick={togglePlay} className="w-[48px] h-[48px] rounded-[50%] bg-[#00f3ff] text-black hover:scale-105 transition-all cursor-pointer border-none flex items-center justify-center">
                  {isPlaying ? <Pause size={24} fill="currentColor" /> : <Play size={24} fill="currentColor" />}
                </button>
                <button onClick={skipTrack} className="text-white hover:text-[#00f3ff] hover:scale-105 transition-all cursor-pointer p-2 bg-transparent border-none">
                  <SkipForward size={20} fill="currentColor" />
                </button>
              </div>
            </div>
            
            <div className="flex items-center gap-4 mt-2">
               <div className="w-12 h-12 bg-gradient-to-tr from-[#ff00f5] to-[#00f3ff] rounded"></div>
               <div>
                 <div className="text-[14px] font-medium text-white max-w-[150px] truncate">{TRACKS[currentTrackIndex].title}</div>
                 <div className="text-[12px] text-[#888]">Now Playing</div>
               </div>
            </div>
          </div>
          <audio 
            ref={audioRef} 
            src={TRACKS[currentTrackIndex].url}
            onEnded={skipTrack}
            autoPlay={isPlaying}
            loop={false}
          />
        </div>

        {/* SNAKE GAME MODULE */}
        <div className="flex-1 flex flex-col items-center order-1 md:order-2 w-full">
          <div className="w-full flex justify-between gap-6 mb-6">
             <div className="flex-1 bg-white/5 border border-white/10 rounded-[12px] p-4 text-center sm:text-left">
               <div className="text-[10px] uppercase text-[#888] tracking-[1px]">Current Score</div>
               <div className="font-mono text-[32px] font-bold text-[#39ff14] mt-1">{String(score).padStart(4, '0')}</div>
             </div>
             <div className="flex-1 bg-white/5 border border-white/10 rounded-[12px] p-4 hidden sm:block">
               <div className="text-[10px] uppercase text-[#888] tracking-[1px]">High Score</div>
               <div className="font-mono text-[32px] font-bold text-[#ff00f5] mt-1">4,850</div>
             </div>
             <div className="flex-1 bg-white/5 border border-white/10 rounded-[12px] p-4 hidden xl:block opacity-50">
               <div className="text-[11px] leading-relaxed">
                 SYSTEM STATUS: OPTIMAL<br/>
                 LATENCY: 4ms<br/>
                 AUDIO_ENGINE: {isPlaying ? 'ACTIVE' : 'IDLE'}
               </div>
             </div>
          </div>

          <div 
            className="grid bg-[#000] border-2 border-[#00f3ff] shadow-[0_0_20px_rgba(0,243,255,0.2)] relative"
            style={{
              gridTemplateColumns: `repeat(${GRID_SIZE}, 1fr)`,
              width: '100%',
              aspectRatio: '1/1',
              maxWidth: '440px'
            }}
          >
            {!gameStarted && (
              <div className="absolute inset-0 bg-black/80 flex items-center justify-center flex-col z-10 backdrop-blur-sm">
                 <p className="text-[#00f3ff] mb-6 text-xl tracking-[4px] animate-pulse">SYSTEM READY</p>
                 <button onClick={resetGame} className="border border-[#00f3ff] text-[#00f3ff] px-6 py-3 hover:bg-[#00f3ff]/20 rounded transition-all uppercase tracking-[2px] font-bold cursor-pointer">
                   Start Game
                 </button>
              </div>
            )}
            {gameOver && (
              <div className="absolute inset-0 bg-black/90 flex items-center justify-center flex-col z-10 backdrop-blur-sm">
                 <p className="text-[#ff00f5] mb-2 text-center text-3xl uppercase tracking-[4px] font-bold">GAME OVER</p>
                 <p className="text-[#39ff14] font-mono mb-8 text-xl tracking-widest">SCORE: {score}</p>
                 <button onClick={resetGame} className="border border-[#00f3ff] text-[#00f3ff] px-6 py-3 hover:bg-[#00f3ff]/20 rounded transition-all uppercase tracking-[2px] font-bold cursor-pointer">
                   Play Again
                 </button>
              </div>
            )}

            {Array.from({ length: GRID_SIZE * GRID_SIZE }).map((_, idx) => {
              const x = idx % GRID_SIZE;
              const y = Math.floor(idx / GRID_SIZE);
              const isSnake = snake.some(segment => segment.x === x && segment.y === y);
              const isFood = food.x === x && food.y === y;

              return (
                <div 
                  key={idx}
                  className={`
                    w-full h-full border-[0.5px] border-white/5
                    ${isSnake ? 'bg-[#39ff14] shadow-[0_0_8px_#39ff14] rounded-[2px]' : ''}
                    ${isFood ? 'bg-[#ff00f5] shadow-[0_0_10px_#ff00f5] rounded-full' : ''}
                  `}
                />
              );
            })}
          </div>
          <div className="mt-8 text-[12px] text-[#444] uppercase tracking-wider text-center">
             Use arrow keys to navigate
          </div>
        </div>
      </main>
    </div>
  );
}
