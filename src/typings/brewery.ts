import type { FeatureCollection, Feature, Point } from "@turf/turf";
import type { PassthroughFilters } from "./filter";

export const breweryTypes = [ "micro", "nano", "regional", "brewpub", "large", "planning", "contract", "proprietor", "closed" ] as const
export type BreweryType = typeof breweryTypes[number]

export interface BreweryProperties {
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
  longitude:      string;
  latitude:       string;
  phone?:         string;
  website_url?:   string;
  state:          string;
  street:         string;
}

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