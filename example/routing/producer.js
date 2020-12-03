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
     *   1. 关闭连接
     */
    const rabbitMQ = new RabbitMQ();
    await rabbitMQ.createConnection(rabbitMQConfig);
    const session = rabbitMQ.createQueueSession();
    const producer = await session.createProducer();
    const msg = session.createTextMessage('this is good');
    const res = await producer.publish(
      'info',
      { exchangerName: 'direct_logs', exchangerType: session.EXCHANGER_TYPE.DIRECT },
      msg
    );
    console.log(res);
    session.close();
  } catch (error) {
    console.error(error);
  }
};

main();
