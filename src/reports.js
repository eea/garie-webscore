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

const reportUrl = (metric) => {
  switch (metric.database) {
    case "lighthouse":
      return "lighthouse-reports/lighthouse.html"

    case "linksintegrity":
      return "linksintegrity-results/linksintegrity.txt"

    case "privacyscore":
      return "privacyscore-results/privacyscore.html"

    case "securityheaders":
      if (metric.measurement === "mozilla_score") {
        return "securityheaders-results/mozilla-observatory.txt"
      } else {
        return "securityheaders-results/securityheaders.html"
      }

    case "ssllabs":
      return "ssllabs-results/ssllabs.txt"

    case "webbkoll":
      return "webbkoll-results/webbkoll.html"

    default:
      return null
  }
}

module.exports = {
  findReportPath,
  reportUrl,
}
