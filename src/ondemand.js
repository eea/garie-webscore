const axios = require('axios')
const metrics = require('./metrics')

const jobs = {}

class Scan {
  constructor(metric, url) {
    this.metric = metric
    this.url = url
  }

  async launch() {
    const res = await axios.post(`${this.metric.apiUrl}/scan`, {
      url: this.url,
    })
    this.id = res.data.id
  }

  async poll() {
    const res = await axios.get(`${this.metric.apiUrl}/scan/${this.id}`)
    const { state, result } = res.data
    if (state === 'success') {
      this.finished = true
      this.success = true
      this.result = this.metric.parseResult(result)
    }
    if (state === 'error') {
      this.finished = true
      this.success = false
    }
  }
}

const launch = async (url) => {
  const job = { url, id: new Date().getTime(), scans: [] }
  for (const metric of metrics) {
    if (metric.apiUrl) {
      const scan = new Scan(metric, url)
      await scan.launch()
      job.scans.push(scan)
    }
  }
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
