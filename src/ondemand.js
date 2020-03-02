const axios = require('axios')
const { metrics, onDemandApis } = require('./metrics')

const jobs = {}

class Scan {
  constructor(api, url) {
    this.api = api
    this.url = url
  }

  async launch() {
    try {
      const res = await axios.post(`${this.api.url}/scan`, {
        url: this.url,
      })
      this.id = res.data.id
    } catch (err) {
      console.error(err)
      this.finished = true
      this.success = false
    }
  }

  async poll() {
    const res = await axios.get(`${this.api.url}/scan/${this.id}`)
    const { state, result } = res.data
    if (state === 'success') {
      this.finished = true
      this.success = true
      this.result = result || {}
    }
    if (state === 'error') {
      this.finished = true
      this.success = false
    }
  }

  getResults() {
    const results = []
    for (const metric of metrics) {
      if (metric.database === this.api.database) {
        const row = { metric }
        if (this.success) {
          const value = this.result[metric.measurement]
          if (typeof(value) === 'number') {
            row.value = Math.round(value)
          }
        }
        results.push(row)
      }
    }
    return results
  }
}

const launch = async (url) => {
  const job = { url, id: new Date().getTime(), scans: [] }
  for (const api of onDemandApis) {
    const scan = new Scan(api, url)
    await scan.launch()
    job.scans.push(scan)
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
