import { useSessionVault } from '@/composables/session-vault';
import LoginPage from '@/views/LoginPage.vue';
import { flushPromises, mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import AppLoginCard from '@/components/AppLoginCard.vue';
import AppUnlockCard from '@/components/AppUnlockCard.vue';

vi.mock('@/composables/session-vault');
vi.mock('@/composables/sync');

describe('LoginPage.vue', () => {
  const vuetify = createVuetify({ components, directives });
  const mountPage = () => mount(LoginPage, { global: { plugins: [vuetify] } });

  beforeEach(() => {
    vi.clearAllMocks();
    const { canUseLocking } = useSessionVault();
    (canUseLocking as Mock).mockReturnValue(true);
  });

  it('renders', () => {
    const wrapper = mountPage();
    expect(wrapper.exists()).toBe(true);
  });

  describe('when unlocked', () => {
    beforeEach(() => {
      const { canUnlock } = useSessionVault();
      (canUnlock as Mock).mockResolvedValue(false);
    });

    it('shows the login card', async () => {
      const wrapper = mountPage();
      await flushPromises();
      const login = wrapper.findComponent(AppLoginCard);
      const unlock = wrapper.findComponent(AppUnlockCard);
      expect(login.exists()).toBe(true);
      expect(unlock.exists()).toBe(false);
    });
  });

  describe('when locked', () => {
    beforeEach(() => {
      const { canUnlock } = useSessionVault();
      (canUnlock as Mock).mockResolvedValue(true);
    });

    it('shows the unlock card', async () => {
      const wrapper = mountPage();
      await flushPromises();
      const login = wrapper.findComponent(AppLoginCard);
      const unlock = wrapper.findComponent(AppUnlockCard);
      expect(login.exists()).toBe(false);
      expect(unlock.exists()).toBe(true);
    });

    describe('redo login', () => {
      it('clears the session', async () => {
        const wrapper = mountPage();
        await flushPromises();
        const { clearSession } = useSessionVault();
        const unlock = wrapper.findComponent(AppUnlockCard);
        unlock.vm.$emit('redo');
        await flushPromises();
        expect(clearSession).toHaveBeenCalledTimes(1);
      });

      it('hides the unlock card and shows the login card', async () => {
        const wrapper = mountPage();
        await flushPromises();
        const unlockB4 = wrapper.findComponent(AppUnlockCard);
        unlockB4.vm.$emit('redo');
        await flushPromises();
        const login = wrapper.findComponent(AppLoginCard);
        const unlock = wrapper.findComponent(AppUnlockCard);
        expect(login.exists()).toBe(true);
        expect(unlock.exists()).toBe(false);
      });
    });
  });
});
