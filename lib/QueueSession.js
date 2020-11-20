const Producer = require('./Producer');
const Consumer = require('./Consumer');

// 会话
class QueueSession {
  constructor(connect) {
    this.connect = connect;
  }

  async createProducer(queueName) {
    /* 
     2. 创建信道
     3. 声明队列
     4. 发送信息
   */
    this.channel = await this.connect.createChannel();
    //this.exchanger = await channel.assertExchange(this.exchangerName, this.workerMode.exchangerType, this.exchangerOptions);
    this.queue = await this.channel.assertQueue(queueName);
    const producer = new Producer(this.channel, queueName);
    return producer;
  }

  createTextMessage(msg) {
    msg = typeof msg === 'object' ? JSON.stringify(msg) : msg;
    msg = Buffer.from(msg);
    return msg;
  }

  async createConsumer(queueName) {
    /* 
     2. 创建信道
     3. 声明队列
     4. 接收信息
   */
    this.channel = await this.connect.createChannel();
    this.queue = await this.channel.assertQueue(queueName);
    const consumer = new Consumer(this.channel, queueName);
    return consumer;
  }

  close() {
    this.channel.close();
  }
}

module.exports = QueueSession;
