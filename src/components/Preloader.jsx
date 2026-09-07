import React, { useState, useEffect } from 'react';

const Preloader = ({ onComplete, onStartFadeOut }) => {
  const [zoomed, setZoomed] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [transparentLogoSrc, setTransparentLogoSrc] = useState(null);

  useEffect(() => {
    // Process logo image to make any white background transparent
    const img = new Image();
    img.src = '/logo-real.png';
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        // Strip white & light gray background pixels (RGB > 225)
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          if (r > 225 && g > 225 && b > 225) {
            data[i + 3] = 0; // Alpha = 0
          }
        }

        ctx.putImageData(imgData, 0, 0);
        setTransparentLogoSrc(canvas.toDataURL('image/png'));
      } catch (err) {
        setTransparentLogoSrc('/logo-real.png');
      }
    };
    img.onerror = () => setTransparentLogoSrc('/logo-real.png');
  }, []);

  useEffect(() => {
    // Step 1: Trigger smooth Logo Zoom In
    const zoomTimer = setTimeout(() => {
      setZoomed(true);
    }, 100);

    // Step 2: Trigger Fade Out after logo zoom completes
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
      if (onStartFadeOut) onStartFadeOut();
    }, 2000);

    // Step 3: Remove preloader component
    const endTimer = setTimeout(() => {
      setIsDone(true);
      if (onComplete) onComplete();
    }, 2900);

    return () => {
      clearTimeout(zoomTimer);
      clearTimeout(fadeTimer);
      clearTimeout(endTimer);
    };
  }, [onComplete, onStartFadeOut]);

  if (isDone) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center bg-gradient-to-br from-[#03141b] via-[#072935] to-[#0d4454] select-none overflow-hidden transition-all duration-900 ease-in-out ${isFadingOut ? 'opacity-0 scale-110 pointer-events-none filter blur-sm' : 'opacity-100 scale-100'
        }`}
    >
      {/* Dynamic Background Atmosphere Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-cyan-500/20 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-amber-500/15 rounded-full blur-[140px] animate-pulse" style={{ animationDuration: '10s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-teal-400/10 rounded-full blur-[160px]" />
      </div>

      {/* Centered Animated Logo (No White Box Background) */}
      <div className="relative z-10 flex items-center justify-center p-4">
        {/* Pulsing Outer Glow Aura */}
        <div
          className={`absolute -inset-10 bg-gradient-to-r from-cyan-400/40 via-teal-300/30 to-amber-300/35 rounded-full blur-3xl transition-all duration-1000 ${zoomed ? 'opacity-100 scale-110' : 'opacity-0 scale-75'
            }`}
        />

        {/* Clean Logo Floating with Smooth Zoom In */}
        <div
          className={`relative flex items-center justify-center transition-all duration-[1500ms] ease-out ${zoomed ? 'scale-100 opacity-100 filter drop-shadow-[0_15px_40px_rgba(17,168,205,0.75)]' : 'scale-65 opacity-0'
            }`}
        >
          <img
            src={transparentLogoSrc || '/logo-real.png'}
            alt="Aashmi Logo"
            className="h-32 sm:h-48 md:h-56 max-w-[88vw] object-contain"
          />
        </div>
      </div>
    </div>
  );
};

export default Preloader;
