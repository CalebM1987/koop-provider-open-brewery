import { extractParamsFromWhereClause } from './brewery'

const where = "city = 'san diego'"

console.log(extractParamsFromWhereClause(where))