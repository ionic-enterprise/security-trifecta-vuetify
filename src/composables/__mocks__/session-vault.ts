import { vi } from 'vitest';

let onLockCallback: (() => Promise<void>) | undefined;

const canUnlock = vi.fn().mockResolvedValue(false);
const canUseLocking = vi.fn().mockReturnValue(false);
const clearSession = vi.fn().mockResolvedValue(undefined);
const setSession = vi.fn().mockResolvedValue(undefined);
const getSession = vi.fn().mockResolvedValue(undefined);
const setUnlockMode = vi.fn().mockResolvedValue(undefined);
const onLock = vi.fn().mockImplementation((cb: () => Promise<void>) => (onLockCallback = cb));
const lock = vi.fn().mockImplementation(() => {
  if (onLockCallback) {
    onLockCallback();
  }
});

export const useSessionVault = vi.fn().mockReturnValue({
  canUnlock,
  canUseLocking,
  clearSession,
  setSession,
  getSession,
  setUnlockMode,
  onLock,
  lock,
});
