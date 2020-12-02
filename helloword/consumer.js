const { rabbitMQConfig } = require('../config');
const RabbitMQ = require('../lib/RabbiMQ');

const main = async () => {
  try {
    /**
     * 1. 创建连接
     * 2. 创建会话
     * 3. 创建消费者
     * 4. 接收信息
     */
    const rabbitMQ = new RabbitMQ();
    await rabbitMQ.createConnection(rabbitMQConfig);
    const session = rabbitMQ.createQueueSession();
    const consumer = await session.createConsumer({ queueName: 'hello' });
    const receiveEvent = consumer.receive({ noAck: false });
    console.log(' [*] Waiting for logs. To exit press CTRL+C');
    receiveEvent.on('message', msg => {
      console.log(" [x] Received '%s'", msg.getContent());
      console.log('exchange=', msg.getExchange());
      consumer.ack(msg.getMsg());
    });
    process.once('SIGINT', function () {
      console.log('意外退出');
      session.close();
    });
  } catch (error) {
    console.error(error);
  }
};

main();
