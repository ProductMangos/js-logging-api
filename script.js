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

app.listen(9999, () => {
    console.log('Server started on port 9999');
});