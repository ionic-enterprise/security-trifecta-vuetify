<template>
  <div class="pa-4">
    <AppTastingNoteCard class="mb-4" v-for="note in notes" :key="note.data.id" :note="note" />
  </div>
</template>

<script lang="ts" setup>
import { useTastingNotes } from '@/composables/tasting-notes';
import AppTastingNoteCard from '@/components/AppTastingNoteCard.vue';

const { notes, refresh } = useTastingNotes();

refresh();
</script>
