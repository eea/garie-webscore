const metrics = [
  {
    name: "Performance",
    important: true,
    database: "lighthouse",
    measurement: "performance-score",
    field: "value",
    thresholds: [50, 90],
    docs: "https://taskman.eionet.europa.eu/projects/netpub/wiki/Quality_metrics#Performance",
    help: "Performance - evaluated using <a href='https://developers.google.com/web/tools/lighthouse' target='_blank'>Lighthouse</a> in Chrome Developer Tools"
  },
  {
    name: "Performance (Fast Connection)",
    database: "lighthouse",
    measurement: "performance-score_fast",
    field: "value",
    thresholds: [50, 90],
    docs: "https://taskman.eionet.europa.eu/projects/netpub/wiki/Quality_metrics#Performance",
    help: "Performance - evaluated using <a href='https://developers.google.com/web/tools/lighthouse' target='_blank'>Lighthouse</a> in Chrome Developer Tools"
  },
  {
    name: "Progressive Web App",
    database: "lighthouse",
    measurement: "pwa-score",
    field: "value",
    thresholds: [50, 90],
    docs: "https://taskman.eionet.europa.eu/projects/netpub/wiki/Quality_metrics#Progressive-Web-App",
    help: "Progressive Web App - evaluated using <a href='https://developers.google.com/web/tools/lighthouse' target='blank'>Lighthouse</a> in Chrome Developer Tools"
  },
  {
    name: "Accessibility",
    database: "lighthouse",
    measurement: "accessibility-score",
    field: "value",
    thresholds: [50, 90],
    docs: "https://taskman.eionet.europa.eu/projects/netpub/wiki/Quality_metrics#Accessibility",
    help: "Accessibility - evaluated using <a href='https://developers.google.com/web/tools/lighthouse' target='_blank'>Lighthouse</a> in Chrome Developer Tools (Audits)"
  },
  {
    name: "Best Practice",
    database: "lighthouse",
    measurement: "best-practices-score",
    field: "value",
    thresholds: [50, 90],
    docs: "https://taskman.eionet.europa.eu/projects/netpub/wiki/Quality_metrics#Best-Practice",
    help: "Best Practice - evaluated using evaluated using <a href='https://developers.google.com/web/tools/lighthouse' target='_blank'>Lighthouse</a> in Chrome Developer Tools (Audits)"
  },
  {
    name: "Seo Score",
    database: "lighthouse",
    measurement: "seo-score",
    field: "value",
    thresholds: [50, 90],
    docs: "https://taskman.eionet.europa.eu/projects/netpub/wiki/Quality_metrics#Seo-Score",
    help: "SEO Score - evaluated using evaluated using <a href='https://developers.google.com/web/tools/lighthouse' target='_blank'>Lighthouse</a> in Chrome Developer Tools (Audits)"
  },
  {
    name: "Links integrity",
    database: "linksintegrity",
    measurement: "linksintegrity",
    field: "value",
    thresholds: [95, 99],
    docs: "https://taskman.eionet.europa.eu/projects/netpub/wiki/Quality_metrics#Links-integrity",
    help: "Links Integrity -  the amount of broken links in websites is evaluated using <a href='https://github.com/linkchecker/linkchecker' target='_blank'>linkchecker</a>, which is run locally in a Docker container"
  },
  {
    name: "Encryption (TLS)",
    important: true,
    database: "ssllabs",
    measurement: "ssl_score",
    field: "value",
    thresholds: [1, 90],
    docs: "https://taskman.eionet.europa.eu/projects/netpub/wiki/Quality_metrics#Encryption-TLS",
    help: "Encryption (TLS) - certificates validity and configuration are evaluated using the SSL test tool at <a href='https://www.ssllabs.com/ssltest/' target='_blank'>https://www.ssllabs.com/ssltest/</a>"
  },
  {
    name: "Securityheaders.com",
    important: true,
    database: "securityheaders",
    measurement: "header_score",
    field: "value",
    thresholds: [20, 90],
    docs: "https://taskman.eionet.europa.eu/projects/netpub/wiki/Quality_metrics#Securityheaderscom",
    help: "SecurityHeaders.com - Checks for missing HTTP security headers in website responses using the tool at <a href='https://securityheaders.com/' target='_blank'>https://securityheaders.com/</a>. This is somewhat outdated and mostly superseded by the Mozilla security headers metric."
  },
  {
    name: "Securityheaders(mozilla)",
    database: "securityheaders",
    measurement: "mozilla_score",
    field: "value",
    thresholds: [25, 70],
    docs: "https://taskman.eionet.europa.eu/projects/netpub/wiki/Quality_metrics#Securityheadersmozilla",
    help: "Securityheaders(mozilla) - also checks for missing HTTP security headers in website responses, but uses the tool at <a href='https://observatory.mozilla.org/' target='_blank'>https://observatory.mozilla.org/</a>"
  },
  {
    name: "Uptime(30days)",
    important: true,
    internal: true,
    database: "uptimerobot",
    measurement: "uptime_score",
    field: "value",
    thresholds: [95, 99],
    docs: "https://taskman.eionet.europa.eu/projects/netpub/wiki/Quality_metrics#Uptime30days",
    help: "Uptime (30 days) - this metrics gives 100 if the site is never found down/unresponsive within the checks performed under the last 30 days period. Uptime data gathered using <a href='https://uptimerobot.com/'>https://uptimerobot.com/</a>"
  },
  {
    name: "Server errors(30days)",
    important: true,
    internal: true,
    database: "sentry-metrics",
    measurement: "ServerErrors/TotalVisits",
    field: "value_30days",
    thresholds: [95, 99],
    docs: "https://taskman.eionet.europa.eu/projects/netpub/wiki/Quality_metrics#Server-errorsvisit-by-Sentry",
    help: "Server Errors (30 days) per visit - aggregation of the number of server-side errors/exception received in <a href='https://sentry.eea.europa.eu/' target='_blank'>Sentry</a> from the website, divided by the total number of website visits as logged by <a href='https://matomo.org/' target='_blank'>Matomo</a>."
  },
  {
    name: "JS errors(30days)",
    internal: true,
    database: "sentry-metrics",
    measurement: "JsEvents/TotalVisits",
    field: "value_30days",
    thresholds: [95, 99],
    docs: "https://taskman.eionet.europa.eu/projects/netpub/wiki/Quality_metrics#JS-errorsvisit-by-Sentry",
    help: "JS Errors per visit - aggregation of the number of JS errors/exceptions received in <a href='https://sentry.eea.europa.eu/' target='_blank'>Sentry</a>, divided by the number of website visits  as logged by <a href='https://matomo.org/' target='_blank'>Matomo</a>."
  },
  {
    name: "Test coverage",
    important: true,
    internal: true,
    database: "sonarqube",
    measurement: "coverage_rating",
    field: "value",
    thresholds: [30, 80],
    docs: "https://taskman.eionet.europa.eu/projects/netpub/wiki/Quality_metrics#Test-coverage-JenkinsSonarqube",
    help: "Test coverage - code quality metric that is computed based on the unit test coverage in <a href='https://ci.eionet.europa.eu' target='_blank'>Jenkins</a>."
  },
  {
    name: "Bugs",
    internal: true,
    database: "sonarqube",
    measurement: "reliability_rating",
    field: "value",
    thresholds: [25, 75],
    docs: "https://taskman.eionet.europa.eu/projects/netpub/wiki/Quality_metrics#Bugs-JenkinsSonarqube",
    help: "Bugs - code quality metric that is computed based on the results of tests ran in <a href='https://ci.eionet.europa.eu' target='_blank'>Jenkins</a> using the SonarQube plugin."
  },
  {
    name: "Vulnerabilities",
    internal: true,
    database: "sonarqube",
    measurement: "security_rating",
    field: "value",
    thresholds: [25, 75],
    docs: "https://taskman.eionet.europa.eu/projects/netpub/wiki/Quality_metrics#Vulnerabilities-JenkinsSonarqube",
    help: "Vulnerabilities - code quality metric that is computed based on the results of tests ran in <a href='https://ci.eionet.europa.eu' target='_blank'>Jenkins</a> using the SonarQube plugin."
  },
  {
    name: "Code smells",
    internal: true,
    database: "sonarqube",
    measurement: "sqale_rating",
    field: "value",
    thresholds: [25, 75],
    docs: "https://taskman.eionet.europa.eu/projects/netpub/wiki/Quality_metrics#Code-smells-JenkinsSonarqube",
    help: "Code smells - code quality metric is computed based on the results of tests ran in <a href='https://ci.eionet.europa.eu' target='_blank'>Jenkins</a> using the SonarQube plugin."
  },
  {
    name: "Duplication score",
    internal: true,
    database: "sonarqube",
    measurement: "non_duplication_rating",
    field: "value",
    thresholds: [80, 95],
    docs: "https://taskman.eionet.europa.eu/projects/netpub/wiki/Quality_metrics#Duplication-score-JenkinsSonarqube",
    help: "Duplication score - code quality metric is computed based on the results of tests ran in <a href='https://ci.eionet.europa.eu' target='_blank'>Jenkins</a> using the SonarQube plugin."
  },
  {
    name: "Webbkoll",
    important: true,
    database: "webbkoll",
    measurement: "webbkoll",
    field: "value",
    thresholds: [50, 90],
    docs: "https://taskman.eionet.europa.eu/projects/netpub/wiki/Quality_metrics#webbkolldataskyddnet",
    help: "webbkoll.dataskydd.net - evaluated using <a href='webbkoll.dataskydd.net' target='_blank'>Webbkoll</a>, an online tool that simulates a normal browser visit and checks for potential privacy problems."
  },
  {
    name: "Browsertime",
    important: false,
    database: "browsertime",
    measurement: "browsertimeScore",
    field: "value",
    thresholds: [50, 90],
    docs: "",
    help: "Browsertime provides an alternative way of evaluating website performance."
  },
  {
    name: "Checkmk(30days)",
    important: true,
    database: "checkmk",
    measurement: "cmk30DaysScore",
    field: "value",
    thresholds: [50, 90],
    docs: "",
    help: "Checkmk provides a score based on the data from checkmk server regarding downtimes."
  }
]

const onDemandApis = [
  {
    database: "linksintegrity",
    url: "http://garie-linksintegrity:3000",
  },
  {
    database: "ssllabs",
    url: "http://garie-ssllabs:3000",
  },
  {
    database: "sonarqube",
    url: "http://garie-sonarqube:3000",
  },
  {
    database: "lighthouse",
    url: "http://garie-lighthouse:3000",
  },
  {
    database: "securityheaders",
    url: "http://garie-securityheaders:3000",
  },
  {
    database: "sentry-metrics",
    url: "http://garie-sentry-metrics:3000",
  },
  {
    database: "uptimerobot",
    url: "http://garie-uptimerobot:3000",
  },
  {
    database: "webbkoll",
    url: "http://garie-webbkoll:3000",
  },
  {
    database: "browsertime",
    url: "http://garie-browsertime:3000",
  },
]

module.exports = {
  metrics,
  onDemandApis,
}
