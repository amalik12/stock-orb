require('dotenv').config();
require('https').globalAgent.options.ca = require('ssl-root-cas/latest').create();
const fetch = require('node-fetch');
const readline = require('readline');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const GREEN = [
    0.1823,
    0.4439
];

const RED = [
    0.5904,
    0.3206
];

let lastPrice = 0;
let lightId = -1;

process.on('SIGINT', () => {
    console.log('Exiting...');
    fetch('http://' + process.env.HUE_BRIDGE_ADDRESS + '/api/' + process.env.HUE_BRIDGE_USER + '/lights/' + lightId + '/state',
        { method: 'PUT', body: JSON.stringify({ on: false }), headers: { 'Content-Type': 'application/json' } })
        .then((result) => process.exit(2))
        .catch(error => process.exit(2))
});

fetch('http://' + process.env.HUE_BRIDGE_ADDRESS + '/api/' + process.env.HUE_BRIDGE_USER + '/lights/' )
.then(result => result.json())
.then(result => {
    let question = 'Select a Philips Hue light:\n'
    for (const key in result) {
        if (result.hasOwnProperty(key)) {
            question += key + ': ' + result[key]['name'] + '\n';
        }
    }
    
    rl.question(question, (answer) => {
        lightId = parseInt(answer);
        setInterval(update, 1000);
        rl.close();
    });
})

function update()
{
    fetch('https://min-api.cryptocompare.com/data/price?fsym=BTC&tsyms=USD')
    .then(result => result.json())
    .then(result => {
        console.log(result);
        let currentPrice = result['USD'];
        let newColor = RED;
        if (currentPrice >= lastPrice) {
            newColor = GREEN;
        }
        lastPrice = currentPrice;
        return fetch('http://' + process.env.HUE_BRIDGE_ADDRESS + '/api/' + process.env.HUE_BRIDGE_USER + '/lights/' + lightId + '/state',
            { method: 'PUT', body: JSON.stringify({ on: true, xy: newColor }), headers: { 'Content-Type': 'application/json' } })
    })
    .then(result => result.json())
    .then(result => console.log(result))
    .catch(error => console.error(error))
}