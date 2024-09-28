import { fetchBreweries } from './api'
import { defaultRenderer, metadata } from './metadata'
import { log } from './utils';
// import { toMercator,
//   // bbox 
// } from '@turf/turf';
import type { Request } from 'express';
import type { BreweriesFeatureCollection, BreweryFeature } from './typings';

export class OpenBreweryProvider {
  // , callback: (error: Error | null, payload: BreweriesFeatureCollection)=> void
  async getData(request: Request){
    const { 
      // params: { host, id }, 
      query 
    } = request
    log.info(`query in request is: ${JSON.stringify(query, null, 2)}`)

    // default output SR to web mercator
    // @ts-ignore
    query.outSR = query.outSR ?? 3857

    // set inputCrs to tell Koop.js the source SR is WGS84
    //@ts-ignore
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
        ...metadata,
        // note: this is NOT documented, but can set the renderer like this:
        renderer: defaultRenderer,
      },
      filtersApplied: {
        limit: Boolean(query.resultRecordCount),
        offset: Boolean(query.resultOffset),
        where: Boolean(query.where),
      },
      // filters: {
      //   projection: false
      // },
      crs: {
        type: 'name',
        properties: {
          name: `urn:ogc:def:crs:EPSG::${query.outSR ?? 3857}`
        }
      },
    } as BreweriesFeatureCollection

    log.info(`first feature of ${geojson.features.length} total: ${JSON.stringify(geojson.features[0], null, 2)}`)


    // // determine extent if < 1000 features
    // let extent: any = undefined
    // if (geojson.features.length && geojson.features.length < 1000){
    //   const [ xmin, ymin, xmax, ymax ] = bbox(geojson.features)
    //   extent = {
    //     xmin,
    //     ymin,
    //     xmax,
    //     ymax,
    //     spatialReference: {
    //       wkid: outSR === 3857 ? 102100: outSR,
    //       latestWkid: outSR
    //     }
    //   }
    //   console.log('set extent: ', extent)
    // }

    // callback(null, geojson)
    return geojson
  }
}