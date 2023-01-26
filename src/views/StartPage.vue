<template>
  <div></div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useSessionVault } from '@/composables/session-vault';

const { canUnlock } = useSessionVault();
const router = useRouter();

canUnlock().then((x: boolean) => {
  if (x) {
    router.replace('/login');
  } else {
    router.replace('/home');
  }
});
</script>
