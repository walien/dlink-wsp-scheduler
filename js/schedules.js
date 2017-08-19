const moment = require('moment');
const utils = require('./utils');

exports.generateTomorrowFullInactiveSchedule = () => {
    const tomorrow = moment().add(1, 'day').isoWeekday();
    const twoDaysLater = moment().add(2, 'day').isoWeekday();
    const days = [1, 2, 3, 4, 5, 6, 7].map(dayIndex => {
        if (dayIndex === tomorrow) {
            return {
                "date": "" + dayIndex,
                "day": utils.days[dayIndex],
                "allDay": "false",
                "start": {
                    "hours": 0,
                    "minutes": 0,
                    "midDateIndicator": "false"
                },
                "end": {
                    "hours": 6,
                    "minutes": 0,
                    "midDateIndicator": "false"
                }
            };
        } else if (dayIndex === twoDaysLater) {
            return {
                "date": "" + dayIndex,
                "day": utils.days[dayIndex],
                "allDay": "false",
                "start": {
                    "hours": 6,
                    "minutes": 0,
                    "midDateIndicator": "false"
                },
                "end": {
                    "hours": 11,
                    "minutes": 59,
                    "midDateIndicator": "true"
                }
            };
        } else {
            return {
                "date": "" + dayIndex,
                "day": utils.days[dayIndex],
                "allDay": "true",
                "start": {
                    "hours": 0,
                    "minutes": 0,
                    "midDateIndicator": "false"
                },
                "end": {
                    "hours": 11,
                    "minutes": 59,
                    "midDateIndicator": "true"
                }
            };
        }
    });
    return [{
        name: 'default',
        days: days
    }];
};

exports.generateTomorrowFullActiveSchedule = () => {
    const days = [1, 2, 3, 4, 5, 6, 7].map(dayIndex => {
        return {
            "date": "" + dayIndex,
            "day": utils.days[dayIndex],
            "allDay": "true",
            "start": {
                "hours": 0,
                "minutes": 0,
                "midDateIndicator": "false"
            },
            "end": {
                "hours": 11,
                "minutes": 59,
                "midDateIndicator": "true"
            }
        };
    });
    return [{
        name: 'default',
        days: days
    }];
};