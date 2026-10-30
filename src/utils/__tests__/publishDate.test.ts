import { describe, it, expect } from 'vitest';
import { getNextAvailablePublishDate } from '../publishDate';

describe('getNextAvailablePublishDate', () => {
  it('retorna a data base (hoje) quando a lista de desafios está vazia', () => {
    const baseDate = new Date(2026, 9, 29); // 2026-10-29
    const result = getNextAvailablePublishDate([], baseDate);
    expect(result).toBe('2026-10-29');
  });

  it('retorna amanhã se a data de hoje já estiver ocupada', () => {
    const baseDate = new Date(2026, 9, 29);
    const challenges = [{ publishDate: '2026-10-29' }];
    const result = getNextAvailablePublishDate(challenges, baseDate);
    expect(result).toBe('2026-10-30');
  });

  it('avança múltiplos dias consecutivos até achar o primeiro dia livre', () => {
    const baseDate = new Date(2026, 9, 29);
    const challenges = [
      { publishDate: '2026-10-29' },
      { publishDate: '2026-10-30' },
      { publishDate: '2026-10-31' },
      { publishDate: '2026-11-01' },
    ];
    const result = getNextAvailablePublishDate(challenges, baseDate);
    expect(result).toBe('2026-11-02');
  });

  it('preenche uma data intermediária caso haja uma lacuna entre os dias', () => {
    const baseDate = new Date(2026, 9, 29);
    const challenges = [
      { publishDate: '2026-10-29' }, // ocupado
      // 2026-10-30 está livre!
      { publishDate: '2026-10-31' }, // ocupado
      { publishDate: '2026-11-01' }, // ocupado
    ];
    const result = getNextAvailablePublishDate(challenges, baseDate);
    expect(result).toBe('2026-10-30');
  });

  it('ignora desafios com datas passadas em relação à data base', () => {
    const baseDate = new Date(2026, 9, 29);
    const challenges = [
      { publishDate: '2026-10-15' },
      { publishDate: '2026-10-20' },
      { publishDate: '2026-10-28' },
    ];
    // Como hoje (29) está livre, deve retornar hoje
    const result = getNextAvailablePublishDate(challenges, baseDate);
    expect(result).toBe('2026-10-29');
  });

  it('lida corretamente com virada de mês e ano', () => {
    const baseDate = new Date(2026, 11, 31); // 2026-12-31
    const challenges = [{ publishDate: '2026-12-31' }];
    const result = getNextAvailablePublishDate(challenges, baseDate);
    expect(result).toBe('2027-01-01');
  });

  it('ignora entradas com datas inválidas ou vazias sem quebrar', () => {
    const baseDate = new Date(2026, 9, 29);
    const challenges = [
      { publishDate: '' },
      { publishDate: '   ' },
      { publishDate: null as any },
      { publishDate: undefined as any },
      { publishDate: '2026-10-29' },
    ];
    const result = getNextAvailablePublishDate(challenges, baseDate);
    expect(result).toBe('2026-10-30');
  });
});
