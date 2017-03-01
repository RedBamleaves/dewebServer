/**
 * Created by Administrator on 2016/12/23.
 */

//First reads the configuration, then perform in the configuration of the nextfunction
'use strict';

const http = require('http');
const config = require('./config/config');
const mysqlapi = require('./public/mysqlscript/mysqlapi');
const indexRouter = require('./routes/router');

//Create httpServer
const createHttpServer = function (router) {
    http.Server(router.routerConnect).listen(router.port,router.host);
};
//Construct nextfunction
const configNext = function () {
    //Set router's config
    let router = indexRouter(config.configObj.webServerConfig);
    //init mysql config
    mysqlapi.initWebServerConfig(config.configObj.webServerConfig);
    //create http server
    createHttpServer(router);
};
//Run app
const runapp = function() {
    //Run readconfig function
    config.configObj.initConfig();
    //Set config's nextfunction
    config.configObj.setNext(configNext);
};

runapp();
