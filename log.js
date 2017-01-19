'use strict';

exports.out = o => console.log(JSON.stringify(o, null, 2));
exports.err = o => console.error(JSON.stringify(o, null, 2));
