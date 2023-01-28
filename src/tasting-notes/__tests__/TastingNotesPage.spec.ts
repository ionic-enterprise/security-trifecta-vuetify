import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import TastingNotesPage from '@/tasting-notes/TastingNotesPage.vue';
import { useTastingNotes } from '@/tasting-notes/composables/tasting-notes';

vi.mock('@/tasting-notes/composables/tasting-notes');

describe('Tasting Notes Page', () => {
  const vuetify = createVuetify({ components, directives });
  const mountPage = () => mount(TastingNotesPage, { global: { plugins: [vuetify] } });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders', () => {
    const wrapper = mountPage();
    expect(wrapper.exists()).toBe(true);
  });

  it('refreshes the tasting notes', () => {
    const { refresh } = useTastingNotes();
    mountPage();
    expect(refresh).toHaveBeenCalledTimes(1);
  });
});
