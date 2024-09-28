import type { FeatureCollection, Feature, Point } from "@turf/turf";
import type { PassthroughFilters } from "./filter";

export const breweryTypes = [ "micro", "nano", "regional", "brewpub", "large", "planning", "contract", "proprietor", "closed" ] as const
export type BreweryType = typeof breweryTypes[number]

export interface LatLngString {
  longitude:      string;
  latitude:       string;
}

export interface LatLngNumber {
  longitude:      number;
  latitude:       number;
}
export interface BreweryPropertiesBase {
  id:             string;
  name:           string;
  brewery_type:   BreweryType;
  address_1:      string;
  address_2?:     string;
  address_3?:     string;
  city:           string;
  state_province: string;
  postal_code:    string;
  country:        string;
  phone?:         string;
  website_url?:   string;
  state:          string;
  street:         string;
}

export type BreweryPropertiesRaw = BreweryPropertiesBase & LatLngString;

export type BreweryProperties = BreweryPropertiesBase & LatLngNumber;

export type BreweryFeature = Feature<Point, BreweryProperties>;

export type BreweriesFeatureCollection = FeatureCollection<Point, BreweryProperties> & { 
  crs?: any;
  metadata: {
    /** 
     * the time to live for caching data (in seconds) 
     */
    ttl?: number;
    crs?: any;
    filtersApplied?: PassthroughFilters;
    [k: string]: any;
  },
  [k: string]: any;
}

export interface BreweryApiQueryParameters {
  /**
   * option to query breweries by city name
   * ?by_city=san_diego
   */
  by_city?: string;
  /**
   * option to query breweries by country name
   */
  by_country?: string;
  /**
   * option to query the closest breweries by from a point (latitude,longitude)
   * @example "?by_dist=32.88313237,-117.1649842"
   */
  by_dist?: string;
  /**
   * option to query breweries by country name
   * @example "?by_state=minnesota"
   */
  by_state?: string;
  /**
   * option to query breweries by zip code
   * May be filtered by basic (5 digit) postal code or more precisely filtered by postal+4 (9 digit) code.
   * Note: If filtering by postal+4 the search must include either a hyphen or an underscore.
   * @example "?by_postal=92101"
   */
  by_postal?: string;
  /**
   * option to query breweries by a comma separated list of ids
   * @example "?by_ids=701239cb-5319-4d2e-92c1-129ab0b3b440,06e9fffb-e820-45c9-b107-b52b51013e8f"
   */
  by_ids?: string;
  /**
   * option to query breweries by type
   * @example "?by_type=micro"
   */
  by_type?: BreweryType;
  /**
   * the numer of records per page
   */
  per_page?: string | number;
  /**
   * the page number
   */
  page?: string | number;
  /**
   * option to sort by fields
   * example "?sort=type,name:asc"
   */
  sort?: string;
}

export interface BreweryMetaResponse {
  total: string;
  per_page: string;
  page: string;
}