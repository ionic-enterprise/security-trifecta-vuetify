<template>
  <AppUnlockCard v-if="showUnlock" @unlocked="$router.replace('/home')" @redo="redoLogin" />
  <AppLoginCard v-else @success="$router.replace('/home')" />
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AppLoginCard from '@/auth/components/AppLoginCard.vue';
import AppUnlockCard from '@/auth/components/AppUnlockCard.vue';
import { useSessionVault } from '@/composables/session-vault';

const showUnlock = ref(false);

const { canUnlock } = useSessionVault();
canUnlock().then((x) => (showUnlock.value = x));

const redoLogin = () => {
  const { clearSession } = useSessionVault();
  clearSession();
  showUnlock.value = false;
};
</script>
