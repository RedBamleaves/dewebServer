/**
 * Created by Administrator on 2016/12/27.
 */

//Deal child_processes with 'cluster'
'use strict';
const cluster = require('cluster');
const timerulers = require('./timer/timer');
const numCPUs = require('os').cpus().length;
const rssWarn = (250 * 1024 * 1024);
let workers = {};

const createWorker = function (){
    let worker = cluster.fork();
    console.log('Created worker: ' + worker.process.pid);
    // Allow boot time
    workers[worker.process.pid] = {
        worker : worker,
        lastCb : new Date().getTime() - 1000
    };
    //Listening child_processes is using to much memeory
    worker.on('message', function(msg) {
        if(msg.cmd === "reportMem") {
            workers[msg.process].lastCb = new Date().getTime();
            if(msg.memory.rss > rssWarn) {
                console.log('Worker ' + msg.process + ' using too much memory.');
            }
        }
    });
};

if (cluster.isMaster) {
    //Create work processes
    for (let i = 0; i < numCPUs; i++) {
        createWorker();
    }
    //
    //Run timerulers,this action just is running on Master's processes
    timerulers.run();//For the time being in Master's processes.Take it to last child_process when cups'length > 2.
    //Kill zombies'processes if five messages('reportMem') arn't received
    setInterval(function() {
        let time = new Date().getTime();
        for(let pid in workers) {
            if(workers.hasOwnProperty(pid) &&
                workers[pid].lastCb + 15000 < time) {
                console.log('Long running worker ' + pid + ' killed');
                workers[pid].worker.kill();
                delete workers[pid];
                //Restart processes
                createWorker();
            }
        }
    }, 3000);

} else {
    //Run app
    require('./app');
    //Report process's memoryUsage
    setInterval(function report(){
        process.send({cmd: "reportMem", memory: process.memoryUsage(),
            process: process.pid});
    }, 3000);
}