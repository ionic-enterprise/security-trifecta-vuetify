<template>
  <div>
    <v-app-bar :elevation="2">
      <v-app-bar-title>Tasting Notes</v-app-bar-title>
      <template v-slot:append>
        <v-btn icon="mdi-theme-light-dark" @click="toggle"></v-btn>

        <v-btn icon="mdi-refresh"></v-btn>

        <v-btn icon="mdi-logout" @click="routeToPage('/logout')"></v-btn>
      </template>
    </v-app-bar>

    <v-main scrollable>
      <router-view />
    </v-main>
  </div>
</template>

<script lang="ts" setup>
import { useThemeSwitcher } from '@/composables/theme-switcher';
import { useRouter } from 'vue-router';

const { toggle } = useThemeSwitcher();

const router = useRouter();

const routeToPage = (page: string) => {
  router.push(page);
};
</script>
