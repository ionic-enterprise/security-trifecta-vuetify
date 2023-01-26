import { useSessionVault } from '@/composables/session-vault';
import LoginPage from '@/views/LoginPage.vue';
import { mount } from '@vue/test-utils';
import { beforeEach, describe, expect, it, Mock, vi } from 'vitest';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';

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
});
