import React, { useState, useEffect } from "react";
import { Utensils } from "lucide-react";

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
  fallbackSrc = "https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=800&q=80",
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
    setHasError(false);
  }, [src]);

  const handleImageLoad = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setIsLoaded(true);
    if (onLoad) onLoad(e);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    if (!hasError) {
      setHasError(true);
      setCurrentSrc(fallbackSrc);
    }
    if (onError) onError(e);
  };

  return (
    <div className={`relative overflow-hidden bg-slate-100 dark:bg-slate-800 ${containerClassName}`}>
      {/* Blur & Shimmer Skeleton Placeholder */}
      {!isLoaded && (
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
