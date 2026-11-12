// Final debug - check actual runtime behavior
// This simulates what React would do on the page

const data = require('./src/lib/data.json');

function normalizeTag(tag) {
  return tag.trim().replace(/^#/, '').toUpperCase();
}

// Get tag from URL - simulate different scenarios
const scenarios = [
  '2G0LCRUGJ',     // without hash
  '#2G0LCRUGJ',    // with hash
  '2c990vr8g',     // lowercase
];

scenarios.forEach(urlTag => {
  console.log('\n=== Scenario:', urlTag, '===');
  
  // This is what page.tsx does: const { tag } = await params;
  const tag = urlTag;
  
  // Line 19-24: filter other clans
  const allClans = data.ClanList.data;
  const otherClans = allClans.filter(
    (c) => normalizeTag(c.tag) !== normalizeTag(tag)
  );
  
  // Line 26-28: find clan from json
  const clanFromJson = data.ClanList.data.find(
    (c) => normalizeTag(c.tag) === normalizeTag(tag)
  );
  
  console.log('allClans count:', allClans.length);
  console.log('otherClans count:', otherClans.length);
  console.log('clanFromJson:', clanFromJson ? clanFromJson.name + ' (tag: ' + clanFromJson.tag + ')' : 'NULL');
  
  // Line 30-46: get clan from API (simulated - we just use clanFromJson)
  // In reality: const clan = await clansApi.getClan(tag);
  
  // Line 191 (my fix): <ClanCwlList tag={clanFromJson?.tag ?? clan.tag} name={clan.name} />
  const tagToPass = clanFromJson?.tag || tag;
  console.log('tag to pass to ClanCwlList:', JSON.stringify(tagToPass));
  
  // What ClanCwlList does internally
  const initialClan = data.ClanList.data.find(
    (c) => (tagToPass && normalizeTag(c.tag) === normalizeTag(tagToPass))
  );
  console.log('ClanCwlList finds:', initialClan ? initialClan.name + ' CWL.data=' + initialClan.CWL.data.length + ' items' : 'NULL');
  
  // Members count
  const membersCount = initialClan?.CWL?.data ? initialClan.CWL.data.length : 0;
  console.log('CWL members count:', membersCount);
});