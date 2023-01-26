<template>
  <v-app
    style="
      padding: env(safe-area-inset-top) env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left);
    "
  >
    <RouterView />
  </v-app>
</template>

<script setup lang="ts">
import { SplashScreen } from '@capacitor/splash-screen';
import { RouterView } from 'vue-router';
import { usePreferences } from './composables/preferences';

SplashScreen.hide();

const { load } = usePreferences();
load();
</script>
