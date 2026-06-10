import { useState, useEffect } from "react";

const JUNE_CSV_URL  = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTtADRNEx9M4uGiDjqrSppUqUO-YUfDp8WcgRSLvWQUgg7zPcJMFocQ7CNa-ORol3-y4qjpb-f3GC5g/pub?gid=966793280&single=true&output=csv";
const MAY_CSV_URL   = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTtADRNEx9M4uGiDjqrSppUqUO-YUfDp8WcgRSLvWQUgg7zPcJMFocQ7CNa-ORol3-y4qjpb-f3GC5g/pub?gid=2102778375&single=true&output=csv";
const APRIL_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTtADRNEx9M4uGiDjqrSppUqUO-YUfDp8WcgRSLvWQUgg7zPcJMFocQ7CNa-ORol3-y4qjpb-f3GC5g/pub?gid=172900262&single=true&output=csv";
const SUBMIT_URL   = "https://script.google.com/macros/s/AKfycbwNOAIXeCzELix1DTOBKYuZ33i2aABv0SObw3l05bBjPFBpkBEWz19XM6Cnzozh0eN19Q/exec";
const DEADLINE     = new Date("2026-06-11T15:00:00");

// ── GOLDEN BOOT PLAYERS (from RotoWire odds, ordered by favorites) ─────────────
const GOLDEN_BOOT_PLAYERS = [
  "Kylian Mbappé",
  "Harry Kane",
  "Lionel Messi",
  "Erling Haaland",
  "Lamine Yamal",
  "Mikel Oyarzabal",
  "Cristiano Ronaldo",
  "Vinicius Junior",
  "Lautaro Martinez",
  "Ousmane Dembele",
  "Romelu Lukaku",
  "Raphinha",
  "Nick Woltemade",
  "Julian Alvarez",
  "Alvaro Morata",
  "Richarlison",
  "Joao Pedro",
  "Cody Gakpo",
  "Bukayo Saka",
  "Memphis Depay",
  "Ferran Torres",
  "Mikel Merino",
  "Igor Thiago",
  "Jean-Philippe Mateta",
  "Jude Bellingham",
  "Goncalo Ramos",
  "Florian Wirtz",
  "Marcus Thuram",
  "Neymar",
  "Bruno Fernandes",
  "Luis Diaz",
  "Desire Doue",
  "Mohamed Salah",
  "Kai Havertz",
  "Dani Olmo",
  "Deniz Undav",
  "Viktor Gyokeres",
  "Enner Valencia",
  "Donyell Malen",
  "Morgan Rogers",
  "Santiago Gimenez",
  "Darwin Nunez",
  "Eberechi Eze",
  "Lois Openda",
  "Jamal Musiala",
  "Leandro Trossard",
  "Marcus Rashford",
  "Matheus Cunha",
  "Alexander Sorloth",
  "Alexander Isak",
  "Folarin Balogun",
  "Kevin De Bruyne",
  "Christian Pulisic",
  "Anthony Gordon",
  "Rafael Leao",
  "Jeremy Doku",
  "Sadio Mane",
  "Leroy Sane",
  "Jhon Duran",
  "Raul Jimenez",
  "Ante Budimir",
  "Brian Brobbey",
  "Christoph Baumgartner",
  "Ollie Watkins",
  "Omar Marmoush",
  "Arda Guler",
  "Mohammed Kudus",
  "Nicolas Jackson",
  "Jonathan David",
  "Kenan Yildiz",
  "Pedro Neto",
  "Haji Wright",
  "Nico Williams",
  "Ricardo Pepi",
  "Scott McTominay",
  "Bradley Barcola",
  "Casemiro",
  "Charles De Ketelaere",
  "Gabriel Martinelli",
  "Rayan Cherki",
  "Breel Embolo",
  "Ismaila Sarr",
  "Hamza Igamane",
  "Noa Lang",
  "Hirving Lozano",
  "Lee Kang-In",
  "Enzo Fernandez",
  "Jorgen Strand Larsen",
  "Riyad Mahrez",
  "James Rodriguez",
  "Brahim Diaz",
  "Andrej Kramaric",
  "Jhon Arias",
  "Ange-Yoan Bonny",
  "Ivan Toney",
  "Julian Quinones",
  "Pedri",
  "Che Adams",
  "Chris Wood",
  "Oscar Bobb",
  "Cyle Larin",
  "Martin Odegaard",
  "Daizen Maeda",
  "Amad Diallo",
  "Denzel Dumfries",
  "Ermedin Demirovic",
  "Lawrence Shankland",
  "Lucas Paqueta",
  "Nicolas Pepe",
  "Noah Okafor",
  "Zeki Amdouni",
  "Giovanni Reyna",
  "Julio Enciso",
  "Achraf Hakimi",
  "Anthony Elanga",
  "Cedric Bakambu",
  "Dan Ndoye",
  "Marcel Sabitzer",
  "Yoane Wissa",
  "Brenden Aaronson",
  "John McGinn",
  "Lyle Foster",
];

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

  const playerHR = {};
  for (const row of rows) {
    const nameCell = row[35] || "", hrCell = row[36] || "";
    if (nameCell && hrCell !== "" && nameCell !== "Player Name") playerHR[nameCell.trim()] = parseInt(hrCell) || 0;
    const ranked = row[28] || "", rankedHR = row[29] || "";
    if (ranked && rankedHR !== "" && /^\d+\./.test(ranked)) {
      const m = ranked.match(/^\d+\.\s+(.+?)\s+\([A-Z]+\)$/);
      if (m) playerHR[m[1].trim()] = parseInt(rankedHR) || 0;
    }
  }

  const monthlyStandings = [];
  for (let i = 0; i < 30; i++) {
    const r = rows[i];
    if (r && r[0] && !isNaN(parseInt(r[0])) && r[1] && r[1] !== "Overall Standings")
      monthlyStandings.push({ rank: parseInt(r[0]), name: r[1], month: parseInt(r[2]) || 0, season: parseInt(r[3]) || 0 });
  }

  const seasonStandings = [];
  let inSeason = false;
  for (const r of rows) {
    if (r[1] === "Overall Standings") { inSeason = true; continue; }
    if (inSeason && r[0] && !isNaN(parseInt(r[0])) && r[1] && r[2])
      seasonStandings.push({ rank: parseInt(r[0]), name: r[1], season: parseInt(r[2]) || 0 });
  }

  const SKIP = new Set(["2025","Total HRs","May","April","June","July","August","September","Season","Player",
    "Monthly Winners","Overall Season Winners","1st - $75","2nd - $50","1st - $300","2nd - $175","3rd - $75",
    "Overall Standings","Standings","Home Run Totals","Player Name","Rank",""]);
  const colGroups = [[6,7,8,9],[11,12,13,14],[16,17,18,19],[21,22,23,24]];
  const rosters = {}; const currentTeams = [null,null,null,null];
  for (const row of rows) {
    for (let gi = 0; gi < colGroups.length; gi++) {
      const [c0,c1,c2,c3] = colGroups[gi];
      const v0=row[c0]||"",v1=row[c1]||"",v2=row[c2]||"",v3=row[c3]||"";
      if (v0 && !SKIP.has(v0) && isNaN(parseInt(v0)) && !v1) {
        currentTeams[gi]=v0;
        if (!rosters[v0]) rosters[v0]={players:[],cap:null,month:0,season:0};
      } else if (!isNaN(parseInt(v0)) && v1 && !SKIP.has(v1)) {
        const team=currentTeams[gi];
        if (team && rosters[team]) {
          const mhr=v2!==""?parseInt(v2):null,shr=v3!==""?parseInt(v3):null;
          rosters[team].players.push({name:v1.trim(),cap2025:parseInt(v0),month:mhr,season:shr,current:playerHR[v1.trim()]??null,swap:mhr===null&&shr===null});
        }
      } else if (v1==="Total HRs" && !isNaN(parseInt(v0))) {
        const team=currentTeams[gi];
        if (team&&rosters[team]){rosters[team].cap=parseInt(v0);rosters[team].month=parseInt(v2)||0;rosters[team].season=parseInt(v3)||0;}
      }
    }
  }

  const hrLeaders = [];
  for (const row of rows) {
    const cell=row[28]||"",hr=row[29]||"";
    if (cell&&hr!==""&&/^\d+\./.test(cell)){const m=cell.match(/^(\d+)\.\s+(.+?)\s+\(([A-Z]+)\)$/);if(m)hrLeaders.push({rank:parseInt(m[1]),name:m[2].trim(),team:m[3],hr:parseInt(hr)||0});}
  }

  return { monthlyStandings, seasonStandings, rosters: Object.entries(rosters).map(([teamName,d])=>({teamName,...d})), hrLeaders };
}

// ── STATIC DATA ───────────────────────────────────────────────────────────────
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
:root{--bg:#000000;--sur:#0a1a1a;--sur2:#0f2424;--bdr:#1a3a3a;--gold:#00c4b4;--gold2:#00a89a;--red:#e84545;--grn:#00e5d4;--blu:#00c4b4;--txt:#ffffff;--mut:#5fa89e;--F:'Bebas Neue',sans-serif;--B:'DM Sans',sans-serif}
body{background:#000000;color:#ffffff;font-family:var(--B);min-height:100vh}
.hdr{background:#000000;border-bottom:2px solid #ffffff;padding:0 24px;position:sticky;top:0;z-index:100;display:flex;align-items:center;justify-content:space-between;height:64px}
.logo{font-family:var(--F);font-size:28px;letter-spacing:2px;color:#00c4b4;cursor:pointer}
.logo span{color:#ffffff;}
.nav{display:flex;gap:4px;padding:16px 24px 0;border-bottom:2px solid #ffffff;background:#000000;overflow-x:auto}
.ntab{padding:10px 20px 12px;border:none;background:transparent;color:#5fa89e;font-family:var(--F);font-size:18px;letter-spacing:1px;cursor:pointer;border-bottom:3px solid transparent;margin-bottom:-2px;transition:all .2s;white-space:nowrap}
.ntab:hover{color:#ffffff;}.ntab.on{color:#00c4b4;border-bottom-color:#ffffff;}
.main{padding:24px;max-width:1200px;margin:0 auto}
.phdr{background:#000000;border:1px solid #ffffff;border-left:6px solid #00c4b4;border-radius:8px;padding:20px 24px;margin-bottom:24px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:12px}
.ptitle{font-family:var(--F);font-size:32px;letter-spacing:2px;color:#00c4b4}
.pmeta{display:flex;gap:12px;flex-wrap:wrap;align-items:center}
.pill{background:#000000;border:1px solid #ffffff;border-radius:20px;padding:4px 14px;font-size:13px;color:#5fa89e}.pill strong{color:#ffffff}
.stabs{display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap}
.stab{padding:8px 18px;border:1px solid #ffffff;border-radius:4px;background:#0a1a1a;color:#5fa89e;font-size:14px;font-weight:500;cursor:pointer;transition:all .15s}
.stab:hover{border-color:#00c4b4;color:#ffffff}.stab.on{background:#00c4b4;color:#000;border-color:#00c4b4;font-weight:600}
.card{background:#0a1a1a;border:1px solid #ffffff;border-radius:8px;overflow:hidden;margin-bottom:20px}
.chdr{padding:14px 20px;border-bottom:2px solid #ffffff;font-family:var(--F);font-size:20px;letter-spacing:1px;color:#00c4b4;display:flex;align-items:center;gap:10px}
table{width:100%;border-collapse:collapse}
th{background:#000000;padding:10px 16px;text-align:left;font-size:11px;font-weight:600;letter-spacing:1.5px;text-transform:uppercase;color:#5fa89e;border-bottom:2px solid #ffffff}
td{padding:10px 16px;border-bottom:1px solid #1a3a3a;font-size:14px}
tr:last-child td{border-bottom:none}tr:hover td{background:rgba(0,196,180,.06)}
th.r,td.r{text-align:right}
.rbadge{display:inline-flex;align-items:center;justify-content:center;width:28px;height:28px;border-radius:50%;font-size:12px;font-weight:700;background:#0f2424;color:#5fa89e}
.r1{background:#00c4b4;color:#000000}.r2{background:#b0b8cc;color:#000000}.r3{background:#cd7f32;color:#fff}
.ttag{display:inline-block;padding:2px 8px;border-radius:3px;font-size:11px;font-weight:700;background:#0f2424;color:#00c4b4;letter-spacing:.5px}
.hn{font-family:var(--F);font-size:20px;color:#00c4b4}
.hns{font-family:var(--F);font-size:16px;color:#ffffff}
.srch{display:flex;align-items:center;gap:12px;margin-bottom:16px;flex-wrap:wrap}
input.si{flex:1;min-width:200px;background:#000000;border:1px solid #ffffff;border-radius:6px;padding:9px 14px;color:#ffffff;font-family:var(--B);font-size:14px;outline:none;transition:border-color .15s}
input.si:focus{border-color:#00c4b4}input.si::placeholder{color:#5fa89e}
.m1x{color:#5fa89e;font-size:12px;font-weight:600}
.m2x{color:#00c4b4;font-size:12px;font-weight:700;background:rgba(0,196,180,.1);padding:2px 7px;border-radius:3px}
.m3x{color:#e84545;font-size:12px;font-weight:700;background:rgba(232,69,69,.1);padding:2px 7px;border-radius:3px}
.ggrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:16px}
.gcard{background:#0a1a1a;border:1px solid #ffffff;border-radius:8px;overflow:hidden}
.gchdr{padding:10px 16px;display:flex;align-items:center;justify-content:space-between}
.g1x .gchdr{background:rgba(0,196,180,.08);border-bottom:1px solid rgba(245,200,66,.2)}
.g2x .gchdr{background:rgba(0,196,180,.1);border-bottom:1px solid rgba(74,158,255,.2)}
.g3x .gchdr{background:rgba(232,69,69,.1);border-bottom:1px solid rgba(232,69,69,.2)}
.gname{font-family:var(--F);font-size:18px;letter-spacing:1px}
.g1x .gname{color:#00c4b4}.g2x .gname{color:#00c4b4}.g3x .gname{color:#e84545}
.grow{padding:8px 16px;font-size:14px;border-bottom:1px solid #1a3a3a}.grow:last-child{border-bottom:none}
.srow{display:flex;justify-content:space-between;align-items:center;padding:10px 16px;border-bottom:1px solid #1a3a3a}.srow:last-child{border-bottom:none}
.spts{font-family:var(--F);font-size:22px;color:#00c4b4}
.sgrid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
@media(max-width:640px){.sgrid{grid-template-columns:1fr}}
.rbox{background:#000000;border:1px solid #ffffff;border-radius:6px;padding:20px}
.ri{display:flex;gap:12px;padding:10px 0;border-bottom:1px solid #1a3a3a;font-size:14px;line-height:1.6;color:#c5cde0}.ri:last-child{border-bottom:none}
.rn{color:#00c4b4;font-family:var(--F);font-size:18px;min-width:24px}
.dgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:20px;margin-bottom:28px}
.dc{background:#0a1a1a;border:1px solid #ffffff;border-radius:10px;overflow:hidden;cursor:pointer;transition:transform .15s,border-color .15s}
.dc:hover{transform:translateY(-2px);border-color:#00c4b4}
.dctop{padding:20px;border-bottom:2px solid #ffffff;display:flex;align-items:center;gap:16px}
.dico{width:52px;height:52px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:26px}
.dctitle{font-family:var(--F);font-size:22px;letter-spacing:1px}.dcsub{font-size:13px;color:#5fa89e;margin-top:2px}
.dcbody{padding:16px 20px}
.dsr{display:flex;justify-content:space-between;margin-bottom:8px;font-size:13px}
.dsl{color:#5fa89e}.dsv{font-weight:600;color:#ffffff}
.dcta{display:block;text-align:center;padding:10px;background:#00c4b4;color:#000;font-weight:700;border:none;cursor:pointer;width:100%;font-family:var(--F);font-size:16px;letter-spacing:1px;transition:background .15s}
.dcta:hover{background:#00a89a}
.dbadge{display:inline-flex;align-items:center;gap:6px;background:rgba(232,69,69,.12);border:1px solid rgba(232,69,69,.3);color:#e84545;border-radius:4px;padding:4px 10px;font-size:12px;font-weight:600}
.blive{background:rgba(0,229,212,.15);color:#00e5d4;border:1px solid #00e5d4;border-radius:4px;padding:2px 8px;font-size:11px;font-weight:700;letter-spacing:1px}
.bsoon{background:rgba(0,196,180,.15);color:#00c4b4;border:1px solid #00c4b4;border-radius:4px;padding:2px 8px;font-size:11px;font-weight:700;letter-spacing:1px}
.swapb{font-size:10px;background:rgba(74,158,255,.15);color:#00c4b4;border:1px solid rgba(74,158,255,.3);border-radius:3px;padding:1px 5px;margin-left:6px;font-weight:700}
.lbar{height:4px;background:var(--bdr);border-radius:2px;margin-top:4px;overflow:hidden}
.lfill{height:100%;border-radius:2px;background:#00c4b4}
.rgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(320px,1fr));gap:16px}
.rc{background:#0a1a1a;border:1px solid #ffffff;border-radius:8px;overflow:hidden}
.rchdr{padding:12px 16px;background:#000000;border-bottom:2px solid #ffffff;display:flex;align-items:center;justify-content:space-between}
.rcname{font-family:var(--F);font-size:16px;letter-spacing:1px}
.rctots{display:flex;gap:12px}
.rcstat .v{font-family:var(--F);font-size:18px;color:#00c4b4}
.rcstat .lbl{font-size:10px;color:#5fa89e;letter-spacing:1px;text-transform:uppercase}
.rpr{padding:8px 16px;display:flex;align-items:center;justify-content:space-between;border-bottom:1px solid #1a3a3a;font-size:13px}.rpr:last-child{border-bottom:none}
.tabs2{display:flex;background:#000000;border:1px solid #ffffff;border-radius:6px;overflow:hidden;margin-bottom:16px;width:fit-content;flex-wrap:wrap}
.t2{padding:8px 18px;font-size:13px;font-weight:600;cursor:pointer;border:none;background:transparent;color:#5fa89e;transition:all .15s;letter-spacing:.5px}
.t2.on{background:#00c4b4;color:#000000}
.podium{display:flex;gap:12px;margin-bottom:20px}
.pod{flex:1;background:#0a1a1a;border:1px solid #ffffff;border-radius:8px;padding:16px;text-align:center}
.pod.p1{border-color:#00c4b4;background:rgba(0,196,180,.08)}.pod.p2{border-color:#b0b8cc}.pod.p3{border-color:#cd7f32}
.pos{font-family:var(--F);font-size:32px}
.p1 .pos{color:#00c4b4}.p2 .pos{color:#b0b8cc}.p3 .pos{color:#cd7f32}
.pteam{font-weight:600;font-size:14px;margin:4px 0 2px}.phr{font-family:var(--F);font-size:24px;color:#ffffff}.plbl{font-size:11px;color:#5fa89e;letter-spacing:1px}
@media(max-width:500px){.podium{flex-direction:column}}
.loading{display:flex;flex-direction:column;align-items:center;justify-content:center;height:60vh;gap:16px;color:#5fa89e}
.spinner{width:48px;height:48px;border:4px solid var(--bdr);border-top-color:#00c4b4;border-radius:50%;animation:spin 0.8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.live-dot{display:inline-block;width:8px;height:8px;border-radius:50%;background:#00e5d4;margin-right:6px;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
.updated{font-size:12px;color:#5fa89e;display:flex;align-items:center}
.month-badge{display:inline-block;padding:2px 10px;border-radius:12px;font-size:11px;font-weight:700;letter-spacing:1px;margin-left:8px}
.month-current{background:rgba(0,229,212,.15);color:#00e5d4;border:1px solid #00e5d4}
.month-past{background:#0f2424;color:#5fa89e;border:1px solid #ffffff}
/* ENTRY FORM */
.entry-form{max-width:800px;margin:0 auto}
.form-section{background:#0a1a1a;border:1px solid #ffffff;border-radius:8px;margin-bottom:20px;overflow:hidden}
.form-section-hdr{padding:14px 20px;background:#000000;border-bottom:2px solid #ffffff;font-family:var(--F);font-size:18px;letter-spacing:1px;display:flex;align-items:center;justify-content:space-between}
.form-section-hdr .num{color:#00c4b4}
.form-group{padding:16px 20px;border-bottom:1px solid #1a3a3a}.form-group:last-child{border-bottom:none}
.form-label{font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#5fa89e;margin-bottom:8px;display:block}
.form-input{width:100%;background:#000000;border:1px solid #ffffff;border-radius:6px;padding:10px 14px;color:#ffffff;font-family:var(--B);font-size:14px;outline:none;transition:border-color .15s}
.form-input:focus{border-color:#00c4b4}.form-input::placeholder{color:#5fa89e}
.team-select-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px;padding:4px 0}
.team-btn{padding:9px 12px;border:1px solid #ffffff;border-radius:6px;background:#000000;color:#ffffff;font-family:var(--B);font-size:13px;cursor:pointer;transition:all .15s;text-align:left}
.team-btn:hover{border-color:#00c4b4;color:#00c4b4}
.team-btn.sel-1x{border-color:#00c4b4;background:rgba(0,196,180,.12);color:#00c4b4;font-weight:600}
.team-btn.sel-2x{border-color:#00c4b4;background:rgba(74,158,255,.12);color:#00c4b4;font-weight:600}
.team-btn.sel-3x{border-color:#e84545;background:rgba(232,69,69,.12);color:#e84545;font-weight:600}
.group-pick-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.group-pick-label{font-family:var(--F);font-size:16px;letter-spacing:1px}
.pick-check{width:22px;height:22px;border-radius:50%;border:2px solid #ffffff;display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0}
.pick-check.done{background:#00e5d4;border-color:#00e5d4;color:#000000}
.progress-bar-wrap{margin-bottom:20px}
.progress-bar{height:6px;background:var(--bdr);border-radius:3px;overflow:hidden}
.progress-fill{height:100%;background:linear-gradient(90deg,var(--gold),var(--grn));border-radius:3px;transition:width .3s}
.progress-label{display:flex;justify-content:space-between;font-size:12px;color:#5fa89e;margin-bottom:6px}
.submit-btn{width:100%;padding:16px;background:#00c4b4;color:#000;border:none;border-radius:8px;font-family:var(--F);font-size:24px;letter-spacing:2px;cursor:pointer;transition:all .2s;margin-top:8px}
.submit-btn:hover:not(:disabled){background:#00a89a;transform:translateY(-1px)}
.submit-btn:disabled{opacity:.5;cursor:not-allowed}
.success-screen{text-align:center;padding:60px 24px;max-width:600px;margin:0 auto}
.success-icon{font-size:72px;margin-bottom:20px}
.success-title{font-family:var(--F);font-size:48px;letter-spacing:3px;color:#00e5d4;margin-bottom:12px}
.success-sub{color:#5fa89e;font-size:16px;line-height:1.6;margin-bottom:32px}
.picks-summary{background:#0a1a1a;border:1px solid #ffffff;border-radius:8px;padding:20px;text-align:left;margin-bottom:24px}
.picks-summary-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #1a3a3a;font-size:14px}.picks-summary-row:last-child{border-bottom:none}
.picks-summary-label{color:#5fa89e}.picks-summary-value{font-weight:600;color:#ffffff}
.deadline-banner{background:rgba(232,69,69,.1);border:1px solid rgba(232,69,69,.3);border-radius:8px;padding:20px 24px;margin-bottom:24px;display:flex;align-items:center;gap:16px}
.deadline-banner-icon{font-size:32px}
.deadline-banner-title{font-family:var(--F);font-size:20px;color:#e84545;letter-spacing:1px}
.deadline-banner-sub{font-size:13px;color:#5fa89e;margin-top:2px}
.gb-select{width:100%;background:#000000;border:1px solid #ffffff;border-radius:6px;padding:10px 14px;color:#ffffff;font-family:var(--B);font-size:14px;outline:none;cursor:pointer}
.gb-select:focus{border-color:#00c4b4}
.error-msg{background:rgba(232,69,69,.1);border:1px solid rgba(232,69,69,.3);color:#e84545;border-radius:6px;padding:12px 16px;font-size:14px;margin-bottom:16px}
`;

function RB({rank}) {
  return <span className={`rbadge ${rank===1?'r1':rank===2?'r2':rank===3?'r3':''}`}>{rank}</span>;
}

// ── WORLD CUP ENTRY FORM ──────────────────────────────────────────────────────
function WCEntryForm() {
  const isOpen = new Date() < DEADLINE;

  // Step 1: email lookup. Step 2: choose entry. Step 3: fill form.
  const [step, setStep] = useState("lookup"); // "lookup" | "choose" | "form"
  const [lookupEmail, setLookupEmail] = useState("");
  const [lookupName, setLookupName] = useState("");
  const [lookupLoading, setLookupLoading] = useState(false);
  const [lookupError, setLookupError] = useState("");
  const [existingEntries, setExistingEntries] = useState([]);
  const [entryNumber, setEntryNumber] = useState(1);
  const [isEditing, setIsEditing] = useState(false);

  const [picks, setPicks] = useState({});
  const [goldenBoot, setGoldenBoot] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const totalGroups = WC_GROUPS.length;
  const pickedCount = Object.keys(picks).length;
  const allPicked = pickedCount === totalGroups;
  const canSubmit = allPicked && goldenBoot && !submitting;
  const getMult = m => m===2?"2x":m===3?"3x":"1x";

  const entryFromRow = (entry) => {
    const p = {};
    for (let i = 1; i <= 12; i++) p[`group${i}`] = entry[`group${i}`] || "";
    return p;
  };

  // Step 1: look up email
  const handleLookup = async () => {
    setLookupError("");
    if (!lookupName.trim()) { setLookupError("Please enter your name."); return; }
    if (!lookupEmail.trim() || !lookupEmail.includes("@")) { setLookupError("Please enter a valid email."); return; }
    setLookupLoading(true);
    try {
      const res = await fetch(SUBMIT_URL + "?email=" + encodeURIComponent(lookupEmail.trim()));
      const data = await res.json();
      const entries = data.submissions || [];
      setExistingEntries(entries);
      if (entries.length === 0) {
        // No existing entries — go straight to new form
        setEntryNumber(1);
        setIsEditing(false);
        setPicks({});
        setGoldenBoot("");
        setStep("form");
      } else if (entries.length === 1) {
        // One entry — ask if they want to edit or add new
        setStep("choose");
      } else {
        // Two entries — must edit one
        setStep("choose");
      }
    } catch { setLookupError("Could not check your entries. Please try again."); }
    setLookupLoading(false);
  };

  const handleChooseEdit = (entry) => {
    setEntryNumber(entry.entryNumber || 1);
    setIsEditing(true);
    setPicks(entryFromRow(entry));
    setGoldenBoot(entry.goldenBoot || "");
    setStep("form");
  };

  const handleChooseNew = () => {
    setEntryNumber(2);
    setIsEditing(false);
    setPicks({});
    setGoldenBoot("");
    setStep("form");
  };

  const handleSubmit = async () => {
    setError("");
    if (!allPicked) { setError("Please pick one team from every group."); return; }
    if (!goldenBoot) { setError("Please select a Golden Boot pick."); return; }
    setSubmitting(true);
    try {
      const payload = {
        name: lookupName.trim(),
        email: lookupEmail.trim(),
        goldenBoot,
        entryNumber,
        ...picks
      };
      await fetch(SUBMIT_URL, {
        method: "POST",
        mode: "no-cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      setSubmitted(true);
    } catch { setError("Something went wrong. Please try again."); }
    setSubmitting(false);
  };

  const resetAll = () => {
    setStep("lookup");
    setLookupEmail("");
    setLookupName("");
    setExistingEntries([]);
    setPicks({});
    setGoldenBoot("");
    setSubmitted(false);
    setError("");
    setIsEditing(false);
  };

  // ── CLOSED ────────────────────────────────────────────────────────────────
  if (!isOpen) return (
    <div style={{textAlign:"center",padding:"60px 24px"}}>
      <div style={{fontSize:64,marginBottom:16}}>🔒</div>
      <div style={{fontFamily:"var(--F)",fontSize:36,letterSpacing:2,color:"#e84545",marginBottom:12}}>SUBMISSIONS CLOSED</div>
      <div style={{color:"#5fa89e",fontSize:16}}>The deadline for World Cup picks has passed.</div>
    </div>
  );

  // ── SUCCESS ───────────────────────────────────────────────────────────────
  if (submitted) return (
    <div className="success-screen">
      <div className="success-icon">{isEditing ? "✏️" : "🎉"}</div>
      <div className="success-title">{isEditing ? "PICKS UPDATED!" : "YOU'RE IN!"}</div>
      <div className="success-sub">
        {isEditing
          ? `Entry ${entryNumber} has been updated successfully, ${lookupName.split(" ")[0]}! Your new picks are locked in below.`
          : `Your picks have been submitted. Good luck ${lookupName.split(" ")[0]}! Check back once the tournament starts.`}
        {!isEditing && existingEntries.length === 0 && (
          <><br/><br/><span style={{color:"#00c4b4"}}>You may submit 1 more entry if you'd like a second lineup.</span></>
        )}
      </div>
      <div className="picks-summary">
        <div style={{fontFamily:"var(--F)",fontSize:16,letterSpacing:1,color:"#00c4b4",marginBottom:12}}>
          {isEditing ? `UPDATED ENTRY ${entryNumber} PICKS` : "YOUR PICKS"}
        </div>
        {WC_GROUPS.map(g=>(
          <div className="picks-summary-row" key={g.group}>
            <span className="picks-summary-label">Group {g.group}{g.multiplier>1?` (${g.multiplier}×)`:""}</span>
            <span className="picks-summary-value">{picks[`group${g.group}`]}</span>
          </div>
        ))}
        <div className="picks-summary-row">
          <span className="picks-summary-label">🥇 Golden Boot</span>
          <span className="picks-summary-value">{goldenBoot}</span>
        </div>
      </div>
      <button className="submit-btn" onClick={resetAll}>
        {existingEntries.length < 1 ? "SUBMIT ANOTHER ENTRY" : "BACK TO MY ENTRIES"}
      </button>
    </div>
  );

  // ── STEP 1: LOOKUP ────────────────────────────────────────────────────────
  if (step === "lookup") return (
    <div className="entry-form">
      <div className="deadline-banner">
        <div className="deadline-banner-icon">⏰</div>
        <div>
          <div className="deadline-banner-title">PICKS DUE JUNE 11 · 2:00 PM</div>
          <div className="deadline-banner-sub">Entry fee: $35 · 12 team picks + Golden Boot · Max 2 entries per person</div>
        </div>
      </div>
      <div className="form-section">
        <div className="form-section-hdr"><span><span className="num">01 · </span>GET STARTED</span></div>
        <div className="form-group">
          <label className="form-label">Your Name</label>
          <input className="form-input" placeholder="First and last name" value={lookupName} onChange={e=>setLookupName(e.target.value)}/>
        </div>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <div style={{fontSize:12,color:"#5fa89e",marginBottom:8}}>We'll use this to look up any existing entries so you can edit them.</div>
          <input className="form-input" type="email" placeholder="your@email.com" value={lookupEmail} onChange={e=>setLookupEmail(e.target.value)}
            onKeyDown={e=>e.key==="Enter"&&handleLookup()}/>
        </div>
        {lookupError && <div className="error-msg" style={{margin:"0 20px 16px"}}>⚠️ {lookupError}</div>}
        <div style={{padding:"16px 20px"}}>
          <button className="submit-btn" onClick={handleLookup} disabled={lookupLoading}>
            {lookupLoading ? "CHECKING..." : "CONTINUE →"}
          </button>
        </div>
      </div>
      <div style={{padding:"16px 20px",background:"#000",border:"2px solid #ffffff",borderRadius:8,fontSize:13,color:"#5fa89e",lineHeight:1.7}}>
        By submitting you agree to pay the <strong style={{color:"#ffffff"}}>$35 entry fee</strong>. Payment can be sent through Zelle to <strong style={{color:"#00c4b4"}}>scott.wbeverly@gmail.com</strong> or contact that email with any questions. Once the tournament starts, pool entries will be announced on this site, along with an email to the group. Thanks for joining and good luck!
      </div>
    </div>
  );

  // ── STEP 2: CHOOSE ENTRY ──────────────────────────────────────────────────
  if (step === "choose") return (
    <div className="entry-form">
      <div className="form-section">
        <div className="form-section-hdr">
          <span><span className="num">✓ </span>FOUND YOUR {existingEntries.length === 1 ? "ENTRY" : "ENTRIES"}</span>
        </div>
        <div style={{padding:"20px"}}>
          <div style={{fontSize:14,color:"#5fa89e",marginBottom:20}}>
            Hi <strong style={{color:"#ffffff"}}>{lookupName.split(" ")[0]}</strong>! We found {existingEntries.length} existing {existingEntries.length===1?"entry":"entries"} for <strong style={{color:"#00c4b4"}}>{lookupEmail}</strong>. What would you like to do?
          </div>
          {existingEntries.map((entry, i) => (
            <div key={i} style={{background:"#0a1a1a",border:"1px solid #ffffff",borderRadius:8,padding:16,marginBottom:12}}>
              <div style={{fontFamily:"var(--F)",fontSize:18,letterSpacing:1,color:"#00c4b4",marginBottom:10}}>
                ENTRY {entry.entryNumber || i+1}
                <span style={{fontSize:11,color:"#5fa89e",fontFamily:"var(--B)",fontWeight:400,marginLeft:10,letterSpacing:0}}>
                  Last updated {new Date(entry.lastUpdated||entry.timestamp).toLocaleDateString()}
                </span>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"4px 16px",marginBottom:14}}>
                {WC_GROUPS.map(g=>(
                  <div key={g.group} style={{fontSize:12,display:"flex",justifyContent:"space-between",padding:"3px 0",borderBottom:"1px solid #1a3a3a"}}>
                    <span style={{color:"#5fa89e"}}>Group {g.group}{g.multiplier>1?` (${g.multiplier}×)`:""}</span>
                    <span style={{color:"#ffffff",fontWeight:600}}>{entry[`group${g.group}`]||"—"}</span>
                  </div>
                ))}
              </div>
              <div style={{fontSize:12,display:"flex",justifyContent:"space-between",padding:"6px 0",marginBottom:14,borderBottom:"1px solid #1a3a3a"}}>
                <span style={{color:"#5fa89e"}}>🥇 Golden Boot</span>
                <span style={{color:"#ffffff",fontWeight:600}}>{entry.goldenBoot||"—"}</span>
              </div>
              <button className="submit-btn" style={{fontSize:16,padding:12}} onClick={()=>handleChooseEdit(entry)}>
                ✏️ EDIT THIS ENTRY
              </button>
            </div>
          ))}
          {existingEntries.length < 2 && (
            <div style={{marginTop:8}}>
              <button className="submit-btn" style={{background:"#0a1a1a",color:"#00c4b4",border:"2px solid #00c4b4",fontSize:16,padding:12}} onClick={handleChooseNew}>
                + SUBMIT A SECOND ENTRY
              </button>
            </div>
          )}
          <div style={{marginTop:12,textAlign:"center"}}>
            <button onClick={resetAll} style={{background:"transparent",border:"none",color:"#5fa89e",cursor:"pointer",fontSize:13,textDecoration:"underline"}}>
              ← Use a different email
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // ── STEP 3: FORM ──────────────────────────────────────────────────────────
  return (
    <div className="entry-form">
      <div style={{background:"#0a1a1a",border:"2px solid #00c4b4",borderRadius:8,padding:"14px 20px",marginBottom:20,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}>
        <div>
          <div style={{fontFamily:"var(--F)",fontSize:18,letterSpacing:1,color:"#00c4b4"}}>
            {isEditing ? `✏️ EDITING ENTRY ${entryNumber}` : "📝 NEW ENTRY"}
          </div>
          <div style={{fontSize:12,color:"#5fa89e",marginTop:2}}>{lookupName} · {lookupEmail}</div>
        </div>
        <button onClick={()=>setStep(existingEntries.length>0?"choose":"lookup")} style={{background:"transparent",border:"1px solid #5fa89e",borderRadius:4,color:"#5fa89e",cursor:"pointer",fontSize:12,padding:"4px 12px"}}>
          ← Back
        </button>
      </div>

      <div className="progress-bar-wrap">
        <div className="progress-label">
          <span>Groups picked: {pickedCount} / {totalGroups}</span>
          <span>{allPicked?"✅ All groups picked!":`${totalGroups-pickedCount} remaining`}</span>
        </div>
        <div className="progress-bar"><div className="progress-fill" style={{width:`${(pickedCount/totalGroups)*100}%`}}/></div>
      </div>

      <div className="form-section">
        <div className="form-section-hdr"><span><span className="num">01 · </span>PICK YOUR 12 TEAMS</span><span style={{fontSize:13,fontFamily:"var(--B)",fontWeight:400,color:"#5fa89e"}}>1 team per group</span></div>
        {WC_GROUPS.map(g=>{
          const picked=picks[`group${g.group}`];
          return (
            <div className="form-group" key={g.group}>
              <div className="group-pick-hdr">
                <div>
                  <div className="group-pick-label" style={{color:g.multiplier===2?"#00c4b4":g.multiplier===3?"#5fa89e":"#00c4b4"}}>
                    Pool Group {g.group}
                    {g.multiplier>1&&<span style={{marginLeft:8,fontSize:12}}>{g.multiplier===2?<span className="m2x">2× DOUBLE</span>:<span className="m3x">3× TRIPLE</span>}</span>}
                  </div>
                  {picked&&<div style={{fontSize:12,color:"#5fa89e",marginTop:2}}>Selected: <strong style={{color:"#ffffff"}}>{picked}</strong></div>}
                </div>
                <div className={`pick-check ${picked?"done":""}`}>{picked?"✓":""}</div>
              </div>
              <div className="team-select-grid">
                {g.teams.map(team=>(
                  <button key={team} className={`team-btn ${picked===team?`sel-${getMult(g.multiplier)}`:""}`}
                    onClick={()=>setPicks(prev=>({...prev,[`group${g.group}`]:team}))}>
                    {picked===team?"✓ ":""}{team}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      <div className="form-section">
        <div className="form-section-hdr"><span><span className="num">02 · </span>GOLDEN BOOT PICK</span></div>
        <div className="form-group">
          <label className="form-label">Who will score the most goals in the tournament?</label>
          <div style={{fontSize:12,color:"#5fa89e",marginBottom:10}}>$5 from each entry goes to whoever picks the correct Golden Boot winner. If multiple people pick correctly, the pot splits.</div>
          <select className="gb-select" value={goldenBoot} onChange={e=>setGoldenBoot(e.target.value)}>
            <option value="">— Select a player —</option>
            {GOLDEN_BOOT_PLAYERS.map(p=><option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>

      {error&&<div className="error-msg">⚠️ {error}</div>}

      <div className="form-section" style={{padding:20}}>
        <button className="submit-btn" onClick={handleSubmit} disabled={!canSubmit}>
          {submitting
            ? "SAVING..."
            : isEditing
              ? canSubmit ? "SAVE CHANGES →" : `COMPLETE ALL FIELDS ${!allPicked?`(${totalGroups-pickedCount} left)`:""}`
              : canSubmit ? "SUBMIT MY PICKS →" : `COMPLETE ALL FIELDS ${!allPicked?`(${totalGroups-pickedCount} left)`:""}` }
        </button>
      </div>
    </div>
  );
}

// ── WORLD CUP FULL PAGE ───────────────────────────────────────────────────────
function WorldCup() {
  const [sec, setSec] = useState("enter");
  const ml = m=>m===2?<span className="m2x">2× DOUBLE</span>:m===3?<span className="m3x">3× TRIPLE</span>:<span className="m1x">1×</span>;
  const gc = m=>m===2?"g2x":m===3?"g3x":"g1x";
  return (
    <div>
      <div className="phdr">
        <div>
          <div className="ptitle">⚽ WORLD CUP POOL 2026</div>
          <div style={{fontSize:14,color:"var(--mut)",marginTop:4}}>Pick 1 team per Pool Group · 12 teams total</div>
        </div>
        <div className="pmeta">
          <div className="pill">Entry: <strong>$35</strong></div>
          <div className="pill">12 teams + Golden Boot</div>
          <div className="dbadge">⏰ Due: Jun 11 · 2PM</div>
        </div>
      </div>
      <div className="stabs">
        {[{id:"enter",label:"✏️ Submit Entry"},{id:"groups",label:"🌍 Pool Groups"},{id:"scoring",label:"📊 Scoring"},{id:"rules",label:"📖 Rules"}].map(s=>(
          <button key={s.id} className={`stab ${sec===s.id?"on":""}`} onClick={()=>setSec(s.id)}>{s.label}</button>
        ))}
      </div>
      {sec==="enter"&&<WCEntryForm/>}
      {sec==="groups"&&(
        <div>
          <div style={{display:"flex",gap:16,marginBottom:16,flexWrap:"wrap"}}>
            <div style={{display:"flex",alignItems:"center",gap:8,fontSize:13,color:"var(--mut)"}}><span className="m1x">1×</span> Groups 1–5</div>
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
      {sec==="scoring"&&(
        <div className="sgrid">
          <div className="card">
            <div className="chdr">📊 Base Scoring</div>
            {WC_SCORING.map((s,i)=><div className="srow" key={i}><span style={{fontSize:14,color:"#c5cde0"}}>{s.event}</span><span className="spts">{s.pts}</span></div>)}
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
                {[["$5/entry","Goes into the Golden Boot pot."],["$30/entry","Goes to top 2-3 finishers."],["Split","Multiple correct picks split the pot."],["Rollover","No correct pick? Rolls into main prize pool."]].map(([k,v],i,a)=>(
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
      {sec==="rules"&&(
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
                "Submit picks via this site. Payment instructions will follow via email.",
              ].map((rule,i)=><div className="ri" key={i}><span className="rn">{i+1}</span><span>{rule}</span></div>)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── HR DERBY ─────────────────────────────────────────────────────────────────
function HRDerby({ allData, loading }) {
  const [sec, setSec] = useState("standings");
  const [monthKey, setMonthKey] = useState("june"); // current month
  const [stab, setStab] = useState("season");
  const [search, setSearch] = useState("");
  const [sel, setSel] = useState(null);

  const months = [
    { key:"june",  label:"June",  isCurrent:true  },
    { key:"may",   label:"May",   isCurrent:false },
    { key:"april", label:"April", isCurrent:false },
  ];

  const currentData = allData[monthKey] || allData["june"] || allData["may"];
  if (!currentData) return <div className="loading"><div className="spinner"/></div>;

  const { monthlyStandings, seasonStandings, rosters, hrLeaders } = currentData;

  const display = stab==="season"
    ? [...seasonStandings].sort((a,b)=>b.season-a.season).map((s,i)=>({...s,rank:i+1}))
    : [...monthlyStandings].sort((a,b)=>b.month-a.month).map((s,i)=>({...s,rank:i+1}));
  const maxV = stab==="season"
    ? Math.max(1,...seasonStandings.map(s=>s.season))
    : Math.max(1,...monthlyStandings.map(s=>s.month));

  const filtRosters = rosters.filter(r=>!search||r.teamName.toLowerCase().includes(search.toLowerCase())||r.players.some(p=>p.name.toLowerCase().includes(search.toLowerCase())));
  const currentMonth = months.find(m=>m.key===monthKey);

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
        </div>
      </div>

      <div className="stabs">
        {[{id:"standings",label:"🏆 Standings"},{id:"rosters",label:"📋 Rosters"},{id:"leaders",label:"⚾ HR Leaders"},{id:"rules",label:"📖 Rules"}].map(s=>(
          <button key={s.id} className={`stab ${sec===s.id?"on":""}`} onClick={()=>setSec(s.id)}>{s.label}</button>
        ))}
      </div>

      {sec==="standings"&&(
        <div>
          {/* Month Selector */}
          <div style={{marginBottom:16}}>
            <div style={{fontSize:11,color:"var(--mut)",letterSpacing:1,textTransform:"uppercase",marginBottom:8}}>Viewing Month</div>
            <div className="tabs2">
              {months.map(m=>(
                <button key={m.key} className={`t2 ${monthKey===m.key?"on":""}`} onClick={()=>setMonthKey(m.key)}>
                  {m.label}{m.isCurrent&&<span style={{marginLeft:4,fontSize:9,opacity:.8}}>●</span>}
                </button>
              ))}
            </div>
          </div>

          <div className="podium">
            {display.slice(0,3).map((t,i)=>{
              const v=stab==="season"?t.season:t.month;
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
            <button className={`t2 ${stab==="month"?"on":""}`} onClick={()=>setStab("month")}>{currentMonth?.label?.toUpperCase()} HRs</button>
          </div>

          <div className="card">
            <div className="chdr">
              {stab==="season"?"🏆 Season Standings":`📅 ${currentMonth?.label} Standings`}
              {currentMonth?.isCurrent&&<span className="month-badge month-current">CURRENT</span>}
              {!currentMonth?.isCurrent&&<span className="month-badge month-past">PAST</span>}
              <span style={{marginLeft:"auto",fontSize:12,fontFamily:"var(--B)",color:"var(--mut)",fontWeight:400}}>Click team → roster</span>
            </div>
            <table>
              <thead><tr><th style={{width:48}}>Rank</th><th>Team</th><th className="r">{stab==="season"?"Season HRs":`${currentMonth?.label} HRs`}</th><th style={{width:160}}></th></tr></thead>
              <tbody>
                {display.map(s=>{
                  const v=stab==="season"?s.season:s.month;
                  const pct=Math.round((v/maxV)*100);
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
            <strong style={{color:"var(--gold)"}}>Payout:</strong> Monthly: 1st $75 · 2nd $50 &nbsp;|&nbsp; Season: 1st $300 · 2nd $175 · 3rd $75
          </div>
        </div>
      )}

      {sec==="rosters"&&(
        <div>
          <div className="srch">
            <input className="si" placeholder="Search team or player..." value={search} onChange={e=>setSearch(e.target.value)}/>
            {sel&&<button className="stab on" onClick={()=>setSel(null)}>✕ {sel}</button>}
          </div>
          <div className="rgrid">
            {(sel?filtRosters.filter(r=>r.teamName===sel):filtRosters).map(r=>(
              <div className="rc" key={r.teamName}>
                <div className="rchdr">
                  <div><div className="rcname">{r.teamName}</div><div style={{fontSize:11,color:"var(--mut)",marginTop:2}}>Cap: {r.cap??'—'} · Season: {r.season} HR · {currentMonth?.label}: {r.month} HR</div></div>
                  <div className="rctots">
                    <div className="rcstat" style={{textAlign:"center"}}><div className="v">{r.month}</div><div className="lbl">{currentMonth?.label?.toUpperCase()}</div></div>
                    <div className="rcstat" style={{textAlign:"center"}}><div className="v" style={{color:"var(--grn)"}}>{r.season}</div><div className="lbl">SEASON</div></div>
                  </div>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr auto auto auto",padding:"6px 16px 4px",borderBottom:"1px solid var(--bdr)"}}>
                  <span style={{fontSize:10,color:"var(--mut)",letterSpacing:1,textTransform:"uppercase"}}>Player</span>
                  <span style={{fontSize:10,color:"var(--mut)",textAlign:"right",minWidth:36}}>Cap</span>
                  <span style={{fontSize:10,color:"var(--mut)",textAlign:"right",minWidth:40,paddingLeft:10}}>{currentMonth?.label}</span>
                  <span style={{fontSize:10,color:"var(--mut)",textAlign:"right",minWidth:44,paddingLeft:10}}>Season</span>
                </div>
                {r.players.map((p,i)=>(
                  <div className="rpr" key={i} style={p.swap?{opacity:.65,background:"rgba(74,158,255,.04)"}:{}}>
                    <div style={{flex:1,display:"flex",alignItems:"center",gap:6}}>
                      <span style={{fontSize:13,fontWeight:p.swap?400:500}}>{p.name}</span>
                      {p.swap&&<span className="swapb">SWAP</span>}
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

      {sec==="leaders"&&(
        <div className="card">
          <div className="chdr">⚾ 2026 MLB HR Leaders</div>
          <table>
            <thead><tr><th style={{width:48}}>Rank</th><th>Player</th><th>Team</th><th className="r">HRs</th></tr></thead>
            <tbody>
              {hrLeaders.slice(0,40).map((p,i)=>(
                <tr key={i}><td><RB rank={p.rank}/></td><td style={{fontWeight:500}}>{p.name}</td><td><span className="ttag">{p.team}</span></td><td className="r"><span className="hn">{p.hr}</span></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {sec==="rules"&&(
        <div className="card">
          <div className="chdr">📖 Rules & Payouts</div>
          <div style={{padding:20}}>
            <div className="rbox">
              {["Draft 7 players from the player pool. Combined 2025 HR total cannot exceed 156.",
                "Designate an 8th SWAP player. Can replace one roster player before the All-Star Game.",
                "Once a swap is made, no further changes are allowed.",
                "Scoring is cumulative season-long HRs.",
                "October regular season games count. Play-in games do NOT.",
                "No free agent or IR moves beyond the one allowed swap.",
                "Monthly prizes for Top 2 teams (April–September). Monthly totals are NOT cumulative.",
                "End-of-year prizes for Top 3 teams."].map((rule,i)=>(
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
function Dashboard({setTab, allData, updatedAt, tournamentStarted}) {
  const currentData = allData["june"] || allData["may"];
  if (!currentData) return <div className="loading"><div className="spinner"/></div>;
  const {monthlyStandings, seasonStandings} = currentData;
  const sl = [...seasonStandings].sort((a,b)=>b.season-a.season)[0]||{};
  const ml = [...monthlyStandings].sort((a,b)=>b.month-a.month)[0]||{};
  return (
    <div>
      <div style={{marginBottom:28}}>
        <div style={{fontFamily:"var(--F)",fontSize:36,letterSpacing:3,marginBottom:6}}>ACTIVE POOLS</div>
        <div className="updated"><span className="live-dot"/>Live data · Updated {updatedAt}</div>
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
            <div className="dsr"><span className="dsl">June Leader</span><span className="dsv">{ml.name} ({ml.month} HR)</span></div>
            <div className="dsr" style={{marginBottom:0}}><span className="dsl">Season Prize</span><span className="dsv">1st $300 · 2nd $175 · 3rd $75</span></div>
          </div>
          <button className="dcta">VIEW STANDINGS →</button>
        </div>
        <div className="dc" onClick={()=>setTab("wc")}>
          <div className="dctop">
            <div className="dico" style={{background:"rgba(0,196,180,.1)"}}>⚽</div>
            <div><div className="dctitle">World Cup Pool</div><div className="dcsub">FIFA World Cup 2026</div></div>
            <span className={tournamentStarted?"blive":"bsoon"} style={{marginLeft:"auto"}}>{tournamentStarted?"LIVE":"OPEN"}</span>
          </div>
          <div className="dcbody">
            <div className="dsr"><span className="dsl">Format</span><span className="dsv">12 picks + Golden Boot</span></div>
            <div className="dsr"><span className="dsl">Entry</span><span className="dsv">$35</span></div>
            <div className="dsr"><span className="dsl">Picks Due</span><span className="dsv">Jun 11, 2026 · 2:00 PM</span></div>
            <div className="dsr" style={{marginBottom:0}}><span className="dsl">Status</span><span className="dsv" style={{color:"#00c4b4"}}>{tournamentStarted?"🔴 Tournament Live":"✅ Submissions Open"}</span></div>
          </div>
          <button className="dcta">{tournamentStarted?"VIEW POOL →":"SUBMIT YOUR PICKS →"}</button>
        </div>
        {tournamentStarted && (
          <div className="dc" onClick={()=>setTab("tournament")}>
            <div className="dctop">
              <div className="dico" style={{background:"rgba(232,69,69,.1)"}}>🏆</div>
              <div><div className="dctitle">Tournament</div><div className="dcsub">Live standings & scores</div></div>
              <span className="blive" style={{marginLeft:"auto"}}>LIVE</span>
            </div>
            <div className="dcbody">
              <div className="dsr"><span className="dsl">Leaderboard</span><span className="dsv">Live pool standings</span></div>
              <div className="dsr"><span className="dsl">Matches</span><span className="dsv">Live scores & results</span></div>
              <div className="dsr"><span className="dsl">Groups</span><span className="dsv">FIFA group standings</span></div>
              <div className="dsr" style={{marginBottom:0}}><span className="dsl">Golden Boot</span><span className="dsv">Pick tracker</span></div>
            </div>
            <button className="dcta">VIEW LIVE →</button>
          </div>
        )}
      </div>
      <div className="card">
        <div className="chdr">🏆 HR Derby — Season Top 5</div>
        <table>
          <thead><tr><th>Rank</th><th>Team</th><th className="r">Season HRs</th><th className="r">June HRs</th></tr></thead>
          <tbody>
            {[...seasonStandings].sort((a,b)=>b.season-a.season).slice(0,5).map((s,i)=>{
              const m=monthlyStandings.find(x=>x.name===s.name);
              return (<tr key={s.name}><td><RB rank={i+1}/></td><td style={{fontWeight:500}}>{s.name}</td><td className="r"><span className="hn">{s.season}</span></td><td className="r"><span className="hns">{m?.month??'—'}</span></td></tr>);
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── SCORING ENGINE ────────────────────────────────────────────────────────────
// Maps API-Football team names to pool group team names
const TEAM_NAME_MAP = {
  "France":"France","Spain":"Spain","England":"England","Brazil":"Brazil",
  "Argentina":"Argentina","Portugal":"Portugal","Germany":"Germany","Netherlands":"Netherlands",
  "Norway":"Norway","Belgium":"Belgium","Colombia":"Colombia","Morocco":"Morocco",
  "Japan":"Japan","United States":"United States","USA":"United States","Uruguay":"Uruguay","Mexico":"Mexico",
  "Switzerland":"Switzerland","Croatia":"Croatia","Ecuador":"Ecuador","Turkey":"Turkey","Türkiye":"Turkey",
  "Sweden":"Sweden","Senegal":"Senegal","Paraguay":"Paraguay","Austria":"Austria",
  "Scotland":"Scotland","Canada":"Canada","Ivory Coast":"Ivory Coast","Côte d'Ivoire":"Ivory Coast","Czech Republic":"Czech Republic",
  "Bosnia":"Bosnia","Bosnia and Herzegovina":"Bosnia","Ghana":"Ghana","Egypt":"Egypt","Algeria":"Algeria",
  "South Korea":"South Korea","Korea Republic":"South Korea","Tunisia":"Tunisia","Australia":"Australia","Iran":"Iran",
  "DR Congo":"DR Congo","Congo DR":"DR Congo","South Africa":"South Africa","Uzbekistan":"Uzbekistan","Panama":"Panama",
  "Qatar":"Qatar","Iraq":"Iraq","Saudi Arabia":"Saudi Arabia","Cape Verde":"Cape Verde",
  "New Zealand":"New Zealand","Curacao":"Curacao","Curaçao":"Curacao","Jordan":"Jordan","Haiti":"Haiti",
};

const POOL_SCORING = {
  goal: 1,
  win: 3,
  draw: 1,
  groupWin: 8,
  group2nd: 4,
  group3rd: 2,
  r32win: 8,
  qf: 12,
  sf: 24,
  final: 36,
  champion: 48,
};

function getMultiplier(groupNum) {
  if ([10,11,12].includes(groupNum)) return 3;
  if ([6,7,8,9].includes(groupNum)) return 2;
  return 1;
}

function calcEntryScore(entry, teamStats) {
  let total = 0;
  const breakdown = {};
  for (let g = 1; g <= 12; g++) {
    const team = entry[`group${g}`];
    const mult = getMultiplier(g);
    const stats = teamStats[team] || {};
    let pts = 0;
    pts += (stats.goals || 0) * POOL_SCORING.goal;
    pts += (stats.wins || 0) * POOL_SCORING.win;
    pts += (stats.draws || 0) * POOL_SCORING.draw;
    if (stats.groupWin) pts += POOL_SCORING.groupWin;
    else if (stats.group2nd) pts += POOL_SCORING.group2nd;
    else if (stats.group3rd) pts += POOL_SCORING.group3rd;
    if (stats.r32win) pts += POOL_SCORING.r32win;
    if (stats.qf) pts += POOL_SCORING.qf;
    if (stats.sf) pts += POOL_SCORING.sf;
    if (stats.final) pts += POOL_SCORING.final;
    if (stats.champion) pts += POOL_SCORING.champion;
    const scored = pts * mult;
    breakdown[`group${g}`] = { team, pts, mult, scored };
    total += scored;
  }
  return { total, breakdown };
}

// ── WC TOURNAMENT PAGE ────────────────────────────────────────────────────────
function WCTournament() {
  const API_KEY = process.env.REACT_APP_FOOTBALL_API_KEY;
  const LEAGUE = 1;
  const SEASON = 2026;

  const [sec, setSec] = useState("leaderboard");
  const [fixtures, setFixtures] = useState([]);
  const [standings, setStandings] = useState([]);
  const [submissions, setSubmissions] = useState([]);
  const [teamStats, setTeamStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState("");
  const [selectedEntry, setSelectedEntry] = useState(null);

  const apiFetch = (endpoint) =>
    fetch(`https://v3.football.api-sports.io/${endpoint}`, {
      headers: { "x-apisports-key": API_KEY }
    }).then(r => r.json());

  const buildTeamStats = (fixtureData, standingsData) => {
    const stats = {};
    // Process group stage standings
    for (const group of standingsData) {
      for (const teamRow of group) {
        const rawName = teamRow.team?.name || "";
        const name = TEAM_NAME_MAP[rawName] || rawName;
        const rank = teamRow.rank;
        if (!stats[name]) stats[name] = { goals: 0, wins: 0, draws: 0 };
        stats[name].goals = (stats[name].goals || 0) + (teamRow.all?.goals?.for || 0);
        stats[name].wins = teamRow.all?.win || 0;
        stats[name].draws = teamRow.all?.draw || 0;
        if (rank === 1) stats[name].groupWin = true;
        else if (rank === 2) stats[name].group2nd = true;
        else if (rank === 3) stats[name].group3rd = true;
      }
    }
    // Process knockout results from fixtures
    for (const f of fixtureData) {
      const round = f.league?.round || "";
      const status = f.fixture?.status?.short;
      if (!["FT","AET","PEN"].includes(status)) continue;
      const homeRaw = f.teams?.home?.name;
      const awayRaw = f.teams?.away?.name;
      const homeWin = f.teams?.home?.winner;
      const awayWin = f.teams?.away?.winner;
      const home = TEAM_NAME_MAP[homeRaw] || homeRaw;
      const away = TEAM_NAME_MAP[awayRaw] || awayRaw;
      const winner = homeWin ? home : awayWin ? away : null;
      if (!winner) continue;
      if (!stats[winner]) stats[winner] = { goals:0, wins:0, draws:0 };
      if (round.includes("Round of 32") || round.includes("Round of 16") && round.includes("32")) {
        stats[winner].r32win = true;
      }
      if (round.includes("Quarter-final") || round.includes("Quarterfinal")) {
        stats[winner].qf = true;
      }
      if (round.includes("Semi-final") || round.includes("Semifinal")) {
        stats[winner].sf = true;
      }
      if (round.includes("Final") && !round.includes("Semi") && !round.includes("3rd")) {
        stats[winner].final = true;
        stats[winner].champion = true;
        const loser = winner === home ? away : home;
        if (!stats[loser]) stats[loser] = { goals:0, wins:0, draws:0 };
        stats[loser].final = true;
      }
    }
    return stats;
  };

  const loadAll = async () => {
    setLoading(true);
    try {
      const [fixtRes, standRes, subRes] = await Promise.all([
        apiFetch(`fixtures?league=${LEAGUE}&season=${SEASON}`),
        apiFetch(`standings?league=${LEAGUE}&season=${SEASON}`),
        fetch(SUBMIT_URL).then(r => r.json()),
      ]);
      const allFixtures = fixtRes.response || [];
      const allStandings = standRes.response?.[0]?.league?.standings || [];
      const allSubs = subRes.submissions || [];
      const stats = buildTeamStats(allFixtures, allStandings);
      setFixtures(allFixtures);
      setStandings(allStandings);
      setSubmissions(allSubs);
      setTeamStats(stats);
      setLastRefresh(new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  // Score every entry
  const scoredEntries = submissions.map(entry => {
    const { total, breakdown } = calcEntryScore(entry, teamStats);
    return { ...entry, total, breakdown };
  }).sort((a,b) => b.total - a.total);

  // Today's matches
  const today = new Date().toISOString().split("T")[0];
  const todayFixtures = fixtures.filter(f => f.fixture?.date?.startsWith(today));
  const liveFixtures = fixtures.filter(f => ["1H","HT","2H","ET","BT","P"].includes(f.fixture?.status?.short));
  const upcomingFixtures = fixtures.filter(f => f.fixture?.status?.short === "NS")
    .sort((a,b) => new Date(a.fixture.date) - new Date(b.fixture.date))
    .slice(0, 8);

  const fmtTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"});
  };
  const fmtDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString([],{month:"short",day:"numeric"});
  };

  return (
    <div>
      <div className="phdr">
        <div>
          <div className="ptitle">⚽ WORLD CUP 2026</div>
          <div style={{fontSize:14,color:"#5fa89e",marginTop:4}}>
            Live tournament · {submissions.length} entries · {scoredEntries.length > 0 ? `Leader: ${scoredEntries[0]?.name} (${scoredEntries[0]?.total} pts)` : "Awaiting data..."}
          </div>
        </div>
        <div className="pmeta">
          <div className="pill">Entries: <strong>{submissions.length}</strong></div>
          <div className="pill">Updated: <strong>{lastRefresh||"—"}</strong></div>
          <button onClick={loadAll} style={{background:"#00c4b4",border:"none",borderRadius:4,color:"#000",padding:"6px 14px",fontFamily:"var(--F)",fontSize:14,letterSpacing:1,cursor:"pointer"}}>↻ REFRESH</button>
        </div>
      </div>

      <div className="stabs">
        {[
          {id:"leaderboard",label:"🏆 Leaderboard"},
          {id:"matches",label:"⚽ Matches"},
          {id:"groups",label:"🌍 Group Stage"},
          {id:"golden",label:"🥇 Golden Boot"},
        ].map(s=>(
          <button key={s.id} className={`stab ${sec===s.id?"on":""}`} onClick={()=>setSec(s.id)}>{s.label}</button>
        ))}
      </div>

      {/* ── LEADERBOARD ── */}
      {sec==="leaderboard" && (
        <div>
          {loading ? (
            <div className="loading" style={{height:200}}><div className="spinner"/></div>
          ) : scoredEntries.length === 0 ? (
            <div className="card"><div style={{padding:40,textAlign:"center",color:"#5fa89e"}}>
              <div style={{fontSize:48,marginBottom:12}}>🏆</div>
              <div style={{fontFamily:"var(--F)",fontSize:24,letterSpacing:2,marginBottom:8}}>STANDINGS LOADING</div>
              <div style={{fontSize:14}}>Scores will appear here once the tournament begins and entries are processed.</div>
            </div></div>
          ) : (
            <>
              {/* Podium */}
              <div className="podium">
                {scoredEntries.slice(0,3).map((e,i)=>(
                  <div key={e.email+e.entryNumber} className={`pod p${i+1}`} style={{cursor:"pointer"}} onClick={()=>setSelectedEntry(selectedEntry?.email===e.email&&selectedEntry?.entryNumber===e.entryNumber?null:e)}>
                    <div className="pos">{["🥇","🥈","🥉"][i]}</div>
                    <div className="pteam">{e.name}</div>
                    {(e.entryNumber||1) > 1 && <div style={{fontSize:11,color:"#5fa89e"}}>Entry {e.entryNumber}</div>}
                    <div className="phr">{e.total}</div>
                    <div className="plbl">POINTS</div>
                  </div>
                ))}
              </div>

              <div className="card">
                <div className="chdr">🏆 Pool Leaderboard <span style={{marginLeft:"auto",fontSize:12,fontFamily:"var(--B)",color:"#5fa89e",fontWeight:400}}>Click any entry to see breakdown</span></div>
                <table>
                  <thead><tr><th style={{width:48}}>Rank</th><th>Participant</th><th className="r">Points</th><th style={{width:160}}></th></tr></thead>
                  <tbody>
                    {scoredEntries.map((e,i)=>{
                      const isSelected = selectedEntry?.email===e.email && selectedEntry?.entryNumber===e.entryNumber;
                      const maxPts = scoredEntries[0]?.total || 1;
                      return (
                        <>
                          <tr key={e.email+(e.entryNumber||1)} style={{cursor:"pointer",background:isSelected?"rgba(0,196,180,.08)":""}}
                            onClick={()=>setSelectedEntry(isSelected?null:e)}>
                            <td><RB rank={i+1}/></td>
                            <td>
                              <span style={{fontWeight:600}}>{e.name}</span>
                              {(e.entryNumber||1)>1&&<span style={{fontSize:11,color:"#5fa89e",marginLeft:8}}>Entry {e.entryNumber}</span>}
                            </td>
                            <td className="r"><span className="hn">{e.total}</span></td>
                            <td><div className="lbar"><div className="lfill" style={{width:`${Math.round((e.total/maxPts)*100)}%`,background:i===0?"#00c4b4":i===1?"#b0b8cc":i===2?"#cd7f32":"#00c4b4"}}/></div></td>
                          </tr>
                          {isSelected && (
                            <tr key={e.email+(e.entryNumber||1)+"detail"}>
                              <td colSpan={4} style={{padding:0,background:"#0a1a1a"}}>
                                <div style={{padding:16}}>
                                  <div style={{fontFamily:"var(--F)",fontSize:14,letterSpacing:1,color:"#00c4b4",marginBottom:10}}>
                                    {e.name}'s PICKS — {e.total} PTS TOTAL
                                  </div>
                                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))",gap:8}}>
                                    {WC_GROUPS.map(g=>{
                                      const bd = e.breakdown[`group${g}`];
                                      return (
                                        <div key={g.group} style={{background:"#000",border:"1px solid #1a3a3a",borderRadius:6,padding:"8px 12px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                                          <div>
                                            <div style={{fontSize:10,color:"#5fa89e",letterSpacing:1,textTransform:"uppercase"}}>Group {g.group} {g.multiplier>1?`· ${g.multiplier}×`:""}</div>
                                            <div style={{fontSize:13,fontWeight:600,color:"#ffffff",marginTop:2}}>{bd?.team||"—"}</div>
                                          </div>
                                          <div style={{textAlign:"right"}}>
                                            <div style={{fontFamily:"var(--F)",fontSize:20,color:"#00c4b4"}}>{bd?.scored||0}</div>
                                            <div style={{fontSize:10,color:"#5fa89e"}}>{bd?.pts||0} × {bd?.mult||1}</div>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                  <div style={{marginTop:10,padding:"8px 12px",background:"#000",border:"1px solid #00c4b4",borderRadius:6,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                                    <span style={{color:"#5fa89e",fontSize:13}}>🥇 Golden Boot Pick</span>
                                    <span style={{fontWeight:600,color:"#ffffff"}}>{e.goldenBoot||"—"}</span>
                                  </div>
                                </div>
                              </td>
                            </tr>
                          )}
                        </>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── MATCHES ── */}
      {sec==="matches" && (
        <div>
          {liveFixtures.length > 0 && (
            <div style={{marginBottom:20}}>
              <div style={{fontFamily:"var(--F)",fontSize:18,letterSpacing:2,color:"#e84545",marginBottom:12,display:"flex",alignItems:"center",gap:8}}>
                <span style={{width:8,height:8,borderRadius:"50%",background:"#e84545",display:"inline-block",animation:"pulse 1s infinite"}}/>
                LIVE NOW
              </div>
              {liveFixtures.map(f=>(
                <MatchCard key={f.fixture.id} f={f} teamStats={teamStats} submissions={submissions}/>
              ))}
            </div>
          )}

          {todayFixtures.length > 0 && (
            <div style={{marginBottom:20}}>
              <div style={{fontFamily:"var(--F)",fontSize:18,letterSpacing:2,color:"#00c4b4",marginBottom:12}}>TODAY'S MATCHES</div>
              {todayFixtures.map(f=>(
                <MatchCard key={f.fixture.id} f={f} teamStats={teamStats} submissions={submissions}/>
              ))}
            </div>
          )}

          <div>
            <div style={{fontFamily:"var(--F)",fontSize:18,letterSpacing:2,color:"#ffffff",marginBottom:12}}>UPCOMING</div>
            {upcomingFixtures.length === 0 ? (
              <div className="card"><div style={{padding:24,textAlign:"center",color:"#5fa89e"}}>No upcoming fixtures loaded yet.</div></div>
            ) : upcomingFixtures.map(f=>(
              <MatchCard key={f.fixture.id} f={f} teamStats={teamStats} submissions={submissions}/>
            ))}
          </div>
        </div>
      )}

      {/* ── GROUP STAGE ── */}
      {sec==="groups" && (
        <div>
          {standings.length === 0 ? (
            <div className="card"><div style={{padding:40,textAlign:"center",color:"#5fa89e"}}>
              <div style={{fontSize:48,marginBottom:12}}>🌍</div>
              <div style={{fontFamily:"var(--F)",fontSize:24,letterSpacing:2,marginBottom:8}}>GROUP STANDINGS</div>
              <div>Group standings will appear here once the tournament begins.</div>
            </div></div>
          ) : (
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:16}}>
              {standings.map((group, gi) => (
                <div key={gi} className="card">
                  <div className="chdr">Group {group[0]?.group || String.fromCharCode(65+gi)}</div>
                  <table>
                    <thead><tr><th>Team</th><th className="r">P</th><th className="r">W</th><th className="r">D</th><th className="r">L</th><th className="r">GF</th><th className="r">Pts</th></tr></thead>
                    <tbody>
                      {group.map((row,ri)=>{
                        const name = TEAM_NAME_MAP[row.team?.name]||row.team?.name;
                        const advances = ri < 2;
                        return (
                          <tr key={ri} style={{background:advances?"rgba(0,196,180,.06)":""}}>
                            <td>
                              <div style={{display:"flex",alignItems:"center",gap:8}}>
                                {row.team?.logo && <img src={row.team.logo} style={{width:20,height:20,objectFit:"contain"}} alt=""/>}
                                <span style={{fontSize:13,fontWeight:advances?600:400}}>{name}</span>
                              </div>
                            </td>
                            <td className="r" style={{fontSize:12}}>{row.all?.played||0}</td>
                            <td className="r" style={{fontSize:12}}>{row.all?.win||0}</td>
                            <td className="r" style={{fontSize:12}}>{row.all?.draw||0}</td>
                            <td className="r" style={{fontSize:12}}>{row.all?.lose||0}</td>
                            <td className="r" style={{fontSize:12}}>{row.all?.goals?.for||0}</td>
                            <td className="r"><span style={{fontFamily:"var(--F)",fontSize:16,color:"#00c4b4"}}>{row.points||0}</span></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── GOLDEN BOOT ── */}
      {sec==="golden" && (
        <div>
          <div className="card">
            <div className="chdr">🥇 Golden Boot Race</div>
            <div style={{padding:20}}>
              <div style={{fontSize:13,color:"#5fa89e",marginBottom:20,lineHeight:1.6}}>
                $5 from each entry goes to the participant who picks the tournament's top scorer. {submissions.length > 0 && `${submissions.length} entries · $${submissions.length * 5} pot.`} If multiple people pick correctly, the pot splits. If no one picks correctly, it rolls into the main prize pool.
              </div>
              {/* Tally who picked whom */}
              {(() => {
                const tally = {};
                for (const s of submissions) {
                  const p = s.goldenBoot || "Unknown";
                  if (!tally[p]) tally[p] = [];
                  tally[p].push(s.name);
                }
                const sorted = Object.entries(tally).sort((a,b)=>b[1].length-a[1].length);
                const maxPicks = sorted[0]?.[1]?.length || 1;
                return (
                  <div>
                    {sorted.map(([player, pickers],i)=>(
                      <div key={player} style={{marginBottom:12}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
                          <div>
                            <span style={{fontWeight:600,color:"#ffffff"}}>{player}</span>
                            <span style={{fontSize:12,color:"#5fa89e",marginLeft:8}}>{pickers.length} pick{pickers.length!==1?"s":""}</span>
                          </div>
                          <span style={{fontFamily:"var(--F)",fontSize:16,color:"#00c4b4"}}>{pickers.length}</span>
                        </div>
                        <div className="lbar" style={{height:6,marginBottom:4}}>
                          <div className="lfill" style={{width:`${Math.round((pickers.length/maxPicks)*100)}%`,background:i===0?"#00c4b4":"#1a3a3a"}}/>
                        </div>
                        <div style={{fontSize:11,color:"#5fa89e"}}>{pickers.join(", ")}</div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── MATCH CARD ────────────────────────────────────────────────────────────────
function MatchCard({ f, submissions }) {
  const homeRaw = f.teams?.home?.name;
  const awayRaw = f.teams?.away?.name;
  const home = TEAM_NAME_MAP[homeRaw] || homeRaw;
  const away = TEAM_NAME_MAP[awayRaw] || awayRaw;
  const homeGoals = f.goals?.home ?? "—";
  const awayGoals = f.goals?.away ?? "—";
  const status = f.fixture?.status?.short;
  const elapsed = f.fixture?.status?.elapsed;
  const isLive = ["1H","HT","2H","ET","BT","P"].includes(status);
  const isDone = ["FT","AET","PEN"].includes(status);
  const isNS = status === "NS";
  const round = f.league?.round || "";

  const homePickers = submissions.filter(s =>
    Object.values(s).includes(home)
  ).map(s=>s.name);
  const awayPickers = submissions.filter(s =>
    Object.values(s).includes(away)
  ).map(s=>s.name);

  return (
    <div style={{background:"#000",border:`2px solid ${isLive?"#e84545":isDone?"#1a3a3a":"#ffffff"}`,borderRadius:8,padding:16,marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <span style={{fontSize:11,color:"#5fa89e",letterSpacing:1,textTransform:"uppercase"}}>{round}</span>
        <span style={{fontSize:12,fontWeight:700,color:isLive?"#e84545":isDone?"#5fa89e":"#ffffff"}}>
          {isLive ? `🔴 ${elapsed}'` : isDone ? "FT" : isNS ? new Date(f.fixture.date).toLocaleString([],{month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}) : status}
        </span>
      </div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:12}}>
        <div style={{flex:1,textAlign:"left"}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            {f.teams?.home?.logo && <img src={f.teams.home.logo} style={{width:28,height:28,objectFit:"contain"}} alt=""/>}
            <span style={{fontWeight:700,fontSize:15,color:"#ffffff"}}>{home}</span>
          </div>
          {homePickers.length > 0 && <div style={{fontSize:11,color:"#00c4b4",marginTop:4}}>🎯 {homePickers.join(", ")}</div>}
        </div>
        <div style={{textAlign:"center",minWidth:60}}>
          {!isNS ? (
            <div style={{fontFamily:"var(--F)",fontSize:28,color:isLive?"#e84545":"#ffffff"}}>
              {homeGoals} - {awayGoals}
            </div>
          ) : (
            <div style={{fontFamily:"var(--F)",fontSize:18,color:"#5fa89e"}}>VS</div>
          )}
        </div>
        <div style={{flex:1,textAlign:"right"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"flex-end",gap:8}}>
            <span style={{fontWeight:700,fontSize:15,color:"#ffffff"}}>{away}</span>
            {f.teams?.away?.logo && <img src={f.teams.away.logo} style={{width:28,height:28,objectFit:"contain"}} alt=""/>}
          </div>
          {awayPickers.length > 0 && <div style={{fontSize:11,color:"#00c4b4",marginTop:4,textAlign:"right"}}>{awayPickers.join(", ")} 🎯</div>}
        </div>
      </div>
    </div>
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [allData, setAllData] = useState({});
  const [updatedAt, setUpdatedAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tournamentStarted = new Date() >= DEADLINE;

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [juneRes, mayRes, aprilRes] = await Promise.all([
          fetch(JUNE_CSV_URL).then(r=>r.text()),
          fetch(MAY_CSV_URL).then(r=>r.text()),
          fetch(APRIL_CSV_URL).then(r=>r.text()),
        ]);
        setAllData({ june: parseCSV(juneRes), may: parseCSV(mayRes), april: parseCSV(aprilRes) });
        setUpdatedAt(new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}));
      } catch {
        setError("Could not load live data. Please refresh.");
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  if (error) return (<><style>{S}</style><div className="loading"><div style={{fontSize:40}}>⚠️</div><div>{error}</div></div></>);
  if (loading) return (<><style>{S}</style><div className="loading"><div className="spinner"/><div style={{fontFamily:"var(--F)",fontSize:24,letterSpacing:2}}>LOADING LIVE DATA...</div></div></>);

  const navTabs = [
    {id:"dashboard", label:"🏠 Dashboard"},
    {id:"hr",        label:"⚾ HR Derby"},
    {id:"wc",        label:"⚽ World Cup"},
    ...(tournamentStarted ? [{id:"tournament", label:"🏆 Tournament"}] : []),
  ];

  return (
    <>
      <style>{S}</style>
      <div>
        <header className="hdr">
          <div className="logo" style={{cursor:"pointer"}} onClick={()=>setTab("dashboard")}>WUG DERBY<span> POOLS</span></div>
          <div style={{fontSize:13,color:"#5fa89e"}}>
            {tournamentStarted
              ? <span style={{color:"#e84545",fontWeight:700}}>🔴 TOURNAMENT LIVE</span>
              : "Wug Derby Pools · 2026"}
          </div>
        </header>
        <nav className="nav">
          {navTabs.map(t=>(
            <button key={t.id} className={`ntab ${tab===t.id?"on":""}`} onClick={()=>setTab(t.id)}>{t.label}</button>
          ))}
        </nav>
        <main className="main">
          {tab==="dashboard"  && <Dashboard setTab={setTab} allData={allData} updatedAt={updatedAt} tournamentStarted={tournamentStarted}/>}
          {tab==="hr"         && <HRDerby allData={allData} loading={loading}/>}
          {tab==="wc"         && <WorldCup/>}
          {tab==="tournament" && <WCTournament/>}
        </main>
      </div>
    </>
  );
}
