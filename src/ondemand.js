const axios = require('axios')

const jobs = {}

const scan_ssllabs = async (url) => {
  const res = await axios.post('http://garie-ssllabs:3000/scan', { url })
  const { id } = res.data
  const parseResult = (result) => {
    return result.ssl_score
  }
  const poll = async () => {
    const res = await axios.get(`http://garie-ssllabs:3000/scan/${id}`)
    const { state, result } = res.data
    if (state === 'success') {
      scan.finished = true
      scan.success = true
      scan.result = parseResult(result)
    }
    if (state === 'error') {
      scan.finished = true
      scan.success = false
    }
    return scan
  }
  const scan = { name: "ssllabs", poll }
  return scan
}

const launch = async (url) => {
  const job = { url, id: new Date().getTime(), scans: [] }
  job.scans.push(await scan_ssllabs(url))
  jobs[job.id] = job
  return job
}

const poll = async (jobId) => {
  const job = jobs[jobId]
  if (!job) return null

  for (const scan of job.scans) {
    if (!scan.finished) {
      await scan.poll()
    }
  }

  return job
}

module.exports = {
  launch,
  poll,
}
