import React from 'react';

interface NutriFactsLogoProps {
  className?: string;
  variant?: 'full' | 'horizontal' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const NutriFactsLogo: React.FC<NutriFactsLogoProps> = ({
  className = '',
  variant = 'horizontal',
  size = 'md',
}) => {
  // Size mapping for height/width
  const sizeClasses = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-14',
    xl: 'h-20',
  };

  const currentSize = sizeClasses[size];

  // SVG Emblem reproducing the NutriFacts circular wheel, 'n' leaf, dots, and hills
  const EmblemSVG = (
    <svg
      viewBox="0 0 200 200"
      className="w-full h-full shrink-0 select-none drop-shadow-sm"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="nf-orange-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
        <linearGradient id="nf-yellow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#eab308" />
          <stop offset="100%" stopColor="#ca8a04" />
        </linearGradient>
        <linearGradient id="nf-green-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#84cc16" />
          <stop offset="100%" stopColor="#65a30d" />
        </linearGradient>
        <linearGradient id="nf-darkgreen-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#15803d" />
          <stop offset="100%" stopColor="#0b5d2e" />
        </linearGradient>
        <linearGradient id="nf-teal-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#14b8a6" />
          <stop offset="100%" stopColor="#0d9488" />
        </linearGradient>
        <linearGradient id="nf-purple-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#7e22ce" />
        </linearGradient>
        <linearGradient id="nf-leaf-bright" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#86efac" />
          <stop offset="100%" stopColor="#22c55e" />
        </linearGradient>
      </defs>

      {/* Outer Segmented Arc Ring (Categories) */}
      {/* 1. Red/Orange Meat */}
      <path
        d="M 28 85 A 82 82 0 0 1 45 42 L 68 56 A 55 55 0 0 0 54 88 Z"
        fill="url(#nf-orange-grad)"
      />
      {/* 2. Orange Oil/Pitcher */}
      <path
        d="M 48 39 A 82 82 0 0 1 82 18 L 95 42 A 55 55 0 0 0 70 57 Z"
        fill="#f97316"
      />
      {/* 3. Yellow Wheat */}
      <path
        d="M 86 16 A 82 82 0 0 1 128 16 L 123 42 A 55 55 0 0 0 97 42 Z"
        fill="url(#nf-yellow-grad)"
      />
      {/* 4. Light Green Veggie */}
      <path
        d="M 132 18 A 82 82 0 0 1 165 39 L 145 57 A 55 55 0 0 0 121 42 Z"
        fill="url(#nf-green-grad)"
      />
      {/* 5. Dark Green Produce */}
      <path
        d="M 168 42 A 82 82 0 0 1 185 85 L 158 88 A 55 55 0 0 0 146 56 Z"
        fill="url(#nf-darkgreen-grad)"
      />
      {/* 6. Teal Fish */}
      <path
        d="M 186 89 A 82 82 0 0 1 188 132 L 159 122 A 55 55 0 0 0 158 91 Z"
        fill="url(#nf-teal-grad)"
      />
      {/* 7. Purple Bowl */}
      <path
        d="M 187 136 A 82 82 0 0 1 170 170 L 148 144 A 55 55 0 0 0 158 125 Z"
        fill="url(#nf-purple-grad)"
      />

      {/* Segment Category Icons (Stylized White Vectors) */}
      {/* Wheat icon in Yellow block */}
      <path d="M 107 24 C 107 28, 112 30, 112 30 C 112 30, 107 32, 107 36 M 107 24 L 107 36" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" />
      {/* Leaf icon in Light Green block */}
      <path d="M 142 30 C 148 24, 154 30, 150 36 C 144 40, 138 34, 142 30 Z" fill="#ffffff" />
      {/* Fish icon in Teal block */}
      <path d="M 168 104 C 174 100, 178 108, 172 110 L 176 112 L 176 102 Z" fill="#ffffff" />
      {/* Bowl icon in Purple block */}
      <path d="M 160 148 C 160 156, 172 156, 172 148 Z M 158 146 L 174 146" stroke="#ffffff" strokeWidth="2.5" />

      {/* Outer Border Arc */}
      <path
        d="M 28 85 A 82 82 0 0 0 180 162"
        stroke="#0b5d2e"
        strokeWidth="6"
        strokeLinecap="round"
      />

      {/* Bottom Overlapping Hills (Warm Orange & Bright Green) */}
      <path
        d="M 40 140 C 70 185, 120 185, 145 155 C 105 190, 50 170, 40 140 Z"
        fill="#f97316"
      />
      <path
        d="M 90 165 C 130 190, 180 155, 185 130 C 150 175, 105 170, 90 165 Z"
        fill="#84cc16"
      />

      {/* Left Arc Dots (5 Lime Green Dots) */}
      <circle cx="68" cy="78" r="4.5" fill="#84cc16" />
      <circle cx="62" cy="98" r="5" fill="#15803d" />
      <circle cx="62" cy="118" r="5.5" fill="#15803d" />
      <circle cx="68" cy="138" r="5" fill="#84cc16" />
      <circle cx="78" cy="155" r="4.5" fill="#84cc16" />

      {/* Center Stylized 'n' Letter */}
      <path
        d="M 85 80 L 85 145 C 85 150, 92 150, 92 145 L 92 108 C 92 92, 122 90, 122 108 L 122 145 C 122 150, 130 150, 130 145 L 130 102 C 130 82, 85 82, 85 102 Z"
        fill="#0b5d2e"
      />

      {/* Sprouting Leaf at Right Top of 'n' */}
      <path
        d="M 122 92 C 122 68, 148 62, 148 62 C 148 62, 142 88, 122 92 Z"
        fill="url(#nf-leaf-bright)"
      />
      <path
        d="M 124 90 C 134 82, 144 70, 144 70"
        stroke="#15803d"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );

  // Text Typography
  const TextContent = (
    <div className="flex flex-col justify-center leading-none">
      <div className="flex items-baseline gap-0.5 tracking-tight">
        <span className="font-black text-white text-xl sm:text-2xl font-sans drop-shadow-md">
          nutri
        </span>
        <span className="font-black text-lime-400 text-xl sm:text-2xl font-sans drop-shadow-md">
          facts
        </span>
        <span className="text-[10px] font-black text-amber-300 -translate-y-2">
          TM
        </span>
      </div>
      {variant === 'full' && (
        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-200 mt-1 whitespace-nowrap">
          EXPLORE • NOURISH • TRANSFORM
        </span>
      )}
    </div>
  );

  if (variant === 'icon') {
    return (
      <div className={`${currentSize} aspect-square bg-white p-1 rounded-full shadow-md border border-slate-200 ring-2 ring-emerald-500/20 ${className}`}>
        {EmblemSVG}
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      <div className={`${currentSize} aspect-square bg-white p-1 rounded-full shadow-md border border-slate-200 ring-2 ring-emerald-500/20 shrink-0`}>
        {EmblemSVG}
      </div>
      {TextContent}
    </div>
  );
};
