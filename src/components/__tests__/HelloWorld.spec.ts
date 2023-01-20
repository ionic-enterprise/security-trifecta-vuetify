import { mount } from '@vue/test-utils';
import { createVuetify } from 'vuetify';
import * as components from 'vuetify/components';
import * as directives from 'vuetify/directives';
import { expect, describe, it } from 'vitest';
import HelloWorld from '../HelloWorld.vue';

describe('Hello World', () => {
  const vuetify = createVuetify({ components, directives });
  it('works', () => {
    const wrapper = mount(HelloWorld, { global: { plugins: [vuetify] } });
    expect(wrapper.text()).toContain('Welcome to');
  });
});
