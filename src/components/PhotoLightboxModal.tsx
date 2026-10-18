import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react';
import { useBrowserBackClose } from '../hooks/useBrowserBackClose';

interface PhotoLightboxModalProps {
  isOpen: boolean;
  photos: string[];
  currentIndex: number;
  onClose: () => void;
  onIndexChange: (index: number) => void;
}

export const PhotoLightboxModal: React.FC<PhotoLightboxModalProps> = ({
  isOpen,
  photos,
  currentIndex,
  onClose,
  onIndexChange,
}) => {
  useBrowserBackClose(isOpen, onClose, 'photo-lightbox-modal');

  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);

  // References for gesture tracking
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastTouchDistanceRef = useRef<number | null>(null);
  const lastTapTimeRef = useRef<number>(0);
  const touchStartPosRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  // Reset zoom and position whenever photo changes or modal opens
  const resetZoom = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  }, []);

  useEffect(() => {
    resetZoom();
  }, [currentIndex, isOpen, resetZoom]);

  // Prevent background scrolling while modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Keyboard navigation (ESC, Arrow Left, Arrow Right)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft' && photos.length > 1 && scale === 1) {
        onIndexChange(currentIndex > 0 ? currentIndex - 1 : photos.length - 1);
      } else if (e.key === 'ArrowRight' && photos.length > 1 && scale === 1) {
        onIndexChange(currentIndex < photos.length - 1 ? currentIndex + 1 : 0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, photos.length, currentIndex, scale, onClose, onIndexChange]);

  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex] || photos[0];

  const handleZoomIn = () => {
    setScale((prev) => Math.min(prev + 0.75, 4));
  };

  const handleZoomOut = () => {
    setScale((prev) => {
      const next = Math.max(prev - 0.75, 1);
      if (next === 1) setPosition({ x: 0, y: 0 });
      return next;
    });
  };

  // Double tap / Double click toggles between 1x and 2.5x
  const handleDoubleTap = (clientX: number, clientY: number) => {
    if (scale > 1) {
      resetZoom();
    } else {
      setScale(2.5);
      // Center zoom roughly around tapped point if inside container
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        const offsetX = (rect.width / 2 - (clientX - rect.left)) * 1.5;
        const offsetY = (rect.height / 2 - (clientY - rect.top)) * 1.5;
        setPosition({ x: offsetX, y: offsetY });
      }
    }
  };

  // Mouse drag handlers for desktop
  const handleMouseDown = (e: React.MouseEvent) => {
    if (scale <= 1) return;
    setIsDragging(true);
    dragStartRef.current = { x: e.clientX - position.x, y: e.clientY - position.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || scale <= 1) return;
    setPosition({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Touch event handlers for mobile gestures (pinch, drag, swipe, double-tap)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const now = Date.now();
      const timeDiff = now - lastTapTimeRef.current;

      touchStartPosRef.current = { x: touch.clientX, y: touch.clientY };

      if (timeDiff < 300) {
        // Double tap detected!
        handleDoubleTap(touch.clientX, touch.clientY);
        lastTapTimeRef.current = 0;
        return;
      }
      lastTapTimeRef.current = now;

      if (scale > 1) {
        setIsDragging(true);
        dragStartRef.current = { x: touch.clientX - position.x, y: touch.clientY - position.y };
      }
    } else if (e.touches.length === 2) {
      // Pinch gesture start
      setIsDragging(false);
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      lastTouchDistanceRef.current = dist;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && scale > 1 && isDragging) {
      const touch = e.touches[0];
      setPosition({
        x: touch.clientX - dragStartRef.current.x,
        y: touch.clientY - dragStartRef.current.y,
      });
    } else if (e.touches.length === 2 && lastTouchDistanceRef.current !== null) {
      // Pinch to zoom
      const dist = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      const diff = dist - lastTouchDistanceRef.current;
      const zoomFactor = diff * 0.008;

      setScale((prev) => {
        const next = Math.min(Math.max(prev + zoomFactor, 1), 4);
        if (next === 1) setPosition({ x: 0, y: 0 });
        return next;
      });
      lastTouchDistanceRef.current = dist;
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    setIsDragging(false);
    lastTouchDistanceRef.current = null;

    // If at scale 1 and user made a single-finger swipe, navigate photos
    if (scale === 1 && e.changedTouches.length === 1 && photos.length > 1) {
      const touch = e.changedTouches[0];
      const deltaX = touchStartPosRef.current.x - touch.clientX;
      const deltaY = Math.abs(touchStartPosRef.current.y - touch.clientY);

      if (Math.abs(deltaX) > 50 && Math.abs(deltaX) > deltaY) {
        if (deltaX > 0) {
          // Swipe left -> next photo
          onIndexChange(currentIndex < photos.length - 1 ? currentIndex + 1 : 0);
        } else {
          // Swipe right -> prev photo
          onIndexChange(currentIndex > 0 ? currentIndex - 1 : photos.length - 1);
        }
      }
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Visualizador de foto ampliada"
      className="fixed inset-0 z-50 flex flex-col bg-black/95 backdrop-blur-xl animate-fade-in select-none"
    >
      {/* Top Header Bar */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b border-zinc-800/80 bg-zinc-950/80 z-30">
        <div className="flex items-center gap-2.5">
          <span className="rounded-full bg-zinc-800/90 border border-zinc-700/80 px-3 py-1 text-xs sm:text-sm font-bold text-white">
            📷 {currentIndex + 1} de {photos.length}
          </span>
          <span className="hidden sm:inline-block text-xs text-zinc-400">
            {scale > 1 ? 'Arraste para mover a imagem' : 'Dê 2 toques ou use a pinça para zoom'}
          </span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {/* Quick Zoom Indicator */}
          {scale > 1 && (
            <span className="rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-xs font-bold text-amber-300">
              {scale.toFixed(1)}x
            </span>
          )}

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer"
            aria-label="Fechar visualizador"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Main Image Stage */}
      <div
        ref={containerRef}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onDoubleClick={(e) => handleDoubleTap(e.clientX, e.clientY)}
        className={`relative flex-1 w-full flex items-center justify-center overflow-hidden touch-none ${
          scale > 1 ? (isDragging ? 'cursor-grabbing' : 'cursor-grab') : 'cursor-zoom-in'
        }`}
      >
        {/* Ambient blurred backdrop */}
        <img
          src={currentPhoto}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover opacity-15 blur-2xl scale-110 pointer-events-none"
        />

        {/* Scaled/Panned Photo */}
        <img
          src={currentPhoto}
          alt={`Foto ${currentIndex + 1}`}
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transition: isDragging ? 'none' : 'transform 0.2s cubic-bezier(0.2, 0, 0, 1)',
          }}
          className="max-h-[85vh] max-w-[95vw] sm:max-w-[90vw] object-contain pointer-events-none select-none drop-shadow-2xl will-change-transform"
        />

        {/* Desktop / Tablet Navigation Arrows (visible only when not zoomed in) */}
        {photos.length > 1 && scale === 1 && (
          <>
            <button
              type="button"
              onClick={() => onIndexChange(currentIndex > 0 ? currentIndex - 1 : photos.length - 1)}
              className="absolute left-3 sm:left-6 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-black/60 border border-white/10 text-white backdrop-blur-md hover:bg-black/90 active:scale-95 transition cursor-pointer"
              aria-label="Foto anterior"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <button
              type="button"
              onClick={() => onIndexChange(currentIndex < photos.length - 1 ? currentIndex + 1 : 0)}
              className="absolute right-3 sm:right-6 top-1/2 -translate-y-1/2 z-20 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-black/60 border border-white/10 text-white backdrop-blur-md hover:bg-black/90 active:scale-95 transition cursor-pointer"
              aria-label="Próxima foto"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          </>
        )}
      </div>

      {/* Bottom Floating Control Bar */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-t border-zinc-800/80 bg-zinc-950/80 z-30">
        {/* Mobile touch hint */}
        <div className="sm:hidden text-[11px] text-zinc-400 font-medium">
          {scale > 1 ? 'Arraste para mover' : 'Toque 2x ou pince para zoom'}
        </div>
        <div className="hidden sm:block text-xs text-zinc-400">
          Atalhos: Esc (fechar), Setas (navegar), Duplo clique (zoom)
        </div>

        {/* Zoom Action Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={handleZoomOut}
            disabled={scale <= 1}
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-zinc-200 hover:text-white hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            aria-label="Diminuir zoom"
            title="Diminuir zoom"
          >
            <ZoomOut className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
          </button>

          {scale > 1 ? (
            <button
              type="button"
              onClick={resetZoom}
              className="flex items-center gap-1.5 px-3 h-9 sm:h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 hover:bg-amber-500/30 font-bold text-xs transition cursor-pointer"
              aria-label="Redefinir zoom"
              title="Redefinir tamanho original"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>1x</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleDoubleTap(window.innerWidth / 2, window.innerHeight / 2)}
              className="flex items-center gap-1.5 px-3 h-9 sm:h-10 rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-zinc-200 hover:text-white hover:bg-zinc-700 font-bold text-xs transition cursor-pointer"
              aria-label="Ampliar foto"
              title="Ampliar para 2.5x"
            >
              <Maximize2 className="h-3.5 w-3.5 text-amber-400" />
              <span>Ampliar</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleZoomIn}
            disabled={scale >= 4}
            className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-xl bg-zinc-800/80 border border-zinc-700/60 text-zinc-200 hover:text-white hover:bg-zinc-700 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer"
            aria-label="Aumentar zoom"
            title="Aumentar zoom"
          >
            <ZoomIn className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
