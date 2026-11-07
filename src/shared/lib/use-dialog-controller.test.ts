import { act, cleanup, renderHook } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useDialogController } from './use-dialog-controller';
afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
  document.body.replaceChildren();
});
it('отменяет ожидающую панель при открытии другой и закрывает Escape до загрузки UI', () => {
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  const { result } = renderHook(() => ({
    first: useDialogController(),
    second: useDialogController(),
  }));
  const trigger = document.createElement('button');
  document.body.append(trigger);
  result.current.second.setTrigger(trigger);
  act(() => result.current.first.show());
  expect(result.current.first.open).toBe(true);
  act(() => result.current.second.show());
  expect(result.current.first.open).toBe(false);
  expect(result.current.second.open).toBe(true);
  act(() => document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })));
  expect(result.current.second.open).toBe(false);
  expect(document.activeElement).toBe(trigger);
});
