# Koop Provider for OpenAsset

Local development:

```sh
cd example-app
npm run start:dev
```

## NSSM Service

### Edit the service:

```sh
nssm edit bmi-koop
```

### start the service

```sh
nssm edit start-koop
```

### stop the service

```sh
nssm stop bmi-koop
```

## example urls

URL Schema: 
[https://ags-gp1.bolton-menk.com:3055/koop-provider-openasset/bolton-menk/<:openasset-project-id>/FeatureServer/0](https://ags-gp1.bolton-menk.com:3055/koop-provider-openasset/bolton-menk/2840/FeatureServer/0)

Layer Definition:
[https://ags-gp1.bolton-menk.com:3055/koop-provider-openasset/bolton-menk/2840/FeatureServer/0](https://ags-gp1.bolton-menk.com:3055/koop-provider-openasset/bolton-menk/2840/FeatureServer/0)

Query Url
[https://ags-gp1.bolton-menk.com:3055/koop-provider-openasset/bolton-menk/2840/FeatureServer/0/query?f=json&maxRecordCountFactor=4&resultOffset=0&resultRecordCount=20&where=1%3D1&orderByFields=id&outFields=*&outSR=102100](https://ags-gp1.bolton-menk.com:3055/koop-provider-openasset/bolton-menk/2840/FeatureServer/0/query?f=json&maxRecordCountFactor=4&resultOffset=0&resultRecordCount=20&where=1%3D1&orderByFields=id&outFields=*&outSR=102100])

View in Map:
[https://ags-gp1.bolton-menk.com:3055/static/viewer?id=<openasset-project-id>](https://ags-gp1.bolton-menk.com:3055/static/viewer.html?id=2840)

