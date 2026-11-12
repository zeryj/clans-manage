/**
 * Clash of Clans API TypeScript Definitions
 * Based on official documentation: https://developer.clashofclans.com/#/documentation
 */

// ==========================================
// COMMON / SHARED MODELS
// ==========================================

export interface APICursors {
  after?: string;
  before?: string;
}

export interface APIPaging {
  cursors?: APICursors;
}

export interface APIIcon {
  small: string;
  /** Tiny Icon is not available for Labels */
  tiny?: string;
  /** Medium Icon is not available for Unranked Icon */
  medium?: string;
}

export interface APILeagueTierIcon {
  small: string;
  large: string;
}

export interface APIBadge {
  small: string;
  large: string;
  medium: string;
}

export interface APISeason {
  id: string;
  rank: number;
  trophies: number;
}

export interface APIClientError {
  reason: string;
  message?: string;
  type?: string;
  detail?: Record<string, unknown>;
}

// ==========================================
// CLANS
// ==========================================

export type APIClanType = "open" | "inviteOnly" | "closed";
export type APIWarFrequency =
  | "always"
  | "moreThanOncePerWeek"
  | "oncePerWeek"
  | "lessThanOncePerWeek"
  | "never"
  | "unknown";
export type APIClanRole = "member" | "admin" | "coLeader" | "leader";

export interface APIChatLanguage {
  name: string;
  id: number;
  languageCode: string;
}

export interface APIPlayerHouseElement {
  type: string;
  id: number;
}

export interface APIPlayerHouse {
  elements: APIPlayerHouseElement[];
}

export interface APIClanCapitalDistrict {
  id: number;
  name: string;
  districtHallLevel: number;
}

export interface APIClanCapital {
  capitalHallLevel?: number;
  districts?: APIClanCapitalDistrict[];
}

export interface APIClanMember {
  name: string;
  tag: string;
  role?: APIClanRole;
  expLevel?: number;
  townHallLevel: number;
  leagueTier: APILeagueTier;
  league?: APILeague;
  builderBaseLeague?: Omit<APILeagueTier, "iconUrls">;
  trophies: number;
  builderBaseTrophies?: number;
  clanRank?: number;
  previousClanRank?: number;
  donations?: number;
  donationsReceived?: number;
  playerHouse?: APIPlayerHouse;
  clanName?: string;
}

export interface APIClan {
  tag: string;
  name: string;
  type?: APIClanType;
  description?: string;
  badgeUrls: APIBadge;
  clanLevel: number;
  clanPoints?: number;
  clanBuilderBasePoints?: number;
  clanCapitalPoints?: number;
  capitalGoldTotal?: number;
  warWinStreak?: number;
  warWins?: number;
  warTies?: number;
  warLosses?: number;
  isWarLogPublic?: boolean;
  publicWarLog?: boolean;
  warLeague?: APIWarLeague;
  capitalLeague?: APICapitalLeague;
  members: number;
  memberCount?: number;
  labels?: APILabel[];
  memberList?: APIClanMember[];
  clanCapital?: APIClanCapital;
  location?: APILocation;
}

export interface APIClanList {
  items: Omit<APIClan, "memberList" | "clanCapital">[];
  paging?: APIPaging;
}

/** Response from GET /clans/{clanTag}/members */
export interface APIClanMemberList {
  items: APIClanMember[];
  paging?: APIPaging;
}

// ==========================================
// CLAN WARS & CWL
// ==========================================

export type APIWarState = "notInWar" | "preparation" | "inWar" | "warEnded";
export type APIBattleModifier = "none" | "hardMode";

export interface APIClanWarAttack {
  order: number;
  attackerTag: string;
  defenderTag: string;
  stars: number;
  duration: number;
  destructionPercentage: number;
}

export interface APIClanWarMember {
  tag: string;
  name: string;
  mapPosition?: number;
  townhallLevel?: number;
  opponentAttacks?: number;
  bestOpponentAttack?: APIClanWarAttack;
  attacks?: APIClanWarAttack[];
}

export interface APIWarClan {
  tag: string;
  name: string;
  badgeUrls: APIBadge;
  clanLevel: number;
  attacks?: number;
  stars?: number;
  destructionPercentage?: number;
  members?: APIClanWarMember[];
}

export interface APIClanWar {
  state: APIWarState;
  teamSize: number;
  startTime?: string;
  preparationStartTime?: string;
  battleModifier?: APIBattleModifier | string;
  endTime?: string;
  clan: APIWarClan;
  opponent: APIWarClan;
  /** Not available or 1 in CWL */
  attacksPerMember?: number;
  warTag?: string;
}

export interface APIWarLogClan {
  tag?: string;
  name?: string;
  badgeUrls: APIBadge;
  clanLevel: number;
  attacks?: number;
  stars: number;
  destructionPercentage: number;
  expEarned?: number;
}

export interface APIClanWarLog {
  result?: "win" | "lose" | "tie" | null;
  endTime: string;
  battleModifier?: APIBattleModifier;
  teamSize: number;
  attacksPerMember?: number;
  clan: APIWarLogClan;
  opponent: APIWarLogClan;
}

/** Response from GET /clans/{clanTag}/warlog */
export interface APIClanWarLogList {
  items: APIClanWarLog[];
  paging: APIPaging;
}

export interface APIClanWarLeagueClanMember {
  name: string;
  tag: string;
  townHallLevel: number;
}

export interface APIClanWarLeagueClan {
  name: string;
  tag: string;
  clanLevel: number;
  badgeUrls: APIBadge;
  members: APIClanWarLeagueClanMember[];
}

export interface APIClanWarLeagueRound {
  warTags: string[];
}

/** Response from GET /clans/{clanTag}/currentwar/leaguegroup */
export interface APIClanWarLeagueGroup {
  state: "notInWar" | "preparation" | "inWar" | "ended";
  season: string;
  clans: APIClanWarLeagueClan[];
  rounds: APIClanWarLeagueRound[];
}

// ==========================================
// CLAN CAPITAL RAIDS
// ==========================================

export interface APICapitalRaidSeasonDistrict {
  id: number;
  name: string;
  districtHallLevel: number;
  destructionPercent: number;
  attackCount: number;
  totalLooted: number;
}

export interface APICapitalRaidSeasonClan {
  tag: string;
  name: string;
  level: number;
  badgeUrls: APIBadge;
}

export interface APICapitalRaidSeasonAttackLog {
  defender: APICapitalRaidSeasonClan;
  attackCount: number;
  districtCount: number;
  districtsDestroyed: number;
  districts: APICapitalRaidSeasonDistrict[];
}

export interface APICapitalRaidSeasonDefenseLog {
  attacker: APICapitalRaidSeasonClan;
  attackCount: number;
  districtCount: number;
  districtsDestroyed: number;
  districts: APICapitalRaidSeasonDistrict[];
}

export interface APICapitalRaidSeasonMember {
  tag: string;
  name: string;
  attacks: number;
  attackLimit: number;
  bonusAttackLimit: number;
  capitalResourcesLooted: number;
}

export interface APICapitalRaidSeason {
  state: "ongoing" | "ended";
  startTime: string;
  endTime: string;
  capitalTotalLoot: number;
  raidsCompleted: number;
  totalAttacks: number;
  enemyDistrictsDestroyed: number;
  offensiveReward: number;
  defensiveReward: number;
  members?: APICapitalRaidSeasonMember[];
  attackLog: APICapitalRaidSeasonAttackLog[];
  defenseLog: APICapitalRaidSeasonDefenseLog[];
}

/** Response from GET /clans/{clanTag}/capitalraidseasons */
export interface APICapitalRaidSeasons {
  items: APICapitalRaidSeason[];
  paging: APIPaging;
}

// ==========================================
// PLAYERS
// ==========================================

export interface APIPlayerItem {
  name: string;
  level: number;
  maxLevel: number;
  superTroopIsActive?: boolean;
  equipment?: APIPlayerItem[];
  village: "home" | "builderBase";
}

export interface APIPlayerAchievement {
  name: string;
  stars: number;
  value: number;
  target: number;
  info: string;
  completionInfo: string | null;
  village: "home" | "builderBase";
}

export interface APIPlayerClan {
  tag: string;
  name: string;
  clanLevel: number;
  badgeUrls: APIBadge;
}

export interface APILegendStatistics {
  previousSeason?: APISeason;
  previousBuilderBaseSeason?: APISeason;
  bestBuilderBaseSeason?: APISeason;
  currentSeason?: APISeason;
  bestSeason?: APISeason;
  legendTrophies: number;
}

export interface APILootEntry {
  name: string;
  amount: number;
}

export interface APIBattleLogEntry {
  battleType: "legend" | "homeVillage" | "ranked";
  attack: boolean;
  armyShareCode: string;
  opponentPlayerTag: string;
  stars: number;
  destructionPercentage: number;
  lootedResources: APILootEntry[];
  extraLootedResources: APILootEntry[];
  availableLoot: APILootEntry[];
}

export interface APIBattleLogEntryList {
  items: APIBattleLogEntry[];
}

/** Response from GET /players/{playerTag} */
export interface APIPlayer {
  name: string;
  tag: string;
  townHallLevel: number;
  townHallWeaponLevel?: number;
  expLevel: number;
  trophies: number;
  bestTrophies: number;
  warStars: number;
  attackWins: number;
  defenseWins: number;
  builderHallLevel?: number;
  builderBaseTrophies?: number;
  bestBuilderBaseTrophies?: number;
  donations: number;
  donationsReceived: number;
  clanCapitalContributions: number;
  role?: APIClanRole;
  warPreference?: "in" | "out";
  clan?: APIPlayerClan;
  leagueTier?: APILeagueTier;
  league?: APILeague;
  builderBaseLeague?: {
    id: number;
    name: string;
  };
  currentLeagueGroupTag?: string;
  currentLeagueSeasonId?: number;
  previousLeagueGroupTag?: string;
  previousLeagueSeasonId?: number;
  legendStatistics?: APILegendStatistics;
  achievements: APIPlayerAchievement[];
  troops: APIPlayerItem[];
  heroes: APIPlayerItem[];
  spells: APIPlayerItem[];
  heroEquipment?: APIPlayerItem[];
  labels: APILabel[];
  playerHouse?: APIPlayerHouse;
}

/** Response from POST /players/{playerTag}/verifytoken */
export interface APIVerifyTokenRequest {
  token: string;
}

export interface APIVerifyTokenResponse {
  tag: string;
  token: string;
  status: "ok" | "invalid";
}

// ==========================================
// LEAGUES
// ==========================================

export interface APILeague {
  id: number;
  name: string;
  iconUrls: APIIcon;
}

export interface APILeagueList {
  items: APILeague[];
  paging: APIPaging;
}

export interface APILeagueTier {
  id: number;
  name: string;
  iconUrls: APILeagueTierIcon;
}

export interface APILeagueTierList {
  items: APILeagueTier[];
  paging: APIPaging;
}

export interface APIWarLeague {
  id: number;
  name: string;
}

export interface APIWarLeagueList {
  items: APIWarLeague[];
  paging: APIPaging;
}

export interface APICapitalLeague {
  id: number;
  name: string;
}

export interface APICapitalLeagueList {
  items: APICapitalLeague[];
  paging: APIPaging;
}

export interface APIBuilderBaseLeague {
  id: number;
  name: string;
}

export interface APIBuilderBaseLeagueList {
  items: APIBuilderBaseLeague[];
  paging: APIPaging;
}

export interface APILeagueSeasonList {
  items: {
    id: string;
  }[];
  paging: APIPaging;
}

export interface APILeagueSeasonResult {
  leagueSeasonId: number;
  leagueTrophies: number;
  leagueTierId: number;
  placement: number;
  attackWins: number;
  attackLosses: number;
  attackStars: number;
  defenseWins: number;
  defenseLosses: number;
  defenseStars: number;
  maxBattles: number;
}

export interface APILeagueSeasonResultList {
  items: APILeagueSeasonResult[];
}

export interface APILeagueGroupMember {
  playerTag: string;
  playerName: string;
  clanTag: string;
  clanName: string;
  leagueTrophies: number;
  attackWinCount: number;
  attackLoseCount: number;
  defenseWinCount: number;
  defenseLoseCount: number;
}

export interface APILeagueGroupLog {
  opponentPlayerTag: string;
  opponentName: string;
  stars: number;
  destructionPercentage: number;
  trophies: number;
  creationTime: string;
}

export interface APILeagueGroupList {
  members: APILeagueGroupMember[];
  attackLogs: APILeagueGroupLog[];
  defenseLogs: APILeagueGroupLog[];
}

// ==========================================
// LOCATIONS & RANKINGS
// ==========================================

export interface APILocation {
  localizedName?: string;
  id: number;
  name: string;
  isCountry: boolean;
  countryCode?: string;
}

export interface APILocationList {
  items: APILocation[];
  paging: APIPaging;
}

export interface APIClanRanking {
  clanLevel: number;
  clanPoints: number;
  location: APILocation;
  members: number;
  tag: string;
  name: string;
  rank: number;
  previousRank: number;
  badgeUrls: APIBadge;
}

export interface APIClanRankingList {
  items: APIClanRanking[];
  paging: APIPaging;
}

export interface APIPlayerRanking {
  tag: string;
  name: string;
  expLevel: number;
  trophies: number;
  attackWins: number;
  defenseWins: number;
  rank: number;
  previousRank: number;
  clan?: Omit<APIPlayerClan, "clanLevel">;
  leagueTier?: APILeagueTier;
  league?: APILeague;
}

export interface APIPlayerRankingList {
  items: APIPlayerRanking[];
  paging: APIPaging;
}

export interface APIClanBuilderBaseRanking {
  clanLevel: number;
  location: APILocation;
  members: number;
  tag: string;
  name: string;
  rank: number;
  previousRank: number;
  badgeUrls: APIBadge;
  clanBuilderBasePoints: number;
}

export interface APIClanBuilderBaseRankingList {
  items: APIClanBuilderBaseRanking[];
  paging: APIPaging;
}

export interface APIPlayerBuilderBaseRanking {
  tag: string;
  name: string;
  expLevel: number;
  builderBaseTrophies: number;
  rank: number;
  previousRank: number;
  clan?: APIPlayerClan;
  builderBaseLeague?: {
    id: number;
    name: string;
  };
}

export interface APIPlayerBuilderBaseRankingList {
  items: APIPlayerBuilderBaseRanking[];
  paging: APIPaging;
}

export interface APIClanCapitalRanking {
  clanLevel: number;
  clanPoints: number;
  location: APILocation;
  members: number;
  tag: string;
  name: string;
  rank: number;
  previousRank: number;
  badgeUrls: APIBadge;
  clanCapitalPoints: number;
}

export interface APIClanCapitalRankingList {
  items: APIClanCapitalRanking[];
  paging: APIPaging;
}

export interface APIPlayerSeasonRankingList {
  items: Omit<APIPlayerRanking, "leagueTier" | "league">[];
  paging: APIPaging;
}

// ==========================================
// LABELS
// ==========================================

export interface APILabel {
  id: number;
  name: string;
  iconUrls: APIIcon;
}

export interface APILabelList {
  items: APILabel[];
  paging: APIPaging;
}

// ==========================================
// GOLD PASS
// ==========================================

export interface APIGoldPassSeason {
  startTime: string;
  endTime: string;
}

// ==========================================
// QUERY PARAMETERS INTERFACES
// ==========================================

export interface APIPaginationParams {
  limit?: number;
  after?: string;
  before?: string;
}

export interface APIClanSearchParams extends APIPaginationParams {
  name?: string;
  warFrequency?: APIWarFrequency;
  locationId?: number;
  minMembers?: number;
  maxMembers?: number;
  minClanPoints?: number;
  minClanLevel?: number;
  labelIds?: string;
}

// ==========================================
// LOCAL DATA (data.json) INTERFACES
// ==========================================

export interface LocalClanItem {
  id: number;
  name: string;
  tag: string;
  logo: string;
  CWL: {
    data: (APIClanMember | Record<string, any>)[];
  };
}

export interface LocalDataJson {
  ClanList: {
    data: LocalClanItem[];
  };
}

export const normalizeTag = (tag: string): string =>
  tag.trim().replace(/^#/, "").toUpperCase();

// ==========================================
// CLASHKING API MODELS (api.clashk.ing)
// ==========================================

export interface ClashKingMemberItem {
  tag: string;
  name: string;
  townHallLevel: number;
}

export interface ClashKingClanCached {
  name: string;
  tag: string;
  badgeUrls: APIBadge;
  description: string;
  clanLevel: number;
  clanPoints: number;
  capitalGoldTotal?: number;
  location?: APILocation;
  warLeague?: APIWarLeague;
  capitalLeague?: APICapitalLeague;
  publicWarLog?: boolean;
  warWins?: number;
  warWinStreak?: number;
  memberCount?: number;
  troopsDonated?: number;
  troopsReceived?: number;
  lastActive?: string;
  members: ClashKingMemberItem[];
}

export interface ClashKingWarItem {
  state: APIWarState;
  teamSize: number;
  battleModifier?: string;
  preparationStartTime?: string;
  startTime?: string;
  endTime?: string;
  warStartTime?: string;
  tag?: string;
  warTag?: string;
  attacksPerMember?: number;
  clan: APIWarClan;
  opponent: APIWarClan;
}

export interface ClashKingWarResponse {
  items: ClashKingWarItem[];
}

// ==========================================
// LEGEND LEADERBOARD & STATS INTERFACES
// ==========================================

export interface PlayerLegendSeasonOffenseDefenseStars {
  zero: number;
  one: number;
  two: number;
  three: number;
}

export interface PlayerLegendSeasonStats {
  attacks?: number | null;
  defenses?: number | null;
  attackTriples?: number | null;
  defenseTriples?: number | null;
  averageOffense?: number | null;
  averageDefense?: number | null;
  offenseStars?: PlayerLegendSeasonOffenseDefenseStars | null;
  defenseStars?: PlayerLegendSeasonOffenseDefenseStars | null;
}

export interface PlayerLegendFavorite {
  category: string;
  id: number;
  name: string;
  attacks: number;
}

export interface PlayerLegendFavoriteTroop {
  id: number;
  name: string;
  attacks: number;
  triples: number;
}

export interface PlayerLegendArmyGroup {
  name: string;
  attacks: number;
  triples: number;
}

export interface PlayerLegendSeasonResponse {
  seasonStart?: string;
  seasonEnd?: string;
  rankPopulation?: number;
  stats?: PlayerLegendSeasonStats;
  favorites?: PlayerLegendFavorite[];
  favoriteTroops?: PlayerLegendFavoriteTroop[];
  armyGroups?: PlayerLegendArmyGroup[];
}

export interface LegendLeaderboardMember extends APIClanMember {
  clanTag?: string;
  rankPosition?: number;
  legendStats?: PlayerLegendSeasonStats | null;
  legendDetails?: PlayerLegendSeasonResponse | null;
  isLoadingStats?: boolean;
}
