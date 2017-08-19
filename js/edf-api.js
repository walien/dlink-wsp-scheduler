const got = require('got');
const moment = require('moment');

const mapping = {
    'ROUGE': 'red',
    'BLANC': 'grey',
    'BLEU': 'blue'
};

exports.fetchDayColor = () => {

    const date = moment().format('YYYY-MM-DD');

    return got(`https://particulier.edf.fr/bin/edf_rc/servlets/ejptemponew?Date_a_remonter=${date}&TypeAlerte=TEMPO`).then(response => {
        const tempoResults = JSON.parse(response.body);
        return mapping[tempoResults.JourJ1.Tempo];
    });
};