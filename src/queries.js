const Influx = require('influx')
const { metrics } = require('./metrics')

// how much time to skip when looking for the historic max value of a metric
const MONTH = "month";
const YEAR = "year";

let nrUrls = 0;

const influx = new Influx.InfluxDB({
  host: process.env.INFLUX_HOST || 'influxdb',
  port: process.env.INFLUX_PORT || '8086'
})

const query = async (metricSpec, kind) => {
  const { name, measurement, field, database } = metricSpec

  const metricsQuery = `SELECT "url", "time", "${field}" AS "value" FROM "${measurement}" WHERE time >= now() - 1d GROUP BY "url" ORDER BY "time" DESC LIMIT 1`
  const lastMetricQuery = `SELECT "url", "time", "${field}" AS "value" FROM "${measurement}" GROUP BY "url" ORDER BY "time" DESC LIMIT 1`

  let query = "";
  if (kind === MONTH) {
    query = `SELECT mean("${field}") AS "value" FROM "${measurement}" WHERE time >= now() - 30d GROUP BY time(1d), "url" fill(-1) ORDER BY time ASC`
  } else if (kind === YEAR) {
    query = `SELECT mean("${field}") AS "value" FROM "${measurement}" WHERE time >= now() - 365d GROUP BY time(7d), "url" fill(-1) ORDER BY time ASC`
  }
  const [ metricsRows, lastMetricsRows, seriesRows ] = await Promise.all([
    influx.query(metricsQuery, { database }),
    influx.query(lastMetricQuery, { database }),
    influx.query(query, { database })
  ]).catch((e) => {
    console.error(e);
    return [[], [], [], [], []];
  })

  const lastValues = {}
  for (const row of lastMetricsRows) {
    lastValues[row.url] = {
      last: row.value,
      lastTime: (row.time.toISOString() || "").substr(0, 16).replace("T", " "),
      lastTimeMs: row.time.getTime(),
    }
  }

  const seriesValues = new Object();
  
  for (const row of seriesRows) {
    if (!seriesValues[row.url]) {
      seriesValues[row.url] = []
    }
    seriesValues[row.url].push(row.value)
  }
  

  const data = {}
  for (const { url, value, time } of metricsRows) {
    const { last, lastTime, lastTimeMs } = lastValues[url] || {}
    const series = seriesValues[url] || []

    data[url] = { value, last, lastTime, lastTimeMs, series }
   
  }
  return data
}

const median = (values) => {
  values.sort((a, b) => a - b)
  if (!values.length > 0) return null
  const half = Math.floor(values.length / 2)
  if (values.length % 2) return values[half]
  return Math.round((values[half - 1] + values[half]) / 2)
}

const fillCheckList = (series, checkList) => {
  for (let i = 0; i < series.length; i++) {
    if (checkList.length <= i) {
      checkList.push(0);
    }
    if (series[i] >= 0) {
      checkList[i]++;
    }
  }


  return checkList;
}


const getData = async (kind) => {
  const results = await Promise.all(metrics.map((metric) => query(metric, kind)))
  const metricResults = {}
  metrics.forEach((metric, i) => metricResults[metric.name] = results[i])

  const urlMap = {}

  for (const metric of metrics) {
    const results = metricResults[metric.name]
    for (const url of Object.keys(results)) {
      const row = urlMap[url] || { url, metrics: {}, score: 0, checks: 0, checkList: [] }
      urlMap[url] = row
      const result = results[url]
      row.metrics[metric.name] = {
        value: Math.round(result.value),
        last: Math.round(result.last),
        lastTime: result.lastTime,
        lastTimeMs: result.lastTimeMs,
        max: Math.round(result.max),
        maxTime: result.maxTime,
        series: result.series,
      }

      row.checkList = fillCheckList(result.series, row.checkList);
      
      row.metrics[metric.name].series = result.series.filter(val => val >= 0);

      row.score += result.value
      row.checks += 1
    }
  }
  nrUrls = Object.keys(urlMap).length;

  for (let url in urlMap) {
    urlMap[url].checkList = urlMap[url].checkList.map(x=>x*5);
  }

  const rv = Object.values(urlMap)
  for (const row of rv) {
    row.score = Math.round(row.score)
    row.median = median(Object.values(row.metrics).map((row) => row.value))
  }

  return rv
}

const getNrUrls = () => {
  return nrUrls;
}

module.exports = {
  getData,
  influx,
  getNrUrls,
}
