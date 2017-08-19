exports.map = (doc) => {
    return doc.getElementsByTagName("OPStatus").item(0).firstChild.nodeValue;
};