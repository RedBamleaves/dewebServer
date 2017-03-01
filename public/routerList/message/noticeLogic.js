/**
 * Created by Administrator on 2017/3/1.
 */


'use strict';

const fs = require("fs");
const path = require("path");
const ejs = require('ejs');
const mime = require('../../../mime').types;
const status = require('../../../status').types;
const config = require('../../../config/config');
const parserange = require('../../util/parserange');
const RES_REALPATH = './assert/message';
const EJS_PATH = './ejs/notice.ejs';

exports.dealResult = function (httpObj,res,req) {
    if(httpObj.para === ''){
        let filePath = RES_REALPATH;
        fs.readdir(filePath, function(err, results){
            if(err) throw err;
            if(results.length > 0) {
                let files = [];
                results.forEach(function(file){
                    if(fs.statSync(path.join(filePath, file)).isFile()){
                        files.push(file);
                    }
                });

                let voiceEjs = fs.readFileSync(EJS_PATH,'utf-8');
                let ret = ejs.render(voiceEjs, {files:files});
                resend_200(res,ret,mime.html);
            } else {
                resend_404(res);
            }
        });
    } else {
        let realPath = RES_REALPATH + '/' + httpObj.para;
        if(realPath.indexOf('..') >= 0){
            resend_404(res);         //文件搜索限定在message下，避免搞事情
            return;
        }

        fs.stat(realPath, function (err, stat) {
            let lastModified = stat.mtime.toUTCString();
            res.setHeader("Last-Modified", lastModified);
            let expires = new Date();
            expires.setTime(expires.getTime() + config.Expires.maxAge * 1000);
            res.setHeader("Content-Type", 'application/force-download');
            res.setHeader("Expires", expires.toUTCString());
            res.setHeader("Cache-Control", "max-age=" + config.Expires.maxAge);

            if(stat.isFile()){
                res.setHeader('Accept-Ranges', 'bytes');
                let _realpara  = httpObj.para.substring(
                    httpObj.para.lastIndexOf('/') + 1,
                    httpObj.para.length);

                if (req.headers["range"]) {
                    let range = parserange.parseRange(req.headers["range"], stat.size);
                    if (range) {
                        res.setHeader("Content-Range", "bytes " + range.start + "-" + range.end + "/" + stat.size);
                        res.setHeader("Content-Length", (range.end - range.start + 1));
                        res.writeHead(status.StatusOK,{
                            'Content-Disposition': 'attachment; filename=' + _realpara,
                            'Content-Length': stat.size
                        });
                        fs.createReadStream(realPath, {
                            "start": range.start,
                            "end": range.end
                        }).pipe(res);
                    } else {
                        res.removeHeader("Content-Length");
                        res.writeHead(status.StatusRequestedRangeNotSatisfiable, "Request Range Not Satisfiable");
                        res.end();
                    }
                } else {
                    res.writeHead(200,{
                        'Content-Disposition': 'attachment; filename=' + _realpara,
                        'Content-Length': stat.size
                    });
                    fs.createReadStream(realPath).pipe(res);
                }
            } else {
                resend_404(res);
            }
        });
    }
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



