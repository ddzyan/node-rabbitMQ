const urlOpt = require('./test/config.json');
const { RabbitMQ, WORKER_MODE } = require('./lib/RabbiMQ');

(async function () {
  const rabbitMQ = new RabbitMQ({
    urlOpt,
    queueName: 'fusion_result',
    queueOptions: {
      exclusive: false, // 独占模式
      durable: false,
    },
    workerMode: WORKER_MODE.NORMAL,
  });

  await rabbitMQ.assert();

  rabbitMQ.subscribe(
    msg => {
      console.log(msg.toString());
    },
    {
      noAck: true,
    }
  );

  process.once('SIGINT', async () => {
    console.log('意外退出');
    await rabbitMQ.close();
  });
})();
