const amqplib = require('amqplib');
//const { all } = require('bluebird');

const Message = require('./Message');

const EXCHANGE_TYPE = {
  FANOUT: 'fanout',
  TOPIC: 'topic',
  DIRECT: 'direct',
};

const WORKER_MODE = {
  NORMAL: {
    exchangerType: EXCHANGE_TYPE.FANOUT,
  },
  TOPIC: {
    exchangerType: EXCHANGE_TYPE.TOPIC,
  },
  PUB_SUB: {
    exchangerType: EXCHANGE_TYPE.FANOUT,
  },
};

class RabbitMQ {
  constructor({
    urlOpt,
    exchangerName,
    exchangerOptions,
    queueName,
    queueOptions,
    workerMode = WORKER_MODE.NORMAL,
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
    this.workerMode = workerMode;
  }

  /**
   * @description 创建连接，创建信道，声明交换机
   * @returns {Promise<Array<object>>} array 包含connect,channel,exchanger,queue 对象
   */
  async assert() {
    if (!this.connect && this.urlOpt) {
      this.connect = await amqplib.connect(this.urlOpt);
    }

    if (!this.channel) {
      this.channel = await this.connect.createChannel();
    }

    if (this.exchangerName && !this.exchanger) {
      this.exchanger = await this.channel.assertExchange(
        this.exchangerName,
        this.workerMode.exchangerType,
        this.exchangerOptions
      );
    }

    if (this.queueName && !this.queue) {
      const { queue } = await this.channel.assertQueue(
        this.queueName,
        this.queueOptions
      );
      this.queue = queue;
    }

    return [this.connect, this.channel, this.exchanger, this.queue];
  }

  /**
   * @description 队列绑定
   * @param {string|Array<string>} routingKeys 路由
   */
  async bindQueue(routingKeys) {
    if (!this.channel && !this.queue) {
      return new Error();
    }

    const res = await this._bindProcess('bindQueue', routingKeys);
    return res;
  }

  /**
   * @description send message
   * @param {string} msg
   * @param {string} routingKey
   * @param {object} options
   * @returns {void}
   */
  publish(msg, routingKey = '', options) {
    if (!this.connect && !this.channel) {
      throw new Error('请先运行 assert 创建必要通道');
    }
    if (typeof msg !== 'string') {
      throw new TypeError('msg must be string');
    }
    msg = Buffer.from(msg);
    switch (this.workerMode) {
      case WORKER_MODE.NORMAL:
        return this.channel.sendToQueue(this.queueName, msg, options);
      case WORKER_MODE.PUB_SUB:
      case WORKER_MODE.TOPIC:
        return this.channel.publish(
          this.exchangerName,
          routingKey || this.queueName,
          msg,
          options
        );
      default:
        break;
    }
  }

  /**
   * @description subscribe message
   * @param {function} cb 回调函数
   * @param {object } options 订阅配置
   */
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
      console.log('subscribe success , [*] Waiting for message');
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

module.exports = {
  RabbitMQ,
  WORKER_MODE,
};
