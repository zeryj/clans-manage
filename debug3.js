// Simulate the exact flow in page.tsx
const data = require('./src/lib/data.json');

// This is what URL params would give us - try both with and without #
const urlTag = '2G0LCRUGJ';  // typical URL param
// const urlTag = '#2G0LCRUGJ';  // with hash

function normalizeTag(tag) {
  return tag.trim().replace(/^#/, '').toUpperCase();
}

// This is from page.tsx line 16: const { tag } = await params;
console.log('=== Simulating page.tsx tag receipt ===');
console.log('URL param tag:', JSON.stringify(urlTag));
console.log('Normalized:', normalizeTag(urlTag));

// Line 26-28: find clan from json
const clanFromJson = data.ClanList.data.find(
  (c) => normalizeTag(c.tag) === normalizeTag(urlTag)
);
console.log('clanFromJson found:', clanFromJson ? clanFromJson.name : 'NULL');

// Line 191 (my fix): tag={clanFromJson?.tag ?? clan.tag}
const tagToPass = clanFromJson?.tag ?? urlTag;
console.log('tag to pass to ClanCwlList:', JSON.stringify(tagToPass));
console.log('tag normalized:', normalizeTag(tagToPass));

// Now simulate what ClanCwlList does with that tag
const initialClanInCwlList = data.ClanList.data.find(
  (c) => (tagToPass && normalizeTag(c.tag) === normalizeTag(tagToPass))
);
console.log('ClanCwlList initialClan:', initialClanInCwlList ? initialClanInCwlList.name : 'NULL');
console.log('CWL data length:', (initialClanInCwlList?.CWL?.data || []).length);
console.log('CWL data sample:', (initialClanInCwlList?.CWL?.data || []).slice(0, 3).map(m => ({name: m.name, tag: m.tag})));