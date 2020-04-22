"use strict";

const kafka = require("kafka-node"),
  HighLevelProducer = kafka.HighLevelProducer,
  client = new kafka.KafkaClient(),
  producer = new HighLevelProducer(client),
  payloads = [{ topic: "test_topic", messages: "hi" }];
producer.on("ready", () => {
  producer.send(payloads, (err, data) => {
    console.log(data);
  });
});


const redis = require("redis");
const redisClient = redis.createClient();

redisClient.on("error", function(error) {
  console.error(error);
});

redisClient.set("key", "value", redis.print);
redisClient.get("key", redis.print);
