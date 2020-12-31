const fs = require('fs')

const SONARQUBE_URL = process.env.SONARQUBE_URL

const findReportPath = async (report, slug, onDemand) => {
  const reportsPath = process.env.REPORTS_PATH
  if (!reportsPath) throw new Error("Required env var REPORTS_PATH is not set")

  const onDemandPart = (onDemand === true) ? "/on-demand" : ""
  const parent = `${reportsPath}${onDemandPart}/${report}/${slug}`
  try {
    if (!(await fs.promises.lstat(parent)).isDirectory()) return null
  } catch(e) {
    if(e.code === 'ENOENT') return null
    throw e
  }
  const items = await fs.promises.readdir(parent)
  const filtered_items = items.filter(folder => !isNaN(Date.parse(folder.slice(0,10))))
  const name = filtered_items.sort().reverse()[0]
  return name && `${parent}/${name}`
}

const reportUrl = (metric, slug, onDemand) => {
    const onDemandPart = (onDemand === true) ? "/on-demand" : ""
    const fileUrl = (fragment) => `/site/${slug}/reports${onDemandPart}/${fragment}`

  switch (metric.database) {
    case "lighthouse":
      return fileUrl("lighthouse-reports/lighthouse.html")

    case "linksintegrity":
      return fileUrl("linksintegrity-results/linksintegrity.txt")

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

    case "browsertime":
      return fileUrl("browsertime-results/browsertime.html")

    default:
      return null
  }
}

module.exports = {
  findReportPath,
  reportUrl,
}
