// hello word
const assert = require('power-assert');

const urlOpt = require('./config.json');
const { RabbitMQ, WORKER_MODE } = require('../lib/RabbiMQ');

let queueName = 'task';
let workerMode = WORKER_MODE.NORMAL;
let message = 'hello word';
describe('amqp normal producer', () => {
  let rabbitMQ = null;

  before(() => {
    rabbitMQ = new RabbitMQ({
      urlOpt,
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
    const [connect, channel, , queue] = await rabbitMQ.assert();
    assert(connect, 'connect error');
    assert(channel, 'channel error');
    assert(queue, 'queue error');
  });

  it('publish test', async () => {
    const res = await rabbitMQ.publish(message);
    assert.equal(res, true, 'publish message error');
  });
});

describe('amqp normal consumer', () => {
  let rabbitMQ = null;

  before(() => {
    rabbitMQ = new RabbitMQ({
      urlOpt,
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
    const [connect, channel, , queue] = await rabbitMQ.assert();
    assert(connect, 'connect error');
    assert(channel, 'channel error');
    assert(queue, 'queue error');
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
});
