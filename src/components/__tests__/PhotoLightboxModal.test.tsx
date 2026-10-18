import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { PhotoLightboxModal } from '../PhotoLightboxModal';

describe('PhotoLightboxModal Component', () => {
  const mockPhotos = [
    'https://example.com/car1.jpg',
    'https://example.com/car2.jpg',
    'https://example.com/car3.jpg',
  ];

  it('does not render when isOpen is false', () => {
    const html = renderToString(
      React.createElement(PhotoLightboxModal, {
        isOpen: false,
        photos: mockPhotos,
        currentIndex: 0,
        onClose: vi.fn(),
        onIndexChange: vi.fn(),
      })
    );
    expect(html).toBe('');
  });

  it('renders modal with photo and counter when isOpen is true', () => {
    const html = renderToString(
      React.createElement(PhotoLightboxModal, {
        isOpen: true,
        photos: mockPhotos,
        currentIndex: 1,
        onClose: vi.fn(),
        onIndexChange: vi.fn(),
      })
    );

    const cleanHtml = html.replace(/<!--.*?-->/g, '');
    expect(html).toContain('role="dialog"');
    expect(cleanHtml).toContain('2 de 3');
    expect(html).toContain('https://example.com/car2.jpg');
    expect(html).toContain('Fechar visualizador');
    expect(html).toContain('Foto anterior');
    expect(html).toContain('Próxima foto');
  });

  it('renders zoom in and zoom out buttons', () => {
    const html = renderToString(
      React.createElement(PhotoLightboxModal, {
        isOpen: true,
        photos: mockPhotos,
        currentIndex: 0,
        onClose: vi.fn(),
        onIndexChange: vi.fn(),
      })
    );

    expect(html).toContain('Aumentar zoom');
    expect(html).toContain('Diminuir zoom');
    expect(html).toContain('Ampliar');
  });
});
