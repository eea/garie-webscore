const Influx = require('influx')
const { metrics } = require('./metrics')
var cache = require('memory-cache');
const { urlReplaceProtocol } = require('./utils')


// how much time to skip when looking for the historic max value of a metric
const MAX_GRACE_PERIOD = "7d"
let nrUrls = 0;

const influx = new Influx.InfluxDB({
  host: process.env.INFLUX_HOST || 'influxdb',
  port: process.env.INFLUX_PORT || '8086'
})

// merge the MEAN values from month and year queries to accept http and https link as the same key;
const merge_results = (seriesRows, days) => {
  const seriesValues = new Object()
  const seriesDuplicates = {};

  for (const row of seriesRows) {
    const url = urlReplaceProtocol(row.url);
    if (!seriesDuplicates[url]) {
      seriesDuplicates[url] = {};
    }
    if (!seriesDuplicates[url][row.url]) {
      seriesDuplicates[url][row.url] = [];
    }

    seriesDuplicates[url][row.url].push({ value: row.value, count: row.count });
  }

  for (const url in seriesDuplicates) {
    const values = [];
    for (let i = 0; i < days; i++) {
      let value = 0;
      let count = 0;
      for (const unsplit_url in seriesDuplicates[url]) {
        const elem = seriesDuplicates[url][unsplit_url][i];
        if (elem.value !== -1) {
          value += elem.value * elem.count;
          count += elem.count;
        }
      }
      if (count === 0)
        values.push(-1);
      else {
        values.push(Math.round(value / count));
      }
    }

    seriesValues[url] = values;
  }
  return seriesValues;
}

const query = async (metricSpec, start_date, end_date, no_cache) => {
  const { name, measurement, field, database } = metricSpec
  let metricsRows, lastMetricsRows, maxRows, monthSeriesRows, yearSeriesRows;
  let cacheResult = null;
  if (!no_cache) {
    cacheResult = cache.get(name);
  }

  let time_condition = 'time >= now() - 1d';

  if (end_date) {    
    time_condition = `time >= '${start_date.toISOString().split('.')[0]}Z' `;
    time_condition += `and time <= '${end_date.toISOString().split('.')[0]}Z'`;
  }

  const metricsQuery = `SELECT "url", "time", "${field}" AS "value" FROM "${measurement}" WHERE ${time_condition} GROUP BY "url" ORDER BY "time" DESC LIMIT 1`
  const lastMetricQuery = `SELECT "url", "time", "${field}" AS "value" FROM "${measurement}" GROUP BY "url" ORDER BY "time" DESC LIMIT 1`
  const maxQuery = `SELECT max("${field}") AS "value" FROM "${measurement}" WHERE time <= now() - ${MAX_GRACE_PERIOD} GROUP BY "url" fill(none) ORDER BY time DESC LIMIT 1`
    // last 30 days - should we add `LIMIT 30` ?
  const monthSeriesQuery = `SELECT mean("${field}") AS "value", count("${field}") AS "count" FROM "${measurement}" WHERE time >= now() - 30d GROUP BY time(1d), "url" fill(-1) ORDER BY time ASC`
    // last 365 days
  const yearSeriesQuery = `SELECT mean("${field}") AS "value", count("${field}") AS "count" FROM "${measurement}" WHERE time >= now() - 365d GROUP BY time(7d), "url" fill(-1) ORDER BY time ASC`

  if (cacheResult !== undefined && cacheResult !== null) {
    metricsRows = cacheResult.metricsRows;
    lastMetricsRows = cacheResult.lastMetricsRows;
    maxRows = cacheResult.maxRows;
    monthSeriesRows = cacheResult.monthSeriesRows;
    yearSeriesRows = cacheResult.yearSeriesRows;

  } else {
    [ metricsRows, lastMetricsRows, maxRows, monthSeriesRows, yearSeriesRows ] = await Promise.all([
      influx.query(metricsQuery, { database }),
      influx.query(lastMetricQuery, { database }),
      influx.query(maxQuery, { database }),
      influx.query(monthSeriesQuery, { database }),
      influx.query(yearSeriesQuery, { database })
    ]).catch((e) => {
      console.error(e);
      return [[], [], [], [], []];
    })

    if (!no_cache) {
      cache.put(name, {
        metricsRows,
        lastMetricsRows,
        maxRows,
        monthSeriesRows,
        yearSeriesRows
      }, 60000);
    }
  }

  // order asc metricRows to get the last value every time;
  metricsRows.sort(function(a, b) {
    return a.time - b.time;
  });

  const metricsValues = {}
  for (const row of metricsRows) {
    metricsValues[urlReplaceProtocol(row.url)] = {
      time: row.time,
      value: row.value
    }
  }

  lastMetricsRows.sort(function(a, b) {
    return a.time - b.time;
  });

  const lastValues = {}
  for (const row of lastMetricsRows) {
    lastValues[urlReplaceProtocol(row.url)] = {
      last: row.value,
      lastTime: (row.time.toISOString() || "").substr(0, 16).replace("T", " "),
      lastTimeMs: row.time.getTime(),
    }
  }

  maxRows.sort(function(a, b) {
    return a.time - b.time;
  });

  const maxValues = {}
  for (const row of maxRows) {
    maxValues[urlReplaceProtocol(row.url)] = {
      max: row.value,
      maxTime: (row.time.toISOString() || "").substr(0, 10),
    }
  }

  
  const monthSeriesValues = merge_results(monthSeriesRows, 30);
  const yearSeriesValues = merge_results(yearSeriesRows, 53); // query grouped by 7d, so 53 weeks of data

  const data = {}
  for (const url of Object.keys(lastValues)) {
    const { value } = metricsValues[url] || { "value": null }
    const { last, lastTime, lastTimeMs } = lastValues[url] || {}
    const { max, maxTime } = maxValues[url] || {}
    const monthSeries = monthSeriesValues[url] || []
    const yearSeries = yearSeriesValues[url] || []

    data[url] = { value, last, lastTime, lastTimeMs, max, maxTime, monthSeries, yearSeries }
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

const getData = async (start_date, end_date, no_cache) => {
  const results = await Promise.all(metrics.map((metric) => query(metric, start_date, end_date, no_cache)))
  const metricResults = {}
  metrics.forEach((metric, i) => metricResults[metric.name] = results[i])

  const urlMap = {}

  for (const metric of metrics) {
    const results = metricResults[metric.name]
    for (const url of Object.keys(results)) {
      const row = urlMap[url] || { url, metrics: {}, score: 0, checks: 0, currentChecks: 0, checkListMonth: [], checkListYear: [] }
      urlMap[url] = row
      const result = results[url]
      row.metrics[metric.name] = {
        value: Math.round(result.value),
        last: Math.round(result.last),
        lastTime: result.lastTime,
        lastTimeMs: result.lastTimeMs,
        max: Math.round(result.max),
        maxTime: result.maxTime,
        monthSeries: result.monthSeries,
        yearSeries: result.yearSeries
      }

      row.checkListMonth = fillCheckList(result.monthSeries, row.checkListMonth)
      row.checkListYear = fillCheckList(result.yearSeries, row.checkListYear)

      if (result.value) {
        row.currentChecks += 1
      }
      row.score += (result.value) ? result.value : 0
      row.checks += 1
    }
  }

  // Eliminate URLs with no current checks
  for (const url of Object.keys(urlMap)) {
    if (urlMap[url].currentChecks === 0) {
      delete urlMap[url]
    }
  }

  nrUrls = Object.keys(urlMap).length;

  for (let url in urlMap) {
    urlMap[url].checkListMonth = urlMap[url].checkListMonth.map(x=>x*5);
    urlMap[url].checkListYear = urlMap[url].checkListYear.map(x=>x*5);
  }

  const rv = Object.values(urlMap)
  for (const row of rv) {
    row.score = Math.round(row.score)
    row.median = median(Object.values(row.metrics).map((row) => row.value))
  }

  return rv
}

module.exports = {
  getData,
  influx
}
