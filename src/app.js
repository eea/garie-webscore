require('dotenv').config()

const fs = require('fs')
const express = require('express')
const bodyParser = require('body-parser')
const nunjucks = require('nunjucks')
const path = require('path')
const { promisify } = require('util')

const queries = require('./queries')
const { metrics } = require('./metrics')
const reports = require('./reports')
const ondemand = require('./ondemand')

const dev = (process.env.NODE_ENV || 'dev') === 'dev'

const app = express()
const port = process.env.PORT || '3000'

const nunjucksEnv = nunjucks.configure(`${__dirname}/templates`, {
  autoescape: true,
  express: app,
  watch: true,
})

app.use(bodyParser.urlencoded({ extended: false }));

app.use('/static', express.static(path.join(__dirname, 'public')));

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

const urlHostname = (url) => {
  return (new URL(url)).hostname
}

nunjucksEnv.addGlobal('urlHostname', urlHostname)

nunjucksEnv.addGlobal('metricStyle', (metric, value) => {
  return thresholdColor(metric.thresholds, value)
})

nunjucksEnv.addGlobal('formatMetric', (value) => {
  if (typeof(value) === 'number') return value
  return "-"
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
  const data = await queries.getData()
  data.sort((a, b) => b.score - a.score)
  const importantMetrics = metrics.filter((m) => m.important)
  return res.render('index.html', { data, importantMetrics })
}))

app.get('/site/:slug', wrap(async (req, res) => {
  const { slug } = req.params

  const data = (await queries.getData())
    .find((row) => urlSlug(row.url) === slug)

  if (! data)
    return res.sendStatus(404)

  return res.render('site.html', { data, metrics })
}))

app.get('/site/:slug/reports/:report/*', wrap(async (req, res) => {
  const { slug, report } = req.params
  const path = req.params[0] || 'index.html'

  if (isUpPath(slug) || isUpPath(report))
    return res.sendStatus(403)

  const root = await reports.findReportPath(report, slug)
  if (!root)
    return res.sendStatus(404)

  return res.sendFile(path, { root })
}))

app.get('/ondemand', (req, res) => {
  return res.render('ondemand.html')
})

app.post('/ondemand', wrap(async (req, res) => {
  const job = await ondemand.launch(req.body.url)
  return res.redirect(`/ondemand/${job.id}`)
}))

app.get('/ondemand/:id', wrap(async (req, res) => {
  const job = await ondemand.get(req.params.id)
  if (! job)
    return res.sendStatus(404)
  const template = req.query.contentonly
    ? 'ondemand-results-content.html'
    : 'ondemand-results.html'
  return res.render(template, { job, metrics })
}))

app.get('/help', (req, res) => {
  return res.render('help.html', { metrics })
})

app.get('/about', (req, res) => {
  return res.render('about.html')
})

app.listen(port, () => console.log(`Listening on port ${port}`))
