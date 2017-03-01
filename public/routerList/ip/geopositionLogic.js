/**
 * Created by Administrator on 2017/2/16.
 */

'use strict';

const http = require('http');
const mime = require('../../../mime').types;
const status = require('../../../status').types;

const sina_server = 'http://int.dpool.sina.com.cn/iplookup/iplookup.php?format=json&ip=';
const upload = function (res,req) {
    let ip = req.connection.remoteAddress;
    getIpInfo('59.110.0.160',function (err, msg) {
        if(err) throw err;
        if(msg && msg.country && msg.province && msg.city){
            let result = {
                country : msg.country,
                province: msg.province,
                city    : msg.city
            };
            res.writeHead(status.StatusOK,{'Content-Type': mime.html});
            res.write(JSON.stringify(result));
            res.end();
        }
        else{
            res.writeHead(status.StatusPreconditionFailed,{'Content-Type': mime.html});
            res.write('The ip is errors!');
            res.end();
        }
    });
};

exports.dealResult = function (httpObj,res,req) {
    if(httpObj.para === '!'){
        upload(res,req);
    }
};

const getIpInfo = function(ip, cb) {
    let url = sina_server + ip;
    http.get(url, function(res) {
        let code = res.statusCode;
        if (code == status.StatusOK) {
            res.on('data', function(data) {
                try {
                    cb(null, JSON.parse(data));
                } catch (err) {
                    cb(err);
                }
            });
        } else {
            cb({ code: code });
        }
    }).on('error', function(e) { cb(e); });
};
