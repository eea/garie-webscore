var dateFormat = require('dateformat');


const urlSlug = (url) => {
    return url
      .replace(/^http[s]?:\/\//, '')
      .replace(/\/$/, '')
      .replace(/[^a-zA-Z0-9.]+/g, '-')
}

const urlReplaceProtocol = (url) => {
    return url.replace(/^http[s]?:\/\//, '');
}

const thresholdColor = (thresholds, value) => {
    if (typeof value === 'number' && value >= 0 && !isNaN(value)) {
      const [red, yellow] = thresholds
      if (value < red)
        return "table-danger"
      else if (value < yellow)
        return "table-warning"
      else
        return "table-success"
    } else {
      return "table-secondary"
    }
}

const healthColor = (alive) => {
  if (alive === 'UP') {
    return "table-success";
  } else if (alive === 'DOWN'){
    return "table-danger";
  } else {
    return "table-secondary";
  }
}

const checksStyle = (value) => {
    //TODO: instead of 13, 18... use (max_number_of_checks - something)
    if (typeof value === 'number' && !isNaN(value)) {
      if (value < 13)
        return "checks-low"
      else if (value < 18)
        return "checks-medium"
      else
        return "checks-best"
    } else {
      return ""
    }
}

const isExternal = (url) => {
    if (url.includes('europa.eu') || url.includes('copernicus') || url.includes('eea-subscriptions')) {
      return false
    }
    return true
}

const urlHostname = (url) => {
    return (new URL(url)).hostname
}

const UP_PATH_REGEXP = /(?:^|[\\/])\.\.(?:[\\/]|$)/
const isUpPath = (path) => {
  // Check if path contains `..`, we don't want clients browsing our filesystem
  return UP_PATH_REGEXP.test(path)
}

const newDate = (timestamp) => {
  return new Date(timestamp);
}

const formatDate = (date) => {
  return dateFormat(date, "yyyy-mm-dd hh:MM")
}


module.exports = {
    urlSlug,
    thresholdColor,
    healthColor,
    checksStyle,
    isExternal,
    urlHostname,
    isUpPath,
    urlReplaceProtocol,
    newDate,
    formatDate
}