import React, { useState } from 'react';
import { ClueItem } from '../types/game';
import { Camera, FileText, MapPin, Clock, Lock, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';

interface ClueViewerProps {
  clues: ClueItem[];
  unlockedCount: number; // 1 to 5
}

export const ClueViewer: React.FC<ClueViewerProps> = ({ clues, unlockedCount }) => {
  const [activePhotoIndex, setActivePhotoIndex] = useState(0);

  // Collect all currently unlocked photos
  const coverClue = clues.find((c) => c.type === 'title_and_cover');
  const galleryClue = clues.find((c) => c.type === 'gallery');
  const descriptionClue = clues.find((c) => c.type === 'description');
  const locationClue = clues.find((c) => c.type === 'location');
  const timeClue = clues.find((c) => c.type === 'time');

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

  const handlePrevPhoto = () => {
    setActivePhotoIndex((prev) => (prev > 0 ? prev - 1 : allPhotos.length - 1));
  };

  const handleNextPhoto = () => {
    setActivePhotoIndex((prev) => (prev < allPhotos.length - 1 ? prev + 1 : 0));
  };

  return (
    <div className="space-y-4">
      {/* Photo Stage */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 shadow-xl">
        <div className="relative aspect-[16/10] w-full bg-zinc-950 sm:aspect-[16/9]">
          {allPhotos.length > 0 ? (
            <img
              src={allPhotos[activePhotoIndex] || allPhotos[0]}
              alt="Foto do anúncio"
              className="h-full w-full object-cover transition-opacity duration-300"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-zinc-600">
              <Camera className="h-12 w-12" />
            </div>
          )}

          {/* Photo Counter & Badge */}
          <div className="absolute bottom-3 left-3 flex items-center gap-2">
            <span className="rounded-full bg-black/70 px-2.5 py-1 text-xs font-semibold text-white backdrop-blur-md">
              📷 {activePhotoIndex + 1}/{allPhotos.length}
            </span>
            {isGalleryUnlocked && (
              <span className="flex items-center gap-1 rounded-full bg-emerald-500/80 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur-md">
                <Sparkles className="h-3 w-3" /> Mais fotos liberadas
              </span>
            )}
          </div>

          {/* Gallery navigation controls */}
          {allPhotos.length > 1 && (
            <>
              <button
                onClick={handlePrevPhoto}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white backdrop-blur-md hover:bg-black/90 active:scale-95 transition"
                aria-label="Foto anterior"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={handleNextPhoto}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/60 p-2 text-white backdrop-blur-md hover:bg-black/90 active:scale-95 transition"
                aria-label="Próxima foto"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </div>

        {/* Title Bar (Clue 1) */}
        <div className="border-t border-zinc-800/80 bg-zinc-900/95 p-3.5">
          <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
            Pista 1 • Anúncio
          </div>
          <h2 className="mt-0.5 text-base font-bold text-zinc-100 sm:text-lg">
            {coverClue?.content.title || 'Carro Anunciado'}
          </h2>
        </div>
      </div>

      {/* Secondary Clues Cards Grid */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        {/* Clue 3: Description */}
        <div
          className={`relative rounded-xl border p-3.5 transition-all ${
            isDescriptionUnlocked
              ? 'border-zinc-800 bg-zinc-900/90 text-zinc-200'
              : 'border-zinc-900 bg-zinc-950/50 text-zinc-600'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <FileText className="h-3.5 w-3.5 text-amber-400" /> Pista 3: Descrição
            </span>
            {!isDescriptionUnlocked && (
              <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                <Lock className="h-3 w-3" /> Palpite 3
              </span>
            )}
          </div>
          <div className="mt-2 text-xs leading-relaxed">
            {isDescriptionUnlocked ? (
              <p className="line-clamp-4 italic text-zinc-300">
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
        <div className="space-y-2.5">
          {/* Location */}
          <div
            className={`rounded-xl border p-3 transition-all ${
              isLocationUnlocked
                ? 'border-zinc-800 bg-zinc-900/90 text-zinc-200'
                : 'border-zinc-900 bg-zinc-950/50 text-zinc-600'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <MapPin className="h-3.5 w-3.5 text-rose-400" /> Pista 4: Cidade
              </span>
              {!isLocationUnlocked && (
                <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                  <Lock className="h-3 w-3" /> Palpite 4
                </span>
              )}
            </div>
            <div className="mt-1 text-sm font-semibold">
              {isLocationUnlocked && locationClue?.content.location ? (
                <span className="text-zinc-100">
                  📍 {locationClue.content.location.city} — {locationClue.content.location.state}
                </span>
              ) : (
                <span className="text-xs text-zinc-600">Cidade e estado bloqueados</span>
              )}
            </div>
          </div>

          {/* Time on Market */}
          <div
            className={`rounded-xl border p-3 transition-all ${
              isTimeUnlocked
                ? 'border-zinc-800 bg-zinc-900/90 text-zinc-200'
                : 'border-zinc-900 bg-zinc-950/50 text-zinc-600'
            }`}
          >
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-zinc-400">
                <Clock className="h-3.5 w-3.5 text-sky-400" /> Pista 5: Tempo
              </span>
              {!isTimeUnlocked && (
                <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                  <Lock className="h-3 w-3" /> Palpite 5
                </span>
              )}
            </div>
            <div className="mt-1 text-xs">
              {isTimeUnlocked && timeClue?.content.timeOnMarket ? (
                <span className="font-medium text-zinc-200">
                  ⏱️ {timeClue.content.timeOnMarket}
                </span>
              ) : (
                <span className="text-zinc-600">Tempo de publicação bloqueado</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
