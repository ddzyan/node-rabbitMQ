// hello word
const assert = require('power-assert');

const urlOpt = require('./config.json');
const { RabbitMQ, WORKER_MODE } = require('../lib/RabbiMQ');

let queueName = 'task';
let workerMode = WORKER_MODE.PUB_SUB;
let message = 'hello word';
let exchangerName = 'subPub_ex';
let routeKey = '';
describe('amqp pubSub producer', () => {
  let rabbitMQ = null;

  before(() => {
    rabbitMQ = new RabbitMQ({
      urlOpt,
      exchangerName,
      queueName,
      workerMode,
    });
  });

  after(async () => {
    if (rabbitMQ && rabbitMQ.connect) {
      await rabbitMQ.close();
    }
  });

  it('connect test', async () => {
    const [connect, channel, exchanger, queue] = await rabbitMQ.assert();
    assert(connect, 'connect error');
    assert(exchanger, 'exchanger error');
    assert(channel, 'channel error');
    assert(queue, 'queue error');
  });

  it('publish test', async () => {
    const res = await rabbitMQ.publish(message);
    assert.equal(res, true, 'publish message error');
  });
});

describe('amqp pubSub consumer', () => {
  let rabbitMQ = null;

  before(() => {
    rabbitMQ = new RabbitMQ({
      urlOpt,
      exchangerName,
      queueName,
      workerMode,
    });
  });

  after(async () => {
    if (rabbitMQ && rabbitMQ.connect) {
      await rabbitMQ.close();
    }
  });

  it('assert test', async () => {
    const [connect, channel, exchanger, queue] = await rabbitMQ.assert();
    assert(connect, 'connect error');
    assert(exchanger, 'exchanger error');
    assert(channel, 'channel error');
    assert(queue, 'queue error');
  });

  it('bindQueue test', async () => {
    const res = await rabbitMQ.bindQueue(routeKey);
    assert.ok(res, true, 'bindQueue error');
  });

  it.skip('subscribe message test', done => {
    rabbitMQ.subscribe(
      msgObj => {
        assert(msgObj, 'msg is error');
        assert.equal(msgObj.toString(), message, 'msg is error');
        msgObj.ack();
        done();
      },
      { ack: false }
    );
  });

  it('unbindQueue test', async () => {
    const res = await rabbitMQ.unbindQueue(routeKey);
    assert.ok(res, true, 'unbindQueue error');
  });
});
