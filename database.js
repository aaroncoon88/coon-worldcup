const Database = require('better-sqlite3');
const db = new Database('./worldcup.db');

const TEAMS = [
  // Group A
  { code: 'MEX', name: 'Mexico',               flag: '🇲🇽', group: 'A', rank: 15, apiNames: ['Mexico'] },
  { code: 'RSA', name: 'South Africa',          flag: '🇿🇦', group: 'A', rank: 61, apiNames: ['South Africa'] },
  { code: 'KOR', name: 'South Korea',           flag: '🇰🇷', group: 'A', rank: 22, apiNames: ['South Korea', 'Korea Republic', 'Korea, Republic of'] },
  { code: 'CZE', name: 'Czechia',               flag: '🇨🇿', group: 'A', rank: 45, apiNames: ['Czechia', 'Czech Republic'] },
  // Group B
  { code: 'CAN', name: 'Canada',                flag: '🇨🇦', group: 'B', rank: 27, apiNames: ['Canada'] },
  { code: 'BIH', name: 'Bosnia & Herz.',        flag: '🇧🇦', group: 'B', rank: 74, apiNames: ['Bosnia-Herzegovina', 'Bosnia and Herzegovina'] },
  { code: 'QAT', name: 'Qatar',                 flag: '🇶🇦', group: 'B', rank: 51, apiNames: ['Qatar'] },
  { code: 'SUI', name: 'Switzerland',           flag: '🇨🇭', group: 'B', rank: 17, apiNames: ['Switzerland'] },
  // Group C
  { code: 'BRA', name: 'Brazil',                flag: '🇧🇷', group: 'C', rank:  5, apiNames: ['Brazil'] },
  { code: 'MAR', name: 'Morocco',               flag: '🇲🇦', group: 'C', rank: 11, apiNames: ['Morocco'] },
  { code: 'HAI', name: 'Haiti',                 flag: '🇭🇹', group: 'C', rank: 84, apiNames: ['Haiti'] },
  { code: 'SCO', name: 'Scotland',              flag: '🏴󠁧󠁢󠁳󠁣󠁴󠁿', group: 'C', rank: 36, apiNames: ['Scotland'] },
  // Group D
  { code: 'USA', name: 'United States',         flag: '🇺🇸', group: 'D', rank: 14, apiNames: ['United States', 'USA'] },
  { code: 'PAR', name: 'Paraguay',              flag: '🇵🇾', group: 'D', rank: 39, apiNames: ['Paraguay'] },
  { code: 'AUS', name: 'Australia',             flag: '🇦🇺', group: 'D', rank: 26, apiNames: ['Australia'] },
  { code: 'TUR', name: 'Türkiye',               flag: '🇹🇷', group: 'D', rank: 44, apiNames: ['Turkey', 'Türkiye'] },
  // Group E
  { code: 'GER', name: 'Germany',               flag: '🇩🇪', group: 'E', rank:  9, apiNames: ['Germany'] },
  { code: 'CUW', name: 'Curaçao',               flag: '🇨🇼', group: 'E', rank: 82, apiNames: ['Curaçao', 'Curacao'] },
  { code: 'CIV', name: 'Ivory Coast',           flag: '🇨🇮', group: 'E', rank: 42, apiNames: ["Côte d'Ivoire", "Cote d'Ivoire", 'Ivory Coast'] },
  { code: 'ECU', name: 'Ecuador',               flag: '🇪🇨', group: 'E', rank: 23, apiNames: ['Ecuador'] },
  // Group F
  { code: 'NED', name: 'Netherlands',           flag: '🇳🇱', group: 'F', rank:  7, apiNames: ['Netherlands'] },
  { code: 'JPN', name: 'Japan',                 flag: '🇯🇵', group: 'F', rank: 18, apiNames: ['Japan'] },
  { code: 'SWE', name: 'Sweden',                flag: '🇸🇪', group: 'F', rank: 43, apiNames: ['Sweden'] },
  { code: 'TUN', name: 'Tunisia',               flag: '🇹🇳', group: 'F', rank: 40, apiNames: ['Tunisia'] },
  // Group G
  { code: 'BEL', name: 'Belgium',               flag: '🇧🇪', group: 'G', rank:  8, apiNames: ['Belgium'] },
  { code: 'EGY', name: 'Egypt',                 flag: '🇪🇬', group: 'G', rank: 34, apiNames: ['Egypt'] },
  { code: 'IRN', name: 'Iran',                  flag: '🇮🇷', group: 'G', rank: 20, apiNames: ['Iran'] },
  { code: 'NZL', name: 'New Zealand',           flag: '🇳🇿', group: 'G', rank: 86, apiNames: ['New Zealand'] },
  // Group H
  { code: 'ESP', name: 'Spain',                 flag: '🇪🇸', group: 'H', rank:  1, apiNames: ['Spain'] },
  { code: 'CPV', name: 'Cape Verde',            flag: '🇨🇻', group: 'H', rank: 68, apiNames: ['Cape Verde'] },
  { code: 'KSA', name: 'Saudi Arabia',          flag: '🇸🇦', group: 'H', rank: 60, apiNames: ['Saudi Arabia'] },
  { code: 'URU', name: 'Uruguay',               flag: '🇺🇾', group: 'H', rank: 16, apiNames: ['Uruguay'] },
  // Group I
  { code: 'FRA', name: 'France',                flag: '🇫🇷', group: 'I', rank:  3, apiNames: ['France'] },
  { code: 'SEN', name: 'Senegal',               flag: '🇸🇳', group: 'I', rank: 19, apiNames: ['Senegal'] },
  { code: 'IRQ', name: 'Iraq',                  flag: '🇮🇶', group: 'I', rank: 48, apiNames: ['Iraq'] },
  { code: 'NOR', name: 'Norway',                flag: '🇳🇴', group: 'I', rank: 29, apiNames: ['Norway'] },
  // Group J
  { code: 'ARG', name: 'Argentina',             flag: '🇦🇷', group: 'J', rank:  2, apiNames: ['Argentina'] },
  { code: 'ALG', name: 'Algeria',               flag: '🇩🇿', group: 'J', rank: 35, apiNames: ['Algeria'] },
  { code: 'AUT', name: 'Austria',               flag: '🇦🇹', group: 'J', rank: 24, apiNames: ['Austria'] },
  { code: 'JOR', name: 'Jordan',                flag: '🇯🇴', group: 'J', rank: 66, apiNames: ['Jordan'] },
  // Group K
  { code: 'POR', name: 'Portugal',              flag: '🇵🇹', group: 'K', rank:  6, apiNames: ['Portugal'] },
  { code: 'COD', name: 'Congo DR',              flag: '🇨🇩', group: 'K', rank: 47, apiNames: ['DR Congo', 'Congo DR', 'Democratic Republic of Congo'] },
  { code: 'UZB', name: 'Uzbekistan',            flag: '🇺🇿', group: 'K', rank: 50, apiNames: ['Uzbekistan'] },
  { code: 'COL', name: 'Colombia',              flag: '🇨🇴', group: 'K', rank: 13, apiNames: ['Colombia'] },
  // Group L
  { code: 'ENG', name: 'England',               flag: '🏴󠁧󠁢󠁥󠁮󠁧󠁿', group: 'L', rank:  4, apiNames: ['England'] },
  { code: 'CRO', name: 'Croatia',               flag: '🇭🇷', group: 'L', rank: 10, apiNames: ['Croatia'] },
  { code: 'GHA', name: 'Ghana',                 flag: '🇬🇭', group: 'L', rank: 72, apiNames: ['Ghana'] },
  { code: 'PAN', name: 'Panama',                flag: '🇵🇦', group: 'L', rank: 30, apiNames: ['Panama'] },
];

// Build lookup maps for API matching
const TEAM_BY_CODE = {};
const TEAM_BY_API_NAME = {};
for (const t of TEAMS) {
  TEAM_BY_CODE[t.code] = t;
  for (const n of t.apiNames) {
    TEAM_BY_API_NAME[n.toLowerCase()] = t.code;
  }
}

const FAMILY_NAMES = {
  og:    'OG Coons',
  cali:  'Cali Coons',
  co:    'CO Coons',
  cajun: 'Cajun Coons',
};

const FAMILY_COLORS = {
  og:    '#ffd700',
  cali:  '#42a5f5',
  co:    '#66bb6a',
  cajun: '#ef5350',
};

// Snake draft order (12 rounds, 48 picks total — every WC team gets drafted):
// Odd rounds go forward:  OG → Cali → CO → Cajun
// Even rounds go backward: Cajun → CO → Cali → OG
const DRAFT_ORDER = [
  'og','cali','co','cajun',   // Round  1 →
  'cajun','co','cali','og',   // Round  2 ←
  'og','cali','co','cajun',   // Round  3 →
  'cajun','co','cali','og',   // Round  4 ←
  'og','cali','co','cajun',   // Round  5 →
  'cajun','co','cali','og',   // Round  6 ←
  'og','cali','co','cajun',   // Round  7 →
  'cajun','co','cali','og',   // Round  8 ←
  'og','cali','co','cajun',   // Round  9 →
  'cajun','co','cali','og',   // Round 10 ←
  'og','cali','co','cajun',   // Round 11 →
  'cajun','co','cali','og',   // Round 12 ←
];

function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS picks (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      family_team TEXT    NOT NULL,
      team_code   TEXT    NOT NULL UNIQUE,
      pick_number INTEGER NOT NULL,
      picked_at   DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS matches (
      match_id   INTEGER PRIMARY KEY,
      home_team  TEXT NOT NULL,
      away_team  TEXT NOT NULL,
      home_score INTEGER,
      away_score INTEGER,
      stage      TEXT    DEFAULT 'GROUP_STAGE',
      status     TEXT    DEFAULT 'SCHEDULED',
      match_date TEXT,
      last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT
    );
  `);
}

function lookupTeamCode(tla, name) {
  // Try 3-letter code first (football-data.org TLA matches our codes for most teams)
  if (tla && TEAM_BY_CODE[tla.toUpperCase()]) return tla.toUpperCase();
  // Fall back to name matching
  if (name) return TEAM_BY_API_NAME[name.toLowerCase()] || null;
  return null;
}

function getWinPoints(stage) {
  switch (stage) {
    case 'GROUP_STAGE':           return 1;
    case 'ROUND_OF_32':
    case 'ROUND_OF_16':
    case 'QUARTER_FINALS':
    case 'SEMI_FINALS':
    case 'THIRD_PLACE_PLAYOFF':   return 1.5;
    case 'FINAL':                 return 2;
    default:                      return 1;
  }
}

function calculateMatchPoints(match) {
  const { home_team, away_team, home_score, away_score, stage } = match;
  if (home_score === null || away_score === null) return {};

  if (home_score === away_score) {
    return { [home_team]: 0.5, [away_team]: 0.5 };
  }

  const winner = home_score > away_score ? home_team : away_team;
  return { [winner]: getWinPoints(stage) };
}

module.exports = {
  db,
  TEAMS,
  TEAM_BY_CODE,
  FAMILY_NAMES,
  FAMILY_COLORS,
  DRAFT_ORDER,
  initDB,
  lookupTeamCode,
  calculateMatchPoints,
};
