const express = require('express');
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

app.listen(9999, () => {
    console.log('Server started on port 9999');
});