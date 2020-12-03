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
    this.consumer = null;
    this.producer = null;
  }

  /**
   * @description 创建生产者
   */
  async createProducer() {
    this.channel = await this.connect.createChannel();
    this.producer = new Producer(this.channel);
    return this.producer;
  }
  /**
   * @description 创建消费者
   */
  async createConsumer() {
    this.channel = await this.connect.createChannel();
    this.consumer = new Consumer(this.channel);
    return this.consumer;
  }

  createTextMessage(msg) {
    if (msg instanceof Object) {
      msg = JSON.stringify(msg);
    }

    return Buffer.from(msg);
  }

  close() {
    if (this.channel) {
      //this.channel.close();
      this.connect.close();
    }
    // if (this.producer) {
    //   await this.producer.close();
    // }

    // if (this.consumer) {
    //   await this.consumer.close();
    // }
  }
}

QueueSession.prototype.WORKER_MODE = WORKER_MODE;
QueueSession.prototype.EXCHANGER_TYPE = EXCHANGER_TYPE;

module.exports = QueueSession;
