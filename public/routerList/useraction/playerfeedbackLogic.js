/**
 * Created by Administrator on 2017/2/28.
 */

'use strict';

const http = require('http');
const mime = require('../../../mime').types;
const status = require('../../../status').types;
const fs = require('fs');
const sd = require('silly-datetime');
const filepath = './assert/advice/';
let initobj = {
    msglist:[]
};

exports.dealResult = function (httpObj,res,req) {
    let timestr = sd.format(new Date(), 'YYYYMMDD');
    let filename = filepath + timestr + '_' + 'advice.txt';
    let postMsg = '';
    req.addListener('data', function(chunk){
        postMsg += chunk;
    }).addListener('end', function(){
        fs.exists(filename, function(exists) {
            if(exists){
                addMsg(filename,JSON.parse(postMsg),res);
            }else{
                createMsg(filename,JSON.parse(postMsg),res);
            }
        });
    });
};

const addMsg = function (filename,httpObj,res) {
    fs.readFile(filename,function (err,data) {
        if(err){
            resend_500(res);
            throw err;
        }
        let jsonObj = JSON.parse(data);
        jsonObj.msglist.push({
            userid : httpObj.userid,
            username : httpObj.username,
            msg : httpObj.msg
        });

        let objstr = JSON.stringify(jsonObj);
        objstr = objstr.split('},').join('},\n');
        objstr = objstr.split('[{').join('[\n{');
        objstr = objstr.split('}]').join('}\n]');
        fs.writeFile(filename,objstr,function(err){
            if(err){
                resend_500(res);
                throw err;
            }
            resend_200(res,'{cReb : 0}',mime.plain);
        });
    });
};

const createMsg = function (filename,httpObj,res) {
    initobj.msglist.push({
        userid : httpObj.userid,
        username : httpObj.username,
        msg : httpObj.msg
    });

    let objstr = JSON.stringify(initobj);
    fs.writeFile(filename,objstr,function(err){
        if(err){
            resend_500(res);
            throw err;
        }
        resend_200(res,'{cReb : 0}',mime.plain);
    });
};

const resend_200 = function (res,msg,msgtype) {
    res.writeHead(status.StatusOK,{'Content-Type':msgtype});
    res.write(msg);
    res.end();
};

const resend_404 = function (res) {
    res.writeHead(status.StatusNotFound,{'Content-Type':mime.plain});
    res.end('There isn\'t this file!\n');
};

const resend_500 = function (res) {
    res.writeHead(status.StatusInternalServerError,{'Content-Type':mime.plain});
    res.end(err);
};