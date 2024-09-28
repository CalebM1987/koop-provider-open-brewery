import { fetchJson, log } from "../utils";
import type { IQueryFeaturesOptions } from '@esri/arcgis-rest-feature-layer'
import type { BreweryApiQueryParameters, BreweryMetaResponse, BreweryProperties, BreweryPropertiesRaw, BreweryType } from '../typings'
// import { filterBreweriesByGeometry } from "../utils";

export const baseUrl = 'https://api.openbrewerydb.org/v1/breweries'

// default to 1000 like
export const defaultLimit = 200
export const maxRecordCount = 200

// const translateParams = (params?: BreweryApiQueryParameters)=> {
//   const 

// }
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

const cityWhereRegExp = /(city)\s?=\s?'(.*?)'/i
const stateWhereRegExp = /(state_province|state)\s?=\s?'(.*?)'/i
const postalWhereRegExp = /(postal_code)\s?=\s?'(.*?)'/i
const typeWhereRegExp = /(type)\s?=\s?'(.*?)'/i

const expressionMatches = (exp: RegExp, s: string)=> Boolean(s.match(exp))

/**
 * creates open brewery api url query parameters from a given where clause
 * @param where - an input where clause
 * @returns the extracted parameters
 * @example 
 * const where = "city = 'san diego' AND state_province = 'california'"
 * console.log(extractParamsFromWhereClause(where))
 * {
 *   "by_city": "san%20diego",
 *   "by_state": "california"
 * } 
 */
export const extractParamsFromWhereClause = (where=''): BreweryWhereQuery => {
  if (!where) return {}
  const params: BreweryWhereQuery = {}

  // first check for city
  if (expressionMatches(cityWhereRegExp, where)){
    const match = where.match(cityWhereRegExp) as RegExpMatchArray
    const city = match[2]
    if (city){
      params.by_city = encodeURIComponent(match[2])
    }
  }

  // check for state
  if (expressionMatches(stateWhereRegExp, where)){
    const match = where.match(stateWhereRegExp) as RegExpMatchArray
    const state = match[2]
    if (state){
      params.by_state = state
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

export type EsriQueryProperties = Omit<IQueryFeaturesOptions, 'url'>

/**
 * converts esri query parameters to open brewery api query parameters
 * @param options the esri query options
 * @returns 
 */
export const translateEsriToParams = (options: EsriQueryProperties={}): BreweryApiQueryParameters => {
  options = options ?? {}
  if (!options.resultRecordCount){
    options.resultRecordCount = defaultLimit
  }
  
  // get initial params from where clause
  const params = {
    ...extractParamsFromWhereClause(options?.where)
  } as BreweryApiQueryParameters

  // check for sorting
  if (options.orderByFields){
    params.sort = options.orderByFields
      .replace(/\s(asc)/gi, ':asc')
      .replace(/\s(desc)/gi, ':desc')
  }
  
  // handle pagination
  const limit = options?.resultRecordCount
    ? Math.min(options.resultRecordCount, defaultLimit)
    : undefined
  
  if (limit){
    params.per_page = limit
  }
   
  if (options?.resultOffset && limit){
    params.page = Math.ceil(options.resultOffset / limit) 
  }
  log.info(`translated esri query to open brewery query parameters: ${JSON.stringify(params, null, 2)}`)
  return params
}

/**
 * builds the query api url with path and query parameters
 * @param options 
 * @returns 
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
 * 
 * @param options 
 * @returns 
 */
export const getMeta = async (url: string): Promise<BreweryMetaResponse> => {
  // const url = buildUrl(options)
  const results  = await fetchJson<BreweryMetaResponse>(url)
  return results
}

/**
 * will fetch breweries from esri parameters
 * @param query - the esri query parameters
 * @returns the brewery features
 */
export const fetchBreweries = async (query?: EsriQueryProperties): Promise<BreweryProperties[]> => {
  query = query ?? {}
  const results: BreweryProperties[] = []

  const params = translateEsriToParams(query)

  const url = buildUrl({ params })
  // TODO: support pagination
  // const meta = await getMeta(url.href)
  log.info(`open brewery api url with query: "${url.href}"`)
  const data = await fetchJson<BreweryPropertiesRaw[]>(url.href)
  results.push(...data 
    .map(d => ({
      ...d,
      latitude: Number(d.latitude),
      longitude: Number(d.longitude),
    })) as any 
  )
  return results
}