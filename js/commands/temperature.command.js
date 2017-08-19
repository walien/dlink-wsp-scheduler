exports.map = (doc) => {
    return doc.getElementsByTagName("CurrentTemperature").item(0).firstChild.nodeValue + ' °C';
};