const userConfig = require('./user-config.js');

module.exports = {
    hostname: userConfig.hostname,
    uid: userConfig.uid,
    pwd: userConfig.pwd,
    database: userConfig.database,
    provider: userConfig.provider,
    startMonth: userConfig.startMonth,
    endMonth: userConfig.endMonth,
    lineCodes: userConfig.lineCodes,
    rowLimit: userConfig.rowLimit
};