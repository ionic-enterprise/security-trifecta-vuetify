import waitForExpect from 'wait-for-expect';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { createVuetify } from 'vuetify';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { flushPromises, mount } from '@vue/test-utils';
import AppUnlockCard from '../AppUnlockCard.vue';
import { useAuth } from '@/composables/auth';
import { useSync } from '@/composables/sync';
import { useSessionVault } from '@/composables/session-vault';

vi.mock('@/composables/auth');
vi.mock('@/composables/session-vault');
vi.mock('@/composables/sync');

describe('app unlock card', () => {
  const vuetify = createVuetify({ components, directives });
  const mountComponent = () => mount(AppUnlockCard, { global: { plugins: [vuetify] } });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('displays the title', () => {
    const wrapper = mountComponent();
    const title = wrapper.findComponent('[data-testid="title"]');
    expect(title.text()).toBe('Your Session is Locked');
  });

  it('displays a subtitle', () => {
    const wrapper = mountComponent();
    const title = wrapper.findComponent('[data-testid="subtitle"]');
    expect(title.text()).toBe('Please unlock to continue');
  });

  describe('unlock button', () => {
    it('exists', () => {
      const wrapper = mountComponent();
      const button = wrapper.findComponent('[data-testid="unlock-button"]');
      expect(button.text()).toBe('Unlock');
    });

    it('restores the session', async () => {
      const { getSession } = useSessionVault();
      const wrapper = mountComponent();
      const button = wrapper.findComponent('[data-testid="unlock-button"]');
      await button.trigger('click');
      expect(getSession).toHaveBeenCalledTimes(1);
    });

    it('emits unlocked', async () => {
      const { getSession } = useSessionVault();
      const wrapper = mountComponent();
      const button = wrapper.findComponent('[data-testid="unlock-button"]');
      await button.trigger('click');
      expect(wrapper.emitted('unlocked')).toBeTruthy();
    });
  });

  describe('redo button', () => {
    it('exists', () => {
      const wrapper = mountComponent();
      const button = wrapper.findComponent('[data-testid="redo-signin-button"]');
      expect(button.text()).toBe('Redo Sign In Instead');
    });

    it('emits redo', async () => {
      const wrapper = mountComponent();
      const button = wrapper.findComponent('[data-testid="redo-signin-button"]');
      await button.trigger('click');
      expect(wrapper.emitted('redo')).toBeTruthy();
    });
  });
});
