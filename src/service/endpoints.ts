import type {
  APIBuilderBaseLeague,
  APIBuilderBaseLeagueList,
  APICapitalLeague,
  APICapitalLeagueList,
  APICapitalRaidSeasons,
  APIClan,
  APIClanList,
  APIClanMember,
  APIClanMemberList,
  APIClanSearchParams,
  APIClanWar,
  APIClanWarLeagueGroup,
  APIClanWarLogList,
  APIGoldPassSeason,
  APILabelList,
  APILeague,
  APILeagueList,
  APILeagueSeasonList,
  APILeagueTierList,
  APIPaginationParams,
  APIPlayer,
  APIVerifyTokenRequest,
  APIVerifyTokenResponse,
  APIWarLeague,
  APIWarLeagueList,
} from "@/lib/type";
import api from "@/service/axios";

export const formatTag = (tag: string): string => {
  const cleanTag = tag.trim().toUpperCase();
  return cleanTag.startsWith("#")
    ? encodeURIComponent(cleanTag)
    : encodeURIComponent(`#${cleanTag}`);
};
//CLANS ENDPOINTS (Migrated to ClashKing API: https://api.clashk.ing)
export const clansApi = {
  /**
   * Search all clans by name and/or filtering options
   * GET /v2/clan/search
   */
  searchClans: async (params?: APIClanSearchParams): Promise<APIClanList> => {
    const query = params?.name || "";
    const { data } = await api.get("/v2/clan/search", { params: { query } });
    return {
      items: (data?.items ?? []).map((item: any) => ({
        tag: item.tag,
        name: item.name,
        badgeUrls: {
          small: item.badge,
          medium: item.badge,
          large: item.badge,
        },
        clanLevel: item.clanLevel,
        members: item.members,
        location: item.location,
        warLeague: item.warLeague,
      })),
      paging: {},
    } as unknown as APIClanList;
  },

  /**
   * Get information about a single clan by clan tag
   * GET /v2/clan/{tag}/cached
   */
  getClan: async (clanTag: string): Promise<APIClan> => {
    const response = await api.get(`/v2/clan/${formatTag(clanTag)}/cached`);
    const data = response?.data || {};
    return {
      tag: data.tag || clanTag,
      name: data.name || "",
      description: data.description || "",
      clanLevel: data.clanLevel || 1,
      clanPoints: data.clanPoints || 0,
      members: data.memberCount ?? (data.members?.length || 0),
      badgeUrls: data.badgeUrls || {
        small: "",
        medium: "",
        large: "",
      },
      memberList: (data.members ?? []).map((m: any) => ({
        tag: m.tag,
        name: m.name,
        townHallLevel: m.townHallLevel,
        role: m.role || "member",
        expLevel: m.expLevel || 0,
        trophies: m.trophies || 0,
        clanRank: m.clanRank,
        previousClanRank: m.previousClanRank,
        donations: m.donations || 0,
        donationsReceived: m.donationsReceived || 0,
      })),
      warLeague: data.warLeague,
      capitalLeague: data.capitalLeague,
      warWins: data.warWins,
      warWinStreak: data.warWinStreak,
      location: data.location,
      publicWarLog: data.publicWarLog,
    } as APIClan;
  },

  /**
   * List clan members
   * GET /v2/clan/{tag}/cached
   */
  getClanMembers: async (clanTag: string): Promise<APIClanMemberList> => {
    const { data } = await api.get(`/v2/clan/${formatTag(clanTag)}/cached`);
    const items: APIClanMember[] = (data.members ?? []).map((m: any) => ({
      tag: m.tag,
      name: m.name,
      townHallLevel: m.townHallLevel,
      role: m.role || "member",
      expLevel: m.expLevel || 0,
      trophies: m.trophies || 0,
    }));
    return { items, paging: {} };
  },

  /**
   * Retrieve clan's clan war log
   * GET /v2/clan/{clanTag}/wars
   */
  getClanWarLog: async (
    clanTag: string,
    params?: APIPaginationParams,
  ): Promise<APIClanWarLogList> => {
    const { data } = await api.get(`/v2/clan/${formatTag(clanTag)}/wars`, {
      params,
    });
    return data;
  },

  /**
   * Retrieve information about clan's current or latest clan war
   * GET /v2/clan/{clanTag}/wars
   */
  getCurrentWar: async (clanTag: string): Promise<APIClanWar> => {
    try {
      const { data } = await api.get(`/v2/clan/${formatTag(clanTag)}/wars`);
      const current = data?.items?.[0];
      if (current) {
        return {
          state: current.state || "inWar",
          teamSize: current.teamSize || 15,
          attacksPerMember: current.attacksPerMember || 1,
          battleModifier: current.battleModifier || "none",
          preparationStartTime: current.preparationStartTime,
          startTime: current.startTime || current.warStartTime,
          endTime: current.endTime,
          warTag: current.warTag || current.tag,
          clan: {
            tag: current.clan?.tag || clanTag,
            name: current.clan?.name || "",
            badgeUrls: current.clan?.badgeUrls || {
              small: "",
              medium: "",
              large: "",
            },
            clanLevel: current.clan?.clanLevel || 1,
            attacks: current.clan?.attacks || 0,
            stars: current.clan?.stars || 0,
            destructionPercentage: current.clan?.destructionPercentage || 0,
            members: current.clan?.members || [],
          },
          opponent: {
            tag: current.opponent?.tag || "",
            name: current.opponent?.name || "",
            badgeUrls: current.opponent?.badgeUrls || {
              small: "",
              medium: "",
              large: "",
            },
            clanLevel: current.opponent?.clanLevel || 1,
            attacks: current.opponent?.attacks || 0,
            stars: current.opponent?.stars || 0,
            destructionPercentage: current.opponent?.destructionPercentage || 0,
            members: current.opponent?.members || [],
          },
        } as APIClanWar;
      }
    } catch (e) {
      console.error("Gagal mengambil data war dari ClashKing", e);
    }

    return {
      state: "notInWar",
      teamSize: 0,
      attacksPerMember: 1,
      clan: {
        tag: clanTag,
        name: "",
        badgeUrls: { small: "", large: "", medium: "" },
        clanLevel: 0,
        attacks: 0,
        stars: 0,
        destructionPercentage: 0,
        members: [],
      },
      opponent: {
        tag: "",
        name: "-",
        badgeUrls: { small: "", large: "", medium: "" },
        clanLevel: 0,
        attacks: 0,
        stars: 0,
        destructionPercentage: 0,
        members: [],
      },
    } as APIClanWar;
  },

  /**
   * Retrieve information about clan's current Clan War League group
   * GET /v2/cwl/{tag}/group
   */
  getCurrentWarLeagueGroup: async (
    clanTag: string,
  ): Promise<APIClanWarLeagueGroup> => {
    const { data } = await api.get(`/v2/cwl/${formatTag(clanTag)}/group`);
    return data;
  },

  /**
   * Retrieve clan's capital raid seasons
   * GET /clans/{clanTag}/capitalraidseasons
   */
  getCapitalRaidSeasons: async (
    clanTag: string,
    params?: APIPaginationParams,
  ): Promise<APICapitalRaidSeasons> => {
    const { data } = await api.get<APICapitalRaidSeasons>(
      `/clans/${formatTag(clanTag)}/capitalraidseasons`,
      { params },
    );
    return data;
  },
};

// OFFICIAL SUPERCELL CLANS API (https://api.clashofclans.com/v1)
export const officialClansApi = {
  /**
   * Get information about a single clan from Official Supercell CoC API
   * GET /clans/{clanTag}
   */
  getClan: async (clanTag: string): Promise<APIClan> => {
    try {
      const { data } = await api.get<APIClan>(`/clans/${formatTag(clanTag)}`);
      return data;
    } catch (err) {
      console.warn(
        `[Official CoC API] getClan gagal untuk ${clanTag}, fallback ke ClashKing API.`,
        err,
      );
      return clansApi.getClan(clanTag);
    }
  },

  /**
   * List clan members from Official Supercell CoC API
   * GET /clans/{clanTag}/members
   */
  getClanMembers: async (clanTag: string): Promise<APIClanMemberList> => {
    try {
      const { data } = await api.get<APIClanMemberList>(
        `/clans/${formatTag(clanTag)}/members`,
      );
      return data;
    } catch (err) {
      console.warn(
        `[Official CoC API] getClanMembers gagal untuk ${clanTag}, fallback ke ClashKing API.`,
        err,
      );
      return clansApi.getClanMembers(clanTag);
    }
  },

  /**
   * Retrieve information about clan's current clan war from Official Supercell CoC API
   * GET /clans/{clanTag}/currentwar
   */
  getCurrentWar: async (clanTag: string): Promise<APIClanWar> => {
    try {
      const { data } = await api.get<APIClanWar>(
        `/clans/${formatTag(clanTag)}/currentwar`,
      );
      return data;
    } catch (err) {
      console.warn(
        `[Official CoC API] getCurrentWar gagal untuk ${clanTag}, fallback ke ClashKing API.`,
        err,
      );
      return clansApi.getCurrentWar(clanTag);
    }
  },
};
// 2. CLAN WAR LEAGUES ENDPOINTS
export const clanWarLeaguesApi = {
  /**
   * Retrieve information about an individual Clan War League war
   * GET /clanwarleagues/wars/{warTag}
   */
  getWar: async (warTag: string): Promise<APIClanWar> => {
    const { data } = await api.get<APIClanWar>(
      `/clanwarleagues/wars/${formatTag(warTag)}`,
    );
    return data;
  },
};

//PLAYERS ENDPOINTS
export const playersApi = {
  /**
   * Get information about a single player by player tag
   * GET /players/{playerTag}
   */
  getPlayer: async (playerTag: string): Promise<APIPlayer> => {
    const { data } = await api.get<APIPlayer>(
      `/players/${formatTag(playerTag)}`,
    );
    return data;
  },

  /**
   * Verify a player's API token
   * POST /players/{playerTag}/verifytoken
   */
  verifyPlayerToken: async (
    playerTag: string,
    body: APIVerifyTokenRequest,
  ): Promise<APIVerifyTokenResponse> => {
    const { data } = await api.post<APIVerifyTokenResponse>(
      `/players/${formatTag(playerTag)}/verifytoken`,
      body,
    );
    return data;
  },

  /**
   * Get player's current legend league season stats
   * GET /v2/player/{playerTag}/legend/season
   */
  getLegendSeason: async (playerTag: string): Promise<any> => {
    const { data } = await api.get(
      `/v2/player/${formatTag(playerTag)}/legend/season`,
    );
    return data;
  },
};

// 4. LEAGUES ENDPOINTS

export const leaguesApi = {
  /**
   * Get list of leagues
   * GET /leagues
   */
  getLeagues: async (params?: APIPaginationParams): Promise<APILeagueList> => {
    const { data } = await api.get<APILeagueList>("/leagues", { params });
    return data;
  },

  /**
   * Get league information
   * GET /leagues/{leagueId}
   */
  getLeague: async (leagueId: number | string): Promise<APILeague> => {
    const { data } = await api.get<APILeague>(`/leagues/${leagueId}`);
    return data;
  },

  /**
   * Get league seasons (Contoh: Legend League Seasons)
   * GET /leagues/{leagueId}/seasons
   */
  getLeagueSeasons: async (
    leagueId: number | string,
    params?: APIPaginationParams,
  ): Promise<APILeagueSeasonList> => {
    const { data } = await api.get<APILeagueSeasonList>(
      `/leagues/${leagueId}/seasons`,
      { params },
    );
    return data;
  },

  /**
   * Get specific season ranking for a league
   * GET /leagues/{leagueId}/seasons/{seasonId}
   */
  getLeagueSeasonRanking: async (
    leagueId: number | string,
    seasonId: string,
    params?: APIPaginationParams,
  ): Promise<any> => {
    // Note: Ganti 'any' dengan tipe interface yang sesuai (misal: APILeagueSeasonRanking)
    const { data } = await api.get(`/leagues/${leagueId}/seasons/${seasonId}`, {
      params,
    });
    return data;
  },

  /**
   * Get Ranked Battle League Group (Endpoint yang kita bahas)
   * GET /leaguegroup/{leagueGroupTag}/{leagueSeasonId}
   */
  getLeagueGroupPlayerStats: async (
    leagueGroupTag: string,
    leagueSeasonId: number | string,
    params?: { playerTag?: string } & APIPaginationParams,
  ): Promise<any> => {
    // Note: Ganti 'any' dengan tipe interface responsmu
    const { data } = await api.get(
      `/leaguegroup/${formatTag(leagueGroupTag)}/${leagueSeasonId}`,
      { params },
    );
    return data;
  },

  /**
   * Get list of league tiers
   * GET /leaguetiers
   */
  getLeagueTiers: async (
    params?: APIPaginationParams,
  ): Promise<APILeagueTierList> => {
    const { data } = await api.get<APILeagueTierList>("/leaguetiers", {
      params,
    });
    return data;
  },

  /**
   * Get list of war leagues
   * GET /warleagues
   */
  getWarLeagues: async (
    params?: APIPaginationParams,
  ): Promise<APIWarLeagueList> => {
    const { data } = await api.get<APIWarLeagueList>("/warleagues", { params });
    return data;
  },

  /**
   * Get war league information
   * GET /warleagues/{leagueId}
   */
  getWarLeague: async (leagueId: number | string): Promise<APIWarLeague> => {
    const { data } = await api.get<APIWarLeague>(`/warleagues/${leagueId}`);
    return data;
  },

  /**
   * Get list of capital leagues
   * GET /capitalleagues
   */
  getCapitalLeagues: async (
    params?: APIPaginationParams,
  ): Promise<APICapitalLeagueList> => {
    const { data } = await api.get<APICapitalLeagueList>("/capitalleagues", {
      params,
    });
    return data;
  },

  /**
   * Get capital league information
   * GET /capitalleagues/{leagueId}
   */
  getCapitalLeague: async (
    leagueId: number | string,
  ): Promise<APICapitalLeague> => {
    const { data } = await api.get<APICapitalLeague>(
      `/capitalleagues/${leagueId}`,
    );
    return data;
  },

  /**
   * Get list of Builder Base leagues
   * GET /builderbaseleagues
   */
  getBuilderBaseLeagues: async (
    params?: APIPaginationParams,
  ): Promise<APIBuilderBaseLeagueList> => {
    const { data } = await api.get<APIBuilderBaseLeagueList>(
      "/builderbaseleagues",
      { params },
    );
    return data;
  },

  /**
   * Get Builder Base league information
   * GET /builderbaseleagues/{leagueId}
   */
  getBuilderBaseLeague: async (
    leagueId: number | string,
  ): Promise<APIBuilderBaseLeague> => {
    const { data } = await api.get<APIBuilderBaseLeague>(
      `/builderbaseleagues/${leagueId}`,
    );
    return data;
  },
};

//LABELS ENDPOINTS

export const labelsApi = {
  /**
   * List clan labels
   * GET /labels/clans
   */
  getClanLabels: async (
    params?: APIPaginationParams,
  ): Promise<APILabelList> => {
    const { data } = await api.get<APILabelList>("/labels/clans", { params });
    return data;
  },

  /**
   * List player labels
   * GET /labels/players
   */
  getPlayerLabels: async (
    params?: APIPaginationParams,
  ): Promise<APILabelList> => {
    const { data } = await api.get<APILabelList>("/labels/players", { params });
    return data;
  },
};
