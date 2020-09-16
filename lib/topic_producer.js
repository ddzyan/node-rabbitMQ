const amqplib = require('amqplib');

class Producer {
  /**
   *
   * @param {string} exchanger 交换机
   */
  constructor({ urlOpt, exchanger, exchangerOptions }) {
    this.exchanger = exchanger;
    this.urlOpt = urlOpt;
    this.exchangerOptions = exchangerOptions;
    this.connect = null;
    this.channel = null;
  }

  async send(customTask) {
    /**
     * 1. 建立连接
     * 2. 创建信道
     * 3. 声明交换机
     * 4. 发送消息
     */

    this.connect = await amqplib.connect(this.urlOpt);

    this.channel = await this.connect.createChannel();
    await this.channel.assertExchange(
      this.exchanger,
      this.exchangerOptions.type || 'fanout',
      this.exchangerOptions
    );

    /* 
    const msg = 'hello word';
    console.log(this.exchanger);
    this.channel.publish(this.exchanger, 'info', Buffer.from(msg));
    console.log(" [x] Sent %s:'%s'", 'info', msg); 
    */

    const { batchTask, commonTasks, routePrefix } = customTask;
    if (batchTask.enable) {
      const { taskIds } = batchTask;
      const route = `${routePrefix}.#`;
      const taskIdsStr = JSON.stringify(taskIds);
      this.channel.publish(this.exchanger, route, Buffer.from(taskIdsStr));
      console.log(" [x] Sent %s:'%s'", route, taskIdsStr);
      console.log('并发任务执行完毕');
    }

    if (commonTasks.enable) {
      for (const key in commonTasks.tasks) {
        const route = `${routePrefix}.${key}`;
        const taskIds = commonTasks.tasks[key];
        const taskIdsStr = JSON.stringify(taskIds);
        this.channel.publish(this.exchanger, route, Buffer.from(taskIdsStr));
      }
      console.log('定制任务发布完毕');
    }

    this.close();
  }
  async close() {
    await this.connect.close;
    await this.channel.close();
  }
}

module.exports = Producer;
