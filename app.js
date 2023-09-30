const express = require("express");
const app = express();
const shell = require("shelljs");
const PORT = 1893;
var imgCount = 0;

const marketplaceAddr =
  "bcrt1p8vv595xwyvk2ey80ewn6sw6s4ffq6rals0dlatvdul2rlkqvn5fsp6x25d";

const cors = require("cors");
app.use(
  cors({
    origin: "*",
  })
);

app.use(express.json());

app.get("/hello", (req, res) => {
  res.set("Content-Type", "text/html");
  res.status(200).send("<h1>Hello GFG Learner!</h1>");
});

app.post("/inscribeOrd", async (req, res) => {
  const { address, imageLink } = req.body;

  shell.exec(`curl ${imageLink} > image${imgCount}.png`);

  shell.exec(
    `ord -r wallet inscribe --fee-rate 1 image${imgCount}.png > id.txt`
  );

  imgCount += 1;

  console.log("imageLink:", imageLink);

  console.log("add:", address);

  shell.exec(`bitcoin-cli -regtest generatetoaddress 1 ${address}`);

  var fs = require("fs");
  var path = require("path");
  var readStream = fs.createReadStream(
    path.join(__dirname, "../ordServer") + "/id.txt",
    "utf8"
  );
  let data = "";
  readStream
    .on("data", function (chunk) {
      data += chunk;
    })
    .on("end", function () {
      console.log(data);
    })
    .on("close", function (err) {
      var file = JSON.parse(data);
      shell.exec(
        `ord -r wallet send --fee-rate 1 ${address} ${file.inscription}`
      );
      shell.exec(`bitcoin-cli -regtest generatetoaddress 1 ${address}`);
      res.status(200).send(file);
    });
});

app.post("/transferOrd", async (req, res) => {
  // require authentication or restriction on sender
  const { address, ordId } = req.body;

  shell.exec(
    `ord -r wallet send --fee-rate 1 ${address} ${ordId} > txHash.txt`
  );

  var fs = require("fs");
  var path = require("path");
  var readStream = fs.createReadStream(
    path.join(__dirname, "../ordServer") + "/txHash.txt",
    "utf8"
  );
  let data = "";
  readStream
    .on("data", function (chunk) {
      data += chunk;
    })
    .on("end", function () {
      console.log(data);
    })
    .on("close", function (err) {
      shell.exec(`bitcoin-cli -regtest generatetoaddress 1 ${address}`);
      res.status(200).send(JSON.stringify({ tx: data }));
    });
});

app.post("/bridgeOrd", async (req, res) => {
  // require authentication or restriction on sender
  const { address, ordId } = req.body;

  shell.exec(
    `ord -r wallet send --fee-rate 1 ${marketplaceAddr} ${ordId} > bridgeTx.txt`
  );

  var fs = require("fs");
  var path = require("path");
  var readStream = fs.createReadStream(
    path.join(__dirname, "../ordServer") + "/bridgeTx.txt",
    "utf8"
  );
  let data = "";
  readStream
    .on("data", function (chunk) {
      data += chunk;
    })
    .on("end", function () {
      console.log(data);
    })
    .on("close", function (err) {
      shell.exec(`bitcoin-cli -regtest generatetoaddress 1 ${address}`);
      res.status(200).send(data);
    });
});

app.post("/ordAddress", async (req, res) => {
  // require authentication or restriction on sender
  shell.exec(`ord -r wallet receive > ordAddress.txt`);

  var fs = require("fs");
  var path = require("path");
  var readStream = fs.createReadStream(
    path.join(__dirname, "../ordServer") + "/ordAddress.txt",
    "utf8"
  );
  let data = "";
  readStream
    .on("data", function (chunk) {
      data += chunk;
    })
    .on("end", function () {
      console.log(data);
    })
    .on("close", function (err) {
      var file = JSON.parse(data);
      res.status(200).send(file);
    });
});

app.post("/claimOrdFromBridge", async (req, res) => {
  // require authentication or restriction on sender
  const { address, ordId } = req.body;

  shell.exec(
    `ord -r wallet send --fee-rate 1 ${address} ${ordId} > claimTx.txt`
  );

  var fs = require("fs");
  var path = require("path");
  var readStream = fs.createReadStream(
    path.join(__dirname, "../ordServer") + "/claimTx.txt",
    "utf8"
  );
  let data = "";
  readStream
    .on("data", function (chunk) {
      data += chunk;
    })
    .on("end", function () {
      console.log(data);
    })
    .on("close", function (err) {
      shell.exec(`bitcoin-cli -regtest generatetoaddress 1 ${address}`);
      res.status(200).send(data);
    });
});

app.get("/getBalance", async (req, res) => {
  // require authentication or restriction on sender
  // const { } = req.body;

  shell.exec(`bitcoin-cli -regtest -rpcwallet=youngz getbalance > balance.txt`);

  var fs = require("fs");
  var path = require("path");
  var readStream = fs.createReadStream(
    path.join(__dirname, "../ordServer") + "/balance.txt",
    "utf8"
  );
  let data = "";
  readStream
    .on("data", function (chunk) {
      data += chunk;
    })
    .on("end", function () {
      console.log(data);
    })
    .on("close", function (err) {
      res.status(200).send(JSON.stringify({ balance: data }));
    });
});

app.listen(PORT, (error) => {
  if (!error) console.log("Server listening on port " + PORT);
  else console.log("Error occurred, server can't start", error);
});
