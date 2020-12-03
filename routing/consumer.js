const { rabbitMQConfig } = require('../config');
const RabbitMQ = require('../lib/RabbiMQ');

const main = async () => {
  try {
    const rabbitMQ = new RabbitMQ();
    /**
     * 1. 创建连接
     * 2. 创建会话
     * 3. 创建消费者
     * 4. 接收信息
     */
    await rabbitMQ.createConnection(rabbitMQConfig);
    const session = rabbitMQ.createQueueSession();
    const consumer = await session.createConsumer();
    await consumer.createQueue(
      { queueName: 'info', key: 'info' },
      { exchangerName: 'direct_logs', exchangerType: session.EXCHANGER_TYPE.DIRECT }
    );
    const receiveEvent = await consumer.receive({ noAck: false });

    console.log(' [*] Waiting for logs. To exit press CTRL+C');
    receiveEvent.on('message', msg => {
      console.log(" [x] Received '%s'", msg.getContent());
      //consumer.ack(msg.getMsg());
      consumer.nack(msg.getMsg());
    });

    process.once('SIGINT', async () => {
      await session.close();
      console.log('意外退出');
    });
  } catch (error) {
    console.error(error);
  }
};

main();
