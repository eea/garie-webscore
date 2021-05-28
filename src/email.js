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
        const page = nunjucks.render('emailTemplate.html', {rank, app_info, current_leaderboard, text})
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

module.exports = {
    send_email_first_place,
    send_email_entered_top_five,
    send_email_exited_top_five,
    send_email_above_median,
    send_email_below_median,
    send_email_bottom_five,
    send_email_subscription_started


}