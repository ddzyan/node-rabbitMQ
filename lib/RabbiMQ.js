const amqplib = require('amqplib');
const QueueSession = require('./QueueSession');

class RabbitMQ {
  constructor() {}

  // 创建连接
  async createConnection(urlOpt) {
    this.connect = await amqplib.connect(urlOpt);
  }

  // 创建队列会话，允许创建多个
  createQueueSession() {
    const session = new QueueSession(this.connect);
    return session;
  }
}

module.exports = RabbitMQ;
