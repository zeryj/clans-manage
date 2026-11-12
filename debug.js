const data = require('./src/lib/data.json');
const tag = '2G0LCRUGJ';
const normalizedInput = tag.trim().replace(/^#/, '').toUpperCase();
console.log('Input tag:', tag);
console.log('Normalized:', normalizedInput);

const found = data.ClanList.data.find(c => c.tag === tag || c.tag === normalizedInput);
console.log('Found clan:', found ? found.name : 'NOT FOUND');

console.log('\nAll tags in data.json:');
data.ClanList.data.forEach(c => console.log(' -', c.tag, '|', c.name));