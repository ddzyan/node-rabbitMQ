const Producer = require('./Producer');
const Consumer = require('./Consumer');

const EXCHANGER_TYPE = {
  FANOUT: 'fanout',
  TOPIC: 'topic',
  DIRECT: 'direct',
};

const WORKER_MODE = {
  NORMAL: EXCHANGER_TYPE.FANOUT,
  TOPIC: EXCHANGER_TYPE.TOPIC,
  PUB_SUB: EXCHANGER_TYPE.FANOUT,
};

// 会话
class QueueSession {
  constructor(connect) {
    this.connect = connect;
    this.exchanger = null;
  }

  /**
   * @description 创建交换机
   * @param {Object} params
   * @param {string} params.exchangerName 交换机名称
   * @param {EXCHANGE_TYPE} params.exchangerType 交换机类型
   * @param {Object} params.option 交换机配置
   */
  async _createExchange(params) {
    if (!this.channel) {
      throw new Error('请先创建信道');
    }
    const { exchangerName, exchangerType, option = {} } = params;
    const exchanger = await this.channel.assertExchange(exchangerName, exchangerType, option);
    return exchanger;
  }

  async bindQueue() {}

  /**
   * @description 创建生产者
   * @param {Object} option
   * @param {string} option.queueOption 队列配置
   * @param {string} option.exchangeOption 交换机配置
   */
  async createProducer(queueOption, exchangeOption) {
    this.channel = await this.connect.createChannel();

    if (!queueOption) {
      throw new Error('队列配置不能为空');
    }

    if (exchangeOption) {
      this.exchanger = await this._createExchange(exchangeOption);
    }

    // 声明交换机
    this.queue = await this.channel.assertQueue(queueOption.queueName);
    const producer = new Producer(this.channel, queueOption, this.exchanger);
    return producer;
  }
  /**
   * @description 创建消费者
   * @param {Object} queueOption 队列配置
   * @param {Object} exchangeOption 交换机配置
   */
  async createConsumer(queueOption, exchangeOption) {
    this.channel = await this.connect.createChannel();

    if (!queueOption && !queueOption.queueName) {
      throw new Error('队列配置不能为空');
    }

    this.queue = await this.channel.assertQueue(queueOption.queueName);

    if (exchangeOption) {
      this.exchanger = await this._createExchange(exchangeOption);
      await this.channel.bindQueue(
        queueOption.queueName,
        exchangeOption.exchangerName,
        queueOption.key
      );
    }

    const consumer = new Consumer(this.channel, queueOption.queueName);
    return consumer;
  }

  createTextMessage(msg) {
    if (msg instanceof Object) {
      msg = JSON.stringify(msg);
    }

    return Buffer.from(msg);
  }

  close() {
    this.channel.close();
  }
}

QueueSession.prototype.WORKER_MODE = WORKER_MODE;
QueueSession.prototype.EXCHANGER_TYPE = EXCHANGER_TYPE;

module.exports = QueueSession;
