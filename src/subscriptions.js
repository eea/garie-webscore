const sleep = require('sleep-promise');
const { influx } = require('./queries');
const queries = require('./queries');
const cron = require('node-cron');

const {
    send_email_first_place,
    send_email_entered_top_five,
    send_email_exited_top_five,
    send_email_above_median,
    send_email_below_median,
    send_email_bottom_five,
    send_email_subscription_started,
    send_monthly_email
} = require('./email');

const {
    urlSlug
} = require('./utils');

const test = require('./test');

const test_functions = Object.values(test);
let test_idx = 0;
const TEST_SUBSCRIPTION_EVENTS = process.env.TEST_SUBSCRIPTION_EVENTS || false;

const DATABASE_NAME = 'leaderboard';
const CONSISTENCY_LENGTH = 3;

// every wednsday at 11:00;
const CRONJOB_INTERVAL = {
    cronjob_syntax: process.env.MAIL_SUBSCRIPTION_FREQUENCY_CRONJOB || '0 11 * * 1',
    influx_syntax: process.env.MAIL_SUBSCRIPTION_INFLUX_SYNTAX || '7d'
}

const MONTHLY_SUBSCRIPTION = {
    cronjob_syntax: process.env.MONTHLY_MAIL_SUBSCRIPTION || "0 12 1 * *",
    influx_syntax: "30d"
}

cron.schedule(MONTHLY_SUBSCRIPTION.cronjob_syntax, async() => monthly_notification());

cron.schedule(CRONJOB_INTERVAL.cronjob_syntax, async()=> send_notification());


async function monthly_notification() {
    let emails = await get_all_emails();
    if (Object.keys(emails).length === 0) {
        console.log("No mail to send monthly emails to.");
        return;
    }

    console.log("Start sending the monthly emails...");
    let current_and_old_scores = {};

    const {urls_map, data} = await get_current_scores();
    let current_urls_sorted = sort_data(urls_map, false);

    for (let i = 0; i < current_urls_sorted.length; i++) {
        current_and_old_scores[current_urls_sorted[i].url] = {
            current_score: current_urls_sorted[i].score,
            current_rank: i + 1,
            last_month_score: 0,
            last_month_rank: 0
        }
    }

    const month_query = `select * from "webscore-leaderboard" where time >= now() - ${MONTHLY_SUBSCRIPTION.influx_syntax} order by time desc`;
    let all_last_month = [];
    try {
        all_last_month = await influx.query(month_query, {database: DATABASE_NAME});
    } catch(err) {
        console.log('Can not get last month query', err);
    }

    let old_scores = {};

    for (let elem of all_last_month) {
        old_scores[elem.url] = elem.score;
    }

    let sorted_old_scores = []
    for (let elem in old_scores) {
        if (old_scores[elem] >= 0) {
            sorted_old_scores.push([elem, old_scores[elem]])
        }
    }

    sorted_old_scores.sort(function(a, b) {
        return b[1] - a[1];
    });

    for (let i = 0; i < sorted_old_scores.length; i++) {
        const url = sorted_old_scores[i][0];
        if (current_and_old_scores[url] != undefined && old_scores[url] >= 0) {
            current_and_old_scores[url].last_month_score = old_scores[url];
            current_and_old_scores[url].last_month_rank = i + 1;
        }
    }

    send_monthly_email(current_urls_sorted, current_and_old_scores, emails);

}

async function update_email_for_url(url, email, active) {

    try{
        const point = {
            measurement: "application-emails",
            tags: {
                url: url,
                email: email,
                active: active
            },
            fields: {date: Date.now() }
        }

        await influx.writePoints([point], {database: DATABASE_NAME});
        console.log(`Successfully saved email ${email} for the application ${url} as ${active}.`);
        if (parseInt(active) === 1) {
            const {urls_map} = await get_current_scores();
            send_email_subscription_started(url, email, urls_map);
        }
    } catch (err) {
        console.log(`Failed to save email ${email} for application ${url}.`);
        console.log(err);
        return Promise.reject(`Failed to save email ${email} for application ${url}.`);
    }
}

async function get_all_emails() {
    //get emails from database
    let emails = {};
    const query = 'select * from "application-emails" order by "time" asc';
    try{
        result = await influx.query(query, {database: DATABASE_NAME});
    } catch(err) {
        console.log(err);
        return emails;
    }

    for (let elem of result) {
        emails[elem.url] = emails[elem.url] || {};
        const active = parseInt(elem.active);
        emails[elem.url][elem.email] = active;
    }
    return emails;
}

async function create_db() {
    try {
        const names = await influx.getDatabaseNames();
        if (names.indexOf(DATABASE_NAME) === -1) {
            console.log("Influx: leaderboard database does not exist. Creating Database.");
            await influx.createDatabase(DATABASE_NAME);
        }
        return Promise.resolve();
    } catch (err) {
        console.log(`Influx: Error when creating database ${err}`);
        return Promise.reject('Failed to create database leaderboard');
    }
}


async function init_leaderboard_influx() {
    let retries = 0;
    while(true) {
        try {
            console.log('Trying to connect to influx');
            await create_db();
            console.log('Connected to influx');
            break;
        }catch(err) {
            retries++;
            if (retries < 60) {
                console.log(`Failed to connect to influx, retry ${retries}`);
                await sleep(1000);
            } else {
                throw(err);
            }
        }
    }
}


function map_data(data) {  
    let urls_map = {};

    for (const row of data) {
        let metrics = {};
        for (const metric in row.metrics) {
            metrics[metric] = row.metrics[metric].value;
        }
        urls_map[row.url] = {
            metrics,
            score: row.score
        };
    }
    return urls_map;
}


function sort_data(urls_map, keep_negatives=false) {
    let urls_array_sorted = [];
    for (const key in urls_map) {
        urls_map[key].score = parseInt(urls_map[key].score, 10);
        if (!keep_negatives) {
            if (!Number.isNaN(urls_map[key].score) && (urls_map[key].score !== -1) ) {
                urls_array_sorted.push({
                    url: key,
                    score: urls_map[key].score
                });
            }
        } else {
            if (!Number.isNaN(urls_map[key].score)) {
                urls_array_sorted.push({
                    url: key,
                    score: urls_map[key].score
                });
            }
        }
        
    }

    urls_array_sorted.sort(function(a, b) {
        return b.score - a.score;
    });

    return urls_array_sorted;
}


async function update_influx(urls_array_sorted) {
    let points = [];
    try {
        for (let i = 0; i < urls_array_sorted.length; i++) {
            points.push( {
                measurement: "webscore-leaderboard",
                tags: {
                    url: urls_array_sorted[i].url,
                    score: urls_array_sorted[i].score
                },
                fields: { date: Date.now() }
            })
        }

        const result = await influx.writePoints(points, {database: DATABASE_NAME});
        console.log(`Successfully saved ${points.length} applications into database leaderboard`);
        return result;
    } catch (err) {
        console.log(`Failed to add applications to leaderboard database. ${points.length} apps. ${err}`);
        return Promise.reject(`Failed to add applications to leaderboard database. ${points.length} apps. ${err}`);
    }
}


async function get_last_entries() {
    const query =  `select * from "webscore-leaderboard" where time >= now() - ${CRONJOB_INTERVAL.influx_syntax}`;
    let result = [];
    let last_urls_map = {};
    try {
        result = await influx.query(query, { database: DATABASE_NAME });
    } catch(err) {
        console.log(err);
        return last_urls_map;
    }
    
    for (const elem of result) {
        last_urls_map[elem.url] = {
            score: elem.score
        }
    }

    return last_urls_map;
}


function get_mapped_scores(scores_sorted) {
    let scores_sorted_map = [];

    for(let i = 0; i < scores_sorted.length; i++) {
        scores_sorted_map.push({});
        for (const elem of scores_sorted[i]) {
            scores_sorted_map[i][elem.url] = elem.score;
        }
    }
    return scores_sorted_map;
}


//either all true or all false;
function check_consistency_topk(k, url, scores_sorted, scores_sorted_map) {
    let last_outside_topk = null;

    for (let i = 0; i < scores_sorted.length; i++) {
        if ((scores_sorted_map[i][url] === undefined) || (scores_sorted[i][k] === undefined)) {
            return false;
        }
        
        const outside_topk = (scores_sorted_map[i][url] < scores_sorted[i][k - 1].score);
        if ((last_outside_topk !== null) && (last_outside_topk !== outside_topk)) {
            return false;
        }

        last_outside_topk = outside_topk;
    }
    return true;
}


function check_consistency_bottomk(k, url, scores_sorted, scores_sorted_map) {
    let last_outside_bottomk = null;

    for (let i = 0; i < scores_sorted.length; i++) {
        if ((scores_sorted_map[i][url] === undefined) || ( scores_sorted[i][scores_sorted[i].length - k] === undefined)) {
            return false;
        }
        const outside_bottomk = (scores_sorted_map[i][url] > scores_sorted[i][scores_sorted[i].length - k].score);
        if ((last_outside_bottomk !== null) && (last_outside_bottomk !== outside_bottomk)) {
            return false;
        }

        last_outside_bottomk = outside_bottomk;
    }
    return true;
}

function check_consistency_median(url, scores_sorted, scores_sorted_map) {
    let last_below_median = null;

    for (let i = 0; i < scores_sorted.length; i++) {
        if (scores_sorted_map[i][url] === undefined) {
            return false;
        }
        const median = scores_sorted[i][Math.round(scores_sorted[i].length / 2)].score;
        const below_median = (scores_sorted_map[i][url] < median);
        console.log(`The ${i} median score is ${median}.`);

        if ((last_below_median !== null) && (last_below_median !== below_median)) {
            return false;
        }

        last_below_median = below_median;
    }
    return true;
}

function get_rank(current_urls_array_sorted, url) {
    for (let i = 0; i < current_urls_array_sorted.length; i++) {
        if (current_urls_array_sorted[i].url === url) {
            return i;
        }
    }

    return -1;
}

async function get_current_scores() {
    const data = await queries.getData();
    for (const row of data) {
        row.url = urlSlug(row.url);
    }
    const urls_map = map_data(data);
    return {urls_map, data};
}

async function send_notification() {
    await init_leaderboard_influx();
    const last_urls_map = await get_last_entries();

    let emails = await get_all_emails();
    if (Object.keys(emails).length === 0) {
      return;
    }


    //after querying influx for last week's results, update influx with current scores;
    const {urls_map, data} = await get_current_scores();
    let current_urls_array_sorted = sort_data(urls_map, true);
    await update_influx(current_urls_array_sorted);
    current_urls_array_sorted = sort_data(urls_map, false);


    if (Object.keys(last_urls_map).length === 0) {
        console.log("No data found in webscore-leaderboard for last week");
        return;
    }

    let scores = [];
    scores.push({});

    for (let i = 0; i < current_urls_array_sorted.length; i++) {
        scores[0][current_urls_array_sorted[i].url] = {score: current_urls_array_sorted[i].score};
    }

    for (let i = 0; i < CONSISTENCY_LENGTH; i++) {
        scores.push({});
    }

    for(const row of data) {
        for (const metric in row.metrics) {
            const month_values = row.metrics[metric].monthSeries;
            for (let i = 1; i <= CONSISTENCY_LENGTH; i++) {
                if (month_values[30 - i] !== -1) {
                    scores[i][row.url] = scores[i][row.url] || {score: 0};
                    scores[i][row.url].score += parseInt(month_values[30 - i] || 0);
                }
            }
        }
    }

    if (TEST_SUBSCRIPTION_EVENTS === "true") {
        const test_function = test_functions[test_idx];
        console.log("Now running test: ", test_function.name);
        scores = test_function(scores);
        test_idx = (test_idx + 1) % test_functions.length;
    }
    
    
    //scores_sorted[0] => current score; socres_sorted[0] -> two days ago; socres_sorted[1] -> two days ago...
    const scores_sorted = scores.map(map => sort_data(map));
    const scores_sorted_map = get_mapped_scores(scores_sorted);
    
    
    const last_urls_array_sorted = sort_data(last_urls_map);
    const last_loserboard = last_urls_array_sorted.slice(last_urls_array_sorted.length - 5, last_urls_array_sorted.length);
    current_urls_array_sorted = scores_sorted[0];
   
    const current_leaderboard = current_urls_array_sorted.slice(0, 5);
    const current_loserboard = current_urls_array_sorted.slice(current_urls_array_sorted.length - 5, current_urls_array_sorted.length);

    //check 1st place, current day:
    if (current_urls_array_sorted[0].url !== last_urls_array_sorted[0].url) {
        send_email_first_place(1, current_urls_array_sorted[0], current_leaderboard, emails);
    }

    //set with old top 5;
    const old_top5_set = new Set();
    for (let i = 0; i < 5; i++) {
        old_top5_set.add(last_urls_array_sorted[i].url);
    }

    //check if current top 5 is the same as old top 5;
    for (let i = 0; i < 5; i++) {
        const is_consistent = check_consistency_topk(5, current_urls_array_sorted[i].url, scores_sorted, scores_sorted_map);
        if (is_consistent) {
            if (!old_top5_set.has(current_urls_array_sorted[i].url)) {
                if (i !== 0) {
                    const rank = i + 1;
                    send_email_entered_top_five(rank, current_urls_array_sorted[i], current_leaderboard, emails);
                }
            } else {
                old_top5_set.delete(current_urls_array_sorted[i].url);
            }
        }
    }

    //check for remnants of old top 5
    for (let elem of old_top5_set) {
        const is_consistent = check_consistency_topk(5, elem, scores_sorted, scores_sorted_map);
        if (is_consistent) {
            const rank = get_rank(current_urls_array_sorted, elem) + 1;
            send_email_exited_top_five(rank, {url: elem, score: urls_map[elem].score}, current_leaderboard, emails);
        }
    }

    //check for new consistent entries in bottom 5
    const old_bottom5_set = new Set();
    for (let i = 0; i < 5; i++) {
        old_bottom5_set.add(last_loserboard[i].url);
    }


    for(let i = current_urls_array_sorted.length - 1; i >= current_urls_array_sorted.length - 5; i--) {
        const is_consistent = check_consistency_bottomk(5, current_urls_array_sorted[i].url, scores_sorted, scores_sorted_map);
        if (is_consistent) {
            if (!old_bottom5_set.has(current_urls_array_sorted[i].url)) {
                send_email_bottom_five(i + 1, current_urls_array_sorted[i], current_leaderboard, emails);
            }
        }
    }

    //notify above and below median;
    const above_median = current_urls_array_sorted.slice(5, Math.round(current_urls_array_sorted.length / 2));
    const below_median = current_urls_array_sorted.slice(Math.round(current_urls_array_sorted.length / 2) + 1, current_urls_array_sorted.length - 5);

    const last_median_score = last_urls_array_sorted[Math.round(last_urls_array_sorted.length / 2)].score;

    for (let i = 0; i < above_median.length; i++) {
        const url = above_median[i].url;
        //if it wasn't last week in the first half, check consistency and send mail;
        if (last_urls_map[url] === undefined) {
            continue;
        }
        if (last_urls_map[url].score < last_median_score) {
            const is_consistent = check_consistency_median(url, scores_sorted, scores_sorted_map);
            if (is_consistent === true) {
                const rank = i + 5 + 1;
                send_email_above_median(rank, above_median[i], current_leaderboard, emails);
            }
        }
    }
    
    for (let i = 0; i < below_median.length; i++) {
        const url = below_median[i].url;
        if (last_urls_map[url] === undefined) {
            continue;
        }
        // if it wasn't in last week second half, check consistency and send mail;
        if (last_urls_map[url].score > last_median_score) {
            const is_consistent = check_consistency_median(below_median[i], scores_sorted, scores_sorted_map);
            if (is_consistent) {
                const rank = i + (current_urls_array_sorted.length / 2) + 1;
                send_email_below_median(rank, below_median[i], current_leaderboard, emails);
            }
        }
    }    
}



module.exports = {
    update_email_for_url,
    get_all_emails,
    monthly_notification
}