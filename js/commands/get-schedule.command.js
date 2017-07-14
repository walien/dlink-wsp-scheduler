var _ = require('lodash');

const days = {
    1: 'Mon',
    2: 'Tue',
    3: 'Wed',
    4: 'Thu',
    5: 'Fri',
    6: 'Sat',
    7: 'Sun'
};

var extractSlotLimits = function (timeElement) {

    var hours = parseInt(timeElement.getElementsByTagName("TimeHourValue").item(0).firstChild.nodeValue);
    var minutes = parseInt(timeElement.getElementsByTagName("TimeMinuteValue").item(0).firstChild.nodeValue);
    var midDateIndicator = timeElement.getElementsByTagName("TimeMidDateValue").item(0).firstChild.nodeValue;

    if (midDateIndicator === 'false' && hours === 12) {
        hours = 0;
    } else if (midDateIndicator === 'true' && hours !== 12) {
        hours = hours + 12;
    }

    return _.padStart(hours, 2, '0') + 'h' + _.padStart(minutes, 2, '0');
};

var buildSlots = function (scheduleInfoElem) {
    var date = scheduleInfoElem.getElementsByTagName("ScheduleDate").item(0).firstChild.nodeValue;
    var startElem = scheduleInfoElem.getElementsByTagName("ScheduleStartTimeInfo").item(0);
    var endElem = scheduleInfoElem.getElementsByTagName("ScheduleEndTimeInfo").item(0);
    var slot = {date: days[date], start: extractSlotLimits(startElem), end: extractSlotLimits(endElem)};
    return [slot];
};

exports.map = function (doc) {

    const scheduleConfigs = [];
    const scheduleConfigsList = doc.getElementsByTagName("ScheduleInfoLists");

    for (var i = 0; i < scheduleConfigsList.length; i++) {

        const transformedScheduleConfig = {};
        const scheduleConfigElem = scheduleConfigsList.item(i);

        transformedScheduleConfig.name = scheduleConfigElem.getElementsByTagName("ScheduleName").item(0).firstChild.nodeValue;
        const scheduleInfosListElem = scheduleConfigElem.getElementsByTagName("ScheduleInfo");

        transformedScheduleConfig.days = [];
        for (var k = 0; k < scheduleInfosListElem.length; k++) {
            const scheduleInfoElem = scheduleInfosListElem.item(k);
            transformedScheduleConfig.days = transformedScheduleConfig.days.concat(buildSlots(scheduleInfoElem));
        }

        scheduleConfigs.push(transformedScheduleConfig);
    }

    return scheduleConfigs;
};