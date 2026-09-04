import React from "react";

interface MithraOwlLogoProps {
  size?: number;
  className?: string;
}

export const MithraOwlLogo: React.FC<MithraOwlLogoProps> = ({ size = 64, className = "" }) => {
  return (
    <div
      id="mithra-logo-container"
      className={`relative inline-flex items-center justify-center select-none ${className}`}
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-md"
      >
        <defs>
          <linearGradient id="violetGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#6B21A8" />
          </linearGradient>
          <linearGradient id="bookPageGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F5F3FF" />
          </linearGradient>
          <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="100%" stopColor="#EAB308" />
          </linearGradient>
          <linearGradient id="owlBellyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#EDE9FE" />
            <stop offset="100%" stopColor="#DDD6FE" />
          </linearGradient>
        </defs>

        {/* --- OPEN BOOK AT BOTTOM --- */}
        {/* Book cover spine & base */}
        <path
          d="M60 102 C42 105 25 101 12 97 L14 103 C28 107 44 110 60 106 C76 110 92 107 106 103 L108 97 C95 101 78 105 60 102 Z"
          fill="#4C1D95"
        />

        {/* Left Book Pages */}
        <path
          d="M60 100 C42 103 24 98 12 94 L14 83 C26 87 43 91 60 88 Z"
          fill="url(#bookPageGrad)"
          stroke="#DDD6FE"
          strokeWidth="1.5"
        />
        {/* Right Book Pages */}
        <path
          d="M60 100 C78 103 96 98 108 94 L106 83 C94 87 77 91 60 88 Z"
          fill="url(#bookPageGrad)"
          stroke="#DDD6FE"
          strokeWidth="1.5"
        />
        {/* Center Spine Crease */}
        <line x1="60" y1="88" x2="60" y2="104" stroke="#6B21A8" strokeWidth="2.5" strokeLinecap="round" />
        
        {/* Page text lines simulation */}
        <path d="M22 89 C32 91 42 92 52 90" stroke="#C4B5FD" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M22 93 C32 95 42 96 52 94" stroke="#C4B5FD" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M68 90 C78 92 88 91 98 89" stroke="#C4B5FD" strokeWidth="1.2" strokeLinecap="round" />
        <path d="M68 94 C78 96 88 95 98 93" stroke="#C4B5FD" strokeWidth="1.2" strokeLinecap="round" />

        {/* Bookmark ribbon */}
        <path d="M60 99 L60 114 L56 111 L52 114 L52 100 Z" fill="url(#goldGrad)" />

        {/* --- CUTE VIOLET OWL --- */}
        {/* Owl Body */}
        <ellipse cx="60" cy="54" rx="28" ry="32" fill="url(#violetGradient)" />

        {/* Owl Ear Tufts / Horns */}
        {/* Left Ear */}
        <path d="M38 32 L30 14 C36 18 44 23 47 26 Z" fill="#581C87" />
        {/* Right Ear */}
        <path d="M82 32 L90 14 C84 18 76 23 73 26 Z" fill="#581C87" />

        {/* Owl Wings (Folded) */}
        <path d="M32 50 C31 66 38 78 45 83 C36 78 30 65 32 50 Z" fill="#581C87" />
        <path d="M88 50 C89 66 82 78 75 83 C84 78 90 65 88 50 Z" fill="#581C87" />

        {/* Owl Belly */}
        <ellipse cx="60" cy="62" rx="18" ry="20" fill="url(#owlBellyGrad)" />
        {/* Belly feather marks */}
        <path d="M54 56 C57 58 63 58 66 56" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M50 63 C55 66 65 66 70 63" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <path d="M54 70 C57 72 63 72 66 70" stroke="#8B5CF6" strokeWidth="1.5" strokeLinecap="round" fill="none" />

        {/* Owl Big Cute Intelligent Eyes */}
        {/* Left Eye Frame */}
        <circle cx="48" cy="42" r="12" fill="#FFFFFF" stroke="#4C1D95" strokeWidth="2" />
        {/* Right Eye Frame */}
        <circle cx="72" cy="42" r="12" fill="#FFFFFF" stroke="#4C1D95" strokeWidth="2" />

        {/* Left Iris & Pupil */}
        <circle cx="50" cy="42" r="7" fill="#6B21A8" />
        <circle cx="50" cy="42" r="4.5" fill="#1E1B4B" />
        <circle cx="48" cy="39.5" r="2.2" fill="#FFFFFF" />
        <circle cx="52" cy="43.5" r="1" fill="#FFFFFF" />

        {/* Right Iris & Pupil */}
        <circle cx="70" cy="42" r="7" fill="#6B21A8" />
        <circle cx="70" cy="42" r="4.5" fill="#1E1B4B" />
        <circle cx="68" cy="39.5" r="2.2" fill="#FFFFFF" />
        <circle cx="72" cy="43.5" r="1" fill="#FFFFFF" />

        {/* Golden Cute Beak */}
        <polygon points="60,46 55,53 65,53" fill="url(#goldGrad)" stroke="#B45309" strokeWidth="1" />

        {/* Academic Mortarboard / Graduation Cap for Wisdom */}
        <path d="M42 22 L60 16 L78 22 L60 28 Z" fill="#3B0764" />
        <rect x="52" y="24" width="16" height="5" rx="1.5" fill="#4C1D95" />
        <circle cx="60" cy="22" r="2" fill="#FDE047" />
        <path d="M60 22 C64 25 68 28 68 33" stroke="#FDE047" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        <circle cx="68" cy="34" r="1.5" fill="#EAB308" />

        {/* Owl Feet gripping the open book */}
        <ellipse cx="50" cy="86" rx="4" ry="2.5" fill="url(#goldGrad)" stroke="#B45309" strokeWidth="0.8" />
        <ellipse cx="55" cy="87" rx="4" ry="2.5" fill="url(#goldGrad)" stroke="#B45309" strokeWidth="0.8" />
        <ellipse cx="65" cy="87" rx="4" ry="2.5" fill="url(#goldGrad)" stroke="#B45309" strokeWidth="0.8" />
        <ellipse cx="70" cy="86" rx="4" ry="2.5" fill="url(#goldGrad)" stroke="#B45309" strokeWidth="0.8" />
      </svg>
    </div>
  );
};
