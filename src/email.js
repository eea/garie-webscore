const nodemailer = require('nodemailer');
const nunjucks = require('nunjucks');


const mail = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        //TODO: TO COMPLETE USER AND PASS
        user: '',
        pass: ''
    }
});



function send_email_first_place(app_info, current_leaderboard, emails) {
    const text = `Congratulations! Your application has now the highest score and reached first place with ${aoo_info.score} points!`;
    send_email(app_info, current_leaderboard, text, emails);
}

function send_email_entered_top_five(app_info, current_leaderboard, emails) {
    const text = `Nice! Your application is in top five with ${app_info.score} points!`;
    send_email(app_info, current_leaderboard, text, emails);
}

function send_email_exited_top_five(app_info, current_leaderboard, emails) {
    const text = "Watch out! Your application is no longer in top five :(";
    send_email(app_info, current_leaderboard, text, emails);
}

function send_email_above_median(app_info, current_leaderboard, emails) {
    const text = `Your application's score has risen above the median of all scores of all the applications with ${app_info.score} points!`;
    send_email(app_info, current_leaderboard, text, emails);
}

function send_email_below_median(app_info, current_leaderboard, emails) {
    const text = `Watch out! Your application's score dropped below the median of all scores of all applications :(`;
    send_email(app_info, current_leaderboard, text, emails);
}

function send_email_bottom_five(app_info, current_leaderboard, emails) {
    const text = `Ouch! Your application is now within the bottom five scores :(`;
    send_email(app_info, current_leaderboard, text, emails);
}


function send_email(app_info, current_leaderboard, text, emails) {

    let email_list = [];
    for (let email in emails[app_info.url]) {
        if (emails[app_info.url][email] === 1) {
            email_list.push(email);
        }
    }

    console.log(email_list);

    try{
        const page = nunjucks.render('emailTemplate.html', {app_info, current_leaderboard, text})
        var mailOptions = {
            // TODO: TO COMPLETE MAIL
            from: '',
            to: email_list,
            subject: 'Status of your application in webscore',
            html: page
        }

        mail.sendMail(mailOptions, function(error, info){
            if (error) {
                console.log(`Could not send email ${error}`);
                return;
            } else {
                console.log('Email sent: ' + info.response);
            }
        });
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
    send_email_bottom_five

}