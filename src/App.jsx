import { useState, useEffect } from "react";

const CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTtADRNEx9M4uGiDjqrSppUqUO-YUfDp8WcgRSLvWQUgg7zPcJMFocQ7CNa-ORol3-y4qjpb-f3GC5g/pub?output=csv";

// ── CSV PARSER ────────────────────────────────────────────────────────────────
function parseCSV(text) {
  const rows = text.split("\n").map(r => {
    const cells = []; let cur = ""; let inQ = false;
    for (let c of r) {
      if (c === '"') inQ = !inQ;
      else if (c === "," && !inQ) { cells.push(cur.trim()); cur = ""; }
      else cur += c;
    }
    cells.push(cur.trim());
    return cells;
  });

  // Build player HR lookup from ranked list (cols AH=33, AI=34)
  const playerHR = {};
  for (const row of rows) {
    const nameCell = row[35] || "";
    const hrCell = row[36] || "";
    if (nameCell && hrCell !== "" && nameCell !== "Player Name") {
      playerHR[nameCell.trim()] = parseInt(hrCell) || 0;
    }
    // Also parse ranked list col AC=28 "N. Name (TEAM)"
    const ranked = row[28] || "";
    const rankedHR = row[29] || "";
    if (ranked && rankedHR !== "" && /^\d+\./.test(ranked)) {
      const m = ranked.match(/^\d+\.\s+(.+?)\s+\([A-Z]+\)$/);
      if (m) playerHR[m[1].trim()] = parseInt(rankedHR) || 0;
    }
  }

  // Parse monthly standings (rows 0-25, cols 0-3)
  const monthlyStandings = [];
  for (let i = 0; i < 26; i++) {
    const r = rows[i];
    if (r && r[0] && !isNaN(parseInt(r[0])) && r[1] && r[1] !== "Overall Standings") {
      monthlyStandings.push({
        rank: parseInt(r[0]),
        name: r[1],
        month: parseInt(r[2]) || 0,
        season: parseInt(r[3]) || 0,
      });
    }
  }

  // Parse overall season standings — find the row with "Overall Standings"
  const seasonStandings = [];
  let inSeason = false;
  for (const r of rows) {
    if (r[1] === "Overall Standings") { inSeason = true; continue; }
    if (inSeason && r[0] && !isNaN(parseInt(r[0])) && r[1] && r[2]) {
      seasonStandings.push({
        rank: parseInt(r[0]),
        name: r[1],
        season: parseInt(r[2]) || 0,
      });
    }
  }

  // Parse roster blocks from cols G-J (6-9), L-O (11-14), Q-T (16-19), V-Y (21-24)
  const SKIP = new Set(["2025","Total HRs","May","April","Season","Player","Monthly Winners",
    "Overall Season Winners","1st - $75","2nd - $50","1st - $300","2nd - $175","3rd - $75",
    "Overall Standings","Standings","Home Run Totals","Player Name","Rank",""]);
  const colGroups = [[6,7,8,9],[11,12,13,14],[16,17,18,19],[21,22,23,24]];
  const rosters = {};
  const currentTeams = [null,null,null,null];

  for (const row of rows) {
    for (let gi = 0; gi < colGroups.length; gi++) {
      const [c0,c1,c2,c3] = colGroups[gi];
      const v0 = row[c0]||"", v1 = row[c1]||"", v2 = row[c2]||"", v3 = row[c3]||"";
      if (v0 && !SKIP.has(v0) && isNaN(parseInt(v0)) && !v1) {
        currentTeams[gi] = v0;
        if (!rosters[v0]) rosters[v0] = { players:[], cap:null, month:0, season:0 };
      } else if (!isNaN(parseInt(v0)) && v1 && !SKIP.has(v1)) {
        const team = currentTeams[gi];
        if (team && rosters[team]) {
          const mhr = v2 !== "" ? parseInt(v2) : null;
          const shr = v3 !== "" ? parseInt(v3) : null;
          rosters[team].players.push({
            name: v1.trim(),
            cap2025: parseInt(v0),
            month: mhr,
            season: shr,
            current: playerHR[v1.trim()] ?? null,
            swap: mhr === null && shr === null,
          });
        }
      } else if (v1 === "Total HRs" && !isNaN(parseInt(v0))) {
        const team = currentTeams[gi];
        if (team && rosters[team]) {
          rosters[team].cap = parseInt(v0);
          rosters[team].month = parseInt(v2) || 0;
          rosters[team].season = parseInt(v3) || 0;
        }
      }
    }
  }

  // Parse HR leaders from ranked list col AC/AD
  const hrLeaders = [];
  for (const row of rows) {
    const cell = row[28]||"", hr = row[29]||"";
    if (cell && hr !== "" && /^\d+\./.test(cell)) {
      const m = cell.match(/^(\d+)\.\s+(.+?)\s+\(([A-Z]+)\)$/);
      if (m) hrLeaders.push({ rank:parseInt(m[1]), name:m[2].trim(), team:m[3], hr:parseInt(hr)||0 });
    }
  }

  return { monthlyStandings, seasonStandings, rosters: Object.entries(rosters).map(([teamName, d]) => ({ teamName, ...d })), hrLeaders };
}

// ── WORLD CUP DATA (static) ───────────────────────────────────────────────────
const WC_GROUPS = [
  {group:1,multiplier:1,teams:["France","Spain","England","Brazil"]},
  {group:2,multiplier:1,teams:["Argentina","Portugal","Germany","Netherlands"]},
  {group:3,multiplier:1,teams:["Norway","Belgium","Colombia","Morocco"]},
  {group:4,multiplier:1,teams:["Japan","United States","Uruguay","Mexico"]},
  {group:5,multiplier:1,teams:["Switzerland","Croatia","Ecuador","Turkey"]},
  {group:6,multiplier:2,teams:["Sweden","Senegal","Paraguay","Austria"]},
  {group:7,multiplier:2,teams:["Scotland","Canada","Ivory Coast","Czech Republic"]},
  {group:8,multiplier:2,teams:["Bosnia","Ghana","Egypt","Algeria"]},
  {group:9,multiplier:2,teams:["South Korea","Tunisia","Australia","Iran"]},
  {group:10,multiplier:3,teams:["DR Congo","South Africa","Uzbekistan","Panama"]},
  {group:11,multiplier:3,teams:["Qatar","Iraq","Saudi Arabia","Cape Verde"]},
  {group:12,multiplier:3,teams:["New Zealand","Curacao","Jordan","Haiti"]},
];
const WC_SCORING = [
  {event:"Each goal scored",pts:1},{event:"Group play win",pts:3},{event:"Group play draw",pts:1},
  {event:"Win group (1st place)",pts:8},{event:"Finish 2nd in group",pts:4},
  {event:"Advance as best 3rd-place",pts:2},{event:"Win Round of 32 (reach R16)",pts:8},
  {event:"Reach Quarterfinals",pts:12},{event:"Reach Semifinals",pts:24},
  {event:"Reach Final",pts:36},{event:"Win Final (Champion)",pts:48},
];

// ── STYLES ────────────────────────────────────────────────────────────────────
const S = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@300;400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
:root{--bg:#0d0f14;--sur:#161a23;--sur2:#1e2330;--bdr:#2a3044;--gold:#f5c842;--gold2:#e6a800;--red:#e84545;--grn:#3dd68c;--blu:#4a9eff;--txt:#e8ecf4;--mut:#6b7799;--F:'Bebas Neue',sans-serif;--B:'DM Sans',sans-serif}
body{background:var(--bg);color:var(--txt);font-family:var(--B);min-height:100vh}
.hdr{background:linear-gradient(135deg,#0d0f14,#1a1f2e);border-bottom:2px solid var(--gold);padding:0 24px;position:sticky;top:0;z-index:100;display:flex;align-items:center;justify-content:space-between;height:64px}
.logo{font-family:var(--F);font-size:28px;letter-spacing:2px;color:var(--gold)}.logo span{color:var(--txt)}
.nav{display:flex;gap:4px;padding:16px 24px 0;border-bottom:1px solid var(--bdr);background:var(--sur)}
.ntab{padding:10px 20px 12px;border:none;background:transparent;color:var(--mut);font-family:var(--F);font-size:18px;letter-spacing:1px;cursor:pointer;border-bottom:3px solid transparent;margin-bottom:-1px;transition:all .2s}
.ntab:hover{color:var(--txt)}.ntab.on{color:var(--gold);border-bottom-color:var(--gold)}
.main{padding:24px;max-width:1200px;margin:0 auto}
.phdr{background:linear-gradient(135deg,var(--sur),var(--sur2));border:1px solid var(--bdr);border-left:4px solid var(--gold);border-radius:8px;padding:20px 24px;margin-bottom:24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
.ptitle{font-family:var(--F);font-size:32px;letter-spacing:2px;color:var(--gold)}
.pmeta{display:flex;gap:12px;flex-wrap:wrap;align-items:center}
.pill{background:var(--bg);border:1px solid var(--bdr);border-radius:20px;padding:4px 14px;font-size:13px;color:var(--mut)}.pill strong{color:var(--txt)}
.stabs{display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap}
.stab{padding:8px 18px;border:1px solid var(--bdr);border-radius:4px;background:var(--sur);color:var(--mut);font-size:14px;font-weight:500;cursor:pointer;transition:all .15s}
.stab:hover{border-color:var(--gold);color:var(--txt)}.stab.on{background:var(--gold);color:#000;border-color:var(--gold);font-weight:600}
.card{background:var(--sur);border:1px solid var(--bdr);border-radius:8px;overflow:hidden;margin-bottom:20px}
.chdr{padding:14px 20px;border-bottom:1px solid var(--bdr);font-family:var(--F);font-size:20px;letter-spacing:1px;color:var(--gold);display:flex;align-items:center;gap:10px}
table{width:100%;border-collapse:collapse}
th{background:var(--bg);padding:10px 16px;text-align:left;font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:var(--mut);border-bottom:1px solid var(--bdr)}
td{padding:10px 16px;border-bottom:1px solid rgba(42,48,68,.5);font-size:14px}
tr:last-child td{border-bottom:none}tr:hover td{background:rgba(245,200,66,.04)}
th.r,td.r{text-align:right}
.rbadge{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;font-size:12px;font-weight:700;background:var(--sur2);color:var(--mut)}
.r1{background:var(--gold);color:#000}.r2{background:#b0b8cc;color:#000}.r3{background:#cd7f32;color:#fff}
.ttag{display:inline-block;padding:2px 8px;border-radius:3px;font-size:11px;font-weight:700;background:var(--sur2);color:var(--blu);letter-spacing:.5px}
.hn{font-family:var(--F);font-size:20px;color:var(--gold)}
.hns{font-family:var(--F);font-size:16px;color:var(--txt)}
.srch{display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap}
input.si{flex:1;min-width:200px;background:var(--bg);border:1px solid var(--bdr);border-radius:6px;padding:9px 14px;color:var(--txt);font-family:var(--B);font-size:14px;outline:none;transition:border-color .15s}
input.si:focus{border-color:var(--gold)}input.si::placeholder{color:var(--mut)}
.m1x{color:var(--mut);font-size:12px;font-weight:600}
.m2x{color:var(--blu);font-size:12px;font-weight:700;background:rgba(74,158,255,.1);padding:2px 7px;border-radius:3px}
.m3x{color:var(--red);font-size:12px;font-weight:700;background:rgba(232,69,69,.1);padding:2px 7px;border-radius:3px}
.ggrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px}
.gcard{background:var(--sur);border:1px solid var(--bdr);border-radius:8px;overflow:hidden}
.gchdr{padding:10px 16px;display:flex;align-items:center;justify-content:space-between}
.g1x .gchdr{background:rgba(245,200,66,.08);border-bottom:1px solid rgba(245,200,66,.2)}
.g2x .gchdr{background:rgba(74,158,255,.1);border-bottom:1px solid rgba(74,158,255,.2)}
.g3x .gchdr{background:rgba(232,69,69,.1);border-bottom:1px solid rgba(232,69,69,.2)}
.gname{font-family:var(--F);font-size:18px;letter-spacing:1px}
.g1x .gname{color:var(--gold)}.g2x .gname{color:var(--blu)}.g3x .gname{color:var(--red)}
.grow{padding:8px 16px;font-size:14px;border-bottom:1px solid rgba(42,48,68,.4)}.grow:last-child{border-bottom:none}
.srow{display:flex;justify-content:space-between;align-items:center;padding:10px 16px;border-bottom:1px solid rgba(42,48,68,.5)}.srow:last-child{border-bottom:none}
.spts{font-family:var(--F);font-size:22px;color:var(--gold)}
.sgrid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
@media(max-width:640px){.sgrid{grid-template-columns:1fr}}
.rbox{background:var(--bg);border:1px solid var(--bdr);border-radius:6px;padding:20px}
.ri{display:flex;gap:12px;padding:10px 0;border-bottom:1px solid rgba(42,48,68,.4);font-size:14px;line-height:1.6;color:#c5cde0}.ri:last-child{border-bottom:none}
.rn{color:var(--gold);font-family:var(--F);font-size:18px;min-width:24px}
.dgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px;margin-bottom:28px}
.dc{background:var(--sur);border:1px solid var(--bdr);border-radius:10px;overflow:hidden;cursor:pointer;transition:transform .15s,border-color .15s}
.dc:hover{transform:translateY(-2px);border-color:var(--gold)}
.dctop{padding:20px;border-bottom:1px solid var(--bdr);display:flex;align-items:center;gap:16px}
.dico{width:52px;height:52px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:26px}
.dctitle{font-family:var(--F);font-size:22px;letter-spacing:1px}
.dcsub{font-size:13px;color:var(--mut);margin-top:2px}
.dcbody{padding:16px 20px}
.dsr{display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px}
.dsl{color:var(--mut)}.dsv{font-weight:600;color:var(--txt)}
.dcta{display:block;text-align:center;padding:10px;background:var(--gold);color:#000;font-weight:700;border:none;cursor:pointer;width:100%;font-family:var(--F);font-size:16px;letter-spacing:1px;transition:background .15s}
.dcta:hover{background:var(--gold2)}
.dbadge{display:inline-flex;align-items:center;gap:6px;background:rgba(232,69,69,.12);border:1px solid rgba(232,69,69,.3);color:var(--red);border-radius:4px;padding:4px 10px;font-size:12px;font-weight:600}
.blive{background:rgba(61,214,140,.15);color:var(--grn);border:1px solid rgba(61,214,140,.3);border-radius:4px;padding:2px 8px;font-size:11px;font-weight:700;letter-spacing:1px}
.bsoon{background:rgba(245,200,66,.15);color:var(--gold);border:1px solid rgba(245,200,66,.3);border-radius:4px;padding:2px 8px;font-size:11px;font-weight:700;letter-spacing:1px}
.swapb{font-size:10px;background:rgba(74,158,255,.15);color:var(--blu);border:1px solid rgba(74,158,255,.3);border-radius:3px;padding:1px 5px;margin-left:6px;font-weight:700}
.lbar{height:4px;background:var(--bdr);border-radius:2px;margin-top:4px;overflow:hidden}
.lfill{height:100%;border-radius:2px;background:var(--gold)}
.rgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px}
.rc{background:var(--sur);border:1px solid var(--bdr);border-radius:8px;overflow:hidden}
.rchdr{padding:12px 16px;background:var(--bg);border-bottom:1px solid var(--bdr);display:flex;align-items:center;justify-content:space-between}
.rcname{font-family:var(--F);font-size:16px;letter-spacing:1px}
.rctots{display:flex;gap:12px}
.rcstat .v{font-family:var(--F);font-size:18px;color:var(--gold)}
.rcstat .lbl{font-size:10px;color:var(--mut);letter-spacing:1px;text-transform:uppercase}
.rpr{padding:8px 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid rgba(42,48,68,.4);font-size:13px}.rpr:last-child{border-bottom:none}
.tabs2{display:flex;background:var(--bg);border:1px solid var(--bdr);border-radius:6px;overflow:hidden;margin-bottom:16px;width:fit-content}
.t2{padding:8px 18px;font-size:13px;font-weight:600;cursor:pointer;border:none;background:transparent;color:var(--mut);transition:all .15s;letter-spacing:.5px}
.t2.on{background:var(--gold);color:#000}
.podium{display:flex;gap:12px;margin-bottom:20px}
.pod{flex:1;background:var(--sur);border:1px solid var(--bdr);border-radius:8px;padding:16px;text-align:center}
.pod.p1{border-color:var(--gold);background:rgba(245,200,66,.06)}.pod.p2{border-color:#b0b8cc}.pod.p3{border-color:#cd7f32}
.pos{font-family:var(--F);font-size:32px}
.p1 .pos{color:var(--gold)}.p2 .pos{color:#b0b8cc}.p3 .pos{color:#cd7f32}
.pteam{font-weight:600;font-size:14px;margin:4px 0 2px}.phr{font-family:var(--F);font-size:24px;color:var(--txt)}.plbl{font-size:11px;color:var(--mut);letter-spacing:1px}
@media(max-width:500px){.podium{flex-direction:column}}
.loading{display:flex;flex-direction:column;align-items:center;justify-content:center;height:60vh;gap:16px;color:var(--mut)}
.spinner{width:48px;height:48px;border:4px solid var(--bdr);border-top-color:var(--gold);border-radius:50%;animation:spin 0.8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.live-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:var(--grn);margin-right:6px;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.updated{font-size:12px;color:var(--mut);display:flex;align-items:center}
`;

function RB({rank}) {
  return <span className={`rbadge ${rank===1?'r1':rank===2?'r2':rank===3?'r3':''}`}>{rank}</span>;
}

// ── HR DERBY ─────────────────────────────────────────────────────────────────
function HRDerby({ data }) {
  const [sec, setSec] = useState("standings");
  const [stab, setStab] = useState("season");
  const [search, setSearch] = useState("");
  const [sel, setSel] = useState(null);

  const { monthlyStandings, seasonStandings, rosters, hrLeaders } = data;

  const display = stab === "season"
    ? [...seasonStandings].sort((a,b) => b.season - a.season).map((s,i) => ({...s, rank:i+1}))
    : [...monthlyStandings].sort((a,b) => b.month - a.month).map((s,i) => ({...s, rank:i+1}));
  const maxV = stab === "season"
    ? Math.max(...seasonStandings.map(s => s.season))
    : Math.max(...monthlyStandings.map(s => s.month));

  const filtRosters = rosters.filter(r =>
    !search || r.teamName.toLowerCase().includes(search.toLowerCase()) ||
    r.players.some(p => p.name.toLowerCase().includes(search.toLowerCase()))
  );

  return (
    <div>
      <div className="phdr">
        <div>
          <div className="ptitle">⚾ HOME RUN DERBY POOL 2026</div>
          <div style={{fontSize:14,color:"var(--mut)",marginTop:4}}>{rosters.length} teams · Live stats · Auto-updates daily</div>
        </div>
        <div className="pmeta">
          <div className="pill">Entry: <strong>50 units</strong></div>
          <div className="pill">Teams: <strong>{rosters.length}</strong></div>
          <div className="pill">HR Cap: <strong>156</strong></div>
          <div className="pill">Prizes: <strong>Monthly + Season</strong></div>
        </div>
      </div>

      <div className="stabs">
        {[{id:"standings",label:"🏆 Standings"},{id:"rosters",label:"📋 Rosters"},{id:"leaders",label:"⚾ HR Leaders"},{id:"rules",label:"📖 Rules"}].map(s=>(
          <button key={s.id} className={`stab ${sec===s.id?"on":""}`} onClick={()=>setSec(s.id)}>{s.label}</button>
        ))}
      </div>

      {sec==="standings" && (
        <div>
          <div className="podium">
            {display.slice(0,3).map((t,i)=>{
              const v = stab==="season" ? t.season : t.month;
              return (
                <div key={t.name} className={`pod p${i+1}`}>
                  <div className="pos">{["🥇","🥈","🥉"][i]}</div>
                  <div className="pteam">{t.name}</div>
                  <div className="phr">{v}</div>
                  <div className="plbl">HOME RUNS</div>
                </div>
              );
            })}
          </div>
          <div className="tabs2">
            <button className={`t2 ${stab==="season"?"on":""}`} onClick={()=>setStab("season")}>SEASON TOTAL</button>
            <button className={`t2 ${stab==="month"?"on":""}`} onClick={()=>setStab("month")}>MAY</button>
          </div>
          <div className="card">
            <div className="chdr">
              {stab==="season" ? "🏆 Season Standings" : "📅 May Standings"}
              <span style={{marginLeft:"auto",fontSize:12,fontFamily:"var(--B)",color:"var(--mut)",fontWeight:400}}>Click team → view roster</span>
            </div>
            <table>
              <thead><tr><th style={{width:48}}>Rank</th><th>Team</th><th className="r">{stab==="season"?"Season HRs":"May HRs"}</th><th style={{width:160}}></th></tr></thead>
              <tbody>
                {display.map(s=>{
                  const v = stab==="season" ? s.season : s.month;
                  const pct = Math.round((v/maxV)*100);
                  return (
                    <tr key={s.name} style={{cursor:"pointer"}} onClick={()=>{setSec("rosters");setSel(s.name);}}>
                      <td><RB rank={s.rank}/></td>
                      <td style={{fontWeight:500}}>{s.name}</td>
                      <td className="r"><span className="hn">{v}</span></td>
                      <td><div className="lbar"><div className="lfill" style={{width:`${pct}%`,background:s.rank===1?"var(--gold)":s.rank===2?"#b0b8cc":s.rank===3?"#cd7f32":"var(--grn)"}}/></div></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div style={{padding:"12px 16px",background:"var(--sur)",border:"1px solid var(--bdr)",borderRadius:6,fontSize:13,color:"var(--mut)"}}>
            <strong style={{color:"var(--gold)"}}>Payout Structure:</strong> Monthly: 1st $75 · 2nd $50 &nbsp;|&nbsp; Season: 1st $300 · 2nd $175 · 3rd $75
          </div>
        </div>
      )}

      {sec==="rosters" && (
        <div>
          <div className="srch">
            <input className="si" placeholder="Search team or player..." value={search} onChange={e=>setSearch(e.target.value)}/>
            {sel && <button className="stab on" onClick={()=>setSel(null)}>✕ {sel}</button>}
          </div>
          <div className="rgrid">
            {(sel ? filtRosters.filter(r=>r.teamName===sel) : filtRosters).map(r=>(
              <div className="rc" key={r.teamName}>
                <div className="rchdr">
                  <div>
                    <div className="rcname">{r.teamName}</div>
                    <div style={{fontSize:11,color:"var(--mut)",marginTop:2}}>Cap: {r.cap??'—'} · Season: {r.season} HR · May: {r.month} HR</div>
                  </div>
                  <div className="rctots">
                    <div className="rcstat" style={{textAlign:"center"}}>
                      <div className="v">{r.month}</div><div className="lbl">MAY</div>
                    </div>
                    <div className="rcstat" style={{textAlign:"center"}}>
                      <div className="v" style={{color:"var(--grn)"}}>{r.season}</div><div className="lbl">SEASON</div>
                    </div>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr auto auto auto",padding:"6px 16px 4px",borderBottom:"1px solid var(--bdr)"}}>
                  <span style={{fontSize:10,color:"var(--mut)",letterSpacing:1,textTransform:"uppercase"}}>Player</span>
                  <span style={{fontSize:10,color:"var(--mut)",textAlign:"right",minWidth:36}}>Cap</span>
                  <span style={{fontSize:10,color:"var(--mut)",textAlign:"right",minWidth:40,paddingLeft:10}}>May</span>
                  <span style={{fontSize:10,color:"var(--mut)",textAlign:"right",minWidth:44,paddingLeft:10}}>Season</span>
                </div>
                {r.players.map((p,i)=>(
                  <div className="rpr" key={i} style={p.swap?{opacity:.65,background:"rgba(74,158,255,.04)"}:{}}>
                    <div style={{flex:1,display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:13,fontWeight:p.swap?400:500}}>{p.name}</span>
                      {p.swap && <span className="swapb">SWAP</span>}
                    </div>
                    <span style={{fontSize:11,color:"var(--mut)",textAlign:"right",minWidth:36}}>{p.cap2025}</span>
                    <span style={{fontFamily:"var(--F)",fontSize:14,color:"var(--gold)",textAlign:"right",minWidth:40,paddingLeft:10}}>{p.month??'—'}</span>
                    <span style={{fontFamily:"var(--F)",fontSize:14,color:"var(--grn)",textAlign:"right",minWidth:44,paddingLeft:10}}>{p.season??'—'}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {sec==="leaders" && (
        <div className="card">
          <div className="chdr">⚾ 2026 MLB HR Leaders <span style={{marginLeft:"auto",fontSize:12,fontFamily:"var(--B)",color:"var(--mut)",fontWeight:400}}>Live from sheet</span></div>
          <table>
            <thead><tr><th style={{width:48}}>Rank</th><th>Player</th><th>Team</th><th className="r">HRs</th></tr></thead>
            <tbody>
              {hrLeaders.slice(0,40).map((p,i)=>(
                <tr key={i}>
                  <td><RB rank={p.rank}/></td>
                  <td style={{fontWeight:500}}>{p.name}</td>
                  <td><span className="ttag">{p.team}</span></td>
                  <td className="r"><span className="hn">{p.hr}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sec==="rules" && (
        <div className="card">
          <div className="chdr">📖 Rules & Payouts</div>
          <div style={{padding:20}}>
            <div className="rbox">
              {["Draft 7 players from the player pool. Combined 2025 HR total for all 7 players CANNOT exceed 156.",
                "Designate an 8th SWAP player at submission. This player can replace one roster player before the All-Star Game, provided the swap doesn't push your total over 156.",
                "Once a swap is made, no further changes are allowed. If no swap is used before the All-Star Game, your roster locks for the rest of the season.",
                "Scoring is cumulative season-long HRs. If you use the swap, HRs count from the original player up to the swap date, then the new player's HRs count forward.",
                "October regular season games count toward final totals. Play-in games do NOT count.",
                "No free agent moves, no IR moves — no changes beyond the one allowed swap.",
                "Monthly prizes for Top 2 teams each month (April–September). Monthly totals are NOT cumulative.",
                "End-of-year prizes for Top 3 teams based on cumulative season HRs."].map((rule,i)=>(
                <div className="ri" key={i}><span className="rn">{i+1}</span><span>{rule}</span></div>
              ))}
            </div>
            <div style={{marginTop:16,padding:16,background:"var(--bg)",borderRadius:6,border:"1px solid var(--bdr)"}}>
              <div style={{fontFamily:"var(--F)",fontSize:16,color:"var(--gold)",marginBottom:10,letterSpacing:1}}>PRIZE STRUCTURE</div>
              {[["Monthly (Apr–Sep)","1st: $75 · 2nd: $50"],["Overall Season","1st: $300 · 2nd: $175 · 3rd: $75"],["All-Star Break","Possible bonus for 1st and 2nd (pending entries)"],["Ties","Split evenly"]].map(([k,v],i)=>(
                <div className="ri" key={i}><span className="rn">★</span><span><strong style={{color:"var(--txt)"}}>{k}:</strong> {v}</span></div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── WORLD CUP ─────────────────────────────────────────────────────────────────
function WorldCup() {
  const [sec, setSec] = useState("groups");
  const ml = m => m===2?<span className="m2x">2× DOUBLE</span>:m===3?<span className="m3x">3× TRIPLE</span>:<span className="m1x">1×</span>;
  const gc = m => m===2?"g2x":m===3?"g3x":"g1x";
  return (
    <div>
      <div className="phdr">
        <div>
          <div className="ptitle">⚽ WORLD CUP POOL 2026</div>
          <div style={{fontSize:14,color:"var(--mut)",marginTop:4}}>Pick 1 team per Pool Group · 12 teams total</div>
        </div>
        <div className="pmeta">
          <div className="pill">Entry: <strong>$35</strong></div>
          <div className="pill">Picks: <strong>12 teams + Golden Boot</strong></div>
          <div className="dbadge">⏰ Due: Jun 11 · 2PM</div>
        </div>
      </div>
      <div className="stabs">
        {[{id:"groups",label:"🌍 Pool Groups"},{id:"scoring",label:"📊 Scoring"},{id:"rules",label:"📖 Rules"}].map(s=>(
          <button key={s.id} className={`stab ${sec===s.id?"on":""}`} onClick={()=>setSec(s.id)}>{s.label}</button>
        ))}
      </div>
      {sec==="groups" && (
        <div>
          <div style={{display:"flex",gap:16,marginBottom:16,flexWrap:"wrap"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:"var(--mut)"}}><span className="m1x">1×</span> Groups 1–5: Standard</div>
            <div style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:"var(--mut)"}}><span className="m2x">2× DOUBLE</span> Groups 6–9</div>
            <div style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:"var(--mut)"}}><span className="m3x">3× TRIPLE</span> Groups 10–12</div>
          </div>
          <div className="ggrid">
            {WC_GROUPS.map(g=>(
              <div key={g.group} className={`gcard ${gc(g.multiplier)}`}>
                <div className="gchdr"><span className="gname">Pool Group {g.group}</span>{ml(g.multiplier)}</div>
                {g.teams.map(t=><div className="grow" key={t}>{t}</div>)}
              </div>
            ))}
          </div>
        </div>
      )}
      {sec==="scoring" && (
        <div className="sgrid">
          <div className="card">
            <div className="chdr">📊 Base Scoring</div>
            {WC_SCORING.map((s,i)=>(
              <div className="srow" key={i}><span style={{fontSize:14,color:"#c5cde0"}}>{s.event}</span><span className="spts">{s.pts}</span></div>
            ))}
          </div>
          <div>
            <div className="card" style={{marginBottom:16}}>
              <div className="chdr">✖️ Multipliers</div>
              <div className="srow"><span style={{fontSize:14,color:"#c5cde0"}}>Groups 1–5</span><span className="m1x">1× standard</span></div>
              <div className="srow"><span style={{fontSize:14,color:"#c5cde0"}}>Groups 6–9</span><span className="m2x">2× DOUBLE</span></div>
              <div className="srow" style={{borderBottom:"none"}}><span style={{fontSize:14,color:"#c5cde0"}}>Groups 10–12</span><span className="m3x">3× TRIPLE</span></div>
            </div>
            <div className="card">
              <div className="chdr">🥇 Golden Boot Side Pool</div>
              <div style={{padding:"14px 16px"}}>
                {[["$5/entry","Goes into the Golden Boot pot for the tournament's top scorer."],["$30/entry","Goes to top 2-3 finishers in the main pool."],["Split","If multiple people pick correctly, the pot splits."],["Rollover","If no one picks correctly, rolls into the main prize pool."]].map(([k,v],i,a)=>(
                  <div className="ri" key={i} style={i===a.length-1?{borderBottom:"none"}:{}}>
                    <span className="rn" style={{minWidth:64,fontSize:12,fontWeight:700}}>{k}</span>
                    <span style={{fontSize:13,color:"#c5cde0"}}>{v}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      {sec==="rules" && (
        <div className="card">
          <div className="chdr">📖 Pool Rules</div>
          <div style={{padding:20}}>
            <div className="rbox">
              {["Each participant chooses 1 team from each of the 12 Pool Groups, giving you 12 teams total.",
                "Pool Groups are based on DraftKings odds and FIFA rankings as of 5/18/2026 — NOT the actual FIFA World Cup groups.",
                "Groups 6, 7, 8, and 9 earn DOUBLE points on all scoring events throughout the entire tournament.",
                "Groups 10, 11, and 12 earn TRIPLE points on all scoring events throughout the entire tournament.",
                "Also select one player you think will win the Golden Boot (most goals). This is the side pool.",
                "Picks are due before 2:00 PM on June 11, 2026. Entry fee is $35.",
                "Payouts: $30 of entry goes to top 2-3 finishers; $5 goes to the Golden Boot side pool winner(s).",
                "Email picks and payment to enter. A Google Sheet with rosters and scoring will be shared once the tournament begins.",
              ].map((rule,i)=>(
                <div className="ri" key={i}><span className="rn">{i+1}</span><span>{rule}</span></div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({ setTab, data, updatedAt }) {
  const { monthlyStandings, seasonStandings } = data;
  const sl = [...seasonStandings].sort((a,b)=>b.season-a.season)[0] || {};
  const ml = [...monthlyStandings].sort((a,b)=>b.month-a.month)[0] || {};
  return (
    <div>
      <div style={{marginBottom:28}}>
        <div style={{fontFamily:"var(--F)",fontSize:36,letterSpacing:3,marginBottom:6}}>ACTIVE POOLS</div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div className="updated"><span className="live-dot"/>Live data · Updated {updatedAt}</div>
        </div>
      </div>
      <div className="dgrid">
        <div className="dc" onClick={()=>setTab("hr")}>
          <div className="dctop">
            <div className="dico" style={{background:"rgba(245,200,66,.12)"}}>⚾</div>
            <div><div className="dctitle">Home Run Derby</div><div className="dcsub">2026 MLB Season · {seasonStandings.length} Teams</div></div>
            <span className="blive" style={{marginLeft:"auto"}}>LIVE</span>
          </div>
          <div className="dcbody">
            <div className="dsr"><span className="dsl">Season Leader</span><span className="dsv">{sl.name} ({sl.season} HR)</span></div>
            <div className="dsr"><span className="dsl">May Leader</span><span className="dsv">{ml.name} ({ml.month} HR)</span></div>
            <div className="dsr"><span className="dsl">Monthly Prize</span><span className="dsv">1st $75 · 2nd $50</span></div>
            <div className="dsr" style={{marginBottom:0}}><span className="dsl">Season Prize</span><span className="dsv">1st $300 · 2nd $175 · 3rd $75</span></div>
          </div>
          <button className="dcta">VIEW STANDINGS →</button>
        </div>
        <div className="dc" onClick={()=>setTab("wc")}>
          <div className="dctop">
            <div className="dico" style={{background:"rgba(61,214,140,.1)"}}>⚽</div>
            <div><div className="dctitle">World Cup Pool</div><div className="dcsub">FIFA World Cup 2026</div></div>
            <span className="bsoon" style={{marginLeft:"auto"}}>OPEN</span>
          </div>
          <div className="dcbody">
            <div className="dsr"><span className="dsl">Format</span><span className="dsv">12 picks (1 per Pool Group)</span></div>
            <div className="dsr"><span className="dsl">Entry</span><span className="dsv">$35</span></div>
            <div className="dsr"><span className="dsl">Picks Due</span><span className="dsv">Jun 11, 2026 · 2:00 PM</span></div>
            <div className="dsr" style={{marginBottom:0}}><span className="dsl">Side Pool</span><span className="dsv">Golden Boot ($5/entry)</span></div>
          </div>
          <button className="dcta">VIEW POOL →</button>
        </div>
      </div>
      <div className="card">
        <div className="chdr">🏆 HR Derby — Season Top 5</div>
        <table>
          <thead><tr><th>Rank</th><th>Team</th><th className="r">Season HRs</th><th className="r">May HRs</th></tr></thead>
          <tbody>
            {[...seasonStandings].sort((a,b)=>b.season-a.season).slice(0,5).map((s,i)=>{
              const m = monthlyStandings.find(x=>x.name===s.name);
              return (
                <tr key={s.name}>
                  <td><RB rank={i+1}/></td>
                  <td style={{fontWeight:500}}>{s.name}</td>
                  <td className="r"><span className="hn">{s.season}</span></td>
                  <td className="r"><span className="hns">{m?.month??'—'}</span></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="card">
        <div className="chdr">📅 Upcoming Deadlines</div>
        <table>
          <thead><tr><th>Pool</th><th>Deadline</th><th>Status</th><th>Entry</th></tr></thead>
          <tbody>
            <tr>
              <td style={{fontWeight:600}}>⚽ World Cup Pool 2026</td>
              <td>June 11, 2026 · 2:00 PM</td>
              <td><span className="bsoon">OPEN</span></td>
              <td>$35</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [data, setData] = useState(null);
  const [updatedAt, setUpdatedAt] = useState("");
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(CSV_URL)
      .then(r => r.text())
      .then(text => {
        setData(parseCSV(text));
        setUpdatedAt(new Date().toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"}));
      })
      .catch(() => setError("Could not load live data. Please refresh."));
  }, []);

  if (error) return (
    <>
      <style>{S}</style>
      <div className="loading"><div style={{fontSize:40}}>⚠️</div><div>{error}</div></div>
    </>
  );

  if (!data) return (
    <>
      <style>{S}</style>
      <div className="loading">
        <div className="spinner"/>
        <div style={{fontFamily:"var(--F)",fontSize:24,letterSpacing:2}}>LOADING LIVE DATA...</div>
        <div style={{fontSize:13}}>Fetching latest stats from Google Sheets</div>
      </div>
    </>
  );

  return (
    <>
      <style>{S}</style>
      <div>
        <header className="hdr">
          <div className="logo">WUG<span>DERBY</span>POOLS</span></div>
          <div style={{fontSize:13,color:"var(--mut)"}}>Fantasy Sports · 2026</div>
        </header>
        <nav className="nav">
          {[{id:"dashboard",label:"🏠 Dashboard"},{id:"hr",label:"⚾ HR Derby"},{id:"wc",label:"⚽ World Cup"}].map(t=>(
            <button key={t.id} className={`ntab ${tab===t.id?"on":""}`} onClick={()=>setTab(t.id)}>{t.label}</button>
          ))}
        </nav>
        <main className="main">
          {tab==="dashboard" && <Dashboard setTab={setTab} data={data} updatedAt={updatedAt}/>}
          {tab==="hr" && <HRDerby data={data}/>}
          {tab==="wc" && <WorldCup/>}
        </main>
      </div>
    </>
  );
}
