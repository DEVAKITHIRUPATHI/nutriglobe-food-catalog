import React, { useState, useEffect } from "react";
import { Utensils, ImageOff } from "lucide-react";

export interface LazyImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  fallbackSrc?: string;
  containerClassName?: string;
  showPlaceholderIcon?: boolean;
}

export const LazyImage: React.FC<LazyImageProps> = ({
  src,
  alt,
  fallbackSrc,
  className = "",
  containerClassName = "",
  showPlaceholderIcon = true,
  onError,
  onLoad,
  ...props
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [currentSrc, setCurrentSrc] = useState(src);

  useEffect(() => {
    setCurrentSrc(src);
    setIsLoaded(false);
    setHasError(!src || src.trim() === '' || src.includes('placeholder'));
  }, [src]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true);
    if (fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    }
    if (onError) onError(e);
  };

  // If no source provided or failed to load, display the clean "Image unavailable" state (Requirement 17 & 18)
  if (!src || src.trim() === '' || (hasError && !fallbackSrc)) {
    return (
      <div 
        className={`relative flex flex-col items-center justify-center p-4 bg-slate-50 dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 text-center ${containerClassName}`}
        aria-label={`Image unavailable for ${alt}`}
      >
        <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-2">
          <ImageOff className="w-5 h-5" />
        </div>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
          Image unavailable
        </span>
        <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1 max-w-[90%]">
          {alt}
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden bg-slate-100 dark:bg-slate-800 ${containerClassName}`}>
      {/* Blur & Shimmer Skeleton Placeholder while loading */}
      {!isLoaded && !hasError && (
        <div className="absolute inset-0 flex items-center justify-center bg-slate-200/80 dark:bg-slate-700/80 backdrop-blur-md animate-pulse z-10">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 dark:via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
          {showPlaceholderIcon && (
            <div className="p-3 rounded-full bg-white/40 dark:bg-slate-800/40 border border-slate-300/40 dark:border-slate-600/40 text-slate-400 dark:text-slate-500">
              <Utensils className="w-6 h-6 animate-bounce" />
            </div>
          )}
        </div>
      )}

      {/* Actual Image with Blur-Up Transition */}
      <img
        {...props}
        src={currentSrc}
        alt={alt}
        loading="lazy"
        decoding="async"
        referrerPolicy="no-referrer"
        onLoad={handleImageLoad}
        onError={handleImageError}
        className={`w-full h-full object-cover transition-all duration-500 ease-out ${
          isLoaded ? "opacity-100 blur-0 scale-100" : "opacity-0 blur-md scale-105"
        } ${className}`}
      />
    </div>
  );
};

export default LazyImage;
