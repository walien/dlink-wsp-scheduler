const mustache = require('mustache');
const utils = require('./utils');

exports.notifyChanges = (soapClient, config, color, metrics) => {

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
    La couleur de demain est <span style="color: {{ color.tomorrow }}">{{ color.tomorrow }}</span>, aussi la configuration suivante a été appliquée :
    <ul>
    {{#days}}
        <li>{{ day }} : {{ start.time24hFormat }} => {{ end.time24hFormat }}</li>
    {{/days}}
    </ul>`;

    soapClient.getScheduleSettings().then(newSchedule => {
        const content = mustache.render(contentTmpl, {
            metrics: metrics,
            days: newSchedule[0].days,
            color: color
        });
        utils.sendMail(
            config.mailConfig.from,
            config.mailConfig.to,
            'Configuration domotique appliquée ✔ (' + color.tomorrow + ')',
            content,
            config.mailConfig
        );
    });
};

