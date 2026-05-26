const express = require('express');
const fetch   = require('node-fetch');
const path    = require('path');
require('dotenv').config();

const {
  db, TEAMS, TEAM_BY_CODE, FAMILY_NAMES, FAMILY_COLORS,
  DRAFT_ORDER, initDB, lookupTeamCode, calculateMatchPoints,
} = require('./database');

const app  = express();
const PORT = process.env.PORT || 3001;

initDB();

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Serve draft page at /draft
app.get('/draft', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'draft.html'));
});

// ── Draft API ──────────────────────────────────────────────────────────────

app.get('/api/draft/state', (req, res) => {
  const picks      = db.prepare('SELECT * FROM picks ORDER BY pick_number').all();
  const currentPick = picks.length;
  const isComplete  = currentPick >= 12;
  const currentTurn = isComplete ? null : DRAFT_ORDER[currentPick];

  const pickedMap = {};
  for (const p of picks) pickedMap[p.team_code] = p.family_team;

  const teams = TEAMS.map(t => ({
    code:     t.code,
    name:     t.name,
    flag:     t.flag,
    group:    t.group,
    rank:     t.rank,
    picked:   !!pickedMap[t.code],
    pickedBy: pickedMap[t.code] || null,
  }));

  // Build picks-per-family summary
  const summary = {};
  for (const key of Object.keys(FAMILY_NAMES)) summary[key] = [];
  for (const p of picks) {
    const team = TEAM_BY_CODE[p.team_code];
    if (team) summary[p.family_team].push({ code: team.code, name: team.name, flag: team.flag });
  }

  res.json({ picks, currentPick, currentTurn, isComplete, teams, summary, familyNames: FAMILY_NAMES, familyColors: FAMILY_COLORS });
});

app.post('/api/draft/pick', (req, res) => {
  const { family_team, team_code } = req.body;

  const picks       = db.prepare('SELECT * FROM picks ORDER BY pick_number').all();
  const currentPick = picks.length;

  if (currentPick >= 12) return res.status(400).json({ error: 'Draft is complete' });

  const expected = DRAFT_ORDER[currentPick];
  if (family_team !== expected) {
    return res.status(400).json({ error: `Not your turn. On the clock: ${FAMILY_NAMES[expected]}` });
  }

  if (!TEAM_BY_CODE[team_code]) return res.status(400).json({ error: 'Invalid team' });

  const already = db.prepare('SELECT id FROM picks WHERE team_code = ?').get(team_code);
  if (already) return res.status(400).json({ error: 'Team already drafted' });

  db.prepare('INSERT INTO picks (family_team, team_code, pick_number) VALUES (?, ?, ?)').run(family_team, team_code, currentPick);
  res.json({ success: true });
});

app.post('/api/draft/reset', (req, res) => {
  db.prepare('DELETE FROM picks').run();
  res.json({ success: true });
});

// ── Standings API ──────────────────────────────────────────────────────────

app.get('/api/standings', (req, res) => {
  const picks   = db.prepare('SELECT * FROM picks').all();
  const matches = db.prepare("SELECT * FROM matches WHERE status = 'FINISHED'").all();

  const totals = { og: 0, cali: 0, co: 0, cajun: 0 };

  for (const match of matches) {
    const pts = calculateMatchPoints(match);
    for (const [code, p] of Object.entries(pts)) {
      const pick = picks.find(x => x.team_code === code);
      if (pick) totals[pick.family_team] += p;
    }
  }

  for (const k of Object.keys(totals)) {
    totals[k] = Math.round(totals[k] * 10) / 10;
  }

  res.json(totals);
});

app.get('/api/hq', (req, res) => {
  const picks   = db.prepare('SELECT * FROM picks ORDER BY pick_number').all();
  const matches = db.prepare("SELECT * FROM matches WHERE status = 'FINISHED' ORDER BY match_date DESC, match_id DESC LIMIT 30").all();

  // Build totals
  const totals = { og: 0, cali: 0, co: 0, cajun: 0 };
  for (const match of matches) {
    const pts = calculateMatchPoints(match);
    for (const [code, p] of Object.entries(pts)) {
      const pick = picks.find(x => x.team_code === code);
      if (pick) totals[pick.family_team] += p;
    }
  }
  for (const k of Object.keys(totals)) {
    totals[k] = Math.round(totals[k] * 10) / 10;
  }

  // Build picks-per-family summary
  const summary = {};
  for (const key of Object.keys(FAMILY_NAMES)) summary[key] = [];
  for (const p of picks) {
    const team = TEAM_BY_CODE[p.team_code];
    if (team) summary[p.family_team].push({ code: team.code, name: team.name, flag: team.flag });
  }

  // Recent results with point earners
  const recentMatches = matches.slice(0, 10).map(match => {
    const pts     = calculateMatchPoints(match);
    const earners = [];
    for (const [code, p] of Object.entries(pts)) {
      if (p > 0) {
        const pick = picks.find(x => x.team_code === code);
        const team = TEAM_BY_CODE[code];
        if (pick && team) earners.push({ family: pick.family_team, teamName: team.name, pts });
      }
    }
    const home = TEAM_BY_CODE[match.home_team];
    const away = TEAM_BY_CODE[match.away_team];
    return {
      matchId:    match.match_id,
      stage:      match.stage,
      matchDate:  match.match_date,
      homeName:   home?.name || match.home_team,
      homeFlag:   home?.flag || '',
      homeScore:  match.home_score,
      awayName:   away?.name || match.away_team,
      awayFlag:   away?.flag || '',
      awayScore:  match.away_score,
      earners,
    };
  });

  const lastSync = db.prepare("SELECT value FROM settings WHERE key = 'last_sync'").get();
  const draftComplete = picks.length >= 12;

  res.json({
    totals,
    summary,
    recentMatches,
    lastSync:      lastSync?.value || null,
    draftComplete,
    familyNames:   FAMILY_NAMES,
    familyColors:  FAMILY_COLORS,
  });
});

app.get('/api/status', (req, res) => {
  const lastSync   = db.prepare("SELECT value FROM settings WHERE key = 'last_sync'").get();
  const matchCount = db.prepare("SELECT COUNT(*) as n FROM matches").get();
  const doneCount  = db.prepare("SELECT COUNT(*) as n FROM matches WHERE status = 'FINISHED'").get();
  res.json({
    lastSync:    lastSync?.value || null,
    matchCount:  matchCount.n,
    doneCount:   doneCount.n,
    hasApiKey:   !!process.env.FOOTBALL_DATA_KEY,
  });
});

app.post('/api/sync', async (req, res) => {
  try {
    const result = await syncScores();
    res.json({ success: true, ...result });
  } catch (e) {
    console.error('Sync error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ── Football-data.org Sync ─────────────────────────────────────────────────

async function syncScores() {
  const key = process.env.FOOTBALL_DATA_KEY;
  if (!key) return { skipped: true, reason: 'No API key set' };

  const compCode = process.env.COMPETITION_CODE || 'WC';
  const url      = `https://api.football-data.org/v4/competitions/${compCode}/matches`;

  const response = await fetch(url, { headers: { 'X-Auth-Token': key } });
  if (!response.ok) {
    throw new Error(`football-data.org API error: ${response.status} ${response.statusText}`);
  }

  const data    = await response.json();
  const matches = data.matches || [];

  const upsert = db.prepare(`
    INSERT INTO matches (match_id, home_team, away_team, home_score, away_score, stage, status, match_date)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(match_id) DO UPDATE SET
      home_score   = excluded.home_score,
      away_score   = excluded.away_score,
      status       = excluded.status,
      last_updated = CURRENT_TIMESTAMP
  `);

  let synced = 0;
  let skipped = 0;

  for (const m of matches) {
    const homeCode = lookupTeamCode(m.homeTeam?.tla, m.homeTeam?.name);
    const awayCode = lookupTeamCode(m.awayTeam?.tla, m.awayTeam?.name);

    if (!homeCode || !awayCode) { skipped++; continue; }

    const homeScore = m.score?.fullTime?.home ?? null;
    const awayScore = m.score?.fullTime?.away ?? null;
    const stage     = m.stage || 'GROUP_STAGE';
    const status    = m.status || 'SCHEDULED';
    const matchDate = m.utcDate ? m.utcDate.split('T')[0] : null;

    upsert.run(m.id, homeCode, awayCode, homeScore, awayScore, stage, status, matchDate);
    synced++;
  }

  const now = new Date().toISOString();
  db.prepare("INSERT OR REPLACE INTO settings (key, value) VALUES ('last_sync', ?)").run(now);
  console.log(`[sync] ${synced} matches updated, ${skipped} skipped`);
  return { synced, skipped, timestamp: now };
}

// Auto-sync every 10 minutes when API key is present
if (process.env.FOOTBALL_DATA_KEY) {
  syncScores().catch(e => console.error('[sync] Initial sync failed:', e.message));
  setInterval(() => syncScores().catch(e => console.error('[sync] Error:', e.message)), 10 * 60 * 1000);
}

app.listen(PORT, () => console.log(`Coon World Cup running on port ${PORT}`));
