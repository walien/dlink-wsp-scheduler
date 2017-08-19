exports.map = (doc) => {
    return doc.getElementsByTagName("TotalConsumption").item(0).firstChild.nodeValue + ' W';
};