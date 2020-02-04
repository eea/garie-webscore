require('dotenv').config()
const express = require('express')
const nunjucks = require('nunjucks')
const queries = require('./queries')
const metrics = require('./metrics')

const dev = (process.env.NODE_ENV || 'dev') === 'dev'
const config = JSON.parse(
  process.env.CONFIG ||
  require('fs').readFileSync(`${__dirname}/examples/config.json`)
)

if(dev) console.debug('config =', config)

const app = express()
const port = process.env.PORT || '3000'

const nunjucksEnv = nunjucks.configure(`${__dirname}/templates`, {
  autoescape: true,
  express: app,
  watch: true
})

function thresholdColor(thresholds, value) {
  if (typeof value === 'number' && !isNaN(value)) {
    const [red, yellow] = thresholds
    if (value < red)
      return "table-danger"
    else if (value < yellow)
      return "table-warning"
    else
      return "table-success"
  } else {
    return "table-secondary"
  }
}

nunjucksEnv.addGlobal('metricStyle', function(metric, value) {
  return thresholdColor(metric.thresholds, value)
})

nunjucksEnv.addGlobal('scoreStyle', function(value) {
  const max = metrics.length * 100
  const [red, yellow] = config.scoreThresholds
  return thresholdColor([max * red, max * yellow], value)
})

function wrap(fn) {
  return async (req, res, next) => {
    try {
      await fn(req, res, next)
    } catch(e) {
      next(e)
    }
  }
}

app.get('/', wrap(async (req, res) => {
  const data = await queries.getData(config)
  data.sort((a, b) => b.score - a.score)
  const importantMetrics = metrics.filter((m) => m.important)
  res.render('index.html', { data, importantMetrics })
}))

app.get(/^\/site\/(.*)$/, wrap(async (req, res) => {
  const url = req.params[0]
  if (config.urls.indexOf(url) < 0) {
    res.sendStatus(404)
    return
  }
  const data = (await queries.getData(config)).find((row) => row.url === url)
  res.render('site.html', { url, data, metrics })
}))

app.listen(port, () => console.log(`Listening on port ${port}`))
