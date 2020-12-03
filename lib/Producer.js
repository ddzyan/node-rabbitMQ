// 生产者
class Producer {
  constructor(channel) {
    this.channel = channel;
    this.exchanger = null;
    this.queue = null;
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
    if (!this.exchanger) {
      this.exchanger = await this.channel.assertExchange(exchangerName, exchangerType, option);
    }
  }

  /**
   * @description 绑定队列
   */
  async _createAndBindQueue(queueName, key) {
    try {
      if (!queueName) {
        throw new Error('消息队列配置失败');
      }

      if (!this.channel) {
        throw new Error('请先创建信道');
      }

      if (!this.queue) {
        // 声明队列
        this.queue = await this.channel.assertQueue(queueName);
      }

      if (key) {
        if (!this.exchanger) {
          throw new Error('请先创建交换机');
        }
        await this.channel.bindQueue(queueName, this.exchanger.exchanger, key);
      }
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * @description 点对点发布消息
   * @param {Buffer} msg
   * @returns {boolean} 消息是否发送成功
   */
  async send(queueName, msg) {
    if (!queueName) {
      throw new Error('队列名称不能为空');
    }
    if (!(msg instanceof Buffer)) {
      throw new Error('类型错误');
    }

    const res = this.channel.sendToQueue(queueName, msg);
    return res;
  }

  /**
   * @description 发布/订阅发布消息
   * @param {Buffer} msg
   * @returns {boolean} 消息是否发送成功
   */
  async publish(key, exchangerOption, message, option = {}) {
    if (!(message instanceof Buffer)) {
      throw new Error('类型错误');
    }
    if (!key) {
      throw new Error('队列路由不能为空');
    }

    if (!exchangerOption) {
      throw new Error('交换机配置错误');
    }

    // 创建交换机
    await this._createExchange(exchangerOption);

    const res = this.channel.publish(this.exchanger.exchange, key, message, option);
    return res;
  }

  /**
   * @description 接触队列绑定和删除交换机
   */
  close() {
    if (this.queue) {
      this.channel.deleteQueue(this.queue.queue);
      this.queue = null;
    }

    if (this.exchanger) {
      this.channel.deleteExchange(this.exchanger.exchange);
      this.exchanger = null;
    }
  }
}

module.exports = Producer;
