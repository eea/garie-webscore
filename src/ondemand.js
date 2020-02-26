const jobs = {}

const launch = async (url) => {
  const job = { url, id: new Date().getTime() }
  jobs[job.id] = job
  return job
}

const poll = async (jobId) => {
  const job = jobs[jobId]
  if (!job) return null

  return job
}

module.exports = {
  launch,
  poll,
}
