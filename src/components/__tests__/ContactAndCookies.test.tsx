import { describe, it, expect } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { CookieBanner } from '../CookieBanner';
import { ContactModal } from '../ContactModal';
import { AdBannerSlot } from '../AdBannerSlot';

describe('CookieBanner, ContactModal e AdBannerSlot', () => {
  it('renderiza o CookieBanner com texto de LGPD', () => {
    const html = renderToString(React.createElement(CookieBanner));
    expect(html).toContain('Privacidade &amp; Cookies');
    expect(html).toContain('LGPD');
  });

  it('renderiza ContactModal na aba de sugerir anúncio', () => {
    const html = renderToString(
      React.createElement(ContactModal, {
        isOpen: true,
        onClose: () => {},
        initialTab: 'suggest',
      })
    );
    expect(html).toContain('Sugerir');
    expect(html).toContain('Link do Anúncio');
    expect(html).toContain('Enviar por Instagram');
    expect(html).toContain('Enviar por E-mail');
  });

  it('renderiza ContactModal na aba de remover anúncio', () => {
    const html = renderToString(
      React.createElement(ContactModal, {
        isOpen: true,
        onClose: () => {},
        initialTab: 'remove',
      })
    );
    expect(html).toContain('Compromisso de Respeito aos Proprietários');
    expect(html).toContain('Pedir pelo Instagram');
    expect(html).toContain('Solicitar por E-mail');
  });

  it('renderiza ContactModal na aba de redes e contato', () => {
    const html = renderToString(
      React.createElement(ContactModal, {
        isOpen: true,
        onClose: () => {},
        initialTab: 'contact',
      })
    );
    expect(html).toContain('Instagram');
    expect(html).toContain('E-mail');
    expect(html).toContain('taprobrick.jogo@gmail.com');
    expect(html).toContain('instagram.com/taprobrick.jogo');
  });

  it('AdBannerSlot não é renderizado enquanto o jogo não estiver concluído', () => {
    const html = renderToString(React.createElement(AdBannerSlot, { isCompleted: false }));
    expect(html).toBe('');
  });

  it('AdBannerSlot é renderizado de forma não-intrusiva após o jogo concluído', () => {
    const html = renderToString(React.createElement(AdBannerSlot, { isCompleted: true }));
    expect(html).toContain('Espaço Patrocinado');
  });
});
