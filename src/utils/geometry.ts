import { arcgisToGeoJSON } from "@terraformer/arcgis"
import type {
  IPoint,
  IPolygon,
  IPolyline,
  IEnvelope,
} from '@esri/arcgis-rest-types'
import type { Geometry } from "@turf/turf"
// import { BreweryProperties } from "../typings"

export type EsriGeometry = 
  | IPoint 
  | IPolygon 
  | IPolyline 
  | IEnvelope

/**
 * 
 * @param esriGeometry 
 * @returns 
 */
export const convertGeometry = (esriGeometry: EsriGeometry)=> {
  return arcgisToGeoJSON(esriGeometry) as Geometry
}

// export const filterBreweriesByGeometry = (geometry: Geometry, breweries: BreweryProperties)=> {

// }
