// 生产者
class Producer {
  constructor(channel, queueOption, exchanger) {
    this.channel = channel;
    this.queueOption = queueOption;
    this.exchanger = exchanger;
  }

  async send(msg) {
    if (!(msg instanceof Buffer)) {
      throw new Error('类型错误');
    }
    let res;
    if (this.exchanger) {
      res = this.channel.publish(this.exchanger.exchange, this.queueOption.key, msg);
    } else {
      res = this.channel.sendToQueue(this.queueOption.queueName, msg);
    }

    return res;
  }
}

module.exports = Producer;
