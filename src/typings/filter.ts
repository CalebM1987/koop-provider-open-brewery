export interface PassthroughFilters {
  /** true if all post processing should be skipped */
  all: boolean; 
  /** rue if a geometric filter has already been applied to the data */
  geometry: boolean; 
  /** true if a sql-like where filter has already been applied to the data */
  where: boolean;
  /** true if the result offset has already been applied to the data, */
  offset: boolean;
  /** true if the result count has already been limited */
  limit: boolean;
  /** true if the result data has already been projected */
  projection: boolean;
}