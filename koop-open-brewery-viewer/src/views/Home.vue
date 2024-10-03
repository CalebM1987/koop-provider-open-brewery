<script lang="ts" setup>
import { ref, defineAsyncComponent } from 'vue'

const MapViewer = defineAsyncComponent(()=> import('./MapViewer.vue'))

</script>

<template>
  <div class="home">
    <Suspense>
      <MapViewer />
      <template #fallback>
        <q-spinner-facebook></q-spinner-facebook>
      </template>
    </Suspense>
  </div>
</template>
