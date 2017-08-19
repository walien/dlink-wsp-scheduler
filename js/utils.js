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

const sendMail = () => {
    // TODO
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