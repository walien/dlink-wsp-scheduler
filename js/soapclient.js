/**
 * libs
 */

const md5 = require('./hmac_md5');
const AES = require('./AES');
const request = require('then-request');
const DOMParser = require('xmldom').DOMParser;
const fs = require("fs");
const q = require("q");

/**
 * commands
 */

const loginCommand = require('./commands/login.command');
const stateCommand = require('./commands/state.command');
const isDeviceReadyCommand = require('./commands/is-device-ready.command');
const temperatureCommand = require('./commands/temperature.command');
const consumptionCommand = require('./commands/consumption.command');
const totalConsumptionCommand = require('./commands/total-consumption.command');
const getScheduleCommand = require('./commands/get-schedule.command');
const setScheduleCommand = require('./commands/set-schedule.command');

/**
 * hnap auth
 */

const HNAP1_XMLNS = "http://purenetworks.com/HNAP1/";
const HNAP_METHOD = "POST";
const HNAP_BODY_ENCODING = "UTF8";
const HNAP_LOGIN_METHOD = "Login";
const HNAP_AUTH = {URL: "", User: "", Pwd: "", Result: "", Challenge: "", PublicKey: "", Cookie: "", PrivateKey: ""};

exports.login = function (user, password, url) {
    HNAP_AUTH.User = user;
    HNAP_AUTH.Pwd = password;
    HNAP_AUTH.URL = url;

    const headers = {
        "Content-Type": "text/xml; charset=utf-8",
        "SOAPAction": '"' + HNAP1_XMLNS + HNAP_LOGIN_METHOD + '"'
    };
    const params = {
        headers: headers,
        body: requestBody(HNAP_LOGIN_METHOD, loginRequest())
    };
    return request(HNAP_METHOD, HNAP_AUTH.URL, params).then(function (response) {
        save_login_result(response.getBody(HNAP_BODY_ENCODING));
        return soapAction(HNAP_LOGIN_METHOD, requestBody(HNAP_LOGIN_METHOD, loginParameters())).then(loginCommand.map);
    }).catch(function (err) {
        console.log("error:", err);
    });
};

function save_login_result(body) {
    const doc = new DOMParser().parseFromString(body);
    HNAP_AUTH.Result = doc.getElementsByTagName(HNAP_LOGIN_METHOD + "Result").item(0).firstChild.nodeValue;
    HNAP_AUTH.Challenge = doc.getElementsByTagName("Challenge").item(0).firstChild.nodeValue;
    HNAP_AUTH.PublicKey = doc.getElementsByTagName("PublicKey").item(0).firstChild.nodeValue;
    HNAP_AUTH.Cookie = doc.getElementsByTagName("Cookie").item(0).firstChild.nodeValue;
    HNAP_AUTH.PrivateKey = md5.hex_hmac_md5(HNAP_AUTH.PublicKey + HNAP_AUTH.Pwd, HNAP_AUTH.Challenge).toUpperCase();
}

function requestBody(method, parameters) {
    return "<?xml version=\"1.0\" encoding=\"utf-8\"?>" +
        "<soap:Envelope " +
        "xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\" " +
        "xmlns:xsd=\"http://www.w3.org/2001/XMLSchema\" " +
        "xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\">" +
        "<soap:Body>" +
        "<" + method + " xmlns=\"" + HNAP1_XMLNS + "\">" +
        parameters +
        "</" + method + ">" +
        "</soap:Body></soap:Envelope>";
}

function moduleParameters(module) {
    return "<ModuleID>" + module + "</ModuleID>";
}

function controlParameters(module, status) {
    return moduleParameters(module) +
        "<NickName>Socket 1</NickName><Description>Socket 1</Description>" +
        "<OPStatus>" + status + "</OPStatus><Controller>1</Controller>";
}

function soapAction(method, body) {
    const headers = {
        "Content-Type": "text/xml; charset=utf-8",
        "SOAPAction": '"' + HNAP1_XMLNS + method + '"',
        "HNAP_AUTH": getHnapAuth('"' + HNAP1_XMLNS + method + '"', HNAP_AUTH.PrivateKey),
        "Cookie": "uid=" + HNAP_AUTH.Cookie
    };
    return request(HNAP_METHOD, HNAP_AUTH.URL, {headers: headers, body: body}).then(function (response) {
        return readResponseValue(response.getBody(HNAP_BODY_ENCODING));
    }).catch(function (err) {
        console.log("error:", err);
    });
}

function loginRequest() {
    return "<Action>request</Action>"
        + "<Username>" + HNAP_AUTH.User + "</Username>"
        + "<LoginPassword></LoginPassword>"
        + "<Captcha></Captcha>";
}

function loginParameters() {
    const login_pwd = md5.hex_hmac_md5(HNAP_AUTH.PrivateKey, HNAP_AUTH.Challenge);
    return "<Action>login</Action>"
        + "<Username>" + HNAP_AUTH.User + "</Username>"
        + "<LoginPassword>" + login_pwd.toUpperCase() + "</LoginPassword>"
        + "<Captcha></Captcha>";
}

function getHnapAuth(SoapAction, privateKey) {
    const current_time = new Date();
    const time_stamp = Math.round(current_time.getTime() / 1000);
    const auth = md5.hex_hmac_md5(privateKey, time_stamp + SoapAction);
    return auth.toUpperCase() + " " + time_stamp;
}

function readResponseValue(body) {
    if (body) {
        return new DOMParser().parseFromString(body);
    }
}

/**
 * public methods
 */

exports.on = function () {
    return soapAction("SetSocketSettings", requestBody("SetSocketSettings", controlParameters(1, true)));
};

exports.reboot = function () {
    return soapAction("Reboot", requestBody("Reboot", ""));
};

exports.state = function () {
    return soapAction("GetSocketSettings", requestBody("GetSocketSettings", moduleParameters(1))).then(stateCommand.map);
};

exports.isDeviceReady = function () {
    return soapAction("IsDeviceReady", requestBody("IsDeviceReady", "")).then(isDeviceReadyCommand.map);
};

exports.setFactoryDefault = function () {
    return soapAction("SetFactoryDefault", requestBody("SetFactoryDefault", ""));
};

exports.consumption = function () {
    return soapAction("GetCurrentPowerConsumption", requestBody("GetCurrentPowerConsumption", moduleParameters(2))).then(consumptionCommand.map);
};

exports.totalConsumption = function () {
    return soapAction("GetPMWarningThreshold", requestBody("GetPMWarningThreshold", moduleParameters(2))).then(totalConsumptionCommand.map);
};

exports.temperature = function () {
    return soapAction("GetCurrentTemperature", requestBody("GetCurrentTemperature", moduleParameters(3))).then(temperatureCommand.map);
};

exports.getScheduleSettings = function () {
    return soapAction("GetScheduleSettings", requestBody("GetScheduleSettings", "")).then(getScheduleCommand.map);
};

exports.setScheduleSettings = function (schedule) {
     return soapAction("SetScheduleSettings", requestBody("SetScheduleSettings", setScheduleCommand.map(schedule)));
};