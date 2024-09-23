interface TypedResponse<T> extends Response {
  data: T;
}
/**
 * will make a fetch request to either a JSON or YAML content type (will also return plain text)
 * @param url - the url to fetch
 * @param init - any additional request options
 * @returns the raw response, the "data" property will be typed if a typing is given
 */
export async function request<T>(url: string, init?: RequestInit): Promise<TypedResponse<T>> {
  const response = await fetch(url, init)
  let data: any = undefined
  const contentType = response.headers.get('content-type')
  if (contentType) {
    if (contentType.includes('application/json')){
      data = await response.json() as T
    } else {
      data = await response.text() as any
    }
  } else {
    const text = await response.text() as any
    try {
      data = JSON.parse(text) as T
    } catch (e) {
      data = text as any
    }
  }

  return {
    ...response,
    data
  }
}

/**
 * will make a fetch request to either a JSON or YAML content type (will also return plain text)
 * @param url - the url to fetch
 * @param init - any additional request options
 * @returns the response, will be typed if a typing is given
 */
export async function fetchJson<T>(url: string, init?: RequestInit): Promise<T> {
  const { data } = await request<T>(url, init)
  return data 
}

