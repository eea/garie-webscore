const Influx = require('influx')
const metrics = require('./metrics')

const influx = new Influx.InfluxDB({
  host: process.env.INFLUX_HOST || 'influxdb',
  port: process.env.INFLUX_PORT || '8086'
})

const query = async (metric) => {
  const {name, query, database} = metric
  const result = await influx.query(query, {database})
  const data = {}
  for (const row of result) {
    data[row.url] = row.value
  }
  return data
}

const getData = async () => {
  const results = await Promise.all(metrics.map((metric) => query(metric)))
  const metricResults = {}
  metrics.forEach((metric, i) => metricResults[metric.name] = results[i])

  const urlMap = {}

  for (const metric of metrics) {
    const results = metricResults[metric.name]
    for (const url of Object.keys(results)) {
      const row = urlMap[url] || { url, score: 0 }
      urlMap[url] = row
      const value = results[url]
      row[metric.name] = value ? Math.round(value) : null
      row.score += value || 0
    }
  }

  const rv = Object.values(urlMap)
  for (const row of rv) {
    row.score = Math.round(row.score)
  }

  return rv
}

module.exports = {
  getData,
}
