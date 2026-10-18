/**
 * Gerenciador de histórico do navegador para modais e lightboxes.
 * Permite que o botão/gesto "Voltar" do celular ou navegador feche o modal aberto
 * em vez de sair da página ou navegar para o site anterior.
 */

type ModalEntry = {
  id: string;
  onClose: () => void;
};

// Pilha global dos modais atualmente abertos
const modalStack: ModalEntry[] = [];
let programmaticBackCount = 0;
let isListenerAttached = false;

function handlePopState() {
  // Se o popstate veio de um history.back() programático (ex: usuário clicou no 'X'), ignoramos
  if (programmaticBackCount > 0) {
    programmaticBackCount--;
    return;
  }

  // Se o usuário clicou no botão "Voltar" do navegador/celular
  if (modalStack.length > 0) {
    const top = modalStack.pop();
    if (top) {
      top.onClose();
    }
  }
}

function ensureListener() {
  if (typeof window === 'undefined' || isListenerAttached) return;
  window.addEventListener('popstate', handlePopState);
  isListenerAttached = true;
}

/**
 * Registra que um modal foi aberto.
 * Adiciona uma entrada no histórico do navegador via history.pushState.
 */
export function registerModalOpen(id: string, onClose: () => void): void {
  if (typeof window === 'undefined') return;
  ensureListener();

  // Verifica se o modal já está na pilha para evitar duplicações acidentais
  const existingIdx = modalStack.findIndex((m) => m.id === id);
  if (existingIdx !== -1) {
    modalStack[existingIdx].onClose = onClose;
    return;
  }

  try {
    window.history.pushState(
      { tpbModal: id, timestamp: Date.now() },
      '',
      window.location.href
    );
  } catch {
    // Ambientes restritivos de navegação
  }

  modalStack.push({ id, onClose });
}

/**
 * Atualiza o callback onClose de um modal já aberto (caso a referência mude).
 */
export function updateModalOnClose(id: string, onClose: () => void): void {
  const existing = modalStack.find((m) => m.id === id);
  if (existing) {
    existing.onClose = onClose;
  }
}

/**
 * Registra que um modal foi fechado.
 * Se o modal ainda estiver na pilha (ou seja, fechou via 'X' ou backdrop e não pelo botão Voltar),
 * remove da pilha e desfaz o histórico extra criado via history.back().
 */
export function registerModalClose(id: string): void {
  if (typeof window === 'undefined') return;

  const index = modalStack.findIndex((m) => m.id === id);
  if (index !== -1) {
    const isTop = index === modalStack.length - 1;
    modalStack.splice(index, 1);

    if (isTop) {
      programmaticBackCount++;
      try {
        window.history.back();
      } catch {
        programmaticBackCount = Math.max(0, programmaticBackCount - 1);
      }

      // Timeout de segurança caso o ambiente não dispare popstate
      setTimeout(() => {
        if (programmaticBackCount > 0) {
          programmaticBackCount = 0;
        }
      }, 300);
    }
  }
}

/**
 * Utilitário para testes e inspeção de estado da pilha de modais.
 */
export function getModalStack(): string[] {
  return modalStack.map((m) => m.id);
}

/**
 * Limpa a pilha (usado em testes).
 */
export function resetModalStack(): void {
  modalStack.length = 0;
  programmaticBackCount = 0;
  isListenerAttached = false;
}
