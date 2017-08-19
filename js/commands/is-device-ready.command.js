exports.map = (doc) => {
    const result = doc.getElementsByTagName("IsDeviceReadyResult").item(0).firstChild.nodeValue;
    return result === 'OK';
};