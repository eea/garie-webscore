require('dotenv').config()
const express = require('express')
const nunjucks = require('nunjucks')
const Influx = require('influx')

const dev = (process.env.NODE_ENV || 'dev') === 'dev'
const config = JSON.parse(
  process.env.CONFIG ||
  require('fs').readFileSync(`${__dirname}/examples/config.json`)
)

if(dev) console.debug('config =', config)

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

async function getData() {
  const result = await query()
  const rv = []
  for(const url of Object.keys(result)) {
    if(config.urls.indexOf(url) < 0) continue
    rv.push({url, links_integrity: result[url]})
  }
  return rv
}

const app = express()
const port = process.env.PORT || '3000'

nunjucks.configure(`${__dirname}/templates`, {
  autoescape: true,
  express: app,
  watch: true
})

app.get('/', async (req, res, next) => {
  try {
    const data = await getData()
    res.render('index.html', {data})
  } catch(e) {
    next(e)
  }
})

app.listen(port, () => console.log(`Listening on port ${port}`))
