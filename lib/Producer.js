// 生产者
class Producer {
  constructor(channel, queueName) {
    this.channel = channel;
    this.queueName = queueName;
  }

  async send(msg) {
    if (!(msg instanceof Buffer)) {
      throw new Error('类型错误');
    }

    const res = this.channel.sendToQueue(this.queueName, msg);
    return res;
  }
}

module.exports = Producer;
