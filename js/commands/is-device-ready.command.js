exports.map = function (doc) {
    var result = doc.getElementsByTagName("IsDeviceReadyResult").item(0).firstChild.nodeValue;
    return result === 'OK';
};