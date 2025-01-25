const express = require('express');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const bunyan = require('bunyan');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const os = require('os');

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

app.get('/test', (req, res) => {
  const response = req.body;
  const logData = JSON.stringify(trackingAlerts(response.appName, response.message).info, null, 2);
  fs.writeFileSync('test.log', logData + ',\n', { flag: 'a' });
  res.send('Log appended to test.log');
});

app.post('/trace', limiter,(req, res) => {
    const response = req.body;
    const logData = JSON.stringify(trackingAlerts(response.appName, response.message).trace, null, 2);
    fs.writeFileSync('test.log', logData + ',\n', { flag: 'a' });
    res.send("trace logged");
})

app.post('/info', limiter, (req, res) => {
    const response = req.body;
    const logData = JSON.stringify(trackingAlerts(response.appName, response.message).info, null, 2);
    fs.writeFileSync('test.log', logData + ',\n', { flag: 'a' });
    res.send("info logged");
})

app.post('/warn', limiter, (req, res) => {
    const response = req.body;
    const logData = JSON.stringify(trackingAlerts(response.appName, response.message).warn, null, 2);
    fs.writeFileSync('test.log', logData + ',\n', { flag: 'a' });
    res.send("warn logged");
})

app.post('/error', limiter, (req, res) => {
    const response = req.body;
    const logData = JSON.stringify(trackingAlerts(response.appName, response.message).error, null, 2);
    fs.writeFileSync('test.log', logData + ',\n', { flag: 'a' });
    res.send("error logged");
})

app.post('/fatal', limiter, (req, res) => {
    const response = req.body;
    const logData = JSON.stringify(trackingAlerts(response.appName, response.message).fatal, null, 2);
    fs.writeFileSync('test.log', logData + ',\n', { flag: 'a' });
    res.send("fatal logged");
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