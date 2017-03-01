/**
 * Created by Administrator on 2016/12/22.
 */
'use strict';
const fs = require('fs');
let config = {
    configdata : "",
    webServerConfig : {},
    next : function (){}
    };

config.initConfig = function () {
    fs.readFile('./config/config.json','utf8',function (err,data) {
        if(err)
        {
            console.log(err);
        }
        config.configdata = data;
        config.webServerConfig = JSON.parse(config.configdata);
        config.next();
    });
};

config.setNext = function (next) {
    config.next = next;
};

exports.configObj = config;
exports.Expires = {
    fileMatch: /^(spx|apk|iap)$/ig,
    maxAge: 60*60*24*365
};
