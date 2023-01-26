<template>
  <v-app>
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
