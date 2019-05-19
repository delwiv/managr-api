import https from 'https'
import qs from 'querystring'

export default (baseUrl, auth = '') => {
  return {
    get: (route, params) =>
      new Promise((resolve, reject) => {
        let data = ''
        https
          .get(`${baseUrl}/${route}?${qs.stringify(params)}`, { auth }, stream => {
            stream.on('data', chunk => {
              data += chunk
            })
            stream.on('end', () => resolve(JSON.parse(data)))
          })
          .on('error', reject)
      }),
    post: (route, params) =>
      new Promise((resolve, reject) => {
        let data = ''
        const body = JSON.stringify(params)
        https
          .request(
            `${baseUrl}/${route}`,
            {
              auth,
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Content-Length': data.length,
              },
            },
            stream => {
              stream.on('data', chunk => {
                data += chunk
              })
              stream.on('end', () => resolve(JSON.parse(data)))
            }
          )
          .on('error', reject)
          .write(body)
          .end()
      }),
  }
}
