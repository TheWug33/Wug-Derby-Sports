// api/nfl-week.js
// Aggregates one NFL week's box scores into the shape NFL Derby scoring needs.
// GET /api/nfl-week?week=9&year=2025&seasontype=2
//
// Returns:
// {
//   week, year,
//   teams:   { "Washington Commanders": { passingTD, fgMade } },
//   players: { "Brock Bowers": { rushTD, recTD, totalTD } }
// }
//
// teams[name].passingTD  -> Team QB slot: (passing TD + the QB's own rushing TD) * 6
// teams[name].fgMade     -> Team Kicker slot: fgMade * 3
// players[name].totalTD  -> Skill player slot: totalTD * 6  (rush+rec only, per rules)
//
// Known limitation: a team's "passer(s)" are identified as whoever appears in the
// box score's passing category. On the rare trick play where a non-QB throws a TD
// pass, this will misattribute that TD to the Team QB slot instead of excluding it
// entirely (per the written rule). This happens a handful of times per season
// league-wide -- flag it if it ever affects a real week and we can add a proper
// QB-position check via the roster endpoint.

export default async function handler(req, res) {
  try {
    const { week, year, seasontype = "2" } = req.query;
    if (!week || !year) {
      return res.status(400).json({ error: "week and year are required" });
    }

    const sbUrl = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard?week=${week}&year=${year}&seasontype=${seasontype}&limit=100`;
    const sbRes = await fetch(sbUrl);
    if (!sbRes.ok) throw new Error(`scoreboard fetch failed: ${sbRes.status}`);
    const sb = await sbRes.json();
    const events = sb.events || [];

    const teams = {};
    const players = {};
    const flagged = []; // suspicious passing TDs worth a manual look (likely trick plays)
    const bump = (obj, key, field, amount) => {
      if (!amount) return;
      if (!obj[key]) obj[key] = {};
      obj[key][field] = (obj[key][field] || 0) + amount;
    };

    // Fetch all game summaries in parallel
    const summaries = await Promise.all(
      events.map(async (ev) => {
        if (!ev.id) return null;
        try {
          const url = `https://site.api.espn.com/apis/site/v2/sports/football/nfl/summary?event=${ev.id}`;
          const r = await fetch(url);
          if (!r.ok) return null;
          return await r.json();
        } catch {
          return null;
        }
      })
    );

    for (const sum of summaries) {
      const teamBlocks = sum?.boxscore?.players || [];
      for (const block of teamBlocks) {
        const teamName = block.team?.displayName;
        if (!teamName) continue;

        // First pass: figure out who the team's passer(s) are, and their passing TDs.
        // Team QB score = that passer's passing TDs + that same passer's own rushing TDs
        // (a rushing QB's scrambles count toward the Team QB slot, not a skill slot).
        const passing = (block.statistics || []).find((c) => c.name === "passing");
        const passerIds = new Set();
        if (passing) {
          const tdIdx = passing.keys.indexOf("passingTouchdowns");
          const attIdx = passing.keys.indexOf("completions/passingAttempts");
          for (const a of passing.athletes || []) {
            const id = a.athlete?.id;
            const name = a.athlete?.displayName;
            const td = parseInt(a.stats?.[tdIdx] || "0", 10) || 0;
            const attempts = parseInt((a.stats?.[attIdx] || "0/0").split("/")[1], 10) || 0;
            if (id) {
              passerIds.add(id);
              bump(teams, teamName, "passingTD", td);
            }
            if (td > 0 && attempts <= 2) {
              flagged.push({
                team: teamName,
                player: name,
                attempts,
                passingTD: td,
                note: "Low pass attempts + a passing TD -- check if this was a trick play (non-QB passer).",
              });
            }
          }
        }

        for (const cat of block.statistics || []) {
          if (cat.name === "kicking") {
            const fgIdx = cat.keys.indexOf("fieldGoalsMade/fieldGoalAttempts");
            const madeStr = (cat.totals?.[fgIdx] || "0/0").split("/")[0];
            bump(teams, teamName, "fgMade", parseInt(madeStr, 10) || 0);
          }

          if (cat.name === "rushing") {
            const tdIdx = cat.keys.indexOf("rushingTouchdowns");
            for (const a of cat.athletes || []) {
              const id = a.athlete?.id;
              const name = a.athlete?.displayName;
              const td = parseInt(a.stats?.[tdIdx] || "0", 10) || 0;
              if (!td) continue;
              if (id && passerIds.has(id)) {
                // The QB's own rushing TD -> Team QB slot, not a skill slot.
                bump(teams, teamName, "passingTD", td);
              } else if (name) {
                bump(players, name, "rushTD", td);
              }
            }
          }

          if (cat.name === "receiving") {
            const tdIdx = cat.keys.indexOf("receivingTouchdowns");
            for (const a of cat.athletes || []) {
              const name = a.athlete?.displayName;
              const td = parseInt(a.stats?.[tdIdx] || "0", 10) || 0;
              if (name && td) bump(players, name, "recTD", td);
            }
          }
        }
      }
    }

    for (const name of Object.keys(players)) {
      players[name].totalTD = (players[name].rushTD || 0) + (players[name].recTD || 0);
    }

    res.setHeader("Cache-Control", "s-maxage=120, stale-while-revalidate=300");
    res.status(200).json({ week: Number(week), year: Number(year), teams, players, flagged });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
