/**
 * Utilitários para cálculo e verificação de datas de publicação de desafios.
 */

export interface ChallengeWithPublishDate {
  publishDate?: string | null;
}

/**
 * Formata um objeto Date no padrão local 'YYYY-MM-DD'
 */
export function formatDateToIsoString(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Calcula a próxima data de publicação disponível (livre de desafios) a partir de uma data base (padrão: hoje).
 * Se a data base estiver livre, retorna ela mesma.
 * Se já estiver ocupada, avança dia a dia até encontrar a primeira data desocupada.
 */
export function getNextAvailablePublishDate(
  challenges: ChallengeWithPublishDate[],
  baseDate: Date = new Date()
): string {
  const occupiedDates = new Set<string>();

  for (const c of challenges) {
    if (c && typeof c.publishDate === 'string') {
      const trimmed = c.publishDate.trim();
      if (trimmed) {
        occupiedDates.add(trimmed);
      }
    }
  }

  // Cria um cursor clonado para não mutar a data base
  const cursor = new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate());

  // Procura até 365 dias no futuro
  for (let i = 0; i < 365; i++) {
    const dateStr = formatDateToIsoString(cursor);

    if (!occupiedDates.has(dateStr)) {
      return dateStr;
    }

    cursor.setDate(cursor.getDate() + 1);
  }

  // Fallback seguro caso atinja 365 dias cheios
  return formatDateToIsoString(baseDate);
}
