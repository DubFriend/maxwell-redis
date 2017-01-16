'use strict';

module.exports = fig => {
    const kafkaConsumer = fig.kafkaConsumer;
    const redis = fig.redis;
    // const consumer = new kafka.Consumer(client, []);

    kafkaConsumer.on('message', message => console.log('message', message));
    kafkaConsumer.on('error', err => console.error('error', err, err.stack));
    kafkaConsumer.on('offsetOutOfRange', err => console.error('offsetOutOfRange', err, err.stack));
    kafkaConsumer.addTopics([{ topic: 'maxwell'}]);

};
