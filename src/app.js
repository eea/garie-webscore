require('dotenv').config()

const express = require('express')
const bodyParser = require('body-parser')
const nunjucks = require('nunjucks')
const path = require('path')
const queries = require('./queries')
const { influx } = require('./queries')
const { metrics } = require('./metrics')
const reports = require('./reports')
const ondemand = require('./ondemand')
const garie_plugin = require('garie-plugin')
const { update_email_for_url, get_all_emails } = require('./subscriptions')
const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const { get } = require('./ondemand')
const {
  urlSlug,
  thresholdColor,
  checksStyle,
  isExternal,
  urlHostname,
  isUpPath
} = require('./utils')

const dev = (process.env.NODE_ENV || 'dev') === 'dev'
const app = express()
const port = process.env.PORT || '3000'

const nunjucksEnv = nunjucks.configure(`${__dirname}/templates`, {
  autoescape: true,
  express: app,
  watch: true,
})

const PAGE_USERNAME = process.env.PAGE_USERNAME;
const PAGE_PASSWORD = process.env.PAGE_PASSWORD;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(require('express-session')({ secret: 'secret', resave: false, saveUninitialized: false }));
app.use('/static', express.static(path.join(__dirname, 'public')));

nunjucksEnv.addGlobal('thresholdColor', thresholdColor)
nunjucksEnv.addGlobal('checksStyle', checksStyle)
nunjucksEnv.addGlobal('urlSlug', urlSlug)
nunjucksEnv.addGlobal('pathNameFromUrl', garie_plugin.utils.helpers.pathNameFromUrl);
nunjucksEnv.addGlobal('urlHostname', urlHostname)
nunjucksEnv.addGlobal('isExternal', isExternal)

nunjucksEnv.addGlobal('metricStyle', (metric, value) => {
  return thresholdColor(metric.thresholds, value)
})

nunjucksEnv.addGlobal('formatMetric', (metric, url, value) => {
  if (typeof(value) === 'number') return value
  if ((metric.internal === true) && (isExternal(url))) return "N/A"
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

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});

passport.use(new Strategy(
  function(username, password, done) {
    if (username === PAGE_USERNAME && password === PAGE_PASSWORD) {
      return done(null, {username: username});
    }
    done(null, false);
  }
));

app.use(passport.initialize());
app.use(passport.session());


app.post('/login', passport.authenticate('local', {
  failureRedirect: '/subscriptions',
  successRedirect: '/subscriptions'
}));


app.get('/', wrap(async (req, res) => {
  const data = await queries.getData()
  data.sort((a, b) => b.score - a.score)
  const importantMetrics = metrics.filter((m) => m.important)
  const timestamp = Date.now();
  return res.render('index.html', { data, importantMetrics, timestamp })
}))

app.get('/subscriptions', wrap(async (req, res) => {

  if (req.user === undefined) {
    return res.render('login.html');
  }

  const data = await queries.getData();
  for (const row of data) {
    row.url = urlSlug(row.url);
  }

  const emails = await get_all_emails();
  return res.render('subscriptions.html', { data, emails });

}));

app.post('/subscriptions/addEmail', wrap(async(req, res) => {
  await update_email_for_url(req.body.url, req.body.email, req.body.active);
  const emails = await get_all_emails();
  return res.send(emails);
}));


app.get('/site/:slug', wrap(async (req, res) => {
  const { slug } = req.params

  const data = (await queries.getData())
    .find((row) => urlSlug(row.url) === slug)

  if (! data)
    return res.sendStatus(404)

  const timestamp = Date.now();
  if (isExternal(slug)) {
    metrics.sort(function(a, b) {
      return (a.internal === b.internal)? 0 : a.internal? 1 : -1;
    });
  }
  return res.render('site.html', { data, metrics, timestamp })
}))

app.get('/site/:slug/reports/on-demand/:report/*', wrap(async (req, res) => {
  const { slug, report } = req.params
  const path = req.params[0] || 'index.html'

  if (isUpPath(slug) || isUpPath(report))
    return res.sendStatus(403)

  const root = await reports.findReportPath(report, slug, true)
  if (!root)
    return res.sendStatus(404)

  return res.sendFile(path, { root })
}))

app.get('/site/:slug/reports/:report/*', wrap(async (req, res) => {
  const { slug, report } = req.params
  const path = req.params[0] || 'index.html'

  if (isUpPath(slug) || isUpPath(report))
    return res.sendStatus(403)

  const root = await reports.findReportPath(report, slug, false)
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


app.get('/status/:plugin_name', async(req, res)=> {

  const plugin = await req.params.plugin_name;

  if (!plugin) {
    return res.sendStatus(404);
  }
  return garie_plugin.utils.makeStatusTables(res, influx, plugin);
});



app.get('/status', async (req, res) => {
  const summaryStatus = await garie_plugin.utils.getSummaryStatus(influx, metrics);
  return res.render('status.html', { metrics, summaryStatus });
});

app.listen(port, () => console.log(`Listening on port ${port}`))
