const fs = require('fs');
const mustache = require('mustache');

exports.generate = (soapClient, config, color, metrics) => {

    const contentTmpl = `
    <h3>Metriques</h3>
    L etat du device est le suivant :
    <ul>
        <li>Etat : {{ metrics.state }}</li>
        <li>Consommation : {{ metrics.consumption  }}</li>
        <li>Consommation Totale : {{ metrics.totalConsumption  }}</li>
        <li>Temperature : {{ metrics.temperature }}</li>
    </ul>
    <h3>Nouvelle configuration</h3>
    La couleur de demain est <span style="color: {{ color.tomorrow }}">{{ color.tomorrow }}</span>, aussi la configuration suivante a ete appliquee :
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
        fs.writeFile(config.reportConfig.path, content, (err) => {
            if (err) {
                console.log(err);
            } else {
                console.log('[REPORT] report generated - ', config.reportConfig.path);
            }
        });
    });
};