# garie-webscore
Garie-WebScore reports on the health of websites with data from InfluxDB.

## Development

```shell
cat <<EOF > .env
INFLUX_HOST=10.50.4.103
EOF

npm install
npm run app
```

## Run with Docker

```shell
docker build . --tag eea/garie-webscore
docker run \
  --rm \
  --name webscore \
  -p 3000:3000 \
  -e INFLUX_HOST=10.50.4.103 \
  eea/garie-webscore
```
