import { fetchBreweries, didApplyWhereFilter } from './api'
import { metadata } from './metadata'
import { log } from './utils';
import type { Request } from 'express';
import type { BreweriesFeatureCollection, BreweryFeature } from './typings';
import type { IQueryFeaturesOptions } from '@esri/arcgis-rest-feature-layer';

type ArcGISQueryRequest = Request & { 
  query: IQueryFeaturesOptions & { inputCrs?: any }
}

export class OpenBreweryProvider {
  async getData(request: ArcGISQueryRequest){
    const { 
      // params: { host, id }, 
      query 
    } = request
    log.info(`query in request is: ${JSON.stringify(query, null, 2)}`)

    // default output SR to web mercator
    query.outSR = query.outSR ?? 3857 as any

    // set inputCrs to tell Koop.js the source SR is WGS84
    query.inputCrs = 4216

    const breweries = await fetchBreweries(query)

    const features: BreweryFeature[] = breweries
      // .filter(b => b.latitude && b.longitude)
      .map(
        properties => ({
          type: 'Feature',
          properties,
          geometry: {
            type: 'Point',
            coordinates: [ properties.longitude, properties.latitude ]
          }
      })
    )

    const geojson = {
      features,
      type: 'FeatureCollection',
      metadata: {
        ttl: 60 * 60,
        ...metadata,
      },
      filtersApplied: {
        limit: Boolean(query.resultRecordCount),
        offset: Boolean(query.resultOffset),
        where: Boolean(query.where),
      },
      crs: {
        type: 'name',
        properties: {
          name: `urn:ogc:def:crs:EPSG::${query.outSR ?? 3857}`
        }
      },
    } as BreweriesFeatureCollection

    log.info(`first feature of ${geojson.features.length} total: ${JSON.stringify(geojson.features[0], null, 2)}`)
    return geojson
  }
}