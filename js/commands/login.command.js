exports.map = function (doc) {
    return doc.getElementsByTagName("LoginResult").item(0).firstChild.nodeValue;
};