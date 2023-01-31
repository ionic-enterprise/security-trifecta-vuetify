<template>
  <div class="pa-4">
    <!-- <TastingNoteEditor class="mb-4" v-for="note in notes" :key="note.data.id" :note="note" /> -->
    <TastingNoteViewer class="mb-4" v-for="note in notes" :key="note.data.id" :note="note" />
  </div>
</template>

<script lang="ts" setup>
import { useTastingNotes } from '@/tasting-notes/composables/tasting-notes';
import TastingNoteEditor from '@/tasting-notes/components/TastingNoteEditor.vue';
import TastingNoteViewer from '@/tasting-notes/components/TastingNoteViewer.vue';

const { notes, refresh } = useTastingNotes();

refresh();
</script>
