const urlOpt = require('./test/config.json');
const { RabbitMQ, WORKER_MODE } = require('./lib/RabbiMQ');

(async function () {
  const rabbitMQ = new RabbitMQ({
    urlOpt,
    queueName: 'task',
  });

  await rabbitMQ.assert();

  rabbitMQ.subscribe(msg => {
    console.log(msg.toString());
  });
})();
