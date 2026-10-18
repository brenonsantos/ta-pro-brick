import { describe, it, expect } from 'vitest';
import { renderToString } from 'react-dom/server';
import { ClueViewer } from '../ClueViewer';
import { ClueItem } from '../../types/game';

const mockClues: ClueItem[] = [
  {
    id: 1,
    attemptNumber: 1,
    label: 'Título e foto principal',
    type: 'title_and_cover',
    content: {
      title: 'VW Gol 1.6 2012',
      coverImageUrl: 'https://example.com/cover.jpg',
    },
  },
  {
    id: 2,
    attemptNumber: 2,
    label: 'Mais fotos',
    type: 'gallery',
    content: {
      images: ['https://example.com/img1.jpg', 'https://example.com/img2.jpg'],
    },
  },
  {
    id: 3,
    attemptNumber: 3,
    label: 'Descrição',
    type: 'description',
    content: {
      description: 'Carro de único dono, revisado na concessionária.',
    },
  },
  {
    id: 4,
    attemptNumber: 4,
    label: 'Localização',
    type: 'location',
    content: {
      location: {
        city: 'Curitiba',
        state: 'PR',
      },
    },
  },
  {
    id: 5,
    attemptNumber: 5,
    label: 'Tempo de publicação',
    type: 'time',
    content: {
      timeOnMarket: 'Anunciado há 2 semanas',
    },
  },
];

describe('ClueViewer - Disclosure Modes', () => {
  it('clean mode: hides locked cards completely when unlockedCount is 1', () => {
    const html = renderToString(
      <ClueViewer
        clues={mockClues}
        unlockedCount={1}
        clueDisclosureMode="clean"
      />
    );

    // Title and Cover (Clue 1) should be present
    expect(html).toContain('VW Gol 1.6 2012');
    expect(html).toContain('Pista 1 • Anúncio');

    // Locked cards should NOT be present in DOM
    expect(html).not.toContain('id="clue-section-description"');
    expect(html).not.toContain('id="clue-section-location"');
    expect(html).not.toContain('id="clue-section-time"');
    expect(html).not.toContain('Descrição bloqueada');
    expect(html).not.toContain('Cidade e estado bloqueados');
    expect(html).not.toContain('Tempo de publicação bloqueado');

    // Compact indicator should NOT be present in clean mode
    expect(html).not.toContain('Próximas pistas:');
  });

  it('compact-indicator mode: renders compact upcoming clues bar and hides large locked cards', () => {
    const html = renderToString(
      <ClueViewer
        clues={mockClues}
        unlockedCount={1}
        clueDisclosureMode="compact-indicator"
      />
    );

    // Compact bar is present
    expect(html).toContain('Próximas pistas:');
    expect(html).toContain('+Fotos (2º chute)');
    expect(html).toContain('Descrição (3º chute)');
    expect(html).toContain('Cidade (4º chute)');
    expect(html).toContain('Tempo (5º chute)');

    // Large locked cards should NOT be present
    expect(html).not.toContain('id="clue-section-description"');
    expect(html).not.toContain('id="clue-section-location"');
    expect(html).not.toContain('id="clue-section-time"');
  });

  it('compact-indicator mode: updates indicator pills as clues unlock', () => {
    const html = renderToString(
      <ClueViewer
        clues={mockClues}
        unlockedCount={3}
        clueDisclosureMode="compact-indicator"
      />
    );

    // Photos (chute 2) and Description (chute 3) are unlocked, so they shouldn't be in upcoming
    expect(html).not.toContain('+Fotos (2º chute)');
    expect(html).not.toContain('Descrição (3º chute)');

    // Cidade and Tempo remain locked
    expect(html).toContain('Cidade (4º chute)');
    expect(html).toContain('Tempo (5º chute)');

    // Description is now rendered
    expect(html).toContain('id="clue-section-description"');
    expect(html).toContain('Carro de único dono, revisado na concessionária.');
  });

  it('classic mode: renders locked placeholder cards with lock icons', () => {
    const html = renderToString(
      <ClueViewer
        clues={mockClues}
        unlockedCount={1}
        clueDisclosureMode="classic"
      />
    );

    // All card placeholders are rendered
    expect(html).toContain('id="clue-section-description"');
    expect(html).toContain('id="clue-section-location"');
    expect(html).toContain('id="clue-section-time"');
    expect(html).toContain('Descrição bloqueada');
    expect(html).toContain('Cidade e estado bloqueados');
    expect(html).toContain('Tempo de publicação bloqueado');
    expect(html).not.toContain('Próximas pistas:');
  });

  it('reveals all clues when completed and hides compact indicator', () => {
    const html = renderToString(
      <ClueViewer
        clues={mockClues}
        unlockedCount={1}
        isCompleted={true}
        clueDisclosureMode="compact-indicator"
      />
    );

    expect(html).not.toContain('Próximas pistas:');
    expect(html).toContain('Carro de único dono, revisado na concessionária.');
    expect(html).toContain('Curitiba');
    expect(html).toContain('Anunciado há 2 semanas');
  });
});
