import { useAuth } from '@/auth/composables/auth';
import { useBackendAPI } from '@/composables/backend-api';
import { useSessionVault } from '@/composables/session-vault';
import { User } from '@/models';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';

vi.mock('@/composables/backend-api');
vi.mock('@/composables/session-vault');

describe('useAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('login', () => {
    const { login } = useAuth();
    const { client } = useBackendAPI();
    beforeEach(() => {
      (client.post as Mock).mockResolvedValue({
        data: { success: false },
      });
    });

    it('posts to the login endpoint', () => {
      login('test@test.com', 'testpassword');
      expect(client.post).toHaveBeenCalledTimes(1);
      expect(client.post).toHaveBeenCalledWith('/login', {
        username: 'test@test.com',
        password: 'testpassword',
      });
    });

    it('resolves false on an unsuccessful login', async () => {
      expect(await login('test@test.com', 'password')).toEqual(false);
    });

    describe('when the login succeeds', () => {
      let user: User;
      beforeEach(() => {
        user = {
          id: 314159,
          firstName: 'Testy',
          lastName: 'McTest',
          email: 'test@test.com',
        };
        (client.post as Mock).mockResolvedValue({
          data: {
            success: true,
            user,
            token: '123456789',
          },
        });
      });

      it('resolves true on a successful login', async () => {
        expect(await login('test@test.com', 'password')).toEqual(true);
      });

      it('sets the session on a successful login', async () => {
        await login('test@test.com', 'password');
        expect(useSessionVault().setSession).toHaveBeenCalledTimes(1);
        expect(useSessionVault().setSession).toHaveBeenCalledWith({
          user,
          token: '123456789',
        });
      });
    });
  });

  describe('logout', () => {
    const { logout } = useAuth();
    const { client } = useBackendAPI();

    it('posts to the login endpoint', () => {
      logout();
      expect(client.post).toHaveBeenCalledTimes(1);
      expect(client.post).toHaveBeenCalledWith('/logout');
    });

    it('clears the session', async () => {
      await logout();
      expect(useSessionVault().clearSession).toHaveBeenCalledTimes(1);
    });
  });
});
