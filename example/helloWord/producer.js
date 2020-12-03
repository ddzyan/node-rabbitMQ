const { rabbitMQConfig } = require('../config');
const RabbitMQ = require('../../lib/RabbiMQ');

const main = async () => {
  try {
    /**
     * 1. 创建连接
     * 2. 创建会话
     * 3. 创建生产者
     * 4. 创建消息体
     * 5. 发送消息
     * 6. 关闭连接
     */

    const rabbitMQ = new RabbitMQ();
    await rabbitMQ.createConnection(rabbitMQConfig);
    const session = rabbitMQ.createQueueSession();
    const producer = await session.createProducer();
    const msg = session.createTextMessage('this is good');
    producer.send('hello', msg);
    session.close();
  } catch (error) {
    console.error(error);
  }
};

main();
