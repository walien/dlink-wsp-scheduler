const _ = require('lodash');
const utils = require('../utils');

const extractSlotLimits = function (timeElement) {

    const hours = parseInt(timeElement.getElementsByTagName("TimeHourValue").item(0).firstChild.nodeValue);
    const minutes = parseInt(timeElement.getElementsByTagName("TimeMinuteValue").item(0).firstChild.nodeValue);
    const midDateIndicator = timeElement.getElementsByTagName("TimeMidDateValue").item(0).firstChild.nodeValue;

    let hoursAs24hFormat = 0;
    if (midDateIndicator === 'false' && hours === 12) {
        hoursAs24hFormat = 0;
    } else if (midDateIndicator === 'true' && hours !== 12) {
        hoursAs24hFormat = hours + 12;
    }

    return {
        hours: hours,
        minutes: minutes,
        midDateIndicator: midDateIndicator,
        meridiem: midDateIndicator === 'true' ? 'PM' : 'AM',
        time24hFormat: _.padStart(hoursAs24hFormat, 2, '0') + 'h' + _.padStart(minutes, 2, '0')
    };
};

const buildSlots = function (scheduleInfoElem) {
    const date = scheduleInfoElem.getElementsByTagName("ScheduleDate").item(0).firstChild.nodeValue;
    const allDay = scheduleInfoElem.getElementsByTagName("ScheduleAllDay").item(0).firstChild.nodeValue;
    const startElem = scheduleInfoElem.getElementsByTagName("ScheduleStartTimeInfo").item(0);
    const endElem = scheduleInfoElem.getElementsByTagName("ScheduleEndTimeInfo").item(0);
    const slot = {
        date: date,
        allDay: allDay,
        day: utils.days[date],
        start: extractSlotLimits(startElem),
        end: extractSlotLimits(endElem)
    };
    return [slot];
};

exports.map = function (doc) {

    const scheduleConfigs = [];
    const scheduleConfigsList = doc.getElementsByTagName("ScheduleInfoLists");

    for (let i = 0; i < scheduleConfigsList.length; i++) {

        const transformedScheduleConfig = {};
        const scheduleConfigElem = scheduleConfigsList.item(i);

        transformedScheduleConfig.name = scheduleConfigElem.getElementsByTagName("ScheduleName").item(0).firstChild.nodeValue;
        const scheduleInfosListElem = scheduleConfigElem.getElementsByTagName("ScheduleInfo");

        transformedScheduleConfig.days = [];
        for (let k = 0; k < scheduleInfosListElem.length; k++) {
            const scheduleInfoElem = scheduleInfosListElem.item(k);
            transformedScheduleConfig.days = transformedScheduleConfig.days.concat(buildSlots(scheduleInfoElem));
        }

        scheduleConfigs.push(transformedScheduleConfig);
    }

    return scheduleConfigs;
};