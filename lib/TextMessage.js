class TextMessage {
  constructor(msg) {
    this.message = msg;
  }

  /**
   * @description 获取消息内容
   */
  getContent() {
    const text = this.message.content.toString();
    return text;
  }

  /**
   * @description 获取路由地址
   */
  getRoutingKey() {
    return this.message.fields.routingKey;
  }

  /**
   * @description 获取 consumer 标签
   */
  getConsumerTag() {
    return this.message.fields.consumerTag;
  }

  /**
   * @description 获取发送标识，用于确认消息
   */
  getRedelivered() {
    return this.message.fields.redelivered;
  }

  /**
   * @description 获取交换机名称
   */
  getExchange() {
    return this.message.fields.exchange;
  }

  /**
   * @description 返回 msg 原始对象
   */
  getMsg() {
    return this.message;
  }
}

module.exports = TextMessage;
