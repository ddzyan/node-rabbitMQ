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

  await rabbitMQ.publish('hello word', 'fusion.abc');
})();
