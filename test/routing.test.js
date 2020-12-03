// // 路由模式
// const assert = require('assert');

// const RabbitMQ = require('../lib/RabbiMQ');
// const { rabbitMQConfig } = require('../config');
// describe('routing test', function () {
//   before(async () => {
//     rabbitMQ = new RabbitMQ();
//     await rabbitMQ.createConnection(rabbitMQConfig);
//     session = rabbitMQ.createQueueSession();
//   });

//   it('publish test', async () => {
//     const producer = await session.createProducer();
//     const msg = session.createTextMessage('this is good');
//     const res = await producer.publish(
//       'info',
//       { exchangerName: 'direct_logs', exchangerType: session.EXCHANGER_TYPE.DIRECT },
//       msg
//     );

//     assert.ok(res, '消息发送失败');
//   });

//   it('consumer test', async done => {
//     const consumer = await session.createConsumer();
//     await consumer.createQueue(
//       { queueName: 'info', key: 'info' },
//       { exchangerName: 'direct_logs', exchangerType: session.EXCHANGER_TYPE.DIRECT }
//     );
//     const receiveEvent = await consumer.receive({ noAck: false });
//     receiveEvent.on('message', msg => {
//       console.log(" [x] Received '%s'", msg.getContent());
//       consumer.ack(msg.getMsg());
//       assert(msg, '消息接收失败');
//       done();
//     });
//   });
// });
