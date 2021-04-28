# garie-webscore
Garie-WebScore reporting website on the health of websites with data from InfluxDB.

## Development

```shell
cat <<EOF > .env
INFLUX_HOST=10.50.4.103
EOF

npm install
npm run app
```

### Download reports for local development
To test viewing of reports, run `getreports.py` in a container on Rancher, then
download `reports.tgz` locally, unpack it, and point the environment variable
`REPORTS_PATH` to it:

```
rancher exec garie/garie-webscore bash -c 'tar c $(/app/examples/getreports.py) | gzip -1 > /tmp/reports.tgz'
rancher exec garie/garie-webscore cat /tmp/reports.tgz > /tmp/reports.tgz
cd /tmp
tar xz < reports.tgz
# set REPORTS_PATH=/tmp/reports
```


## Run with Docker

```shell
docker build . --tag eea/garie-webscore
docker run \
  --rm \
  --name webscore \
  -p 3000:3000 \
  -e INFLUX_HOST=10.50.4.103 \
  -e REPORTS_PATH=/reports
  eea/garie-webscore
```

For development purposes, it can also be git-cloned and run directly on the dev machine, with the above env variables set, using:
```shell
npm install
npm start
```

## License
Icons from https://icons.getbootstrap.com/, MIT license

