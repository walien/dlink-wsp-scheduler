const soapclient = require('./js/soapclient');
const schedules = require('./js/schedules');
const edfApi = require('./js/edf-api');
const emailNotifier = require('./js/email-notifier');
const reportGenerator = require('./js/report-generator');
const config = require('./config');
const q = require('q');

const start = () => {
    soapclient.on().done(() => {
        read();
    });
};

const updateSchedule = (color, schedule) => {
    return soapclient.setScheduleSettings(schedule).then(() => {
        console.log();
        console.log(' -- schedule update :', '(color : ' + color + ') schedule color has been passed, remote config has been updated');
        return true;
    });
};

const notifyChanges = (color, metrics) => {
    emailNotifier.notifyChanges(soapclient, config, color, metrics);
    reportGenerator.generate(soapclient, config, color, metrics);
};

const read = () => {

    const commands = [
        soapclient.state(),
        soapclient.isDeviceReady(),
        soapclient.consumption(),
        soapclient.totalConsumption(),
        soapclient.temperature(),
        edfApi.fetchDayColor()
    ];

    q.all(commands).then(results => {

        const metrics = {
            state: results[0] ? 'OK' : 'KO',
            consumption: results[2],
            totalConsumption: results[3],
            temperature: results[4],
        };
        const color = results[5];

        console.log(new Date().toLocaleString());
        console.log(' -- state :', metrics.state);
        console.log(' -- consumption :', metrics.consumption);
        console.log(' -- total consumption :', metrics.totalConsumption);
        console.log(' -- temperature :', metrics.temperature);
        console.log(' -- color :', color);

        if (color === 'red') {
            updateSchedule(color, schedules.generateTomorrowFullInactiveSchedule()).then(() => notifyChanges(color, metrics));
        } else {
            updateSchedule(color, schedules.generateTomorrowFullActiveSchedule()).then(() => notifyChanges(color, metrics));
        }
    });
};

const hnapConfig = config.hnapConfig;
soapclient.login(hnapConfig.login, hnapConfig.pinCode, hnapConfig.url).done(status => {
    if (!status || status !== "success") {
        throw "Login failed!";
    } else {
        console.log("Login success!");
    }
    start();
    process.stdin.pause();
});

