const fs = require('fs')

const findReportPath = async (report, slug) => {
  const reportsPath = process.env.REPORTS_PATH
  if (!reportsPath) throw new Error("Required env var REPORTS_PATH is not set")
  const parent = `${reportsPath}/${report}/${slug}`
  try {
    if (!(await fs.promises.lstat(parent)).isDirectory()) return null
  } catch(e) {
    if(e.code === 'ENOENT') return null
    throw e
  }
  const items = await fs.promises.readdir(parent)
  const name = items.sort().reverse()[0]
  return name && `${parent}/${name}`
}

const reportFilename = (metric) => {
  switch (metric.database) {
    case "lighthouse":
      return "lighthouse.html"

    case "linksintegrity":
      return "linksintegrity.txt"

    case "privacyscore":
      return "privacyscore.html"

    case "securityheaders":
      return "securityheaders.html"

    case "ssllabs":
      return "ssllabs.txt"

    case "webbkoll":
      return "webbkoll.html"

    default:
      return null
  }
}

const reportUrl = (metric) => {
  const filename = reportFilename(metric)
  if (!filename) return null
  return `${metric.database}-results/${filename}`
}

module.exports = {
  findReportPath,
  reportUrl,
}
