const { createLogger, format, transports } = require('winston');

module.exports = createLogger({
transports:[
    new transports.Console({}),
    new transports.File({
    filename: 'logs/error_logs.js',
    format:format.combine(
        format.timestamp({format: 'MMM-DD-YYYY HH:mm:ss'}),
        format.align(),
        format.printf(info => `${info.level}: ${[info.timestamp]}: ${info.message}`),
    )}),
]});