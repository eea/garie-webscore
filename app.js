require('dotenv').config()

const fs = require('fs')
const express = require('express')
const nunjucks = require('nunjucks')
const queries = require('./queries')
const metrics = require('./metrics')
const reports = require('./reports')

const dev = (process.env.NODE_ENV || 'dev') === 'dev'
const config = JSON.parse(
  process.env.CONFIG ||
  fs.readFileSync(`${__dirname}/examples/config.json`)
)

if(dev) console.debug('config =', config)

const app = express()
const port = process.env.PORT || '3000'

const nunjucksEnv = nunjucks.configure(`${__dirname}/templates`, {
  autoescape: true,
  express: app,
  watch: true,
})

const thresholdColor = (thresholds, value) => {
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

const urlSlug = (url) => {
  return url
    .replace(/^http[s]?:\/\//, '')
    .replace(/\/$/, '')
    .replace(/[^a-zA-Z0-9.]+/g, '-')
}

nunjucksEnv.addGlobal('urlSlug', urlSlug)

nunjucksEnv.addGlobal('metricStyle', (metric, value) => {
  return thresholdColor(metric.thresholds, value)
})

nunjucksEnv.addGlobal('scoreStyle', (value) => {
  const max = metrics.length * 100
  const [red, yellow] = config.scoreThresholds
  return thresholdColor([max * red, max * yellow], value)
})

nunjucksEnv.addGlobal('reportUrl', reports.reportUrl)

const wrap = (fn) => {
  return async (req, res, next) => {
    try {
      await fn(req, res, next)
    } catch(e) {
      next(e)
    }
  }
}

const UP_PATH_REGEXP = /(?:^|[\\/])\.\.(?:[\\/]|$)/
const isUpPath = (path) => {
  // Check if path contains `..`, we don't want clients browsing our filesystem
  return UP_PATH_REGEXP.test(path)
}

app.get('/', wrap(async (req, res) => {
  const data = await queries.getData(config)
  data.sort((a, b) => b.score - a.score)
  const importantMetrics = metrics.filter((m) => m.important)
  return res.render('index.html', { data, importantMetrics })
}))

app.get('/site/:slug', wrap(async (req, res) => {
  const { slug } = req.params

  if (config.urls.map(urlSlug).indexOf(slug) < 0)
    return res.sendStatus(404)

  const data = (await queries.getData(config))
    .find((row) => urlSlug(row.url) === slug)

  return res.render('site.html', { data, metrics })
}))

app.get('/site/:slug/reports/:report/*', wrap(async (req, res) => {
  const { slug, report } = req.params
  const path = req.params[0] || 'index.html'

  if (isUpPath(slug) || isUpPath(report))
    return res.sendStatus(403)

  if (config.urls.map(urlSlug).indexOf(slug) < 0)
    return res.sendStatus(404)

  const root = await reports.findReportPath(report, slug)
  if (!root)
    return res.sendStatus(404)

  return res.sendFile(path, { root })
}))

app.listen(port, () => console.log(`Listening on port ${port}`))
