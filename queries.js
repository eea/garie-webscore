const Influx = require('influx')

const influx = new Influx.InfluxDB({
  host: process.env.INFLUX_HOST || 'influxdb',
  port: process.env.INFLUX_PORT || '8086'
})

const metrics = require('./metrics')

async function query(metric) {
  const {name, query, database} = metric
  const result = await influx.query(query, {database})
  const data = {}
  for(const row of result) {
    data[row.url] = row[name]
  }
  return data
}

async function getData(config) {
  const metricResults = {}
  for(const metric of metrics) {
    metricResults[metric.name] = await query(metric)
  }

  const rv = []
  for(const url of config.urls) {
    const row = {url}
    for(const metric of metrics) {
      row[metric.name] = metricResults[metric.name][url]
    }
    rv.push(row)
  }

  return rv
}

module.exports = {
  getData
}
