const Producer = require('./Producer');
const Consumer = require('./Consumer');

const EXCHANGE_TYPE = {
  FANOUT: 'fanout',
  TOPIC: 'topic',
  DIRECT: 'direct',
};

const WORKER_MODE = {
  NORMAL: EXCHANGE_TYPE.FANOUT,
  TOPIC: EXCHANGE_TYPE.TOPIC,
  PUB_SUB: EXCHANGE_TYPE.FANOUT,
};

// 会话
class QueueSession {
  constructor(connect) {
    this.connect = connect;
    this.exchanger = null;
  }

  /**
   * @description 创建交换机
   * @param {Object} option
   * @param {string} option.exchangeName 交换机名称
   * @param {EXCHANGE_TYPE} option.exchangerType 交换机类型
   * @param {Object} option.option 交换机配置
   */
  async createExchange() {
    if (this.option.workerMode !== WORKER_MODE.NORMAL) {
      const { exchangerName, exchangerType, exchangerOptions } = this.this.option;
      this.exchanger = await channel.assertExchange(exchangerName, exchangerType, exchangerOptions);
    }
  }

  async bindQueue() {}

  async createProducer(queueName) {
    /* 
     2. 创建信道
     3. 声明交换机
     3. 声明队列
     4. 发送信息
   */
    this.channel = await this.connect.createChannel();
    this.exchanger = null;

    // 声明交换机
    this.queue = await this.channel.assertQueue(queueName);
    const producer = new Producer(this.channel, queueName);
    return producer;
  }

  async createConsumer(queueName) {
    /* 
     2. 创建信道
     3. 声明队列
     4. 接收信息
   */
    this.channel = await this.connect.createChannel();
    this.queue = await this.channel.assertQueue(queueName);
    const consumer = new Consumer(this.channel, queueName);
    return consumer;
  }

  close() {
    this.channel.close();
  }
}

QueueSession.prototype.WORKER_MODE = WORKER_MODE;

module.exports = QueueSession;
