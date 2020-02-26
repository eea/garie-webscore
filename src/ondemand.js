const axios = require('axios')

const jobs = {}

class Scan {
  constructor(url) {
    this.url = url
  }

  async launch() {
    const res = await axios.post(`${this.apiUrl}/scan`, {
      url: this.url,
    })
    this.id = res.data.id
  }

  async poll() {
    const res = await axios.get(`${this.apiUrl}/scan/${this.id}`)
    const { state, result } = res.data
    if (state === 'success') {
      this.finished = true
      this.success = true
      this.result = this.parseResult(result)
    }
    if (state === 'error') {
      this.finished = true
      this.success = false
    }
  }
}

class SslLabsScan extends Scan {
  name = "Encryption (TLS)"
  apiUrl = "http://garie-ssllabs:3000"

  parseResult(result) {
    return result.ssl_score
  }
}

const scanners = [
  SslLabsScan,
]

const launch = async (url) => {
  const job = { url, id: new Date().getTime(), scans: [] }
  for (const scanner of scanners) {
    const scan = new scanner(url)
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
