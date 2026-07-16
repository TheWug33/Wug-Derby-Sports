// src/lib/nflPeriods.js
// Rolls up /api/nfl-week results into NFL Derby pay periods.

export const NFL_PERIODS = {
  "Period 1": [1, 2, 3, 4],
  "Period 2": [5, 6, 7, 8],
  "Period 3": [9, 10, 11, 12, 13],
  "Period 4": [14, 15, 16, 17, 18],
};

export function weeksThroughPeriod(periodName) {
  // "Overall" = every week up through the end of the given period
  const order = ["Period 1", "Period 2", "Period 3", "Period 4"];
  const idx = order.indexOf(periodName);
  if (idx === -1) return [];
  return order.slice(0, idx + 1).flatMap((p) => NFL_PERIODS[p]);
}

const bump = (obj, key, field, amount) => {
  if (!amount) return;
  if (!obj[key]) obj[key] = {};
  obj[key][field] = (obj[key][field] || 0) + amount;
};

// Fetches and combines stats for an arbitrary list of weeks.
export async function fetchWeeksStats(weeks, year) {
  const results = await Promise.all(
    weeks.map((w) =>
      fetch(`/api/nfl-week?week=${w}&year=${year}`).then((r) => r.json())
    )
  );

  const teams = {};
  const players = {};
  const flagged = [];

  for (const wk of results) {
    for (const [team, stats] of Object.entries(wk.teams || {})) {
      bump(teams, team, "passingTD", stats.passingTD || 0);
      bump(teams, team, "fgMade", stats.fgMade || 0);
    }
    for (const [name, stats] of Object.entries(wk.players || {})) {
      bump(players, name, "rushTD", stats.rushTD || 0);
      bump(players, name, "recTD", stats.recTD || 0);
    }
    for (const f of wk.flagged || []) {
      flagged.push({ ...f, week: wk.week });
    }
  }
  for (const name of Object.keys(players)) {
    players[name].totalTD = (players[name].rushTD || 0) + (players[name].recTD || 0);
  }
  return { teams, players, flagged };
}

// Convenience: stats for one named period ("Period 1".."Period 4") or "Overall".
export async function fetchPeriodStats(periodName, year) {
  const weeks =
    periodName === "Overall" ? weeksThroughPeriod("Period 4") : NFL_PERIODS[periodName];
  return fetchWeeksStats(weeks, year);
}

// Scores a single fantasy roster against combined {teams, players} stats.
// roster = { qb: [teamName, teamName], k: [teamName, teamName], skill: [playerName x6], swap: playerName|null }
export function scoreRoster(roster, stats) {
  let total = 0;
  const breakdown = [];

  for (const teamName of roster.qb || []) {
    const pts = (stats.teams[teamName]?.passingTD || 0) * 6;
    total += pts;
    breakdown.push({ slot: "QB", name: teamName, pts });
  }
  for (const teamName of roster.k || []) {
    const pts = (stats.teams[teamName]?.fgMade || 0) * 3;
    total += pts;
    breakdown.push({ slot: "K", name: teamName, pts });
  }
  for (const playerName of roster.skill || []) {
    const pts = (stats.players[playerName]?.totalTD || 0) * 6;
    total += pts;
    breakdown.push({ slot: "Skill", name: playerName, pts });
  }
  return { total, breakdown };
}
