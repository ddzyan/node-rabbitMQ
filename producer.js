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
    const producer = await session.createProducer('hello');
    const msg = session.createTextMessage('this is good');
    producer.send(msg);
    session.close();
  } catch (error) {
    console.error(error);
  }
};

main();
