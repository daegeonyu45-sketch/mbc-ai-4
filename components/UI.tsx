
import React from 'react';
import { GameState } from '../types';

interface MenuProps {
  onStart: () => void;
  gameState: GameState;
  level: number;
  score: number;
  tip?: string;
}

export const MainMenu: React.FC<MenuProps> = ({ onStart }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-20">
    <h1 className="text-6xl font-orbitron font-bold text-red-600 mb-8 tracking-tighter drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">
      NEON OUTBREAK
    </h1>
    <p className="text-zinc-400 mb-12 max-w-md text-center">
      생존만이 유일한 목표입니다. 네온 빛으로 가득한 폐허를 탐험하며 감염자들을 피하고 한계에 도전하세요.
    </p>
    <button
      onClick={onStart}
      className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-bold rounded-none border-b-4 border-red-900 transition-all hover:translate-y-1 active:translate-y-2 font-orbitron tracking-widest"
    >
      작전 개시
    </button>
  </div>
);

export const GameOver: React.FC<MenuProps> = ({ onStart, level, score, tip }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-950/90 z-20 backdrop-blur-sm">
    <h2 className="text-5xl font-orbitron font-bold text-white mb-4">작전 실패</h2>
    <div className="flex gap-8 mb-8">
      <div className="text-center">
        <p className="text-red-300 text-xs uppercase tracking-widest">최종 레벨</p>
        <p className="text-4xl font-bold">{level}</p>
      </div>
      <div className="text-center">
        <p className="text-red-300 text-xs uppercase tracking-widest">점수</p>
        <p className="text-4xl font-bold">{score}</p>
      </div>
    </div>
    {tip && (
      <div className="mb-10 px-6 py-3 bg-black/40 border-l-4 border-red-500 italic text-zinc-300 max-w-sm text-center">
        "{tip}"
      </div>
    )}
    <button
      onClick={onStart}
      className="px-8 py-4 bg-white text-red-900 font-bold rounded-none border-b-4 border-zinc-300 transition-all hover:translate-y-1 active:translate-y-2 font-orbitron"
    >
      다시 시도
    </button>
  </div>
);

export const HUD: React.FC<{ level: number; score: number; health: number; timeLeft: number }> = ({ 
  level, score, health, timeLeft 
}) => (
  <div className="absolute top-0 left-0 w-full p-6 flex justify-between items-start pointer-events-none z-10">
    <div className="flex flex-col gap-2">
      <div className="bg-black/60 border border-zinc-800 p-3 flex flex-col min-w-[120px]">
        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">체력</span>
        <div className="w-full bg-zinc-900 h-2 mt-1 relative">
          <div 
            className="h-full bg-blue-500 transition-all duration-300" 
            style={{ width: `${health}%` }}
          />
        </div>
      </div>
      <div className="bg-black/60 border border-zinc-800 p-3">
        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">레벨</span>
        <p className="text-2xl font-orbitron text-white">{level}</p>
      </div>
    </div>
    
    <div className="flex flex-col items-end gap-2">
      <div className="bg-black/60 border border-zinc-800 p-3 text-right">
        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">탈출 대기 시간</span>
        <p className="text-3xl font-orbitron text-red-500 tabular-nums">
          {Math.ceil(timeLeft)}s
        </p>
      </div>
      <div className="bg-black/60 border border-zinc-800 p-3 text-right">
        <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">점수</span>
        <p className="text-xl font-orbitron text-white">{score}</p>
      </div>
    </div>
  </div>
);

export const LevelSuccess: React.FC<{ level: number; onNext: () => void; tip?: string }> = ({ level, onNext, tip }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-950/80 z-20 backdrop-blur-md">
    <h2 className="text-4xl font-orbitron font-bold text-blue-400 mb-2">구역 확보 완료</h2>
    <p className="text-zinc-300 mb-8">다음 구역 {level + 1}으로 이동 중...</p>
    {tip && (
      <div className="mb-10 px-6 py-3 bg-black/40 border-l-4 border-blue-500 italic text-zinc-300 max-w-sm text-center">
        "{tip}"
      </div>
    )}
    <button
      onClick={onNext}
      className="px-10 py-4 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-none border-b-4 border-blue-900 transition-all font-orbitron"
    >
      다음 구역으로
    </button>
  </div>
);
