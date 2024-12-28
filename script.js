const express = require('express');
const fs = require('fs');
const path = require('path');
const readline = require('readline');
const bunyan = require('bunyan');

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

app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.post('/trace', (req, res) => {
    const response = req.body;
    log.trace(response.message);
    res.send(response.message);
})

app.post('/debug', (req, res) => {
    const response = req.body;
    log.debug(response.message);
    res.send(response.message);
})

app.post('/info', (req, res) => {
    const response = req.body;
    log.info(response.message);
    res.send(response.message);
})

app.post('/warn', (req, res) => {
    const response = req.body;
    log.warn(response.message);
    res.send(response.message);
})

app.post('/error', (req, res) => {
    const response = req.body;
    log.error(response.message);
    res.send(response.message);
})

app.post('/fatal', (req, res) => {
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
        logs.push(JSON.parse(line)); // Parse each log line as JSON
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