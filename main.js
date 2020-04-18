const express = require("express");
const app = express();
const port = 3000;

const request = require("request");

app.get("/", (req, res) => res.send("Hello World from API!"));

app.listen(port, "0.0.0.0", () =>
  console.log(`App listening at http://localhost:${port}`)
);

setInterval(() => {
  request("http://payment:8080", { json: true }, (err, res, body) => {
    console.log(err ? err : body);
  });
  request("http://ticket:8081", { json: true }, (err, res, body) => {
    console.log(err ? err : body);
  });
  request("http://user:8082", { json: true }, (err, res, body) => {
    console.log(err ? err : body);
  });
}, 2000);
