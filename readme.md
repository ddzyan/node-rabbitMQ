## 简介

这是一个使用 amqp 协议的 nodejs 模块

## 支持模式

- hello word
- topic
- router
- publish/subscriber
- work

## 使用

安装

```shell
npm install node-rabbitMQ --save
```

测试

```shell
npm run test
```

### 示例

具体代码可以参考 test

producer

```js
const RabbitMQ = require('node-rabbitMQ');

const rabbitMQ = new RabbitMQ({
  urlOpt: {
    protocol: 'amqp',
    hostname: 'localhost',
    port: 5672,
    username: 'admin',
    password: 'xxx',
  },
  exchangerName: 'test_ex',
  exchangerOptions: {
    type: 'topic',
    durable: false,
  },
});

rabbitMQ.assert().then(() => {
  rabbitMQ.publish('hello word', 'info');
});
```

consumer

```js
const RabbitMQ = require('node-rabbitMQ');

const rabbitMQ = new RabbitMQ({
  urlOpt: {
    protocol: 'amqp',
    hostname: 'localhost',
    port: 5672,
    username: 'admin',
    password: 'xxx',
  },
  exchangerName: 'test_ex',
  exchangerOptions: {
    type: 'topic',
    durable: false,
  },
  queueName: 'direct',
  queueOptions: {
    exclusive: false, // 独占模式
  },
});

rabbitMQ.assert(() => {
  rabbitMQ.bindQueue('info').then(() => {
    rabbitMQ.subscribe(
      msgObj => {
        console.log(msgObj.toString());
        msgObj.ack();
        done();
      },
      { ack: true }
    );
  });
});
```
