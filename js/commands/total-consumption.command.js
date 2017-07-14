exports.map = function (doc) {
    return doc.getElementsByTagName("TotalConsumption").item(0).firstChild.nodeValue + ' W';
};