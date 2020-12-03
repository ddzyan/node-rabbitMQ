const { EventEmitter } = require('events');
const TextMessage = require('./TextMessage');

const receiveEvent = new EventEmitter();

const receiveHandle = function (msg) {
  const textMessage = new TextMessage(msg);
  receiveEvent.emit('message', textMessage);
};

class Consumer {
  constructor(channel) {
    this.channel = channel;
    this.queue = null;
    this.exchanger = null;
    this.consumer = null;
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
   * @param {string} queueName 队列名称
   * @param {boolean} isBind 是否绑定
   */
  async _createAndBindQueue(queueName, key) {
    if (!queueName) {
      throw new Error('队列名称不能为空');
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
      await this.channel.bindQueue(queueName, this.exchanger.exchange, key);
    }
  }

  /**
   * @description 创建队列
   * @param {Object} queueOption
   * @param {string} queueOption.queueName 队列名称
   * @param {string} queueOption.key 队列路由
   * @param {Object} exchangerOption
   * @param {string} exchangerOption.exchangerName 交换机名称
   * @param {EXCHANGE_TYPE} exchangerOption.exchangerType 交换机类型
   * @param {Object} exchangerOption.option 交换机配置
   */
  async createQueue(queueOption, exchangerOption) {
    if (!queueOption && !queueOption.queueName) {
      throw new Error('消息队列配置错误');
    }
    const { queueName, key } = queueOption;

    // 创建交换机
    if (exchangerOption) {
      // 创建交换机
      await this._createExchange(exchangerOption);
    }

    // 声明队列，并且绑定交换机
    await this._createAndBindQueue(queueName, key);
  }

  async receive(option) {
    this.consumer = await this.channel.consume(this.queue.queue, receiveHandle, option);
    return receiveEvent;
  }

  /**
   * @description 确认消息
   * @param {string} msg
   * @param {boolean} allUpTo 则在给定消息之前（包括给定消息）的所有未完成消息都应被视为已确认，否则只确定指定消息
   */
  async ack(msg, allUpTo = false) {
    return await this.channel.ack(msg, allUpTo);
  }

  /**
   * @description 拒绝消息
   * @param {string} msg
   * @param {boolean} allUpTo 则在给定消息之前（包括给定消息）的所有未完成消息都应该拒绝，否则只确定指定消息
   */
  async ack(msg, allUpTo = false) {
    return await this.channel.nack(msg, allUpTo);
  }

  /**
   * @description 停止接收消息
   */
  async cancel() {
    if (this.consumer) {
      await this.channel.cancel(this.consumer.consumerTag);
    }
  }

  /**
   * @description 接触队列绑定和删除交换机
   */
  async close() {
    // 删除队列
    if (this.queue) {
      this.channel.deleteQueue(this.queue.queue);
      this.queue = null;
    }

    // 删除交换机
    if (this.exchanger) {
      this.channel.deleteExchange(this.exchanger.exchange);
      this.exchanger = null;
    }

    // 停止接收消息
    if (this.consumer) {
      await this.cancel();
    }
  }
}

module.exports = Consumer;
