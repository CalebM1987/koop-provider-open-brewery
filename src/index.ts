import { OpenBreweryProvider  } from "./model";
import { version } from '../package.json'

export = {
  name: 'koop-provider-open-brewery',
  type: 'provider',
  disableIdParams: true,
  Model: OpenBreweryProvider,
  version
}