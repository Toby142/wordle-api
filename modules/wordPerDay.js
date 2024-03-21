const fs = require('fs');
const path = require('path');

function selectWordOfToday() {
    let data = fs.readFileSync(path.join('words.json'), 'utf-8');
    let words = JSON.parse(data);
    const randomWord = words[Math.floor(Math.random() * words.length)];
    return randomWord;
}


function getTimeUntilNextMidnight() {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setHours(24, 0, 0, 0);
    return midnight - now;
}


module.exports = {
    selectWordOfToday,
    getTimeUntilNextMidnight
};
