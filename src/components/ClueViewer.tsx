import React, { useState, useEffect } from 'react';
import { ClueItem } from '../types/game';
import { Camera, FileText, MapPin, Clock, Lock, Sparkles, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

interface ClueViewerProps {
  clues: ClueItem[];
  unlockedCount: number; // 1 to 5
  isCompleted?: boolean;
  originalUrl?: string;
}

export const ClueViewer: React.FC<ClueViewerProps> = ({
  clues,
  unlockedCount,
  isCompleted,
  originalUrl,
}) => {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Collect all currently unlocked photos
  const coverClue = clues.find((c) => c.type === 'title_and_cover');
  const galleryClue = clues.find((c) => c.type === 'gallery');
  const descriptionClue = clues.find((c) => c.type === 'description');
  const locationClue = clues.find((c) => c.type === 'location');
  const timeClue = clues.find((c) => c.type === 'time');

  // Reset active photo to 0 whenever the car or cover image changes
  useEffect(() => {
    setActivePhotoIndex(0);
  }, [coverClue?.content.coverImageUrl]);

  const isGalleryUnlocked = unlockedCount >= 2;
  const isDescriptionUnlocked = unlockedCount >= 3;
  const isLocationUnlocked = unlockedCount >= 4;
  const isTimeUnlocked = unlockedCount >= 5;

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
    setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : allPhotos.length - 1));
  };

  const handleNextPhoto = () => {
    setActivePhotoIndex((prev) => (prev < allPhotos.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="space-y-4 sm:space-y-5">
      {/* Photo Stage */}
      <div id="clue-section-gallery" className="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-zinc-800 bg-zinc-900 shadow-xl scroll-mt-20">
        <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full bg-zinc-950 flex items-center justify-center overflow-hidden">
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
                className="relative z-10 max-h-full max-w-full object-contain transition-all duration-300 select-none"
              />
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center text-zinc-600">
              <Camera className="h-12 w-12" />
            </div>
          )}

          {/* Photo Counter & Badge */}
          <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 flex items-center gap-2">
            <span className="rounded-full bg-black/75 px-3 py-1 text-xs sm:text-sm font-bold text-white backdrop-blur-md border border-white/10">
              📷 {currentPhotoIndex + 1}/{allPhotos.length}
            </span>
            {isGalleryUnlocked && (
              <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/90 px-3 py-1 text-xs sm:text-sm font-bold text-white backdrop-blur-md shadow-md">
                <Sparkles className="h-3.5 w-3.5" /> Mais fotos liberadas
              </span>
            )}
          </div>

          {/* Gallery navigation controls */}
          {allPhotos.length > 1 && (
            <>
              <button
                onClick={handlePrevPhoto}
                className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/60 p-2.5 sm:p-3 text-white backdrop-blur-md hover:bg-black/90 active:scale-95 transition cursor-pointer"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>
              <button
                onClick={handleNextPhoto}
                className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 z-20 rounded-full bg-black/60 p-2.5 sm:p-3 text-white backdrop-blur-md hover:bg-black/90 active:scale-95 transition cursor-pointer"
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

      {/* Secondary Clues Cards Grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Clue 3: Description */}
        <div
          id="clue-section-description"
          className={`relative rounded-2xl border p-4 sm:p-5 transition-all scroll-mt-20 ${
            isDescriptionUnlocked
              ? 'border-zinc-800 bg-zinc-900/90 text-zinc-200'
              : 'border-zinc-900 bg-zinc-950/50 text-zinc-600'
          }`}
        >
          <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
            <span className="flex items-center gap-2 text-zinc-400">
              <FileText className="h-4 w-4 text-amber-400" /> Pista 3: Descrição
            </span>
            {!isDescriptionUnlocked && (
              <span className="flex items-center gap-1 text-xs text-zinc-500">
                <Lock className="h-3.5 w-3.5" /> Palpite 3
              </span>
            )}
          </div>
          <div className="mt-2.5 text-xs sm:text-sm leading-relaxed">
            {isDescriptionUnlocked ? (
              <p className="italic text-zinc-300 whitespace-pre-line">
                "{descriptionClue?.content.description}"
              </p>
            ) : (
              <p className="italic text-zinc-600">
                A descrição do vendedor será revelada após o 2º palpite.
              </p>
            )}
          </div>
        </div>

        {/* Clue 4 & 5: Location & Time */}
        <div className="space-y-3">
          {/* Location */}
          <div
            id="clue-section-location"
            className={`rounded-2xl border p-4 transition-all scroll-mt-20 ${
              isLocationUnlocked
                ? 'border-zinc-800 bg-zinc-900/90 text-zinc-200'
                : 'border-zinc-900 bg-zinc-950/50 text-zinc-600'
            }`}
          >
            <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
              <span className="flex items-center gap-2 text-zinc-400">
                <MapPin className="h-4 w-4 text-rose-400" /> Pista 4: Cidade
              </span>
              {!isLocationUnlocked && (
                <span className="flex items-center gap-1 text-xs text-zinc-500">
                  <Lock className="h-3.5 w-3.5" /> Palpite 4
                </span>
              )}
            </div>
            <div className="mt-1.5 text-sm sm:text-base font-semibold">
              {isLocationUnlocked && locationClue?.content.location ? (
                <span className="text-zinc-100">
                  📍 {locationClue.content.location.city} — {locationClue.content.location.state}
                </span>
              ) : (
                <span className="text-xs sm:text-sm text-zinc-600">Cidade e estado bloqueados</span>
              )}
            </div>
          </div>

          {/* Time on Market */}
          <div
            id="clue-section-time"
            className={`rounded-2xl border p-4 transition-all scroll-mt-20 ${
              isTimeUnlocked
                ? 'border-zinc-800 bg-zinc-900/90 text-zinc-200'
                : 'border-zinc-900 bg-zinc-950/50 text-zinc-600'
            }`}
          >
            <div className="flex items-center justify-between text-xs sm:text-sm font-bold">
              <span className="flex items-center gap-2 text-zinc-400">
                <Clock className="h-4 w-4 text-sky-400" /> Pista 5: Tempo
              </span>
              {!isTimeUnlocked && (
                <span className="flex items-center gap-1 text-xs text-zinc-500">
                  <Lock className="h-3.5 w-3.5" /> Palpite 5
                </span>
              )}
            </div>
            <div className="mt-1.5 text-xs sm:text-sm">
              {isTimeUnlocked && timeClue?.content.timeOnMarket ? (
                <span className="font-semibold text-zinc-200">
                  ⏱️ {timeClue.content.timeOnMarket}
                </span>
              ) : (
                <span className="text-xs sm:text-sm text-zinc-600">Tempo de publicação bloqueado</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
