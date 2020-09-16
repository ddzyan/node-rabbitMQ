const amqplib = require('amqplib');
//const { all } = require('bluebird');

const Message = require('./Message');

const DEFAULT_EXCHANGER_TYPE = 'fanout';

class RabbitMQ {
  constructor({
    urlOpt,
    exchangerName,
    exchangerOptions,
    queueName,
    queueOptions,
  }) {
    this.connect = null;
    this.channel = null;
    this.exchanger = null;
    this.ct = null; // 信道Tag
    this.queue = null;
    this._subscribeCache = null;
    this.exchangerName = exchangerName;
    this.exchangerOptions = exchangerOptions;
    this.queueName = queueName;
    this.queueOptions = queueOptions;
    this.urlOpt = urlOpt;
    this.bindRouteKeys = [];
  }

  /**
   * @description 创建连接，创建信道，声明交换机
   * @returns {Promise<Array<object>>} array 包含connect,channel,exchanger,queue 对象
   */
  async assert() {
    /**
     * 1. 创建连接
     * 2. 创建信道
     * 3. 声明交换机
     */
    if (!this.connect && this.urlOpt) {
      this.connect = await amqplib.connect(this.urlOpt);
    }

    if (!this.channel) {
      this.channel = await this.connect.createChannel();
    }

    if (this.exchangerName && !this.exchanger) {
      this.exchanger = await this.channel.assertExchange(
        this.exchangerName,
        this.exchangerOptions.type || DEFAULT_EXCHANGER_TYPE,
        this.exchangerOptions
      );
    }

    if (this.queueName) {
      const { queue } = await this.channel.assertQueue(
        this.queueName,
        this.queueOptions
      );
      this.queue = queue;
    }

    return [this.connect, this.channel, this.exchanger, this.queue];
  }

  async bindQueue(routingKeys) {
    if (!this.channel && !this.queue) {
      return new Error();
    }

    const res = await this._bindProcess('bindQueue', routingKeys);
    return res;
  }

  publish(msg, routingKey, options) {
    if (!this.connect && !this.channel && !this.exchanger) {
      throw new Error('请先运行 assert 创建必要通道');
    }

    if (typeof msg !== 'string') {
      throw new TypeError('msg must be string');
    }

    return this.channel.publish(
      this.exchangerName,
      routingKey || this.queueName,
      Buffer.from(msg),
      options
    );
  }

  async subscribe(cb, options) {
    const ct = await this._subscribe(cb, options);
    if (ct) {
      this.ct = ct.consumerTag;
    }
  }

  /**
   *
   * @param {function} cb 回调函数
   * @param {Object} options consumer 配置
   * @return {Promise}
   */
  async _subscribe(cb, options) {
    if (this.queue) {
      this._subscribeCache = {
        cb,
        opt: options,
      };
      const res = await this.channel.consume(
        this.queueName,
        msg => cb(new Message(msg, this.channel)),
        options || {}
      );
      return res;
    } else {
      throw new Error('请先声明队列');
    }
  }

  /**
   * @description 解除信道订阅
   */
  async unsubscribe() {
    if (!this.ct) {
      return;
    }

    this.channel.cancel(this.ct);
    this.ct = null;
  }

  /**
   * @description 关闭信道和连接
   * @returns {void}
   */
  async close() {
    if (this.channel) {
      await this.channel.close();
    }

    if (this.connect) {
      await this.connect.close();
    }
  }

  /**
   * @description 解除队列绑定
   * @param {string | Array<string>} routingKeys 路由
   * @returns {Promise}
   */
  async unbindQueue(routingKeys) {
    return this._bindProcess('unbindQueue', routingKeys);
  }

  /**
   * @description 绑定/解除绑定 交换机
   * @param {string} method 让交换机执行的方法
   * @param {string | Array<string>} routingKeys 路由
   * @returns {Promise} res 绑定结果
   */
  async _bindProcess(method, routingKeys) {
    if (routingKeys && !Array.isArray(routingKeys)) {
      routingKeys = [routingKeys];
    }

    let bind = method === 'bindQueue';
    if (!this.exchanger) {
      throw new Error();
    }

    for (const routingKey of routingKeys) {
      await this.channel[method](this.queue, this.exchangerName, routingKey);
      // 判断是否是绑定队列
      if (bind) {
        this.bindRouteKeys.push(routingKey);
      } else {
        this.bindRouteKeys.splice(this.bindRouteKeys.indexOf(routingKey), 1);
      }
    }

    return true;
  }

  /**
   * @description 重新连接
   */
  async restart() {
    await this.assert();

    if (this._subscribeCache) {
      this.subscribe();
    }

    if (this.bindRouteKeys.length > 0) {
      await this.assertAndBindQueue(bindRouteKeys);
    }
  }
}

module.exports = RabbitMQ;
