/**
 * Tool for reading data from D-Link DSP-W215 Home Smart Plug.
 *
 * Usage: enter your PIN code to LOGIN_PWD, change value of HNAP_URL according to your device settings.
 *
 * @type {exports|module.exports}
 */
const soapclient = require('./js/soapclient');
const config = require('./config').hnapConfig;
const fs = require('fs');
const q = require('q');

soapclient.login(config.login, config.pinCode, config.url).done(function (status) {
    if (!status || status !== "success") {
        throw "Login failed!";
    } else {
        console.log("Login success!");
    }
    start();
});

function start() {
    soapclient.on().done(function () {
        read();
    });
}

function read() {
    const commands = [
        soapclient.state(),
        soapclient.isDeviceReady(),
        soapclient.consumption(),
        soapclient.totalConsumption(),
        soapclient.temperature(),
        soapclient.getScheduleSettings(),
    ];
    q.all(commands).then(function (result) {
        console.log(new Date().toLocaleString());
        console.log(' -- state :', result[0] ? 'OK' : 'KO');
        console.log(' -- device ready :', result[1] ? 'OK' : 'KO');
        console.log(' -- consumption :', result[2]);
        console.log(' -- total consumption :', result[3]);
        console.log(' -- temperature :', result[4]);
        console.log(' -- schedule :', JSON.stringify(result[5], '', '\t'));

        soapclient.setScheduleSettings(result[5]);
    });
}
