"use client";

import { useEffect, useState } from "react";

export default function SplashScreen({ onComplete }: { onComplete: () => void }) {
  const [progress, setProgress] = useState(0);
  const [loadingText, setLoadingText] = useState("Initializing...");

  useEffect(() => {
    // Progress animation
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(progressTimer);
          setTimeout(onComplete, 500); // Smooth fade out
          return 100;
        }
        return prev + 10;
      });
    }, 150); // Total 1.5 seconds

    // Loading text changes
    const textTimer = setTimeout(() => setLoadingText("Loading components..."), 500);
    const textTimer2 = setTimeout(() => setLoadingText("Almost ready..."), 1000);

    return () => {
      clearInterval(progressTimer);
      clearTimeout(textTimer);
      clearTimeout(textTimer2);
    };
  }, [onComplete]);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-emerald-600 via-emerald-700 to-emerald-900 flex items-center justify-center z-50 animate-fadeIn">
      <div className="text-center text-white px-8">
        
        {/* Logo with pulse animation */}
        <div className="relative w-32 h-32 mx-auto mb-8 animate-bounce-slow">
          <div className="absolute inset-0 bg-white/20 rounded-3xl blur-2xl animate-pulse" />
          <div className="relative w-full h-full bg-white rounded-3xl shadow-2xl flex items-center justify-center">
            <img 
              src="/icon.png" 
              alt="Msgify Logo" 
              width={96} 
              height={96}
              className="object-contain"
            />
          </div>
        </div>
        
        {/* App Name */}
        <h1 className="text-5xl font-black mb-3 tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-emerald-100">
          Msgify
        </h1>
        
        {/* Tagline */}
        <p className="text-emerald-50 text-lg font-medium mb-8 opacity-90">
          Offline Archive Viewer
        </p>
        
        {/* Progress Bar */}
        <div className="w-80 mx-auto">
          <div className="h-2 bg-emerald-900/50 rounded-full overflow-hidden backdrop-blur-sm border border-emerald-400/20">
            <div 
              className="h-full bg-gradient-to-r from-white via-emerald-100 to-white rounded-full transition-all duration-300 ease-out shadow-lg shadow-white/50"
              style={{ width: `${progress}%` }}
            />
          </div>
          
          {/* Loading Text */}
          <div className="flex items-center justify-between mt-3 px-1">
            <p className="text-sm text-emerald-100 font-medium animate-pulse">
              {loadingText}
            </p>
            <p className="text-sm text-emerald-100 font-bold tabular-nums">
              {progress}%
            </p>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
          <p className="text-xs text-emerald-200/60 font-medium">
            Powered by Tauri & Next.js
          </p>
        </div>
      </div>

      {/* Background Animation Circles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-400/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-300/10 rounded-full blur-3xl animate-float-delayed" />
      </div>
    </div>
  );
}