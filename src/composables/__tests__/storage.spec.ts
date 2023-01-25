import { useEncryption } from '@/composables/encryption';
import { useStorage } from '@/composables/storage';
import { Capacitor } from '@capacitor/core';
import { KeyValueStorage } from '@ionic-enterprise/secure-storage';
import { beforeAll, beforeEach, describe, expect, it, Mock, vi } from 'vitest';

vi.mock('@capacitor/core');
vi.mock('@/composables/encryption');
vi.mock('@/composables/vault-factory');
vi.mock('@ionic-enterprise/secure-storage', () => {
  const actual = vi.importActual('@ionic-enterprise/secure-storage');
  const mockKeyValueStorage = {
    create: vi.fn().mockResolvedValue(undefined),
    set: vi.fn().mockResolvedValue(undefined),
    get: vi.fn().mockResolvedValue('foo'),
  };
  return {
    ...actual,
    KeyValueStorage: vi.fn(() => mockKeyValueStorage),
  };
});

describe('useStorage', () => {
  let store: KeyValueStorage;
  beforeAll(() => {
    useStorage();
    store = new KeyValueStorage();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    (Capacitor.isNativePlatform as Mock).mockReturnValue(false);
  });

  it('creates the storage on the first call', async () => {
    const { setValue } = useStorage();
    const { getDatabaseKey } = useEncryption();
    (getDatabaseKey as Mock).mockResolvedValue('foo-bar-key');
    (Capacitor.isNativePlatform as Mock).mockReturnValue(true);
    expect(store.create).not.toHaveBeenCalled();
    await setValue('some-key', false);
    expect(store.create).toHaveBeenCalledTimes(1);
    expect(store.create).toHaveBeenCalledWith('foo-bar-key');
    await setValue('some-key', true);
    expect(store.create).toHaveBeenCalledTimes(1);
  });

  describe('set value', () => {
    it('sets the value', async () => {
      const { setValue } = useStorage();
      await setValue('some-key', false);
      expect(store.set).toHaveBeenCalledTimes(1);
      expect(store.set).toHaveBeenCalledWith('some-key', false);
    });
  });

  describe('get value', () => {
    it('gets the value', async () => {
      const { getValue } = useStorage();
      await getValue('some-key');
      expect(store.get).toHaveBeenCalledTimes(1);
      expect(store.get).toHaveBeenCalledWith('some-key');
    });

    it('returns the value', async () => {
      const { getValue } = useStorage();
      (store.get as Mock).mockResolvedValue(427349);
      expect(await getValue('some-key')).toEqual(427349);
    });
  });
});
