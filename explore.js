require('dotenv').config()
const express = require('express')
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

const app = express()
const port = process.env.PORT || '3000'

app.get('/data', async (req, res) => {
  try {
    const data = await query()
    res.json(data)
  } catch(e) {
    console.error(e)
    res.status(500)
    res.send("Internal error")
  }
})

app.listen(port, () => console.log(`Listening on port ${port}`))
