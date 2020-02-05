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
  for(const row of result) {
    data[row.url] = row.value
  }
  return data
}

const getData = async (config) => {
  const results = await Promise.all(metrics.map((metric) => query(metric)))
  const metricResults = {}
  metrics.forEach((metric, i) => metricResults[metric.name] = results[i])

  const rv = []
  for(const url of config.urls) {
    const row = {url, score: 0}
    for(const metric of metrics) {
      const value = metricResults[metric.name][url]
      row[metric.name] = value ? Math.round(value) : null
      row.score += value || 0
    }
    row.score = Math.round(row.score)
    rv.push(row)
  }

  return rv
}

module.exports = {
  getData,
}
