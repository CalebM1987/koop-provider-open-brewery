# Koop Provider for the Open Brewery DB API

Sample Application from my [Serving up your data with Koop.js](https://gis.bolton-menk.com/presentations/serving-data-with-koop-2024) presentation at the MN GIS LIS Fall 2024 Conference.

This project demonstrates how to create a [Koop.js](https://koopjs.github.io/docs/basics/what-is-koop) Provider Plugin for the [Open Brewery DB API](https://www.openbrewerydb.org/documentation)

Local development:

```sh
npm i
npm run build
cd example-app
koop serve

# or 
# npm run start:dev
```

## example urls

URL Schema: 
[https://localhost:6443/koop-provider-open-brewery/bolton-menk/breweries/FeatureServer/0](https://localhost:6443/koop-provider-open-brewery/rest/services/breweries/FeatureServer/0)

Layer Definition:
[https://localhost:6443/koop-provider-open-brewery/rest/services/breweries/FeatureServer/0](https://localhost:6443/koop-provider-open-brewery/rest/services/breweries/FeatureServer/0)

Query Url
[https://localhost:6443/koop-provider-open-brewery/rest/services/breweries/FeatureServer/0/query?f=json&maxRecordCountFactor=4&resultOffset=0&resultRecordCount=20&where=1%3D1&orderByFields=id&outFields=*&outSR=102100](https://localhost:6443/koop-provider-open-brewery/rest/services/breweries/FeatureServer/0/query?f=json&maxRecordCountFactor=4&resultOffset=0&resultRecordCount=20&where=1%3D1&orderByFields=id&outFields=*&outSR=102100])

View in Map:
[https://localhost:6443/static/viewer?id=<open-brewery-project-id>](https://localhost:6443/static/viewer.html?id=2840)

