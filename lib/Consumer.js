const { EventEmitter } = require('events');
const TextMessage = require('./TextMessage');

const receiveEvent = new EventEmitter();

const receiveHandle = function (msg) {
  const textMessage = new TextMessage(msg);
  receiveEvent.emit('message', textMessage);
};

class Consumer {
  constructor(channel, queueName) {
    this.channel = channel;
    this.queueName = queueName;
  }

  receive(option = {}) {
    this.channel.consume(this.queueName, receiveHandle, option);
    return receiveEvent;
  }

  ack(msg) {
    this.channel.ack(msg);
  }
}

module.exports = Consumer;
