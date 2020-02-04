const fs = require('fs').promises

async function findReportPath(report, slug) {
  const reportsPath = process.env.REPORTS_PATH
  if (!reportsPath) throw new Error("Required env var REPORTS_PATH is not set")
  const parent = `${reportsPath}/${report}/${slug}`
  try {
    if (!(await fs.lstat(parent)).isDirectory()) return null
  } catch(e) {
    if(e.code === 'ENOENT') return null
    throw e
  }
  const items = await fs.readdir(parent)
  const name = items.sort().reverse()[0]
  return name && `${parent}/${name}`
}

module.exports = {
  findReportPath
}
