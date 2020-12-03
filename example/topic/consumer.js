const { rabbitMQConfig } = require('../../config');
const RabbitMQ = require('../../lib/RabbiMQ');

const queueName = 'info';
const key = 'logs.warn';
const exchangerName = 'topic_logs';
const main = async () => {
  try {
    const rabbitMQ = new RabbitMQ();
    /**
     * 1. 创建连接
     * 2. 创建会话
     * 3. 创建消费者
     * 4. 创建队列
     * 5. 订阅信息
     *   1. 关闭会话
     */
    await rabbitMQ.createConnection(rabbitMQConfig);
    const session = rabbitMQ.createQueueSession();
    const consumer = await session.createConsumer();
    await consumer.createQueue(
      { queueName, key, option: { exclusive: true } },
      { exchangerName, exchangerType: session.EXCHANGER_TYPE.TOPIC }
    );
    const receiveEvent = await consumer.receive({ noAck: false });
    console.log('queue routing', key);
    console.log(' [*] Waiting for logs. To exit press CTRL+C');
    receiveEvent.on('message', msg => {
      console.log(" [x] Received '%s'", msg.getContent());
      consumer.ack(msg.getMsg());
    });

    process.once('SIGINT', async () => {
      session.close();
      console.log('意外退出');
    });
  } catch (error) {
    console.error(error);
  }
};

main();
