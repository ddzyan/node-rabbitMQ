const RabbitMQ = require('./lib/RabbiMQ');

const main = async () => {
  try {
    const rabbitMQ = new RabbitMQ();
    await rabbitMQ.createConnection({
      protocol: 'amqp',
      hostname: '10.10.0.12', // 连接地址
      port: 5673,
      username: 'admin',
      password: 'PwDF0hVBkNpkZGfkNI3Y',
    });
    const session = rabbitMQ.createQueueSession();
    const consumer = await session.createConsumer('hello');
    const receiveEvent = consumer.receive({ noAck: false });

    receiveEvent.on('message', msg => {
      console.log(" [x] Received '%s'", msg.getContent());
      console.log('exchange=', msg.getExchange());
      consumer.ack(msg.getMsg());
    });
  } catch (error) {
    console.error(error);
  }
};

main();
