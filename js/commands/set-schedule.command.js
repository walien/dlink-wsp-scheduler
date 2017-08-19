const mustache = require("mustache");
const fs = require('fs');

const tmpl = `
{{#schedule}}
<ScheduleInfoLists>
    <ScheduleName>{{ name }}</ScheduleName>
    {{#days}}
    <ScheduleInfo>
        <ScheduleDate>{{ date }}</ScheduleDate>
        <ScheduleAllDay>{{ allDay }}</ScheduleAllDay>
        <ScheduleTimeFormat>false</ScheduleTimeFormat>
        <ScheduleStartTimeInfo>
            <TimeHourValue>{{ start.hours }}</TimeHourValue>
            <TimeMinuteValue>{{ start.minutes }}</TimeMinuteValue>
            <TimeMidDateValue>{{ start.midDateIndicator }}</TimeMidDateValue>
        </ScheduleStartTimeInfo>
        <ScheduleEndTimeInfo>
            <TimeHourValue>{{ end.hours }}</TimeHourValue>
            <TimeMinuteValue>{{ end.minutes }}</TimeMinuteValue>
            <TimeMidDateValue>{{ end.midDateIndicator }}</TimeMidDateValue>
        </ScheduleEndTimeInfo>
    </ScheduleInfo>
    {{/days}}
</ScheduleInfoLists>
{{/schedule}}`;

exports.map = (schedule) => {
    return mustache.render(tmpl, {schedule});
};