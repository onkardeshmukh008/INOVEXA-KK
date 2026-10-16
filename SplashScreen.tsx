import React, { useEffect, useState } from 'react';
import { SkillTraceLogo } from './SkillTraceLogo.tsx';
import { ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';

interface SplashScreenProps {
  onFinish: () => void;
  autoDismissMs?: number;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({
  onFinish,
  autoDismissMs = 2800,
}) => {
  const [progress, setProgress] = useState(15);
  const [loadingText, setLoadingText] = useState('Initializing career evidence engine...');

  useEffect(() => {
    const t1 = setTimeout(() => {
      setProgress(45);
      setLoadingText('Connecting GitHub static code analyzer...');
    }, 700);

    const t2 = setTimeout(() => {
      setProgress(80);
      setLoadingText('Loading skill verification matrix...');
    }, 1500);

    const t3 = setTimeout(() => {
      setProgress(100);
      setLoadingText('Ready.');
    }, 2200);

    const tFinish = setTimeout(() => {
      onFinish();
    }, autoDismissMs);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(tFinish);
    };
  }, [onFinish, autoDismissMs]);

  return (
    <div
      style={{ backgroundColor: '#FAF6EE' }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 sm:p-12 overflow-hidden select-none"
    >
      {/* Decorative Warm Sparkles */}
      <span className="absolute top-8 left-8 text-amber-300/80 text-2xl font-serif animate-pulse">✦</span>
      <span className="absolute top-12 right-12 text-amber-400/80 text-xl font-serif animate-pulse">✦</span>
      <span className="absolute bottom-12 left-12 text-amber-400/80 text-xl font-serif animate-pulse">✦</span>
      <span className="absolute bottom-8 right-8 text-amber-300/80 text-2xl font-serif animate-pulse">✦</span>

      {/* Top bar with Skip button */}
      <div className="w-full max-w-2xl flex items-center justify-between text-xs text-amber-900/60 font-medium">
        <span className="tracking-widest uppercase text-[10px] font-bold">SkillTrace.Ai • National Build</span>
        <button
          onClick={onFinish}
          className="px-3 py-1.5 rounded-full border border-amber-900/20 text-amber-900/80 hover:bg-amber-900/5 transition-colors flex items-center gap-1 text-xs"
        >
          <span>Enter App</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Central Visual Showcase Matching User's Image */}
      <div className="flex flex-col items-center justify-center max-w-md w-full text-center space-y-6">
        <div className="animate-in fade-in zoom-in-95 duration-700">
          <SkillTraceLogo size="xl" variant="badge-only" className="mx-auto" />
        </div>

        <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
          <h1
            style={{
              fontFamily: 'Georgia, Cambria, "Times New Roman", serif',
              color: '#865A30',
            }}
            className="text-3xl sm:text-4xl font-bold tracking-tight"
          >
            SkillTrace.Ai
          </h1>
          <p className="text-sm sm:text-base text-amber-950/80 font-medium max-w-sm mx-auto leading-relaxed">
            Know what your projects prove. Discover what to improve next.
          </p>
          <p className="text-xs text-amber-900/60 max-w-xs mx-auto">
            Compare your resume with your real coding projects and the skills employers need.
          </p>
        </div>

        {/* Loading Progress Bar */}
        <div className="w-full max-w-xs space-y-2 pt-2">
          <div className="h-1.5 w-full bg-amber-900/10 rounded-full overflow-hidden">
            <div
              style={{ width: `${progress}%` }}
              className="h-full bg-gradient-to-r from-amber-600 via-amber-500 to-amber-400 transition-all duration-500 rounded-full"
            />
          </div>
          <div className="flex items-center justify-between text-[11px] text-amber-900/70 font-mono">
            <span>{loadingText}</span>
            <span>{progress}%</span>
          </div>
        </div>
      </div>

      {/* Footer Credibility Info */}
      <div className="text-center text-xs text-amber-900/60 max-w-md space-y-1">
        <p className="text-[11px]">
          Evidence-based career readiness for students, new grads & job seekers.
        </p>
        <p className="text-[10px] text-amber-900/40">
          Static code verification • Real GitHub API • Privacy first
        </p>
      </div>
    </div>
  );
};
