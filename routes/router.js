/**
 * Created by Administrator on 2016/12/23.
 */

'use strict';

const vows = require('vows');
const connect = require('connect');
const httpurl = require('url');
const RELATIVEPATH = '../public/routerList/';
const status = require('../status').types;
const mime = require('../mime').types;

module.exports = function (configObj) {
    return new router(configObj);
};

const router = function (configObj) {
    this.config = configObj;
    //Create connect
    this.routerConnect = new connect();

    //Got runtype by config
    let runtype = configObj.runtype;
    let objgate;
    if(runtype === 'development'){
        objgate = configObj.development;
    }
    else if(runtype === 'production') {
        objgate = configObj.production;
    }
    else {
        vows.describe('Config ErrorTips').addBatch({
            '\"Config\'s runtype\" Error': {
                topic: runtype,
                '\'runtype\' should be \'development\' or \'production\'': function (topic) {
                    assert.strictEqual(topic, 'Be Error!');
                }
            }
        }).run();
        return;
    }
    //Set host and port
    this.host = objgate.host;
    this.port = objgate.port;
    //init routerConnect
    this.routerConnect.use(function (req,res,next) {
        let urlObj = httpurl.parse(req.url,true,true);                                 //url path
        let fun_index = checkConfig(urlObj.pathname,objgate);
        if(fun_index.index < 0){
            //Don't found the router
            res.writeHead(status.StatusNotFound,{'Content-Type':mime.html});
            res.write('Page not found!\n');
            res.end();
        }
        else {
            //Run the router's function('dealResult')
            if(fun_index.mark === '/'){
                let _realpara = '';
                let temp_length = fun_index.parastr.length;
                if(temp_length > 0){
                    _realpara = fun_index.parastr.substr(1,temp_length - 1);
                }
                urlObj.query = {para : _realpara};
            }
            else if(fun_index.mark === '!'){
                urlObj.query = {para : '!'};
            }
            let filename = RELATIVEPATH + objgate.gate[fun_index.index].routersign + 'Logic'; //filename absolute path
            let httpLogic = require(filename);
            if(!httpLogic){
                res.writeHead(status.StatusNotFound,{'Content-Type':mime.html});
                res.write('Page not found!\n');
                res.end();
            }else{
                res.setHeader("Server", "Node/V6");
                httpLogic.dealResult(urlObj.query,res,req);
            }
        }
        next();
    }).use(somethingHttpEnd);
};

//find 'config' route index
const checkConfig = function (pathname,objgate) {
    let _index = -1;
    let i = 0;
    let _mark = '?';
    let _parastr = '';
    for(;i<objgate.gate.length;++i) {
        let realpath = pathname;
        _mark = objgate.gate[i].paraType;
        let router = objgate.gate[i].routersign;
        let routersign = '/' + router; //router path
        let temp_sub = realpath.substr(0,routersign.length);
        _parastr = realpath.substr(routersign.length,realpath.length - routersign.length);
        if (routersign === temp_sub) {
            _index = i;
            break;
        }
    }

    return {
        index : _index,
        mark : _mark ,
        parastr : _parastr
    };
};

//do something function
const somethingHttpEnd = function (req,res) {

};






