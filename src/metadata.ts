import type { ILayerDefinition, IField } from '@esri/arcgis-rest-feature-layer'
import { maxRecordCount } from './api'
import { breweryTypes } from './typings'

export const defaultRenderer = {
  "type": "simple",
  "symbol": {
    "type": "esriSMS",
    "color": [
      233,
      115,
      0,
      255
    ],
    "angle": 0,
    "xoffset": 0,
    "yoffset": 0,
    "size": 12,
    "style": "esriSMSCircle",
    "outline": {
      "type": "esriSLS",
      "color": [
        255,
        255,
        255,
        255
      ],
      "width": 0.75,
      "style": "esriSLSSolid"
    }
  }
}

/**
 * the fields metadata for the feature layer endpoint
 */
const fields = [
  {
    name: 'id',
    alias: 'Open Brewery ID'
  },
  {
    name: 'name',
    alias: 'Name'
  },
  {
    name: 'brewery_type',
    alias: 'Brewery Type',
    domain: {
      type: 'codedValue',
      codedValues: breweryTypes
        .map(t => ({ code: t, name: t }))
    }
  },
  {
    name: 'address_1',
    alias: 'Address 1'
  },
  {
    name: 'address_2',
    alias: 'Address 2'
  },
  {
    name: 'address_3',
    alias: 'Address 3'
  },
  {
    name: 'city',
    alias: 'City',
  },
  {
    name: 'state_province',
    alias: 'State Province'
  },
  {
    name: 'postal_code',
    alias: 'Postal Code'
  },
  {
    name: 'country',
    alias: 'Country'
  },
  {
    name: 'phone',
    alias: 'Phone Number'
  },
  {
    name: 'website_url',
    alias: 'Website'
  },
  {
    name: 'state',
    alias: 'State'
  },
  {
    name: 'street',
    alias: 'Street'
  }

].map(f => ({
  ...f,
  alias: f.alias ?? f.name,
  type: 'esriFieldTypeString'
})
) as IField[]


export const metadata: Partial<ILayerDefinition> = {
  fields,
  maxRecordCount,
  displayField: 'name',
  description: 'Features from the Open Brewery API',
  geometryType: 'esriGeometryPoint',
  spatialReference: {
    wkid: 102100,
    latestWkid: 3857
  }
}