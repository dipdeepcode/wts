let loggingLevel = userSession.getNote("logging_level");

if (loggingLevel === null) {
    loggingLevel = "INFO";
}

exports = loggingLevel;