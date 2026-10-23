import { describe, it, expect, vi } from 'vitest';
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ImportChallengeModal } from '../ImportChallengeModal';
import * as supabaseModule from '../../services/supabase';

describe('ImportChallengeModal Component', () => {
  it('renderiza o modal fechado retornando null/vazio', () => {
    const html = renderToString(
      React.createElement(ImportChallengeModal, {
        isOpen: false,
        onClose: vi.fn(),
        onImport: vi.fn(),
      })
    );
    expect(html).toBe('');
  });

  it('renderiza o modal aberto com cabeçalho, textarea e botão de bookmarklet', () => {
    vi.spyOn(supabaseModule, 'isSupabaseConfigured').mockReturnValue(false);

    const html = renderToString(
      React.createElement(ImportChallengeModal, {
        isOpen: true,
        onClose: vi.fn(),
        onImport: vi.fn(),
      })
    );

    expect(html).toContain('Importar Dados do Anúncio');
    expect(html).toContain('Cole o JSON ou carregue o arquivo:');
    expect(html).toContain('Extrator do Facebook Marketplace');
    expect(html).toContain('Preencher Formulário');
  });

  it('renderiza a opção de auto-upload para Supabase Storage quando configurado', () => {
    vi.spyOn(supabaseModule, 'isSupabaseConfigured').mockReturnValue(true);

    const html = renderToString(
      React.createElement(ImportChallengeModal, {
        isOpen: true,
        onClose: vi.fn(),
        onImport: vi.fn(),
      })
    );

    expect(html).toContain('Salvar fotos no Supabase Storage automaticamente');
    expect(html).toContain('Baixa as fotos do Facebook CDN');
  });
});
