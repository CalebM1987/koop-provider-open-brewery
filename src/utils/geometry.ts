import { arcgisToGeoJSON } from "@terraformer/arcgis"
import type {
  IPoint,
  IPolygon,
  IPolyline,
  IEnvelope,
  IGeometry,
  ISpatialReference
} from '@esri/arcgis-rest-types'
import { centroid, toWgs84, booleanContains } from "@turf/turf"
import type { Geometry, Point, GeometryTypes } from '@turf/turf'
import type { BreweryFeature } from "../typings"
import { log } from "./logger"

export type EsriGeometry = 
  | IPoint 
  | IPolygon 
  | IPolyline 
  | IEnvelope
  | IGeometry

/**
 * converts geojson to arcgis geometry
 * @param esriGeometry - the esri geometry to convert
 * @returns the geometry as geojson
 */
export const convertGeometry = (esriGeometry: EsriGeometry | string, inSR?: string | number)=> {
  if (typeof esriGeometry === 'string'){
    try {
      esriGeometry = JSON.parse(esriGeometry)
    } catch(err){
      log.info(`failed to parse geometry: ${esriGeometry}`)
    }
  }
  const geometry = arcgisToGeoJSON(esriGeometry as EsriGeometry) as Geometry
  const isMercator = [ 3857, 102100, '3857', '102100' ].includes(inSR)
  console.log('IS MERCATOR: ', isMercator, inSR, typeof inSR)
  return isMercator ? toWgs84(geometry): geometry
}

/**
 * gets the centroid for an input geometry
 * @param esriGeometry - the esri json to fetch Point for
 * @returns a Point geometry
 */
export const getCentroid = (esriGeometry: EsriGeometry, inSR?: string | number | ISpatialReference): Point => {
  const sr = ['string', 'number'].includes(typeof inSR) 
    ? inSR 
    : getSR(inSR as ISpatialReference)
  const geometry = convertGeometry(esriGeometry, sr as any)
  return geometry.type === 'Point' 
    ? geometry as Point
    : centroid(geometry).geometry as Point
}

type FilterByGeometryResult = {
  /**
   * the filtered features
   */
  features: BreweryFeature[];
  /**
   * will be true if a geometry filter was actually applied,
   * i.e. a polygon or line geometry was used to filter results
   */
  didApplyGeometryFilter: boolean;
}

/**
 * will filter brewery features by a given geometry
 * @param features - the features to filter
 * @param geometry - the filter geometry
 * @returns 
 */
export const filterBreweriesByGeometry = (features: BreweryFeature[], geometry?: Geometry): FilterByGeometryResult => {
  const geometryFilterTypes: GeometryTypes[] = ['Polygon', 'MultiPolygon', 'LineString', 'MultiLineString']
  if (geometryFilterTypes.includes(geometry?.type as GeometryTypes)){
    return {
      didApplyGeometryFilter: true,
      features: features.filter(ft => booleanContains(geometry, ft.geometry))
    }
  } else {
    return { features, didApplyGeometryFilter: false }
  }

}

/**
 * will attempt to get the spatial reference WKID if present
 * @param geometry 
 * @returns the well known id if present
 */
export const getSR = (geometry?: EsriGeometry | ISpatialReference)=> {
  if (!geometry) return undefined
  if ('spatialReference' in geometry){
    return geometry.spatialReference?.latestWkid ?? geometry.spatialReference?.wkid
  } else if ('wkid' in geometry || 'latestWkid' in geometry){
    return geometry?.latestWkid ?? geometry?.wkid
  }
  return undefined
}
