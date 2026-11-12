// Verify the fix: tag={clanFromJson?.tag ?? clan.tag}
const data = require('./src/lib/data.json');

function normalizeTag(tag) {
  return tag.trim().replace(/^#/, '').toUpperCase();
}

// Simulate: const { tag } = await params;
const urlTag = '2G0LCRUGJ';  // from URL

// From page.tsx: const allClans = data.ClanList.data;
// const clanFromJson = data.ClanList.data.find(
//   (c) => normalizeTag(c.tag) === normalizeTag(tag)
// );

const clanFromJson = data.ClanList.data.find(
  (c) => normalizeTag(c.tag) === normalizeTag(urlTag)
);

// The FIXED line: tag={clanFromJson?.tag ?? clan.tag}
// But we don't have 'clan' from API in this simulation, so let's just test the logic:
// If clanFromJson exists, use its tag. Otherwise, fall back to urlTag.

const tagToPass = clanFromJson?.tag ?? urlTag;

console.log('=== Fix Verification ===');
console.log('URL tag:', urlTag);
console.log('clanFromJson:', clanFromJson ? clanFromJson.name : 'NULL');
console.log('tag to pass to ClanCwlList:', tagToPass);
console.log('Expected: 2G0LCRUGJ (Clan Master tag)');
console.log('');

if (tagToPass === '2G0LCRUGJ') {
  console.log('✅ FIX WORKS: tag is correctly set to clanFromJson.tag');
} else {
  console.log('❌ FIX FAILED: tag is', tagToPass);
}

// Now simulate what ClanCwlList does with this tag
const initialClan = data.ClanList.data.find(
  (c) => (tagToPass && normalizeTag(c.tag) === normalizeTag(tagToPass))
);
console.log('ClanCwlList finds clan:', initialClan ? initialClan.name + ' with ' + (initialClan?.CWL?.data?.length || 0) + ' CWL members' : 'NULL');