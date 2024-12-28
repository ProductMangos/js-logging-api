const express = require('express');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const bunyan = require('bunyan');
const rateLimit = require('express-rate-limit');
const cors = require('cors');

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20, // Limit each IP to 100 requests per `window` (15 minutes)
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: 'Too many requests from this IP, please try again later.'
  });

const log = bunyan.createLogger({
    name: 'myapp',
    streams: [
        {
            level: 'trace',
            path: 'logging.log'
        }
    ]
})
const app = express();
app.use(express.json())
app.use(cors())

app.get('/', (req, res) => {
    res.send('API is running!');
});

app.post('/trace', limiter,(req, res) => {
    const response = req.body;
    log.trace(response.message);
    res.send(response.message);
})

app.post('/debug', limiter, (req, res) => {
    const response = req.body;
    log.debug(response.message);
    res.send(response.message);
})

app.post('/info', limiter, (req, res) => {
    const response = req.body;
    log.info(response.message);
    res.send(response.message);
})

app.post('/warn', limiter, (req, res) => {
    const response = req.body;
    log.warn(response.message);
    res.send(response.message);
})

app.post('/error', limiter, (req, res) => {
    const response = req.body;
    log.error(response.message);
    res.send(response.message);
})

app.post('/fatal', limiter, (req, res) => {
    const response = req.body;
    log.fatal(response.message);
    res.send(response.message);
})

app.get('/getlogs', (req, res) => {
    const logFilePath = path.join(__dirname, 'logging.log');

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