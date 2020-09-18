const urlOpt = require('./test/config.json');
const { RabbitMQ, WORKER_MODE } = require('./lib/RabbiMQ');

(async function () {
  const rabbitMQ = new RabbitMQ({
    urlOpt,
    exchangerName: 'fusion_inspect',
    exchangerOptions: {
      durable: false,
    },
    workerMode: WORKER_MODE.TOPIC,
  });

  await rabbitMQ.assert();
  const res = await rabbitMQ.publish('hello word', 'all.*');
  if (res) console.log('信息发送成功');
  await rabbitMQ.close();
})();
