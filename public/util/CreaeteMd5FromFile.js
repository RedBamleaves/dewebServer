/**
 * Created by Administrator on 2017/2/11.
 */

//This util just need to run self by node
'use strict';

const md5 = require('md5');
const fs = require('fs');
const path = require("path");

const newfile = '../../assert/manifest/new.manifest';

const _packageUrl = 'http://192.168.99.101:3341/hotupdate/assetsupdate';
const _remoteManifestUrl = 'http://192.168.99.101:3341/hotupdate/assetsupdate/project.manifest';
const _remoteVersionUrl = 'http://192.168.99.101:3341/hotupdate/assetsupdate/version.manifest';
const _version = '1.0.4';
const _engineVersion = '3.14.1';
const _groupVersions = {
    "1" : "1.0.1",
    "2" : "1.0.2"
};
const _searchPaths = [
    "res/",
    "src/"
];
let _assets = {};

const filepathPrefix = '../../assert/hotupdate';

const filepathArray = [
    'src',
    'src/config',
    'src/data',
    'src/net',
    'src/procallback',
    'src/pt',
    'src/sdk',
    'src/test',
    'src/tool',
    'src/views',
    'src/views/TP_Scroll',
    'src/views/uiEventManager',
    //======================
    'res',
    'res/dzpk',
    'res/test',
    'res/tpTest',
    'res/test/LoGo'
];
let fileArray = [];
let manifest_obj = {
    packageUrl : _packageUrl,
    remoteManifestUrl : _remoteManifestUrl,
    remoteVersionUrl : _remoteVersionUrl,
    version : _version,
    engineVersion : _engineVersion,
    groupVersions : _groupVersions
};

const runscript = function () {
    let counter = 0;
    for(let element in filepathArray){
        element = filepathArray[element];
        let realf = (element.length !== 0)?('/' + element): element;
        fs.readdir(filepathPrefix + realf, function(err, results){
            if(err) throw err;
            if(results.length > 0) {
                results.forEach(function(file){
                    let realpath = filepathPrefix + realf;
                    realpath = path.join(realpath, file);
                    if(fs.statSync(realpath).isFile()){
                        fileArray.push(path.join(element, file));
                    }
                });
            }
            if(++counter === filepathArray.length){
                update_assets();
            }
        });
    }
};

//There are all files in fileArray now.
let update_assets = function () {
    let update_count = 0;
    let counter = 0;
    for(let file in fileArray){
        fs.readFile(filepathPrefix + '/' + fileArray[file],
            function(err, buf) {
                if(err) throw err;
                //write this json
                ++update_count;
                let isCompress = (path.extname(fileArray[file]) === '.zip');
                let update_bok = {
                    path : fileArray[file],
                    md5 : md5(buf),
                    compressed : isCompress,
                    group : "1"
                };
                _assets['update' + update_count] = update_bok;
                ++counter;
                if(counter === fileArray.length){
                    //update manifest_obj
                    manifest_obj['assets'] = _assets;
                    manifest_obj['searchPaths'] = _searchPaths;
                    //create newfile
                    let json_manifest = JSON.stringify(manifest_obj);
                    json_manifest = json_manifest.split(',').join(',\n');
                    json_manifest = json_manifest.split('{').join('{\n');
                    json_manifest = json_manifest.split('}').join('\n}');
                    json_manifest = json_manifest.split('\\\\').join('/');
                    fs.writeFile(newfile,json_manifest,function (err,data) {
                        if(err)throw err;
                    });
                }
            });
    }

};

runscript();

