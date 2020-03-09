const axios = require('axios')
const { metrics, onDemandApis } = require('./metrics')

const JOB_POLL_INTERVAL = 3
const JOB_LIFETIME = 24 * 3600

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
      this.result = result || []
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
          const item = this.result.find((r) => r.measurement === metric.measurement)
          if (item && item.fields) {
            const value = item.fields[metric.field]
            if (typeof(value) === 'number') {
              row.value = Math.round(value)
            }
          }
        }
        results.push(row)
      }
    }
    return results
  }
}

const deltaSeconds = (t1, t0) => {
  return (t1.getTime() - t0.getTime()) / 1000
}

const launch = async (url) => {
  const job = {
    url,
    id: new Date().getTime(),
    createTime: new Date(),
    updateTime: new Date(),
    scans: [],
    done: false,
  }
  for (const api of onDemandApis) {
    const scan = new Scan(api, url)
    await scan.launch()
    job.scans.push(scan)
  }
  job.duration = () => {
    return Math.round(deltaSeconds(job.updateTime, job.createTime))
  }
  jobs[job.id] = job
  return job
}

const get = (jobId) => {
  return jobs[jobId]
}

const poll = async (job) => {
  if (job.done) return

  let done = true
  for (const scan of job.scans) {
    if (!scan.finished) {
      await scan.poll()
    }
    if (!scan.finished) done = false
  }
  job.done = done
  job.updateTime = new Date()
}

let pollJobsRunning = false

const pollJobs = async () => {
  if (pollJobsRunning) return
  try {
    pollJobsRunning = true
    for (const job of Object.values(jobs)) {
      // Forget about old jobs
      if (deltaSeconds(new Date(), job.createTime) > JOB_LIFETIME) {
        delete jobs[job.id]
      }

      try {
        await poll(job)
      } catch(err) {
        console.error(err)
      }
    }
  } catch(err) {
    console.error(err)
  } finally {
    pollJobsRunning = false
  }
}

setInterval(pollJobs, JOB_POLL_INTERVAL * 1000)

module.exports = {
  launch,
  get,
}
