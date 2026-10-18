import React, { useState, useEffect } from 'react';
import { ClueItem } from '../types/game';
import { Camera, FileText, MapPin, Clock, Lock, Sparkles, ChevronLeft, ChevronRight, ExternalLink, Maximize2 } from 'lucide-react';
import { PhotoLightboxModal } from './PhotoLightboxModal';

export type ClueDisclosureMode = 'clean' | 'compact-indicator' | 'classic';

interface ClueViewerProps {
  clues: ClueItem[];
  unlockedCount: number; // 1 to 5
  isCompleted?: boolean;
  originalUrl?: string;
  isBalancedLayout?: boolean;
  highContrastLocks?: boolean;
  unlockedClueGlow?: boolean;
  clueDisclosureMode?: ClueDisclosureMode;
}

export const ClueViewer: React.FC<ClueViewerProps> = ({
  clues,
  unlockedCount,
  isCompleted,
  originalUrl,
  isBalancedLayout = true,
  highContrastLocks = true,
  unlockedClueGlow = true,
  clueDisclosureMode = 'compact-indicator',
}) => {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);
  const [hasSwitchedPhoto, setHasSwitchedPhoto] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const isLatestClue = (clueNumber: number) => {
    return unlockedClueGlow && !isCompleted && unlockedCount === clueNumber;
  };

  // Collect all currently unlocked photos
  const coverClue = clues.find((c) => c.type === 'title_and_cover');
  const galleryClue = clues.find((c) => c.type === 'gallery');
  const descriptionClue = clues.find((c) => c.type === 'description');
  const locationClue = clues.find((c) => c.type === 'location');
  const timeClue = clues.find((c) => c.type === 'time');

  // Reset active photo to 0 whenever the car or cover image changes
  useEffect(() => {
    setActivePhotoIndex(0);
    setHasSwitchedPhoto(false);
  }, [coverClue?.content.coverImageUrl]);

  const isGalleryUnlocked = Boolean(isCompleted || unlockedCount >= 2);
  const isDescriptionUnlocked = Boolean(isCompleted || unlockedCount >= 3);
  const isLocationUnlocked = Boolean(isCompleted || unlockedCount >= 4);
  const isTimeUnlocked = Boolean(isCompleted || unlockedCount >= 5);

  const allPhotos: string[] = [];
  if (coverClue?.content.coverImageUrl) {
    allPhotos.push(coverClue.content.coverImageUrl);
  }
  if (isGalleryUnlocked && galleryClue?.content.images) {
    // Add additional unique photos
    galleryClue.content.images.forEach((img) => {
      if (!allPhotos.includes(img)) allPhotos.push(img);
    });
  }

  // Safety clamp so index can never exceed available unlocked photos (prevents 5/1 bug)
  const currentPhotoIndex = allPhotos.length > 0 ? Math.min(activePhotoIndex, allPhotos.length - 1) : 0;

  const handlePrevPhoto = () => {
    setHasSwitchedPhoto(true);
    setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : allPhotos.length - 1));
  };

  const handleNextPhoto = () => {
    setHasSwitchedPhoto(true);
    setActivePhotoIndex((prev) => (prev < allPhotos.length - 1 ? prev + 1 : 0));
  };

  const handleSelectPhoto = (idx: number) => {
    setHasSwitchedPhoto(true);
    setActivePhotoIndex(idx);
  };

  // Touch Swipe detection for mobile devices
  const [touchStartX, setTouchStartX] = useState<number | null>(null);
  const [touchEndX, setTouchEndX] = useState<number | null>(null);
  const [touchStartY, setTouchStartY] = useState<number | null>(null);

  const minSwipeDistance = 40;

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchEndX(null);
    setTouchStartX(e.targetTouches[0].clientX);
    setTouchStartY(e.targetTouches[0].clientY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEndX(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null || touchEndX === null || allPhotos.length <= 1) return;
    const distanceX = touchStartX - touchEndX;
    const distanceY = Math.abs((touchStartY ?? 0) - e.changedTouches[0].clientY);

    // Only swipe if horizontal motion is significantly larger than vertical motion
    if (Math.abs(distanceX) > distanceY && Math.abs(distanceX) > minSwipeDistance) {
      if (distanceX > 0) {
        handleNextPhoto();
      } else {
        handlePrevPhoto();
      }
    }
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Photo Stage */}
      <div
        id="clue-section-gallery"
        className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border transition-all duration-300 scroll-mt-20 ${
          isLatestClue(2)
            ? 'border-amber-500/60 ring-1 ring-amber-400/40 shadow-[0_0_25px_-5px_rgba(245,158,11,0.28)] bg-zinc-900'
            : 'border-zinc-800 bg-zinc-900 shadow-xl'
        }`}
      >
        <div
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onClick={() => allPhotos.length > 0 && setIsLightboxOpen(true)}
          className={`relative aspect-[4/3] sm:aspect-[16/10] w-full bg-zinc-950 flex items-center justify-center overflow-hidden touch-pan-y select-none ${
            allPhotos.length > 0 ? 'cursor-zoom-in group' : ''
          }`}
          title={allPhotos.length > 0 ? 'Toque ou clique para ver foto em tela cheia com zoom' : undefined}
        >
          {allPhotos.length > 0 ? (
            <>
              {/* Ambient blurred backdrop */}
              <img
                src={allPhotos[currentPhotoIndex] || allPhotos[0]}
                alt=""
                aria-hidden="true"
                className="absolute inset-0 h-full w-full object-cover opacity-25 blur-xl scale-110 pointer-events-none select-none"
              />
              {/* Main uncropped photo */}
              <img
                src={allPhotos[currentPhotoIndex] || allPhotos[0]}
                alt="Foto do anúncio"
                className="relative z-10 max-h-full max-w-full object-contain transition-all duration-300 select-none pointer-events-none group-hover:scale-[1.015]"
              />
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-zinc-600">
              <Camera className="h-12 w-12" />
            </div>
          )}

          {/* Expand / Fullscreen Badge Button */}
          {allPhotos.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxOpen(true);
              }}
              className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-1.5 rounded-full bg-black/70 hover:bg-black/90 active:scale-95 px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-bold text-white backdrop-blur-md border border-white/15 transition cursor-pointer shadow-lg"
              aria-label="Abrir foto em tela cheia com zoom"
              title="Abrir em tela cheia com zoom"
            >
              <Maximize2 className="h-3.5 w-3.5 text-amber-400" />
              <span className="hidden sm:inline">Ampliar</span>
            </button>
          )}

          {/* Photo Counter & Badge */}
          <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 flex items-center gap-2">
            <span className="rounded-full bg-black/75 px-3 py-1 text-xs sm:text-sm font-bold text-white backdrop-blur-md border border-white/10">
              📷 {currentPhotoIndex + 1}/{allPhotos.length}
            </span>
            {isGalleryUnlocked && !hasSwitchedPhoto && (
              <span
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs sm:text-sm font-bold backdrop-blur-md shadow-md transition-all ${
                  isLatestClue(2)
                    ? 'bg-amber-500 text-zinc-950 ring-2 ring-amber-300 animate-pulse'
                    : 'bg-emerald-500/90 text-white'
                }`}
              >
                <Sparkles className="h-3.5 w-3.5" /> Mais fotos liberadas
              </span>
            )}
          </div>

          {/* Dots pagination for mobile and quick navigation */}
          {allPhotos.length > 1 && (
            <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20 flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1.5 backdrop-blur-md border border-white/10">
              {allPhotos.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectPhoto(idx);
                  }}
                  aria-label={`Ir para foto ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                    idx === currentPhotoIndex
                      ? 'w-4 bg-amber-400'
                      : 'w-1.5 bg-white/40 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Gallery navigation controls */}
          {allPhotos.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevPhoto();
                }}
                className="hidden sm:flex absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/60 p-2.5 sm:p-3 text-white backdrop-blur-md hover:bg-black/90 active:scale-95 transition cursor-pointer"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextPhoto();
                }}
                className="hidden sm:flex absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/60 p-2.5 sm:p-3 text-white backdrop-blur-md hover:bg-black/90 active:scale-95 transition cursor-pointer"
                aria-label="Próxima foto"
              >
                <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
            </>
          )}
        </div>

        {/* Title Bar (Clue 1) */}
        <div className="border-t border-zinc-800/80 bg-zinc-900/95 p-4 sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-amber-400">
              Pista 1 • Anúncio
            </span>
            {isCompleted && originalUrl && (
              <a
                href={originalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 text-xs font-bold text-amber-300 hover:bg-amber-500/20 transition cursor-pointer"
              >
                Abrir Anúncio na Web <ExternalLink className="h-3.5 w-3.5 text-amber-400" />
              </a>
            )}
          </div>
          <h2 className="mt-1 text-base sm:text-xl font-extrabold text-zinc-100">
            {coverClue?.content.title || 'Carro Anunciado'}
          </h2>
        </div>
      </div>

      {/* Compact Upcoming Clues Indicator (Option 2) */}
      {clueDisclosureMode === 'compact-indicator' && !isCompleted && (!isGalleryUnlocked || !isDescriptionUnlocked || !isLocationUnlocked || !isTimeUnlocked) && (
        <div className="flex flex-wrap items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-400 animate-in fade-in">
          <span className="flex items-center gap-1 font-semibold text-zinc-300 mr-1">
            <Lock className="h-3 w-3 text-amber-400" /> Próximas pistas:
          </span>
          {!isGalleryUnlocked && (
            <span className="inline-flex items-center gap-1 rounded-md bg-zinc-800/90 border border-zinc-700/60 px-2 py-0.5 text-[11px] text-zinc-300 font-medium">
              <Camera className="h-3 w-3 text-amber-400" /> +Fotos (2º chute)
            </span>
          )}
          {!isDescriptionUnlocked && (
            <span className="inline-flex items-center gap-1 rounded-md bg-zinc-800/90 border border-zinc-700/60 px-2 py-0.5 text-[11px] text-zinc-300 font-medium">
              <FileText className="h-3 w-3 text-amber-400" /> Descrição (3º chute)
            </span>
          )}
          {!isLocationUnlocked && (
            <span className="inline-flex items-center gap-1 rounded-md bg-zinc-800/90 border border-zinc-700/60 px-2 py-0.5 text-[11px] text-zinc-300 font-medium">
              <MapPin className="h-3 w-3 text-rose-400" /> Cidade (4º chute)
            </span>
          )}
          {!isTimeUnlocked && (
            <span className="inline-flex items-center gap-1 rounded-md bg-zinc-800/90 border border-zinc-700/60 px-2 py-0.5 text-[11px] text-zinc-300 font-medium">
              <Clock className="h-3 w-3 text-sky-400" /> Tempo (5º chute)
            </span>
          )}
        </div>
      )}

      {/* Secondary Clues Cards Grid */}
      {isBalancedLayout ? (
        /* Balanced Layout: Description full-width, Location & Time side-by-side */
        (clueDisclosureMode === 'classic' || isDescriptionUnlocked || isLocationUnlocked || isTimeUnlocked) && (
          <div className="space-y-3">
            {/* Clue 3: Description Full Width */}
            {(clueDisclosureMode === 'classic' || isDescriptionUnlocked) && (
              <div
                id="clue-section-description"
                className={`relative rounded-2xl border p-4 sm:p-5 transition-all duration-300 scroll-mt-20 animate-in fade-in ${
                  isDescriptionUnlocked
                    ? isLatestClue(3)
                      ? 'border-amber-500/60 ring-1 ring-amber-400/40 shadow-[0_0_22px_-4px_rgba(245,158,11,0.25)] bg-zinc-900/95 text-zinc-100'
                      : 'border-zinc-800 bg-zinc-900/90 text-zinc-200'
                    : highContrastLocks
                    ? 'border-zinc-800/80 bg-zinc-950/70 text-zinc-400'
                    : 'border-zinc-900 bg-zinc-950/50 text-zinc-600'
                }`}
              >
                <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
                  <span className="flex items-center gap-2 text-zinc-400">
                    <FileText className="h-4 w-4 text-amber-400" /> Pista 3: Descrição
                  </span>
                  <div className="flex items-center gap-1.5">
                    {isLatestClue(3) && (
                      <span className="flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                        <Sparkles className="h-3 w-3 text-amber-400" /> Nova pista
                      </span>
                    )}
                    {!isDescriptionUnlocked && (
                      <span className={`flex items-center gap-1 text-xs ${highContrastLocks ? 'text-amber-400/90 font-semibold' : 'text-zinc-500'}`}>
                        <Lock className="h-3.5 w-3.5" /> Palpite 3
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-2 text-xs sm:text-sm leading-relaxed">
                  {isDescriptionUnlocked ? (
                    <p className="italic text-zinc-300 whitespace-pre-line">
                      "{descriptionClue?.content.description}"
                    </p>
                  ) : (
                    <p className={`text-xs sm:text-sm font-normal ${highContrastLocks ? 'text-zinc-400' : 'text-zinc-600'}`}>
                      Descrição bloqueada
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Clue 4 & 5: Location & Time Side by Side in 2 cols */}
            {(clueDisclosureMode === 'classic' || isLocationUnlocked || isTimeUnlocked) && (
              <div className={`grid gap-3 ${
                clueDisclosureMode !== 'classic' && (!isLocationUnlocked || !isTimeUnlocked)
                  ? 'grid-cols-1'
                  : 'grid-cols-1 sm:grid-cols-2'
              }`}>
                {/* Location */}
                {(clueDisclosureMode === 'classic' || isLocationUnlocked) && (
                  <div
                    id="clue-section-location"
                    className={`rounded-2xl border p-4 transition-all duration-300 scroll-mt-20 animate-in fade-in ${
                      isLocationUnlocked
                        ? isLatestClue(4)
                          ? 'border-amber-500/60 ring-1 ring-amber-400/40 shadow-[0_0_22px_-4px_rgba(245,158,11,0.25)] bg-zinc-900/95 text-zinc-100'
                          : 'border-zinc-800 bg-zinc-900/90 text-zinc-200'
                        : highContrastLocks
                        ? 'border-zinc-800/80 bg-zinc-950/70 text-zinc-400'
                        : 'border-zinc-900 bg-zinc-950/50 text-zinc-600'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
                      <span className="flex items-center gap-2 text-zinc-400">
                        <MapPin className="h-4 w-4 text-rose-400" /> Pista 4: Cidade
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isLatestClue(4) && (
                          <span className="flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                            <Sparkles className="h-3 w-3 text-amber-400" /> Nova pista
                          </span>
                        )}
                        {!isLocationUnlocked && (
                          <span className={`flex items-center gap-1 text-xs ${highContrastLocks ? 'text-amber-400/90 font-semibold' : 'text-zinc-500'}`}>
                            <Lock className="h-3.5 w-3.5" /> Palpite 4
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2">
                      {isLocationUnlocked && locationClue?.content.location ? (
                        <span className="text-sm sm:text-base font-semibold text-zinc-100">
                          📍 {locationClue.content.location.city} — {locationClue.content.location.state}
                        </span>
                      ) : (
                        <span className={`text-xs sm:text-sm font-normal ${highContrastLocks ? 'text-zinc-400' : 'text-zinc-600'}`}>
                          Cidade e estado bloqueados
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Time on Market */}
                {(clueDisclosureMode === 'classic' || isTimeUnlocked) && (
                  <div
                    id="clue-section-time"
                    className={`rounded-2xl border p-4 transition-all duration-300 scroll-mt-20 animate-in fade-in ${
                      isTimeUnlocked
                        ? isLatestClue(5)
                          ? 'border-amber-500/60 ring-1 ring-amber-400/40 shadow-[0_0_22px_-4px_rgba(245,158,11,0.25)] bg-zinc-900/95 text-zinc-100'
                          : 'border-zinc-800 bg-zinc-900/90 text-zinc-200'
                        : highContrastLocks
                        ? 'border-zinc-800/80 bg-zinc-950/70 text-zinc-400'
                        : 'border-zinc-900 bg-zinc-950/50 text-zinc-600'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
                      <span className="flex items-center gap-2 text-zinc-400">
                        <Clock className="h-4 w-4 text-sky-400" /> Pista 5: Tempo
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isLatestClue(5) && (
                          <span className="flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                            <Sparkles className="h-3 w-3 text-amber-400" /> Nova pista
                          </span>
                        )}
                        {!isTimeUnlocked && (
                          <span className={`flex items-center gap-1 text-xs ${highContrastLocks ? 'text-amber-400/90 font-semibold' : 'text-zinc-500'}`}>
                            <Lock className="h-3.5 w-3.5" /> Palpite 5
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2">
                      {isTimeUnlocked && timeClue?.content.timeOnMarket ? (
                        <span className="text-xs sm:text-sm font-semibold text-zinc-200">
                          ⏱️ {timeClue.content.timeOnMarket}
                        </span>
                      ) : (
                        <span className={`text-xs sm:text-sm font-normal ${highContrastLocks ? 'text-zinc-400' : 'text-zinc-600'}`}>
                          Tempo de publicação bloqueado
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      ) : (
        /* Legacy 2-column layout (Left: Description, Right: Location + Time stacked) */
        (clueDisclosureMode === 'classic' || isDescriptionUnlocked || isLocationUnlocked || isTimeUnlocked) && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {/* Clue 3: Description */}
            {(clueDisclosureMode === 'classic' || isDescriptionUnlocked) && (
              <div
                id="clue-section-description"
                className={`relative rounded-2xl border p-4 sm:p-5 transition-all duration-300 scroll-mt-20 animate-in fade-in ${
                  isDescriptionUnlocked
                    ? isLatestClue(3)
                      ? 'border-amber-500/60 ring-1 ring-amber-400/40 shadow-[0_0_22px_-4px_rgba(245,158,11,0.25)] bg-zinc-900/95 text-zinc-100'
                      : 'border-zinc-800 bg-zinc-900/90 text-zinc-200'
                    : highContrastLocks
                    ? 'border-zinc-800/80 bg-zinc-950/70 text-zinc-400'
                    : 'border-zinc-900 bg-zinc-950/50 text-zinc-600'
                }`}
              >
                <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
                  <span className="flex items-center gap-2 text-zinc-400">
                    <FileText className="h-4 w-4 text-amber-400" /> Pista 3: Descrição
                  </span>
                  <div className="flex items-center gap-1.5">
                    {isLatestClue(3) && (
                      <span className="flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                        <Sparkles className="h-3 w-3 text-amber-400" /> Nova pista
                      </span>
                    )}
                    {!isDescriptionUnlocked && (
                      <span className={`flex items-center gap-1 text-xs ${highContrastLocks ? 'text-amber-400/90 font-semibold' : 'text-zinc-500'}`}>
                        <Lock className="h-3.5 w-3.5" /> Palpite 3
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-2 text-xs sm:text-sm leading-relaxed">
                  {isDescriptionUnlocked ? (
                    <p className="italic text-zinc-300 whitespace-pre-line">
                      "{descriptionClue?.content.description}"
                    </p>
                  ) : (
                    <p className={`text-xs sm:text-sm font-normal ${highContrastLocks ? 'text-zinc-400' : 'text-zinc-600'}`}>
                      Descrição bloqueada
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Clue 4 & 5: Location & Time */}
            {(clueDisclosureMode === 'classic' || isLocationUnlocked || isTimeUnlocked) && (
              <div className="space-y-3">
                {/* Location */}
                {(clueDisclosureMode === 'classic' || isLocationUnlocked) && (
                  <div
                    id="clue-section-location"
                    className={`rounded-2xl border p-4 transition-all duration-300 scroll-mt-20 animate-in fade-in ${
                      isLocationUnlocked
                        ? isLatestClue(4)
                          ? 'border-amber-500/60 ring-1 ring-amber-400/40 shadow-[0_0_22px_-4px_rgba(245,158,11,0.25)] bg-zinc-900/95 text-zinc-100'
                          : 'border-zinc-800 bg-zinc-900/90 text-zinc-200'
                        : highContrastLocks
                        ? 'border-zinc-800/80 bg-zinc-950/70 text-zinc-400'
                        : 'border-zinc-900 bg-zinc-950/50 text-zinc-600'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
                      <span className="flex items-center gap-2 text-zinc-400">
                        <MapPin className="h-4 w-4 text-rose-400" /> Pista 4: Cidade
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isLatestClue(4) && (
                          <span className="flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                            <Sparkles className="h-3 w-3 text-amber-400" /> Nova pista
                          </span>
                        )}
                        {!isLocationUnlocked && (
                          <span className={`flex items-center gap-1 text-xs ${highContrastLocks ? 'text-amber-400/90 font-semibold' : 'text-zinc-500'}`}>
                            <Lock className="h-3.5 w-3.5" /> Palpite 4
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2">
                      {isLocationUnlocked && locationClue?.content.location ? (
                        <span className="text-sm sm:text-base font-semibold text-zinc-100">
                          📍 {locationClue.content.location.city} — {locationClue.content.location.state}
                        </span>
                      ) : (
                        <span className={`text-xs sm:text-sm font-normal ${highContrastLocks ? 'text-zinc-400' : 'text-zinc-600'}`}>
                          Cidade e estado bloqueados
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Time on Market */}
                {(clueDisclosureMode === 'classic' || isTimeUnlocked) && (
                  <div
                    id="clue-section-time"
                    className={`rounded-2xl border p-4 transition-all duration-300 scroll-mt-20 animate-in fade-in ${
                      isTimeUnlocked
                        ? isLatestClue(5)
                          ? 'border-amber-500/60 ring-1 ring-amber-400/40 shadow-[0_0_22px_-4px_rgba(245,158,11,0.25)] bg-zinc-900/95 text-zinc-100'
                          : 'border-zinc-800 bg-zinc-900/90 text-zinc-200'
                        : highContrastLocks
                        ? 'border-zinc-800/80 bg-zinc-950/70 text-zinc-400'
                        : 'border-zinc-900 bg-zinc-950/50 text-zinc-600'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
                      <span className="flex items-center gap-2 text-zinc-400">
                        <Clock className="h-4 w-4 text-sky-400" /> Pista 5: Tempo
                      </span>
                      <div className="flex items-center gap-1.5">
                        {isLatestClue(5) && (
                          <span className="flex items-center gap-1 rounded-full bg-amber-500/15 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                            <Sparkles className="h-3 w-3 text-amber-400" /> Nova pista
                          </span>
                        )}
                        {!isTimeUnlocked && (
                          <span className={`flex items-center gap-1 text-xs ${highContrastLocks ? 'text-amber-400/90 font-semibold' : 'text-zinc-500'}`}>
                            <Lock className="h-3.5 w-3.5" /> Palpite 5
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="mt-2">
                      {isTimeUnlocked && timeClue?.content.timeOnMarket ? (
                        <span className="text-xs sm:text-sm font-semibold text-zinc-200">
                          ⏱️ {timeClue.content.timeOnMarket}
                        </span>
                      ) : (
                        <span className={`text-xs sm:text-sm font-normal ${highContrastLocks ? 'text-zinc-400' : 'text-zinc-600'}`}>
                          Tempo de publicação bloqueado
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      )}

      {/* Fullscreen Photo Lightbox Modal */}
      <PhotoLightboxModal
        isOpen={isLightboxOpen}
        photos={allPhotos}
        currentIndex={currentPhotoIndex}
        onClose={() => setIsLightboxOpen(false)}
        onIndexChange={(idx) => {
          setHasSwitchedPhoto(true);
          setActivePhotoIndex(idx);
        }}
      />
    </div>
  );
};
