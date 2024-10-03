import { 
  fetchBreweries,
  didApplyWhereFilter, 
  maxRecordCount
} from './api'
import { metadata } from './metadata'
import type { Request } from 'express';
import { log, getSR, convertGeometry, filterBreweriesByGeometry } from './utils';
import type { BreweriesFeatureCollection, BreweryFeature } from './typings';
import type { IQueryFeaturesOptions } from '@esri/arcgis-rest-feature-layer';

type ArcGISQueryRequest = Request & { 
  query: IQueryFeaturesOptions & { inputCrs?: any }
}

export class OpenBreweryProvider {
  async getData(request: ArcGISQueryRequest, callback: (error: Error | null, geojson: BreweriesFeatureCollection)=> void){
    const { query } = request
    log.info(`query in request is: ${JSON.stringify(query, null, 2)}`)

    // default output SR to web mercator
    query.outSR = query.outSR ?? 3857 as any

    // set inputCrs to tell Koop.js the source SR is WGS84
    query.inputCrs = 4326
    
    const { data: breweries, meta } = await fetchBreweries(query)

    // convert brewery data to GeoJSON features
    const breweryFeatures: BreweryFeature[] = breweries
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

    // important: if a geometry was provided we should filter results here
    let queryGeometry: any = undefined
    if (query.geometry){
      try {
        queryGeometry = JSON.parse(query.geometry as string)
        log.info(`query geometry: ${JSON.stringify(queryGeometry, null, 2)}`)
      }catch(err){
        log.warn('failed to parse query geometry')
      }
    }
    const inSR = getSR(queryGeometry) ?? query.inSR as any
    const geometry = queryGeometry ? convertGeometry(queryGeometry, inSR): undefined
    if (geometry){
      log.info(`querying by geometry with inSR ${inSR}: ${JSON.stringify(geometry, null, 2)}`)
    }
    const { features, didApplyGeometryFilter } = filterBreweriesByGeometry(breweryFeatures, geometry)
    if (didApplyGeometryFilter){
      log.info(`filtered breweries by ${geometry.type} geometry: ${features.length} out of ${breweryFeatures.length} matched`)
      if (features.length < maxRecordCount){
        /**
         * important: if features filtered by geometry is less than maxRecordCount
         * update the meta total to notify koop the transfer limit is not exceeded
         * */ 
        meta.total = features.length
      }
    }

    // check to see if limit was exceeded
    const limitExceeded = Number(meta.total) > breweries.length
    log.info(`fetch breweries meta with limit exceeded: ${JSON.stringify({...meta, limitExceeded}, null, 2)}`)

    // create final geojson payload to send to Koop
    const geojson = {
      features,
      type: 'FeatureCollection',
      // cache time to live in seconds
      ttl: 60 * 60,
      metadata: {
        ...metadata,
        limitExceeded,
      },
      /**
       * notify koop that we have already processed these filters
       * that are true
       */
      filtersApplied: {
        limit: Boolean(query.resultRecordCount),
        offset: Boolean(query.resultOffset),
        /**
         * may want to consider setting this to `false`
         * in case other where clause parameters are 
         * passed outside of what is supported by the
         * open brewery db api
         */
        where: didApplyWhereFilter(query.where),
        geometry: didApplyGeometryFilter
      },
      crs: {
        type: 'name',
        properties: {
          name: `urn:ogc:def:crs:EPSG::${query.inputCrs}`
        }
      },
    } as BreweriesFeatureCollection

    log.info(`first feature of ${geojson.features.length} total: ${JSON.stringify(geojson.features[0], null, 2)}`)

    /**
     * hack: if returnCountOnly is `true`, we need to return the meta total
     * we can fake this by just copying the first feature <N> times to match
     * the meta total
     */
    if ([true, 'true'].includes(query.returnCountOnly)){
      log.info(`resultRecordCount requested, we will fake the data to match the meta.total of ${meta.total}`)
      const repeatItem = (item, n) => Array.from({ length: n }, () => item);
      geojson.features = repeatItem(geojson.features[0], Number(meta.total))
      geojson.metadata.maxRecordCount = Number(meta.total)
    }
    
    callback(null, geojson)
  }
}