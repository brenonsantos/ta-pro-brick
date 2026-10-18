import { useEffect, useRef } from 'react';
import {
  registerModalOpen,
  registerModalClose,
  updateModalOnClose,
} from '../utils/modalHistoryManager';

/**
 * Hook que sincroniza a abertura de modais com o histórico do navegador.
 * Quando o modal está aberto e o usuário pressiona "Voltar" (no celular ou navegador),
 * o modal fecha em vez de sair da página.
 * Se o modal for fechado pelo 'X' ou backdrop, o histórico é revertido automaticamente.
 */
export function useBrowserBackClose(
  isOpen: boolean,
  onClose?: () => void,
  modalId?: string
): void {
  const isRegisteredRef = useRef(false);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  const id = modalId || 'modal';

  useEffect(() => {
    if (isOpen && onClose) {
      if (!isRegisteredRef.current) {
        registerModalOpen(id, () => {
          onCloseRef.current?.();
        });
        isRegisteredRef.current = true;
      } else {
        updateModalOnClose(id, () => {
          onCloseRef.current?.();
        });
      }
    } else {
      if (isRegisteredRef.current) {
        registerModalClose(id);
        isRegisteredRef.current = false;
      }
    }
  }, [isOpen, id, Boolean(onClose)]);

  // Limpeza ao desmontar o componente
  useEffect(() => {
    return () => {
      if (isRegisteredRef.current) {
        registerModalClose(id);
        isRegisteredRef.current = false;
      }
    };
  }, [id]);
}
