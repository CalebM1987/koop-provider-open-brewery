import { arcgisToGeoJSON } from "@terraformer/arcgis"
import type {
  IPoint,
  IPolygon,
  IPolyline,
  IEnvelope,
  IGeometry,
} from '@esri/arcgis-rest-types'
import { centroid, toWgs84  } from "@turf/turf"
import type { Geometry, Point } from '@turf/turf'
// import { BreweryProperties } from "../typings"

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
export const convertGeometry = (esriGeometry: EsriGeometry, projectToWGS=true)=> {
  const geometry = arcgisToGeoJSON(esriGeometry) as Geometry
  if (projectToWGS){
    const isMercator = [ esriGeometry.spatialReference?.wkid, esriGeometry.spatialReference?.latestWkid ]
      .some(wkid => [ 3857, 102100 ]
        .includes(wkid)
      )
    return isMercator ? toWgs84(geometry): geometry
  }
  return geometry
}

/**
 * gets the centroid for an input geometry
 * @param esriGeometry - the esri json to fetch Point for
 * @returns a Point geometry
 */
export const getCentroid = (esriGeometry: EsriGeometry): Point => {
  const geometry = convertGeometry(esriGeometry, true)
  return geometry.type === 'Point' 
    ? geometry as Point
    : centroid(geometry).geometry as Point
}

// export const filterBreweriesByGeometry = (geometry: Geometry, breweries: BreweryProperties)=> {

// }
