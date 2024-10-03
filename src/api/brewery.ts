import { fetchJson, log } from "../utils";
import { getCentroid, getSR } from "../utils";
import type { IQueryFeaturesOptions } from '@esri/arcgis-rest-feature-layer'
import type { 
  BreweryApiQueryParameters, 
  BreweryMetaResponse, 
  BreweryProperties, 
  BreweryPropertiesRaw, 
  BreweryType 
} from '../typings'

export const baseUrl = 'https://api.openbrewerydb.org/v1/breweries'

const flip = (data: Record<any, any>) => Object.fromEntries(
  Object
    .entries(data)
    .map(([key, value]) => [value, key])
  );

/**
 * oid tracker
 */
let oid = 1

/**
 * id map to keep track of OIDs
 * { <id>: <objectid> }
 */
export const idMap: Record<string, number> = {}

// default to 1000 features for max record count
export const maxRecordCount = 1000
// the maximum allowed page size for open brewery api
export const breweryApiLimit = 200

export interface BreweryQueryBuilderOptions {
  /**
   * the query parameters
   */
  params?: BreweryApiQueryParameters; 
  /**
   * an optional url path beyond the base url
   * @example "/meta"
   */
  path?: string; 
}

export type BreweryWhereQuery = Pick<BreweryApiQueryParameters, "by_city" | "by_country" | "by_state" | "by_postal" | "by_type">

/**
 * will check if a string matches a RegExp
 * @param exp - the RegExp to check for match against string
 * @param s - the string to check for match against RegExp
 * @returns `true` if the string matches the RegExp
 */
const expressionMatches = (exp: RegExp, s: string)=> Boolean(s.match(exp))

const cityWhereRegExp = /(city)\s?=\s?'(.*?)'/i
const stateWhereRegExp = /(state_province|state)\s?=\s?'(.*?)'/i
const postalWhereRegExp = /(postal_code)\s?=\s?'(.*?)'/i
const typeWhereRegExp = /(type)\s?=\s?'(.*?)'/i

/**
 * creates open brewery api url query parameters from a given where clause
 * @param where - an input where clause
 * @returns the extracted parameters
 * @example 
 * const where = "city = 'san diego' AND state_province = 'california'"
 * console.log(extractParamsFromWhereClause(where))
 * {
 *   "by_city": "san_diego",
 *   "by_state": "california"
 * } 
 */
export const extractParamsFromWhereClause = (where=''): BreweryWhereQuery => {
  const params: BreweryWhereQuery = {}
  if (!where) return params

  // first check for city
  if (expressionMatches(cityWhereRegExp, where)){
    const match = where.match(cityWhereRegExp) as RegExpMatchArray
    const city = match[2]
    if (city){
      params.by_city = match[2].replace(/\s/g, '_')
    }
  }

  // check for state
  if (expressionMatches(stateWhereRegExp, where)){
    const match = where.match(stateWhereRegExp) as RegExpMatchArray
    const state = match[2]
    if (state){
      params.by_state = state.replace(/\s/g, '_')
    }
  }

  // check for postal code
  if (expressionMatches(postalWhereRegExp, where)){
    const match = where.match(postalWhereRegExp) as RegExpMatchArray
    const postal = match[2]
    if (postal){
      params.by_postal = postal
    }
  }

  // check for postal code
  if (expressionMatches(typeWhereRegExp, where)){
    const match = where.match(typeWhereRegExp) as RegExpMatchArray
    const type = match[2]
    if (type){
      params.by_type = type as BreweryType
    }
  }
  return params
}

/**
 * will return true if one of the special where clause filters were applied
 * @param where - the where clause to evaluate
 * @returns 
 */
export const didApplyWhereFilter = (where?: string)=> {
  if (!where) return false

  return [ cityWhereRegExp, stateWhereRegExp, postalWhereRegExp, typeWhereRegExp ]
    .some(exp => expressionMatches(exp, where))
}

export type EsriQueryProperties = Omit<IQueryFeaturesOptions, 'url'>

/**
 * converts esri query parameters to open brewery api query parameters
 * @param query the esri query query
 * @returns - the equivalent open brewery api params
 */
export const translateEsriQueryToParams = (query: EsriQueryProperties={}): BreweryApiQueryParameters => {
  query = query ?? {}
  
  // get initial params from where clause
  const params = {
    ...extractParamsFromWhereClause(query?.where)
  } as BreweryApiQueryParameters

  // check for sorting
  if (query.orderByFields){
    params.sort = query.orderByFields
      .replace(/\s(asc)/gi, ':asc')
      .replace(/\s(desc)/gi, ':desc')
  }

  // check for geometry 
  if (query.geometry){
    const geometry = JSON.parse(query.geometry as string)
    const inSR = getSR(geometry) ?? query.inSR
    const point = getCentroid(geometry, inSR)
    params.by_dist = point.coordinates.reverse().join(',')
    log.info(`found esri geometry in query, using centroid for by_dist: ${JSON.stringify(point, null, 2)}`)
  }
  
  // handle pagination
  const limit = query?.resultRecordCount
    ? Math.min(query.resultRecordCount, breweryApiLimit)
    : breweryApiLimit
  
  if (limit){
    params.per_page = limit
  }
   
  if (query?.resultOffset && limit){
    params.page = Math.ceil(query.resultOffset / limit) + 1
  }

  // check for "objectIds" in query
  if (query.objectIds){
    const oidLookup = flip(idMap)
    params.by_ids = (query.objectIds as unknown as string)
      .split(',')
      .map(oid => oidLookup[oid])
      .join(',')
    log.info(`translated objectIds to by_ids`)
  }
  log.info(`translated esri query to open brewery query parameters: ${JSON.stringify(params, null, 2)}`)
  return params
}

/**
 * builds the query api url with path and query parameters
 * @param options - the options for building the url
 * @returns the built url
 */
export const buildUrl = (options?: BreweryQueryBuilderOptions): URL => {
  const { params={}, path='' } = options ?? {}
  const url = new URL(baseUrl + path)
  for (const [key, value ] of Object.entries(params ?? {})){
    url.searchParams.append(key, value)
  }
  return url
}

/**
 * gets the metadata for a given search criteria
 * @param url - the brewery search url
 * @returns the metadata for the response
 */
export const getMeta = async (url: string): Promise<BreweryMetaResponse> => {
  // const url = buildUrl(options)
  const results  = await fetchJson<BreweryMetaResponse>(url)
  return results
}

/**
 * the response with data and pagination info
 */
type PaginatedResponse = {
  /**
   * the request metadata
   */
  meta: BreweryMetaResponse;
  /**
   * the result data from the query
   */
  data: BreweryProperties[];
} 

/**
 * fetch all brewery records, will paginate if necessary
 * @param params - the open brewery api params
 * @returns the response with data and pagination info
 */
export const paginatedBreweryRequest = async (params: BreweryApiQueryParameters): Promise<PaginatedResponse> => {

  // first, fetch metadata to know how many requests to make
  const meta = await getMeta(
    buildUrl({ 
      params, 
      path: '/meta'
    }).href
  )

  log.info(`initial brewery query meta: ${JSON.stringify(meta, null, 2)}`)

  // find start page, default to 1
  const startPage = params.page ? Number(params.page) : 1

  // find number of pages we will need to fetch based on meta
  const pages = Math.ceil(Math.min(Number(meta.total), maxRecordCount) / breweryApiLimit)
  const breweries: BreweryProperties[] = []

  // store all pagination promises
  const proms: Promise<BreweryPropertiesRaw[]>[] = []
  
  // make paginated requests
  for (let i = 0; i < pages; i++){
    const page = startPage + i
    const pageParams = {
      ...params,
      per_page: 200,
      page
    }
    const url = buildUrl({ params: pageParams }).href
    log.info(`open brewery api query with url: "${url}"`)
    proms.push(fetchJson<BreweryPropertiesRaw[]>(url))
    log.info(`fetched page ${page} of ${pages + startPage - 1}`)
  }

  // wait for all request promises to resolve
  const results = await Promise.all(proms)

  // put all results together
  results.forEach((data)=> {
    breweries.push(...data 
      .map((d) => {
        let OBJECTID = idMap[d.id]
        if (!OBJECTID){
          idMap[d.id] = oid
          OBJECTID = oid
          oid += 1
        }
        return {
          ...d,
          OBJECTID,
          latitude: Number(d.latitude),
          longitude: Number(d.longitude),
        }
      })
    ) as any 
  })
  log.info(`retrieved ${breweries.length} breweries. Next OBJECTID is ${oid}`)

  // update the metadata with the last page fetched
  meta.page = pages

  // return the paginated response data and meta
  return {
    meta,
    data: breweries,
  }
}

/**
 * will fetch breweries from esri parameters
 * @param query - the esri query parameters
 * @returns the brewery features as a paginated response
 */
export const fetchBreweries = async (query?: EsriQueryProperties): Promise<PaginatedResponse> => {
  query = query ?? {}

  // translate esri parameters to brewery api params
  const params = translateEsriQueryToParams(query)

  // return results
  const results = await paginatedBreweryRequest(params)

  return results
}