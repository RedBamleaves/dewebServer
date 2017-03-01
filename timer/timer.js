/**
 * Created by Administrator on 2017/1/7.
 */
//This just is running on Master's processes please

'use strict';

const fs = require('fs');
const RELATIVEPATH = '../public/timeruler/';

let timerconfig = {
    configdata : "",
    timerConfig : {},
    next : function (){
        runTimeRuler();
    }
};

let initConfig = function () {
    fs.readFile('./timer/timer.json','utf8',function (err,data) {
        if(err)
        {
            console.log(err);
        }
        timerconfig.configdata = data;
        timerconfig.timerConfig = JSON.parse(timerconfig.configdata);
        timerconfig.next();
    });
};

let runTimeRuler = function () {
    let rulers = timerconfig.timerConfig.timerulers;
    for(let ruler of rulers){
        let filepath = RELATIVEPATH + ruler.rulersign + 'Logic';
        let rulerLogic = require(filepath);
        setInterval(rulerLogic.dealLogic, ruler.timer * 1000);
    }
};

exports.run = function () {
    initConfig();
};
