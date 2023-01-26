<template>
  <AppLoginCard @success="$router.replace('/home')" />
</template>

<script setup lang="ts">
import AppLoginCard from '@/components/AppLoginCard.vue';
//import AppUnlockCard from '@/components/AppUnlockCard.vue';
</script>
