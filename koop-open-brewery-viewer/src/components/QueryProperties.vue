<script lang="ts" setup>
import { shallowRef, ref, computed } from 'vue'
import { eventBus } from '@/utils'
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import hljsVuePlugin from "@highlightjs/vue-plugin";
const highlightjs = hljsVuePlugin.component
import 'highlight.js/styles/monokai-sublime.css'

// Then register the languages you need
hljs.registerLanguage('javascript', javascript);

const query = shallowRef<__esri.QueryProperties>()
const features = shallowRef<any[]>()

const whereClause = ref('')

eventBus.on('queried-layer', evt => {
  console.log('queried features event: ', evt)
  query.value = evt.query
  features.value = evt.features
    .map(ft => ft.toJSON())
})

const queryStringified = computed(()=> JSON.stringify(query.value ?? {}, null, 2))
const featuresStringified = computed(()=> JSON.stringify(features.value ?? [], null, 2))

const runQuery = ()=> {
  eventBus.emit('send-where-clause', whereClause.value)
}

</script>

<template>
  <div class="q-pa-md">
    <div class="q-form">
      <q-input 
        filled
        type="textarea" 
        label="whereClause"
        v-model="whereClause" clearable 
      />

      <q-btn class="q-my-sm" label="Run Query" @disable="!whereClause" @click="runQuery" placeholder="city = 'duluth'" />
    </div>

    <div class="code-sections q-my-md">
      <q-list bordered class="rounded-borders">
        <q-expansion-item
          expand-separator
          label="Query Properties"
          default-opened
        >
        <q-card>
          <q-card-section>
            <highlightjs
            class="json-code"
            language="json"
            :code="queryStringified"
          />
          </q-card-section>
        </q-card>

      </q-expansion-item>
        <q-expansion-item
        default-opened
          expand-separator
          label="Result Features"
        >
        <q-card>
          <q-card-section>
            <highlightjs
            class="json-code"
            language="json"
            :code="featuresStringified"
          />
          </q-card-section>
        </q-card>
      </q-expansion-item>
    </q-list>
    </div>
  </div>
</template>

<style lang="scss">
.json-code {
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
}
</style>