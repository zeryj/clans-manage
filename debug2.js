const data = require('./src/lib/data.json');

// Simulate what happens in page.tsx
function normalizeTag(tag) {
  return tag.trim().replace(/^#/, '').toUpperCase();
}

// This is what would come from URL params - could have # or not
const urlTag = '2G0LCRUGJ';  // or '#2G0LCRUGJ'
const apiTag = '2G0LCRUGJ';  // from API response

console.log('URL tag:', JSON.stringify(urlTag));
console.log('API tag:', JSON.stringify(apiTag));
console.log('Normalized URL:', normalizeTag(urlTag));
console.log('Normalized API:', normalizeTag(apiTag));

// Find clan from json
const clanFromJson = data.ClanList.data.find(
  (c) => normalizeTag(c.tag) === normalizeTag(urlTag)
);
console.log('Clan from JSON found:', clanFromJson ? clanFromJson.name : 'NULL');

// Now check ClanCwlList logic
const initialClan = data.ClanList.data.find(
  (c) =>
    (urlTag && normalizeTag(c.tag) === normalizeTag(urlTag))
);
console.log('ClanCwlList initialClan:', initialClan ? initialClan.name : 'NULL');
console.log('initialMembers count:', (initialClan?.CWL?.data).length || 0);