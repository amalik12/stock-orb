require('dotenv').config();
require('https').globalAgent.options.ca = require('ssl-root-cas/latest').create();
const fetch = require('node-fetch');

const GREEN = [
    0.1823,
    0.4439
];

const RED = [
    0.5904,
    0.3206
];

let lastPrice = 0;

if (process.argv.length < 3) {
    console.error('Error: Missing Philips Hue light id')
    process.exit(1);
}


function update()
{
    fetch('https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD&api_key=' + process.env.API_KEY)
    .then(result => result.json())
    .then(result => {
        console.log(result);
        let currentPrice = result['USD'];
        let newColor = RED;
        if (currentPrice >= lastPrice) {
            newColor = GREEN;
        }
        lastPrice = currentPrice;
        return fetch('http://' + process.env.HUE_BRIDGE_ADDRESS + '/api/' + process.env.HUE_BRIDGE_USER + '/lights/' + process.argv[2] + '/state',
            { method: 'PUT', body: JSON.stringify({ on: true, xy: newColor }), headers: { 'Content-Type': 'application/json' } })
    })
    .then(result => result.json())
    .then(result => console.log(result))
    .catch(error => console.error(error))
}

setInterval(update, 1000);