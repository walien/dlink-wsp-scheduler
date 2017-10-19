const nodemailer = require('nodemailer');

const hasArg = (name) => {
    return process.argv.indexOf('--' + name) > 0;
};

const getArgValue = (name, mandatory) => {
    const argIndex = process.argv.indexOf('--' + name);
    if (argIndex > 0) {
        const value = process.argv[argIndex + 1];
        if (value) {
            return value;
        }
    }
    if (mandatory === true) {
        throw new Error("'" + name + "' arg is missing");
    }
    return null;
};

const sendMail = (to, subject, content, config) => {

    const transporter = nodemailer.createTransport({
        host: config.host,
        port: config.port,
        secure: config.secure,
        auth: {
            user: config.login,
            pass: config.password
        }
    });

    const options = {
        from: 'team.oriou@gmail.com',
        to: to,
        subject: subject,
        text: content,
        html: content
    };

    transporter.sendMail(options, (error, info) => {
        if (error) {
            return console.log(error);
        }
        console.log('[EMAIL] Message sent to', to);
    });

};

exports.hasArg = hasArg;
exports.getArgValue = getArgValue;
exports.sendMail = sendMail;
exports.days = {
    1: 'Mon',
    2: 'Tue',
    3: 'Wed',
    4: 'Thu',
    5: 'Fri',
    6: 'Sat',
    7: 'Sun'
};