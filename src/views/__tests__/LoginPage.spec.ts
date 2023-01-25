import { useAuth } from '@/composables/auth';
import { useSessionVault } from '@/composables/session-vault';
import { useSync } from '@/composables/sync';
import LoginPage from '@/views/LoginPage.vue';
import { Device } from '@ionic-enterprise/identity-vault';
import { flushPromises, mount, VueWrapper } from '@vue/test-utils';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { useRouter } from 'vue-router';
import waitForExpect from 'wait-for-expect';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { createVuetify } from 'vuetify';

vi.mock('@/composables/auth');
vi.mock('@/composables/session-vault');
vi.mock('@/composables/sync');

describe.skip('LoginPage.vue', () => {
  const vuetify = createVuetify({ components, directives });
  const mountPage = () => mount(LoginPage, { global: { plugins: [vuetify] } });

  beforeEach(() => {
    vi.clearAllMocks();
    const { canUseLocking } = useSessionVault();
    (canUseLocking as Mock).mockReturnValue(true);
  });

  describe('without a session that can be unlocked', () => {
    beforeEach(() => {
      const { canUnlock } = useSessionVault();
      (canUnlock as Mock).mockResolvedValue(false);
    });

    it('displays the title', () => {
      const wrapper = mountPage();
      const title = wrapper.findComponent('[data-testid="title"]');
      expect(title.text()).toBe('Login');
    });

    it('displays the "Sign In" button', () => {
      const wrapper = mountPage();
      const button = wrapper.find('[data-testid="signin-button"]');
      expect(button.text()).toBe('Sign In');
    });

    it('displays the username/password inputs', () => {
      const wrapper = mountPage();
      const email = wrapper.find('[data-testid="email-input"]');
      const password = wrapper.find('[data-testid="password-input"]');
      expect(email.exists()).toBe(true);
      expect(password.exists()).toBe(true);
    });

    describe('unlock mode', () => {
      it('is displayed', () => {
        const wrapper = mountPage();
        const select = wrapper.find('[data-testid="unlock-opt-select"]');
        expect(select.exists()).toBe(true);
      });

      it('is not displayed if the app cannot use locking', () => {
        const { canUseLocking } = useSessionVault();
        (canUseLocking as Mock).mockReturnValue(false);
        const wrapper = mountPage();
        const select = wrapper.find('[data-testid="unlock-opt-select"]');
        expect(select.exists()).toBe(false);
      });

      it('displays non-biometric options if biometrics is not enabled', () => {
        Device.isBiometricsEnabled = vi.fn().mockResolvedValue(false);
        const wrapper = mountPage();
        const select = wrapper.find('[data-testid="unlock-opt-select"]');
        const opts = select.findAll('ion-select-option');

        expect(opts.length).toEqual(3);
        expect(opts[0].text()).toEqual('Session PIN Unlock');
        expect(opts[1].text()).toEqual('Never Lock Session');
        expect(opts[2].text()).toEqual('Force Login');
      });

      it('displays all options if biometrics is enabled', () => {
        Device.isBiometricsEnabled = vi.fn().mockResolvedValue(true);
        const wrapper = mountPage();
        const select = wrapper.find('[data-testid="unlock-opt-select"]');
        const opts = select.findAll('ion-select-option');

        expect(opts.length).toEqual(4);
        expect(opts[0].text()).toEqual('Biometric Unlock');
        expect(opts[1].text()).toEqual('Session PIN Unlock');
        expect(opts[2].text()).toEqual('Never Lock Session');
        expect(opts[3].text()).toEqual('Force Login');
      });
    });

    it('displays messages as the user enters invalid data', async () => {
      const wrapper = mountPage();
      const email = wrapper.findComponent('[data-testid="email-input"]');
      const password = wrapper.findComponent('[data-testid="password-input"]');
      const msg = wrapper.find('[data-testid="message-area"]');

      expect(msg.text()).toBe('');

      await email.setValue('foobar');
      await flushPromises();
      await waitForExpect(() => expect(msg.text()).toBe('Email Address must be a valid email'));

      await email.setValue('');
      await flushPromises();
      await waitForExpect(() => expect(msg.text()).toBe('Email Address is a required field'));

      await email.setValue('foobar@baz.com');
      await flushPromises();
      await waitForExpect(() => expect(msg.text()).toBe(''));

      await password.setValue('mypassword');
      await flushPromises();
      await waitForExpect(() => expect(msg.text()).toBe(''));

      await password.setValue('');
      await flushPromises();
      await waitForExpect(() => expect(msg.text()).toBe('Password is a required field'));

      await password.setValue('mypassword');
      await flushPromises();
      await waitForExpect(() => expect(msg.text()).toBe(''));
    });

    it('has a disabled signin button until valid data is entered', async () => {
      const wrapper = mountPage();
      const button = wrapper.find('[data-testid="signin-button"]');
      const email = wrapper.findComponent('[data-testid="email-input"]');
      const password = wrapper.findComponent('[data-testid="password-input"]');

      await flushPromises();
      await waitForExpect(() => expect((button.element as HTMLButtonElement).disabled).toBe(true));

      await email.setValue('foobar');
      await flushPromises();
      await waitForExpect(() => expect((button.element as HTMLButtonElement).disabled).toBe(true));

      await password.setValue('mypassword');
      await flushPromises();
      await waitForExpect(() => expect((button.element as HTMLButtonElement).disabled).toBe(true));

      await email.setValue('foobar@baz.com');
      await flushPromises();
      await waitForExpect(() => expect((button.element as HTMLButtonElement).disabled).toBe(false));
    });

    it('does not display the unlock button', async () => {
      const wrapper = mountPage();
      await flushPromises();
      const unlock = wrapper.find('[data-testid="unlock-button"]');
      expect(unlock.exists()).toBe(false);
    });

    describe('clicking on the signin button', () => {
      let wrapper: VueWrapper<any>;
      beforeEach(async () => {
        Device.isBiometricsEnabled = vi.fn().mockResolvedValue(false);
        wrapper = mountPage();
        const email = wrapper.findComponent('[data-testid="email-input"]');
        const password = wrapper.findComponent('[data-testid="password-input"]');
        await email.setValue('test@test.com');
        await password.setValue('test');
      });

      it('performs the login', async () => {
        const { login } = useAuth();
        const button = wrapper.find('[data-testid="signin-button"]');
        await button.trigger('click');
        expect(login).toHaveBeenCalledTimes(1);
        expect(login).toHaveBeenCalledWith('test@test.com', 'test');
      });

      describe('if the login succeeds', () => {
        beforeEach(() => {
          const { login } = useAuth();
          (login as Mock).mockResolvedValue(true);
        });

        it('does not show an error', async () => {
          const button = wrapper.find('[data-testid="signin-button"]');
          const msg = wrapper.find('[data-testid="message-area"]');
          await button.trigger('click');
          await flushPromises();
          expect(msg.text()).toBe('');
        });

        it('syncs with the database', async () => {
          const sync = useSync();
          const button = wrapper.find('[data-testid="signin-button"]');
          await button.trigger('click');
          await flushPromises();
          expect(sync).toHaveBeenCalledTimes(1);
        });

        it('sets the desired unlock mode', async () => {
          const { setUnlockMode } = useSessionVault();
          const button = wrapper.find('[data-testid="signin-button"]');
          await button.trigger('click');
          await flushPromises();
          expect(setUnlockMode).toHaveBeenCalledTimes(1);
          expect(setUnlockMode).toHaveBeenCalledWith('SessionPIN');
        });

        it('navigates to the start page', async () => {
          const button = wrapper.find('[data-testid="signin-button"]');
          router.replace = vi.fn();
          await button.trigger('click');
          await flushPromises();
          expect(router.replace).toHaveBeenCalledTimes(1);
          expect(router.replace).toHaveBeenCalledWith('/');
        });
      });

      describe('if the login fails', () => {
        beforeEach(() => {
          const { login } = useAuth();
          (login as Mock).mockResolvedValue(false);
        });

        it('does not show an error', async () => {
          const button = wrapper.find('[data-testid="signin-button"]');
          const msg = wrapper.find('[data-testid="message-area"]');
          button.trigger('click');
          await flushPromises();
          expect(msg.text()).toBe('Invalid email and/or password');
        });

        it('does not sync the database', async () => {
          const sync = useSync();
          const button = wrapper.find('[data-testid="signin-button"]');
          await button.trigger('click');
          expect(sync).not.toHaveBeenCalled();
        });

        it('does not navigate', async () => {
          const router = useRouter();
          const button = wrapper.find('[data-testid="signin-button"]');
          router.replace = vi.fn();
          button.trigger('click');
          await flushPromises();
          expect(router.replace).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('with a session that can be unlocked', () => {
    beforeEach(() => {
      const { canUnlock } = useSessionVault();
      (canUnlock as Mock).mockResolvedValue(true);
    });

    it('displays the title', () => {
      const wrapper = mountPage();
      const title = wrapper.findComponent('[data-testid="title"]');
      expect(title.text()).toBe('Unlock');
    });

    it('displays the "Redo Sign In" button', () => {
      const wrapper = mountPage();
      const button = wrapper.find('[data-testid="signin-button"]');
      expect(button.text()).toBe('Redo Sign In');
    });

    it('hides the username/password inputs and unlock mode', () => {
      const wrapper = mountPage();
      const email = wrapper.find('[data-testid="email-input"]');
      const password = wrapper.find('[data-testid="password-input"]');
      const select = wrapper.find('[data-testid="unlock-opt-select"]');
      expect(email.exists()).toBe(false);
      expect(password.exists()).toBe(false);
      expect(select.exists()).toBe(false);
    });

    it('unlock button is displayed', () => {
      const wrapper = mountPage();
      const unlock = wrapper.find('[data-testid="unlock-button"]');
      expect(unlock.exists()).toBe(true);
    });

    it('clicking the signin button flips the mode to "sign in"', async () => {
      const wrapper = mountPage();
      const button = wrapper.find('[data-testid="signin-button"]');
      await button.trigger('click');
      const unlock = wrapper.find('[data-testid="unlock-button"]');
      const email = wrapper.find('[data-testid="email-input"]');
      const password = wrapper.find('[data-testid="password-input"]');
      expect(unlock.exists()).toBe(false);
      expect(email.exists()).toBe(true);
      expect(password.exists()).toBe(true);
    });

    describe('unlock clicked', () => {
      it('unlocks the vault', async () => {
        const router = useRouter();
        const { getSession } = useSessionVault();
        const wrapper = mountPage();
        router.replace = vi.fn();
        const unlock = wrapper.find('[data-testid="unlock-button"]');
        await unlock.trigger('click');
        await flushPromises();
        expect(getSession).toHaveBeenCalledTimes(1);
      });

      it('routes to the start page', async () => {
        const router = useRouter();
        const wrapper = mountPage();
        const unlock = wrapper.find('[data-testid="unlock-button"]');
        router.replace = vi.fn();
        await unlock.trigger('click');
        await flushPromises();
        expect(router.replace).toHaveBeenCalledTimes(1);
        expect(router.replace).toHaveBeenCalledWith('/');
      });
    });
  });
});
