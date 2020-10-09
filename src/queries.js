const Influx = require('influx')
const { metrics } = require('./metrics')

// how much time to skip when looking for the historic max value of a metric
const MAX_GRACE_PERIOD = "7d"

const influx = new Influx.InfluxDB({
  host: process.env.INFLUX_HOST || 'influxdb',
  port: process.env.INFLUX_PORT || '8086'
})

const query = async (metricSpec) => {
  const { name, measurement, field, database } = metricSpec

  const metricsQuery = `SELECT mean("${field}") AS "value" FROM "${measurement}" WHERE time >= now() - 1d GROUP BY time(1d), "url" fill(none) ORDER BY time DESC LIMIT 1`
  const maxQuery = `SELECT max("${field}") AS "value" FROM "${measurement}" WHERE time <= now() - ${MAX_GRACE_PERIOD} GROUP BY "url" fill(none) ORDER BY time DESC LIMIT 1`
  // last 30 days - should we add `LIMIT 30` ?
  const timeSeriesQuery = `SELECT mean("${field}") AS "value" FROM "${measurement}" WHERE time >= now() - 30d GROUP BY time(1d), "url" fill(none) ORDER BY time ASC`

  const [ metricsRows, maxRows, timesSeriesRows ] = await Promise.all([
    influx.query(metricsQuery, { database }),
    influx.query(maxQuery, { database }),
    influx.query(timeSeriesQuery, { database }),
  ]).catch((e) => {
    console.error(e);
    return [[], [], []];
  })

  const maxValues = {}
  for (const row of maxRows) {
    maxValues[row.url] = {
      max: row.value,
      maxTime: (row.time.toISOString() || "").substr(0, 10),
    }
  }

  const timeSeriesValues = new Object()
  for (const row of timesSeriesRows) {
    if (!timeSeriesValues[row.url]) {
      timeSeriesValues[row.url] = []
    }
    timeSeriesValues[row.url].push(row.value)
  }

  const data = {}
  for (const { url, value } of metricsRows) {
    const { max, maxTime } = maxValues[url] || {}
    const timeSeries = timeSeriesValues[url] || []
    data[url] = { value, max, maxTime, timeSeries }
  }

  return data
}

const median = (values) => {
  values.sort((a, b) => a - b)
  if (!values.length > 0) return null
  const half = Math.floor(values.length / 2)
  if (values.length % 2) return values[half]
  return Math.round((values[half - 1] + values[half]) / 2)
}

const getData = async () => {
  const results = await Promise.all(metrics.map((metric) => query(metric)))
  const metricResults = {}
  metrics.forEach((metric, i) => metricResults[metric.name] = results[i])

  const urlMap = {}

  for (const metric of metrics) {
    const results = metricResults[metric.name]
    for (const url of Object.keys(results)) {
      const row = urlMap[url] || { url, metrics: {}, score: 0, checks: 0 }
      urlMap[url] = row
      const result = results[url]
      row.metrics[metric.name] = {
        value: Math.round(result.value),
        max: Math.round(result.max),
        maxTime: result.maxTime,
        timeSeries: result.timeSeries
      }
      row.score += result.value
      row.checks += 1
    }
  }

  const rv = Object.values(urlMap)
  for (const row of rv) {
    row.score = Math.round(row.score)
    row.median = median(Object.values(row.metrics).map((row) => row.value))
  }

  return rv
}

module.exports = {
  getData,
}
