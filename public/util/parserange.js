/**
 * Created by Administrator on 2017/1/5.
 */
'use strict';

exports.parseRange = function (str, size) {
    if (str.indexOf(",") != -1) {
        return;
    }
    let range = str.split('-');
    let start = parseInt(range[0].split('=')[1], 10);
    let end = parseInt(range[1].split('=')[1], 10);
    // Case: -num
    if (isNaN(start)) {
        start = size - end;
        end = size - 1;
    // Case: num-
    } else if (isNaN(end)) {
        end = size - 1;
    }
    // Invalid
    if (isNaN(start) || isNaN(end) || start > end || end > size) {
        return;
    }
    return {
        start: start,
        end: end
    };
};
