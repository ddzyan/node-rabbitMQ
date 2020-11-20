class Consumer {
  constructor(channel, queueName) {
    this.channel = channel;
    this.queueName = queueName;
  }

  receive(cb, option = {}) {
    this.channel.consume(this.queueName, cb, option);
  }
}

module.exports = Consumer;
