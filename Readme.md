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

## Subscriptions

The tab subscriptions was created to have a system where one can subscribe to a specific application and get notifications regarding its rank and status with respect to the other apps.

The page is locked with user and password, both of which have to be given as environment variables: PAGE_USERNAME and PAGE_PASSWORD respectively (not optional, no default).

In the subscriptions tab you will find a table with all the applications, and for each app there will be a list of subscribers (by their emails). There is also a slot where one can add and remove an email with the help of the green 'plus' button and the red 'trash' button. (After you type in the email, press the button and an alert will appear that will tell you if the operation was successful). 

There are two additional optional environment variables:
MAIL_SUBSCRIPTION_FREQUENCY_CRONJOB (default to '0 11 * * 1', every Monday at 11:00). This tells the frequency of the notifications. In case an event happens (such as 'Your application is no longer in top 5', or 'Your application is now in the bottom 5'), the subscribers of the app will receive an informative email.
MAIL_SUBSCRIPTION_INFLUX_SYNTAX (default to '7d'), this tells the influx to compare the results from 'x' days ago to the ones in the present, in order to mail the subscriber the right event.

If you want to change one of the two last variables mentioned, you will have to change both the CRONJOB syntax and also the INFLUX syntax, for the subscription system to work as intended.

If you want to test the system, you can make the environment variable TEST_SUBSCRIPTION_EVENTS 'true' (it defaults to 'false'). There are several tests (you can find them in test.js) that run, with the frequency set by the cronjob, that manually change a website's score and notifies the list of subscribers.

## License
Icons from https://icons.getbootstrap.com/, MIT license

