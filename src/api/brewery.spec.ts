import { extractParamsFromWhereClause } from './brewery'

const where = "city = 'san diego'"

test('should extract city', () => {
  const result = { by_city: 'san%20diego' }
  expect(extractParamsFromWhereClause(where)).toEqual(result);
});