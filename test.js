'use strict';

const Q = require('q');
const _ = require('underscore');
const sql = require('mysql-wrap-production')(require('mysql').createPool({
    host: 'localhost',
    user: 'username',
    password: 'password',
    database: 'test'
}));
const expect = require('chai').expect;
const redis = require('redis').createClient();
const kafka = require('kafka-node');
const kafkaClient = kafka.Client();
const maxwellRedis = require('./index')({
    kafkaConsumer: new kafka.Consumer(kafkaClient, []),
    redis: redis,
    keyPrefix: 'p',
    tables: [
        {
            name: 'a',
            keyField: 'id'
        },
        {
            name: 'b',
            keyField: 'id'
        }
    ]
});

const wait = ms => Q.Promise(resolve => setTimeout(
    resolve, ms === undefined ? 100 : ms
));

const rGet = key => Q.Promise((resolve, reject) => redis.get(
    key, (err, data) => err ? reject(err) : resolve(data)
));


describe('maxwell-redis', () => {
    beforeEach(done => {
        this.b = od => _.extend({ id: 'foo', value: 1.2 }, od);

        Q.all([sql.delete('a'), sql.delete('b')])
        .then(() => Q.Promise((resolve, reject) => redis.flushall(
            (err, resp) => err ? reject(err) : resolve()
        )))
        .then(() => sql.insert('b', this.b()))
        .then(() => wait())
        .then(() => done()).done();
    });

    it('should set redis cache from mysql insert', done => {
        const data = { id: 5, name: 'foo', time: new Date(5000).toISOString() };
        sql.insert('a', data)
        .then(() => wait())
        .then(() => rGet('pa:id:5'))
        .then(resp => {
            expect(JSON.parse(resp)).to.deep.equal(data);
            done();
        }).done();
    });

    it('should set redis cache from mysql update', done => {
        sql.update('b', { value: -5.4 })
        .then(() => wait())
        .then(() => rGet(`pb:id:${this.b().id}`))
        .then(resp => {
            expect(JSON.parse(resp)).to.deep.equal(this.b({ value: -5.4 }));
            done();
        }).done();
    });
});
