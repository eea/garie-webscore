const Influx = require('influx')

const influx = new Influx.InfluxDB({
  host: process.env.INFLUX_HOST || 'influxdb',
  port: process.env.INFLUX_PORT || '8086',
  database: 'linksintegrity'
})

async function query() {
  const result = await influx.query(`SELECT mean("value") AS "value" FROM "linksintegrity" WHERE time >= now() - 1d GROUP BY time(1d), "url" fill(none) ORDER BY time DESC LIMIT 1`)
  const data = {}
  for(const row of result) {
    const {url, value} = row
    data[url] = value
  }
  return data
}

async function getData(config) {
  const result = await query()
  const rv = []
  for(const url of Object.keys(result)) {
    if(config.urls.indexOf(url) < 0) continue
    rv.push({url, links_integrity: result[url]})
  }
  return rv
}

module.exports = {
  getData
}
