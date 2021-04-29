const winston = require("winston");
require("winston-daily-rotate-file");

const myCustomLevels = {
    levels: {
      alert: 1, 
      error: 2, 
      warning: 3,
      info: 4,
    }
};

const logger = winston.createLogger({
    transports: [
        new (winston.transports.DailyRotateFile)({
            filename: "/home/daniel/Escritorio/logs/%DATE%.log",
            datePattern: "YYYY-MM-DD-HH",
            zippedArchive: true,
            maxSize: "30m",
            maxFiles: "14d",
            frequency: "12h"
        })
    ],
    format: winston.format.combine(
        winston.format.timestamp({
            format: "DD-MM-YYYY HH:mm:ss"
        }),
        winston.format.printf( info => {
            let ret = {};
            ret.message = info.message || "";
            ret.timestamp= info.timestamp || "" ;
            ret.status = info.status || "";
            ret.level = info.level || "";
            ret.method = info.ret? info.ret.method : "";
            ret.ip = info.ip || "";
            
            return(`[${ret.level}:\t${ret.timestamp} | ${ret.ip} | ${ret.message} | ${ret.status}]`);
        }),
    ),
    
    levels: myCustomLevels.levels,
    exitOnError: false,
    
});

module.exports.logger = logger;