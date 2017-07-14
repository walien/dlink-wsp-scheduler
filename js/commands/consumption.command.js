exports.map = function (doc) {
    return doc.getElementsByTagName("CurrentConsumption").item(0).firstChild.nodeValue + ' W';
};