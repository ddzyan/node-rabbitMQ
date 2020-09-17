const urlOpt = require('./test/config.json');
const { RabbitMQ, WORKER_MODE } = require('./lib/RabbiMQ');

(async function () {
  const rabbitMQ = new RabbitMQ({
    urlOpt,
    exchangerName: 'fusion_inspect',
    exchangerOptions: {
      durable: false,
    },
    queueName: 'shell',
    queueOptions: {
      exclusive: false, // 独占模式
    },
    workerMode: WORKER_MODE.TOPIC,
  });

  await rabbitMQ.assert();

  await rabbitMQ.bindQueue(0);

  rabbitMQ.subscribe(msg => {
    console.log(msg.toString());
  });
})();
