import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  registerModalOpen,
  registerModalClose,
  getModalStack,
  resetModalStack,
} from '../modalHistoryManager';

describe('modalHistoryManager', () => {
  let listeners: Array<(e: any) => void> = [];
  let pushStateSpy: any;
  let backSpy: any;

  beforeEach(() => {
    listeners = [];
    resetModalStack();

    pushStateSpy = vi.fn();
    backSpy = vi.fn();

    // Mock minimal browser window and history for node test environment
    (global as any).window = {
      addEventListener: vi.fn((event: string, handler: any) => {
        if (event === 'popstate') listeners.push(handler);
      }),
      removeEventListener: vi.fn((_event: string, handler: any) => {
        listeners = listeners.filter((h) => h !== handler);
      }),
      history: {
        pushState: pushStateSpy,
        back: backSpy,
      },
      location: {
        href: 'https://taprobrick.com.br/',
      },
    };
  });

  afterEach(() => {
    delete (global as any).window;
    vi.restoreAllMocks();
  });

  it('pushes modal to stack and calls history.pushState when opened', () => {
    const onClose = vi.fn();

    registerModalOpen('test-modal', onClose);

    expect(getModalStack()).toEqual(['test-modal']);
    expect(pushStateSpy).toHaveBeenCalledTimes(1);
    expect(pushStateSpy).toHaveBeenCalledWith(
      expect.objectContaining({ tpbModal: 'test-modal' }),
      '',
      'https://taprobrick.com.br/'
    );
  });

  it('handles browser popstate event by closing top modal without extra history.back', () => {
    const onClose1 = vi.fn();
    const onClose2 = vi.fn();

    registerModalOpen('modal-1', onClose1);
    registerModalOpen('modal-2', onClose2);

    expect(getModalStack()).toEqual(['modal-1', 'modal-2']);

    // Simulate browser Back button press (triggers popstate listener)
    listeners.forEach((fn) => fn({ type: 'popstate' }));

    // Top modal (modal-2) was closed
    expect(onClose2).toHaveBeenCalledTimes(1);
    expect(onClose1).not.toHaveBeenCalled();
    expect(getModalStack()).toEqual(['modal-1']);

    // Simulating component reaction to onClose: modal-2 unmounts / calls registerModalClose
    registerModalClose('modal-2');

    // Because it was already popped by popstate, history.back should NOT be called
    expect(backSpy).not.toHaveBeenCalled();
  });

  it('calls history.back() when modal closes via UI (X button) to pop its history entry', () => {
    backSpy.mockImplementation(() => {
      // Simulate history.back firing a popstate event in browser
      listeners.forEach((fn) => fn({ type: 'popstate' }));
    });

    const onClose = vi.fn();
    registerModalOpen('modal-ui', onClose);
    expect(getModalStack()).toEqual(['modal-ui']);

    // User clicked 'X'
    registerModalClose('modal-ui');

    expect(getModalStack()).toEqual([]);
    expect(backSpy).toHaveBeenCalledTimes(1);
    // Programmatic back shouldn't call onClose again
    expect(onClose).not.toHaveBeenCalled();
  });
});
