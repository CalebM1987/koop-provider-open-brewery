<script lang="ts" setup>
import { shallowRef, onMounted } from 'vue'
import { eventBus } from '@/utils'
import Map from '@arcgis/core/Map'
import MapView from '@arcgis/core/views/MapView'
import FeatureLayer from '@arcgis/core/layers/FeatureLayer'
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer'
import Sketch from "@arcgis/core/widgets/Sketch.js"

const esriMap = shallowRef<HTMLDivElement | null>(null)

const layerView = shallowRef<__esri.FeatureLayerView>()

let highlightHandle: IHandle | undefined = undefined

const map = new Map({
  basemap: 'streets-vector'
})
const view = new MapView({
  map,
  center: [-100, 40],
  zoom: 3,
  popupEnabled: true
})

const layer = new FeatureLayer({
  url: 'https://localhost:6443/koop-provider-open-brewery/rest/services/0/FeatureServer/0',
  popupEnabled: true,
  outFields: ['*'],
})

map.add(layer)

view.whenLayerView(layer).then((lv)=> {
  layerView.value = lv
  const popupTemplate = layer.createPopupTemplate()
  popupTemplate.title = '{name}'
  layer.popupTemplate = popupTemplate
  console.log('created popup template')
})

const graphicsLayer = new GraphicsLayer({ title: 'sketch-graphics' })

const sketch = new Sketch({
  view,
  layer: graphicsLayer
  // availableCreateTools: ['rectangle', 'circle', 'polygon', 'polyline'],
  // visibleElements: {
  //   createTools: {
  //     polygon: true,
  //     polyline: true,
  //     rectangle: true,
  //     circle: true
  //   },
  //   selectionTools: {
  //     'rectangle-selection': true,
  //     'lasso-selection': true
  //   }
  // }
})

// listen to sketch create 
sketch.on('create', async ({ graphic, state })=> {
  if (state === 'complete'){

    console.log('sketch create event: ', graphic)
    const query = {
      geometry: graphic.geometry,
      outFields: ['*'],
      returnGeometry: true
    }
    const { features } = await layer.queryFeatures(query)
  
    eventBus.emit('queried-layer', { features, query })
  
    if (layerView.value){
      highlightHandle && highlightHandle.remove()
      if (features.length){
        highlightHandle = layerView.value.highlight(features)
      }
    }
  }

})

onMounted(()=> {
  if (esriMap.value){
    view.container = esriMap.value

    // add sketch widget
    view.ui.add(sketch, 'top-right')
  }
})

</script>

<template>
  <div class="map-wrapper">
    <div class="arcgis-map-viewer" ref="esriMap"></div>
  </div class="map-wrapper">
</template>

<style lang="scss">
@import "https://js.arcgis.com/4.30/@arcgis/core/assets/esri/themes/light/main.css";
.map-wrapper {
  height: calc(100vh - 60px);
}
.arcgis-map-viewer {
  height: 100%;
  width: 100%;
}
</style>