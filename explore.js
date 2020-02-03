const Influx = require('influx')

const influx = new Influx.InfluxDB({
  host: 'influxdb',
  database: 'linksintegrity'
})

async function main() {
  try {
    const result = await influx.query(`SELECT mean("value") AS "value" FROM "linksintegrity" WHERE time >= now() - 1d GROUP BY time(1d), "url" fill(none) ORDER BY time DESC LIMIT 1`)
    const data = {}
    for(const row of result) {
      const {url, value} = row
      data[url] = value
    }
    console.log(data)
  } catch(e) {
    console.error(e)
  }
}

main()
