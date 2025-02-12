const express = require('express');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const os = require('os');
const pool = require("./db");
const { log } = require('console');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 100 requests per `window` (15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: 'Too many requests from this IP, please try again later.'
  });

const trackingAlerts = (appName, msg) => {
  const currentDate = new Date().toISOString();

  const alerts = {
    trace: { 
      appName: appName,
      name: os.hostname(), 
      msg: msg, 
      time: currentDate, 
      type: 'trace',
      level: 10
    },
    info: { 
      appName: appName,
      name: os.hostname(), 
      msg: msg, 
      time: currentDate, 
      type: 'info',
      level: 20
    },
    warn: {
      appName: appName,
      name: os.hostname(),
      msg: msg,
      time: currentDate,
      type: 'warn',
      level: 30
    },
    error: {
      appName: appName,
      name: os.hostname(),
      msg: msg,
      time: currentDate,
      type: 'error',
      level: 40
    },
    fatal: {
      appName: appName,
      name: os.hostname(),
      msg: msg,
      time: currentDate,
      type: 'fatal',
      level: 50
    }
  };

  return alerts;
};



const app = express();
app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
    res.send('API is running!');
});

app.get('/test', async (req, res) => {
  const posts = await pool.query("INSERT INTO logs (appname, machine_name, msg, time, type, level) VALUES ('js-logger-api', 'MacBook-Pro', 'hello, world!', '2025-01-23T03:24:15.067Z', 'trace', 20) RETURNING *");
  res.send({ posts });
});

const loggingIntoDB = async(appName, machineName, msg, time, type, level) => {
  try {
    await pool.query("INSERT INTO logs (appname, machine_name, msg, time, type, level) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *", [appName, machineName, msg, time, type, level]);
  } catch (error) {
    console.log(error);
  }
  return "success";
}

app.post('/trace', limiter, (req, res) => {
    const response = req.body;
    const logData = trackingAlerts(response.appname, response.message).trace;
    const result = loggingIntoDB(logData.appName, logData.name, logData.msg, logData.time, logData.type, logData.level);
    res.send(result);
})

app.post('/info', limiter, (req, res) => {
    const response = req.body;
    const logData = trackingAlerts(response.appname, response.message).info;
    const result = loggingIntoDB(logData.appName, logData.name, logData.msg, logData.time, logData.type, logData.level);
    res.send(result);
})

app.post('/warn', limiter, (req, res) => {
    const response = req.body;
    const logData = trackingAlerts(response.appname, response.message).warn;
    const result = loggingIntoDB(logData.appName, logData.name, logData.msg, logData.time, logData.type, logData.level);
    res.send(result);
})

app.post('/error', limiter, (req, res) => {
    const response = req.body;
    const logData = trackingAlerts(response.appname, response.message).error;
    const result = loggingIntoDB(logData.appName, logData.name, logData.msg, logData.time, logData.type, logData.level);
    res.send(result);
})

app.post('/fatal', limiter, (req, res) => {
    const response = req.body;
    const logData = trackingAlerts(response.appname, response.message).fatal;
    const result = loggingIntoDB(logData.appName, logData.name, logData.msg, logData.time, logData.type, logData.level);
    res.send(result);
})

app.get('/getlogs', (req, res) => {
    const logFilePath = path.join(__dirname, 'test.log');

    const stream = fs.createReadStream(logFilePath, { encoding: 'utf8' });
    const rl = readline.createInterface({ input: stream });

    let logs = [];

    rl.on('line', (line) => {
        logs.push(JSON.parse(line));
    });

    rl.on('close', () => {
        res.json({ logs });
    });

    rl.on('error', (err) => {
        console.error('Error reading log file:', err);
        res.status(500).send('Error reading log file.');
    });
});


app.listen(9999, () => {
    console.log('Server started on port 9999');
});