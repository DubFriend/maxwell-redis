'use strict';
const log = require('./log');
const _ = require('lodash');

module.exports = fig => {
    const kafkaConsumer = fig.kafkaConsumer;
    const redis = fig.redis;
    const keyPrefix = fig.keyPrefix;
    const tables = _.mapValues(_.groupBy(fig.tables, 'name'), t => _.first(t));
    const topic = fig.topic || 'maxwell';
    const jsonParse = s => {
        try {
            return JSON.parse(s);
        }
        catch(err) {
            log.err({
                event: 'jsonParse error',
                error: {
                    name: err.name,
                    stack: err.stack
                }
            });
            return null;
        }
    };

    kafkaConsumer.on('message', message => {
        // console.log('message', message)
        const action = message.value && jsonParse(message.value) || {};
        const table = tables[action.table];
        // console.log(JSON.stringify(table, null, 2))
        if(table) {
            const keyValue = action.data[table.keyField];
            const redisKey = `${keyPrefix}${table.name}:${table.keyField}:${keyValue}`;
            switch(action.type) {
                case 'insert':
                case 'update':
                    // console.log('set', redisKey)
                    redis.set(redisKey, JSON.stringify(action.data), err => err && log.err({
                        event: 'redis set error',
                        error: {
                            name: err.name,
                            stack: err.stack
                        }
                    }));
                    break;
                case 'delete':
                    // console.log('del', redisKey)
                    redis.del(redisKey, err => err && log.err({
                        event: 'redis del error',
                        error: {
                            name: err.name,
                            stack: err.stack
                        }
                    }));
                    break;
            }
        }
    });
    kafkaConsumer.on('error', err => console.error('error', err, err.stack));
    kafkaConsumer.on('offsetOutOfRange', err => console.error('offsetOutOfRange', err, err.stack));
    kafkaConsumer.addTopics([{ topic: topic }]);

};
