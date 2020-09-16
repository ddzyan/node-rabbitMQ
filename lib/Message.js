class Message {
  constructor(msg, channel) {
    if (!msg || !channel) {
      throw new Error();
    }
    this.msg = msg;
    this.channel = channel;
  }

  toString() {
    return this.msg.content.toString();
  }

  /**
   * @description 确认消息
   * @returns {void}
   */
  ack() {
    this.channel.ack(this.msg);
  }
}

module.exports = Message;
