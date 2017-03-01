/**
 * Created by Administrator on 2016/12/26.
 */

'use strict';

const mysql = require('mysql');
const assert = require('assert');

let webServerConfig = null;
let poolCluster = null;
const poolClusterConfig = {
    canRetry : true,
    removeNodeErrorCount : 5,
    restoreNodeTimeout : 0,
    defaultSelector : 'RR'
};
//init poolCluster
function initPoolCluster() {
    if(webServerConfig.sqlvalve !== 'on')
    {
        return;
    }
    poolCluster = mysql.createPoolCluster(poolClusterConfig);
    for(let i = 0;i<webServerConfig.mysql.length;++i){
        let sqlConfig = {
            host : webServerConfig.mysql[i].sqlhost,
            user : webServerConfig.mysql[i].sqluser,
            password : webServerConfig.mysql[i].sqlpassword,
            port: webServerConfig.mysql[i].sqlport,
            database: webServerConfig.mysql[i].database
        };
        poolCluster.add(sqlConfig.database, sqlConfig);
    }
}
//init webserver's config
exports.initWebServerConfig = function (config) {
    let runtype = config.runtype;
    let objgate = null;
        if(runtype === 'development'){
        objgate = config.development;
    }
    else if(runtype === 'production') {
        objgate = config.production;
    }
    else{
        return;
    }

    webServerConfig = objgate;
    initPoolCluster();
};
//get connection 'eyeproject_web'
exports.ConnectWebDataBase = function (connectFun) {
    assert.strictEqual('on',webServerConfig.sqlvalve,'sqlvalve isn\'t on!');
    if(webServerConfig === null || poolCluster === null){
        return;
    }
    poolCluster.getConnection(webServerConfig.mysql[0].database,connectFun);
};




