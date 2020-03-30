const fs = require('fs')

const SONARQUBE_URL = process.env.SONARQUBE_URL

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

const reportUrl = (metric, slug) => {
  const fileUrl = (fragment) => `/site/${slug}/reports/${fragment}`
  switch (metric.database) {
    case "lighthouse":
      return fileUrl("lighthouse-reports/lighthouse.html")

    case "linksintegrity":
      return fileUrl("linksintegrity-results/linksintegrity.txt")

    case "privacyscore":
      return fileUrl("privacyscore-results/privacyscore.html")

    case "securityheaders":
      if (metric.measurement === "mozilla_score") {
        return fileUrl("securityheaders-results/mozilla-observatory.txt")
      } else {
        return fileUrl("securityheaders-results/securityheaders.html")
      }

    case "ssllabs":
      return fileUrl("ssllabs-results/ssllabs.txt")

    case "webbkoll":
      return fileUrl("webbkoll-results/webbkoll.html")

    case "sonarqube":
      if (SONARQUBE_URL) {
        return `${SONARQUBE_URL}/projects?tags=${slug}`
      }

    default:
      return null
  }
}

module.exports = {
  findReportPath,
  reportUrl,
}
