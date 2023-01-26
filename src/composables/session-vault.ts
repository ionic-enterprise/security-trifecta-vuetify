import { useVaultFactory } from '@/composables/vault-factory';
import { Session } from '@/models';
import router from '@/router';
import { Capacitor } from '@capacitor/core';
import { BiometricPermissionState, Device, DeviceSecurityType, VaultType } from '@ionic-enterprise/identity-vault';

export type UnlockMode = 'Device' | 'SessionPIN' | 'SystemPIN' | 'NeverLock' | 'ForceLogin';

const key = 'session';
let session: Session | null | undefined;

const { createVault } = useVaultFactory();
const vault = createVault({
  key: 'io.ionic.csdemosecurestorage',
  type: VaultType.SecureStorage,
  deviceSecurityType: DeviceSecurityType.None,
  lockAfterBackgrounded: 5000,
  shouldClearVaultAfterTooManyFailedAttempts: true,
  customPasscodeInvalidUnlockAttempts: 2,
  unlockVaultOnLoad: false,
});

vault.onLock(() => {
  session = undefined;
  router.replace('/login');
});

vault.onPasscodeRequested(async (isPasscodeSetRequest: boolean) => {
  console.log(isPasscodeSetRequest);
  vault.setCustomPasscode('1234');
});

const getSession = async (): Promise<Session | null | undefined> => {
  if (!session) {
    session = await vault.getValue(key);
  }
  return session;
};

const setSession = async (s: Session): Promise<void> => {
  session = s;
  return vault.setValue(key, s);
};

const canUnlock = async (): Promise<boolean> => {
  return Capacitor.isNativePlatform() && !(await vault.isEmpty()) && (await vault.isLocked());
};

const canUseLocking = (): boolean => Capacitor.isNativePlatform();

const getVaultType = async (): Promise<VaultType | undefined> => {
  const exists = !(await vault.isEmpty());
  if (exists) {
    return vault.config.type;
  }
};

const provision = async (): Promise<void> => {
  if ((await Device.isBiometricsAllowed()) === BiometricPermissionState.Prompt) {
    await Device.showBiometricPrompt({ iosBiometricsLocalizedReason: 'Authenticate to continue' });
  }
};

const initializeUnlockMode = async (): Promise<void> => {
  if (Capacitor.isNativePlatform()) {
    if (await Device.isSystemPasscodeSet()) {
      if (await Device.isBiometricsEnabled()) {
        await setUnlockMode('Device');
      } else {
        await setUnlockMode('SystemPIN');
      }
    } else {
      await setUnlockMode('NeverLock');
    }
  } else {
    await setUnlockMode('NeverLock');
  }
};

const setUnlockMode = async (unlockMode: UnlockMode): Promise<void> => {
  let type: VaultType;
  let deviceSecurityType: DeviceSecurityType;

  switch (unlockMode) {
    case 'Device':
      await provision();
      type = VaultType.DeviceSecurity;
      deviceSecurityType = DeviceSecurityType.Both;
      break;

    case 'SystemPIN':
      await provision();
      type = VaultType.DeviceSecurity;
      deviceSecurityType = DeviceSecurityType.SystemPasscode;
      break;

    case 'SessionPIN':
      type = VaultType.CustomPasscode;
      deviceSecurityType = DeviceSecurityType.None;
      break;

    case 'ForceLogin':
      type = VaultType.InMemory;
      deviceSecurityType = DeviceSecurityType.None;
      break;

    case 'NeverLock':
      type = VaultType.SecureStorage;
      deviceSecurityType = DeviceSecurityType.None;
      break;

    default:
      type = VaultType.SecureStorage;
      deviceSecurityType = DeviceSecurityType.None;
  }

  await vault.updateConfig({
    ...vault.config,
    type,
    deviceSecurityType,
  });
};

const clearSession = async (): Promise<void> => {
  session = undefined;
  await setUnlockMode('NeverLock');
  await vault.clear();
};

export const useSessionVault = () => {
  return {
    canUnlock,
    canUseLocking,
    clearSession,
    getSession,
    setSession,
    initializeUnlockMode,
    setUnlockMode,
    getVaultType,
  };
};
