const soapclient = require('./js/soapclient');
const schedules = require('./js/schedules');
const utils = require('./js/utils');
const config = require('./config');
const fs = require('fs');
const q = require('q');

const color = utils.getArgValue('color', true);

const start = function () {
    soapclient.on().done(function () {
        read();
    });
};

const updateSchedule = function (schedule) {
    soapclient.setScheduleSettings(schedule).then(function (response) {
        console.log();
        console.log(' -- schedule update :', '(color : ' + color + ') schedule color has been passed, remote config has been updated');
        console.log(' -- schedule after :', JSON.stringify(schedule));
    });
};

const read = function () {

    const commands = [
        soapclient.state(),
        soapclient.isDeviceReady(),
        soapclient.consumption(),
        soapclient.totalConsumption(),
        soapclient.temperature(),
        soapclient.getScheduleSettings()
    ];

    q.all(commands).then(function (result) {

        console.log(new Date().toLocaleString());
        console.log(' -- state :', result[0] ? 'OK' : 'KO');
        console.log(' -- device ready :', result[1] ? 'OK' : 'KO');
        console.log(' -- consumption :', result[2]);
        console.log(' -- total consumption :', result[3]);
        console.log(' -- temperature :', result[4]);
        console.log(' -- schedule before :', JSON.stringify(result[5]));

        if (color === 'red') {
            updateSchedule(schedules.generateTomorrowFullInactiveSchedule());
        } else {
            updateSchedule(schedules.generateTomorrowFullActiveSchedule());
        }
    });
};

const hnapConfig = config.hnapConfig;
soapclient.login(hnapConfig.login, hnapConfig.pinCode, hnapConfig.url).done(function (status) {
    if (!status || status !== "success") {
        throw "Login failed!";
    } else {
        console.log("Login success!");
    }
    start();
});

