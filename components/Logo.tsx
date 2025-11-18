import React from 'react';

interface LogoProps {
  className?: string; // Controls the container div
  iconClassName?: string; // Controls the SVG icon size
  textClassName?: string; // Controls the text style
  showText?: boolean; // Toggles text visibility
}

const Logo: React.FC<LogoProps> = ({ 
  className, 
  iconClassName = "h-10 w-10", 
  textClassName = "font-bold text-xl text-secondary dark:text-white", 
  showText = true 
}) => {
  return (
    <div 
      className={`flex items-center gap-3 ${className || ''}`}
      aria-label="Business Hub Pro Logo"
    >
      <svg 
        viewBox="0 0 64 64" 
        xmlns="http://www.w3.org/2000/svg" 
        className={`${iconClassName} flex-shrink-0`}
        aria-hidden={showText} // Hide icon from screen readers if text is present
      >
        <g fillRule="evenodd">
          {/* Main structure part 1 (Blue) */}
          <path 
            d="M32 0C14.327 0 0 14.327 0 32s14.327 32 32 32c5.703 0 11.1-1.46 15.69-3.99L32 42.312V21.688L47.69 11.99C42.82 4.75 37.712 0 32 0z" 
            fill="#4f46e5"
          />
          {/* Main structure part 2 (Slightly darker blue for depth) */}
          <path 
            d="M64 32c0 5.712-1.46 11.1-3.99 15.69L42.312 32l15.698-15.69C62.54 20.9 64 26.288 64 32z" 
            fill="#4338ca"
          />
          {/* "Pro" accent (Amber) */}
          <path 
            d="M32 64c17.673 0 32-14.327 32-32 0-2.812-.363-5.533-1.04-8.1L32 42.312v-2.92l21.848 21.848C48.467 62.91 40.482 64 32 64z" 
            fill="#f59e0b" 
          />
        </g>
      </svg>
      {showText && (
        <span className={textClassName}>
          Business Hub Pro
        </span>
      )}
    </div>
  );
};

export default Logo;
