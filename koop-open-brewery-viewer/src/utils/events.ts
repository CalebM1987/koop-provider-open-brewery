import { EventBus } from 'quasar'

interface QueriedFeaturesPayload {
  query: __esri.QueryProperties;
  features: __esri.Graphic[];
}

export const eventBus = new EventBus<{
    'queried-layer': (payload: QueriedFeaturesPayload) => void;
}>()
