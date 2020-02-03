require('dotenv').config()
const express = require('express')
const nunjucks = require('nunjucks')
const queries = require('./queries')

const dev = (process.env.NODE_ENV || 'dev') === 'dev'
const config = JSON.parse(
  process.env.CONFIG ||
  require('fs').readFileSync(`${__dirname}/examples/config.json`)
)

if(dev) console.debug('config =', config)

const app = express()
const port = process.env.PORT || '3000'

nunjucks.configure(`${__dirname}/templates`, {
  autoescape: true,
  express: app,
  watch: true
})

app.get('/', async (req, res, next) => {
  try {
    const data = await queries.getData(config)
    res.render('index.html', {data})
  } catch(e) {
    next(e)
  }
})

app.listen(port, () => console.log(`Listening on port ${port}`))
