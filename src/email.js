const nodemailer = require('nodemailer');
const nunjucks = require('nunjucks');
const sleep = require('sleep-promise');


const mail = nodemailer.createTransport({
    host: process.env.MAIL_SERVER || 'postfix',
    port: process.env.MAIL_PORT || 25
});

const EMAIL_FROM = process.env.EMAIL_FROM || 'noreply@eea.europa.eu'

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


function send_email_first_place(rank, app_info, current_leaderboard, emails) {
    const text = `Congratulations! Your application has now the highest score and reached first place with ${app_info.score} points!`;
    send_email(rank, app_info, current_leaderboard, text, emails);
}

function send_email_entered_top_five(rank, app_info, current_leaderboard, emails) {
    const text = `Nice! Your application is in top five with ${app_info.score} points!`;
    send_email(rank, app_info, current_leaderboard, text, emails);
}

function send_email_exited_top_five(rank, app_info, current_leaderboard, emails) {
    const text = "Watch out! Your application is no longer in top five.";
    send_email(rank, app_info, current_leaderboard, text, emails);
}

function send_email_above_median(rank, app_info, current_leaderboard, emails) {
    const text = `Your application's score has risen above the median of all applications' scores with ${app_info.score} points!`;
    send_email(rank, app_info, current_leaderboard, text, emails);
}

function send_email_below_median(rank, app_info, current_leaderboard, emails) {
    const text = `Watch out! Your application's score dropped below the median of all applications' scores.`;
    send_email(rank, app_info, current_leaderboard, text, emails);
}

function send_email_bottom_five(rank, app_info, current_leaderboard, emails) {
    const text = `Ouch! Your application is now within the bottom five scores.`;
    send_email(rank, app_info, current_leaderboard, text, emails);
}


function resend_email(mailOptions, count) {
    if (count <= 0) {
        return;
    }
    mail.sendMail(mailOptions, async function(error, info){
        if (error) {
            if (error.message.includes("No recipients defined")) {
                return;
            }
            console.log(`Could not send email ${error}. Resending...`)
            count--;
            await sleep(60 * 1000);
            return resend_email(mailOptions, count)
        } else {
            console.log('Email sent: ' + info.response);
            return;
        }
    });
}

function send_email(rank, app_info, current_leaderboard, text, emails) {

    let email_list = [];
    for (let email in emails[app_info.url]) {
        if (emails[app_info.url][email] === 1) {
            email_list.push(email);
        }
    }

    try{
        const page = nunjucks.render('emailEventTemplate.html', {rank, app_info, current_leaderboard, text})
        var mailOptions = {
            from: `Webscore <${EMAIL_FROM}>`,
            to: email_list,
            subject: `Webscore Rank - ${app_info.url}`,
            html: page
        }
        // try resending the email if it does not work from the start;
        resend_email(mailOptions, 20);
    } catch (err) {
        console.log(`Could not send email ${err}`);
        return;
    }
}

function send_email_subscription_started(url, email, last_scores_saved) {
    let rank = -1;
    let score = -1;
    let leaderboard = [];
    let last_leaderboard = [];

    if (last_scores_saved.length !== 0) {
        const url_score = last_scores_saved[url] || {score: -1};
        score = url_score.score;

        last_leaderboard = sort_data(last_scores_saved);
        leaderboard = last_leaderboard.slice(0,5);
    }

    for (let i = 0; i < last_leaderboard.length; i++) {
        if ((last_leaderboard[i] !== undefined) && (last_leaderboard[i].url === url)) {
            rank = i + 1;
            break;
        }
    }

    try {
        const page = nunjucks.render('emailSubscriptionTemplate.html', {rank, url, score, leaderboard})
        var mailOptions = {
            from: `Webscore <${EMAIL_FROM}>`,
            to: email,
            subject: `Successfully subscribed to Webscore - ${url}!`,
            html: page
        }
        resend_email(mailOptions, 20);
    } catch (err) {
        console.log(`Could not send email ${err}`);
        return;
    }
}

async function send_monthly_email(current_urls_sorted, current_and_old_scores, emails, influx, DATABASE_NAME, already_sent) {
    const leaderboard = current_urls_sorted.slice(0, 5);
    for (let i = 0; i < current_urls_sorted.length; i++) {
        const url = current_urls_sorted[i].url;
        const current_score = current_and_old_scores[url].current_score;
        const last_month_score = current_and_old_scores[url].last_month_score;
        const current_rank = current_and_old_scores[url].current_rank;
        const last_month_rank = current_and_old_scores[url].last_month_rank;

        // in case the url is new, continue
        if (current_score === 0 || last_month_score === 0) {
            continue;
        }

        const text = get_email_text(
            current_score,
            last_month_score,
            current_rank,
            last_month_rank
        );
        let art = " a ";
        if (text.adj === "" && text.subst === " increase") {
            art = " an ";
        } else if (text.subst === " no change") {
            art = "";
        }

        const current = new Date();
        current.setMonth(current.getMonth())
        const currentMonth = current.toLocaleString('default', { month: 'long' });
        current.setMonth(current.getMonth()-1);
        const previousMonth = current.toLocaleString('default', { month: 'long' });
        const year = current.getFullYear();
        const email_text_score = `There has been ${art}${text.adj}${text.subst} in the score since the start of ${previousMonth} ${year}, from ${last_month_score} to ${current_score}.`
        const email_text_rank = `The current rank, ${current_rank}, is ${text.rank} the rank from the start of the month, which was ${last_month_rank}.`

        let email_list = [];
        for (let email in emails[url]) {
            if (emails[url][email] === 1) {
                email_list.push(email);
            }
        }

        for (let email of email_list) {
            if (already_sent && already_sent[url] !== undefined && already_sent[url].includes(email)) {
                console.log(`The monthly email for ${url} to ${email} was already sent!`);
                continue;
            }
            try {
                const page = nunjucks.render('emailMonthlyTemplate.html', {
                    leaderboard,
                    email_text_score,
                    email_text_rank,
                    url,
                    current_score,
                    last_month_score,
                    current_rank,
                    last_month_rank,
                    previousMonth,
                    currentMonth
                })
                var mailOptions = {
                    from: `Webscore <${EMAIL_FROM}>`,
                    to: email,
                    subject: `Webscore monthly update - ${url} - ${previousMonth} ${year}`,
                    html: page
                }
                await mark_monthly_email_sent(url, email, influx, DATABASE_NAME);
                resend_email(mailOptions, 20);
            } catch (err) {
                console.log(`Could not send monthly email ${err}`);
                return;
            }
        }
    }
}

async function mark_monthly_email_sent(url, email, influx, DATABASE_NAME) {
    try {
        const point = {
            measurement: "sent_mails",
            tags: {
                url: url,
                email: email
            },
            fields: {date: Date.now()}
        }

        await influx.writePoints([point], {database: DATABASE_NAME});
        console.log(`Sent monthly mail to ${email} for ${url}.`);
    } catch (err) {
        console.log(`Failed to save and send monthly email to ${email} for ${url}`, err);
        return Promise.reject(`Failed to save and send monthly email to ${email} for ${url}`);
    }
}

function get_email_text(current_score, old_score, current_rank, old_rank) {

    let text = {
        adj: "",
        subst: "",
        rank: ""
    }

    if (current_score - old_score > 0) {
        text.subst = " increase";
        if (current_score - old_score > 100) {
            text.adj = " significant";
        } else if (current_score - old_score <= 50) {
            text.adj = " slight";
        }
    } else if (current_score - old_score < 0) {
        text.subst = " decrease";
        if (old_score - current_score > 100) {
            text.adj = " significant";
        } else if (old_score - current_score <= 50) {
            text.adj = " slight";
        }
    } else {
        text.subst = " no change";
    }

    if (current_rank > old_rank) {
        text.rank = " lower than";
    } else if (current_rank < old_rank) {
        text.rank = " higher than";
    } else {
        text.rank = " the same as"
    }

    return text;
}

module.exports = {
    send_email_first_place,
    send_email_entered_top_five,
    send_email_exited_top_five,
    send_email_above_median,
    send_email_below_median,
    send_email_bottom_five,
    send_email_subscription_started,
    send_monthly_email
}