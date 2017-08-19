const soapclient = require('./js/soapclient');
const schedules = require('./js/schedules');
const utils = require('./js/utils');
const edfApi = require('./js/edf-api');
const config = require('./config');
const mustache = require('mustache');
const fs = require('fs');
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

    const contentTmpl = `
    <h3>Métriques</h3>
    L'état du device est le suivant :
    <ul>
        <li>Etat : {{ metrics.state }}</li>
        <li>Consommation : {{ metrics.consumption  }}</li>
        <li>Consommation Totale : {{ metrics.totalConsumption  }}</li>
        <li>Temperature : {{ metrics.temperature }}</li>
    </ul>
    <h3>Nouvelle configuration</h3>
    La couleur de demain est <span style="color: {{ color }}">{{ color }}</span>, aussi la configuration suivante a été appliquée :
    <ul>
    {{#days}}
        <li>{{ day }} : {{ start.time24hFormat }} => {{ end.time24hFormat }}</li>
    {{/days}}
    </ul>`;

    soapclient.getScheduleSettings().then(newSchedule => {
        const content = mustache.render(contentTmpl, {
            metrics: metrics,
            days: newSchedule[0].days,
            color: color
        });
        utils.sendMail(
            'elian.oriou@gmail.com',
            'Configuration domotique appliquée ✔ (' + color + ')',
            content,
            config.mailConfig
        );
    });
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

