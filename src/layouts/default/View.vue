<template>
  <div>
    <v-app-bar :elevation="2">
      <v-app-bar-title>Tasting Notes</v-app-bar-title>
      <template v-slot:append>
        <v-btn icon="mdi-theme-light-dark"></v-btn>

        <v-btn icon="mdi-refresh"></v-btn>

        <v-btn icon="mdi-logout"></v-btn>
      </template>
    </v-app-bar>

    <v-main>
      <router-view />
    </v-main>
  </div>
</template>

<script lang="ts" setup>
//
</script>
