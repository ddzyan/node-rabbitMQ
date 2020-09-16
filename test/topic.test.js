const assert = require('power-assert');

const urlOpt = require('./config.json');
const RabbitMQ = require('../lib/RabbiMQ');

let exchangerName = 'test_ex';
let type = 'topic';

describe('amqp topic producer', () => {
  let rabbitMQ = null;

  before(() => {
    rabbitMQ = new RabbitMQ({
      urlOpt,
      exchangerName,
      exchangerOptions: {
        type,
        durable: false,
      },
    });
  });

  after(async () => {
    if (rabbitMQ && rabbitMQ.connect) {
      await rabbitMQ.close();
    }
  });

  it('connect test', async () => {
    await rabbitMQ.assert();
    connect = assert(rabbitMQ.connect, 'connect error');
  });

  it('publish test', async () => {
    const res = await rabbitMQ.publish('hello word', 'info');
    assert.ok(res, true, 'publish message error');
  });
});

describe('amqp topic consumer', () => {
  let rabbitMQ = null;
  let routeKey = 'info';
  let queueName = 'direct';
  before(() => {
    rabbitMQ = new RabbitMQ({
      urlOpt,
      exchangerName,
      exchangerOptions: {
        type,
        durable: false,
      },
      queueName,
      queueOptions: {
        exclusive: false, // 独占模式
      },
    });
  });

  after(() => {
    if (rabbitMQ && rabbitMQ.connect && rabbitMQ.queue) {
      rabbitMQ.close();
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

  // 由于交换机不具备存储message 的能力所以无法进行测试
  it.skip('subscribe message test', done => {
    rabbitMQ.subscribe(
      msgObj => {
        assert(msgObj, 'msg is error');
        assert.equal(
          msgObj.msg.fields.routingKey,
          'info',
          'routingKey is error'
        );
        assert.equal(msgObj.toString(), 'hello word', 'msg is error');
        msgObj.ack();
        done();
      },
      { ack: true }
    );
  });

  it('unbindQueue test', async () => {
    const res = await rabbitMQ.unbindQueue(routeKey);
    assert.ok(res, true, 'unbindQueue error');
  });
});
