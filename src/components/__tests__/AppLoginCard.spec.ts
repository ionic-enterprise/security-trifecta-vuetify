import { useAuth } from '@/composables/auth';
import { useSessionVault } from '@/composables/session-vault';
import { useSync } from '@/composables/sync';
import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import waitForExpect from 'wait-for-expect';
import AppLoginCard from '../AppLoginCard.vue';

vi.mock('@/composables/auth');
vi.mock('@/composables/session-vault');
vi.mock('@/composables/sync');

describe('app login card', () => {
  const vuetify = createVuetify({ components, directives });
  const mountComponent = () => mount(AppLoginCard, { global: { plugins: [vuetify] } });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays the title', () => {
    const wrapper = mountComponent();
    const title = wrapper.findComponent('[data-testid="title"]');
    expect(title.text()).toBe('Login');
  });

  it('displays a subtitle', () => {
    const wrapper = mountComponent();
    const title = wrapper.findComponent('[data-testid="subtitle"]');
    expect(title.text()).toBe('Please enter your credentials');
  });

  it('displays the "Sign In" button', () => {
    const wrapper = mountComponent();
    const button = wrapper.find('[data-testid="signin-button"]');
    expect(button.text()).toBe('Sign In');
  });

  it('displays the username/password inputs', () => {
    const wrapper = mountComponent();
    const email = wrapper.find('[data-testid="email-input"]');
    const password = wrapper.find('[data-testid="password-input"]');
    expect(email.exists()).toBe(true);
    expect(password.exists()).toBe(true);
  });

  it('displays messages as the user enters invalid data', async () => {
    const wrapper = mountComponent();
    const email = wrapper.findComponent('[data-testid="email-input"]');
    const emailMsgs = email.find('.v-messages');
    const password = wrapper.findComponent('[data-testid="password-input"]');
    const passwordMsgs = password.find('.v-messages');

    await flushPromises();
    await waitForExpect(() => expect(emailMsgs.text()).toBe(''));
    await waitForExpect(() => expect(passwordMsgs.text()).toBe(''));

    await email.setValue('foobar');
    await flushPromises();
    await waitForExpect(() => expect(emailMsgs.text()).toContain('Email Address must be a valid email'));

    await email.setValue('');
    await flushPromises();
    await waitForExpect(() => expect(emailMsgs.text()).toBe('Email Address is a required field'));

    await email.setValue('foobar@baz.com');
    await flushPromises();
    await waitForExpect(() => expect(emailMsgs.text()).toBe(''));

    await password.setValue('mypassword');
    await flushPromises();
    await waitForExpect(() => expect(passwordMsgs.text()).toBe(''));

    await password.setValue('');
    await flushPromises();
    await waitForExpect(() => expect(passwordMsgs.text()).toBe('Password is a required field'));

    await password.setValue('mypassword');
    await flushPromises();
    await waitForExpect(() => expect(passwordMsgs.text()).toBe(''));
  });

  describe('login button', () => {
    it('is disabled until valid data is entered', async () => {
      const wrapper = mountComponent();
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

    it('performs a login on press', async () => {
      const wrapper = mountComponent();
      const button = wrapper.find('[data-testid="signin-button"]');
      const email = wrapper.findComponent('[data-testid="email-input"]');
      const password = wrapper.findComponent('[data-testid="password-input"]');

      const { login } = useAuth();

      await email.setValue('foobar');
      await password.setValue('mypassword');
      await button.trigger('click');

      expect(login).toHaveBeenCalledTimes(1);
    });

    describe('on success', () => {
      beforeEach(() => {
        const { login } = useAuth();
        (login as Mock).mockResolvedValue(true);
      });

      it('does not display an error', async () => {
        const wrapper = mountComponent();
        const button = wrapper.find('[data-testid="signin-button"]');
        const email = wrapper.findComponent('[data-testid="email-input"]');
        const password = wrapper.findComponent('[data-testid="password-input"]');

        await email.setValue('foobar');
        await password.setValue('mypassword');
        await button.trigger('click');
        await flushPromises();

        const error = wrapper.findComponent('[data-testid="signin-error"]');
        expect(error.exists()).toBe(false);
      });

      it('performs a sync', async () => {
        const wrapper = mountComponent();
        const button = wrapper.find('[data-testid="signin-button"]');
        const email = wrapper.findComponent('[data-testid="email-input"]');
        const password = wrapper.findComponent('[data-testid="password-input"]');

        const sync = useSync();

        await email.setValue('foobar');
        await password.setValue('mypassword');
        await button.trigger('click');
        await flushPromises();

        expect(sync).toHaveBeenCalledTimes(1);
      });

      it('initializes the unlock mode', async () => {
        const wrapper = mountComponent();
        const button = wrapper.find('[data-testid="signin-button"]');
        const email = wrapper.findComponent('[data-testid="email-input"]');
        const password = wrapper.findComponent('[data-testid="password-input"]');

        const { initializeUnlockMode } = useSessionVault();

        await email.setValue('foobar');
        await password.setValue('mypassword');
        await button.trigger('click');
        await flushPromises();

        expect(initializeUnlockMode).toHaveBeenCalledTimes(1);
      });

      it('emits success', async () => {
        const wrapper = mountComponent();
        const button = wrapper.find('[data-testid="signin-button"]');
        const email = wrapper.findComponent('[data-testid="email-input"]');
        const password = wrapper.findComponent('[data-testid="password-input"]');

        await email.setValue('foobar');
        await password.setValue('mypassword');
        await button.trigger('click');
        await flushPromises();

        expect(wrapper.emitted('success')).toBeTruthy();
      });
    });

    describe('on success', () => {
      beforeEach(() => {
        const { login } = useAuth();
        (login as Mock).mockResolvedValue(false);
      });

      it('displays an error', async () => {
        const wrapper = mountComponent();
        const button = wrapper.find('[data-testid="signin-button"]');
        const email = wrapper.findComponent('[data-testid="email-input"]');
        const password = wrapper.findComponent('[data-testid="password-input"]');

        await email.setValue('foobar');
        await password.setValue('mypassword');
        await button.trigger('click');
        await flushPromises();

        const error = wrapper.findComponent('[data-testid="signin-error"]');
        expect(error.exists()).toBe(true);
      });

      it('does not performs a sync', async () => {
        const wrapper = mountComponent();
        const button = wrapper.find('[data-testid="signin-button"]');
        const email = wrapper.findComponent('[data-testid="email-input"]');
        const password = wrapper.findComponent('[data-testid="password-input"]');

        const sync = useSync();

        await email.setValue('foobar');
        await password.setValue('mypassword');
        await button.trigger('click');
        await flushPromises();

        expect(sync).not.toHaveBeenCalled();
      });

      it('does not set the unlock mode', async () => {
        const wrapper = mountComponent();
        const button = wrapper.find('[data-testid="signin-button"]');
        const email = wrapper.findComponent('[data-testid="email-input"]');
        const password = wrapper.findComponent('[data-testid="password-input"]');

        const { setUnlockMode } = useSessionVault();

        await email.setValue('foobar');
        await password.setValue('mypassword');
        await button.trigger('click');
        await flushPromises();

        expect(setUnlockMode).not.toHaveBeenCalled();
      });

      it('does not emit success', async () => {
        const wrapper = mountComponent();
        const button = wrapper.find('[data-testid="signin-button"]');
        const email = wrapper.findComponent('[data-testid="email-input"]');
        const password = wrapper.findComponent('[data-testid="password-input"]');

        await email.setValue('foobar');
        await password.setValue('mypassword');
        await button.trigger('click');
        await flushPromises();

        expect(wrapper.emitted('success')).toBeFalsy();
      });
    });
  });
});
