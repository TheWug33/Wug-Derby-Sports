import { useState, useEffect } from "react";

const JUNE_CSV_URL  = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTtADRNEx9M4uGiDjqrSppUqUO-YUfDp8WcgRSLvWQUgg7zPcJMFocQ7CNa-ORol3-y4qjpb-f3GC5g/pub?gid=966793280&single=true&output=csv";
const MAY_CSV_URL   = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTtADRNEx9M4uGiDjqrSppUqUO-YUfDp8WcgRSLvWQUgg7zPcJMFocQ7CNa-ORol3-y4qjpb-f3GC5g/pub?gid=2102778375&single=true&output=csv";
const APRIL_CSV_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTtADRNEx9M4uGiDjqrSppUqUO-YUfDp8WcgRSLvWQUgg7zPcJMFocQ7CNa-ORol3-y4qjpb-f3GC5g/pub?gid=172900262&single=true&output=csv";
const SUBMIT_URL   = "https://script.google.com/macros/s/AKfycbwNOAIXeCzELix1DTOBKYuZ33i2aABv0SObw3l05bBjPFBpkBEWz19XM6Cnzozh0eN19Q/exec";
const DEADLINE     = new Date("2026-06-11T14:00:00");

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
:root{--bg:#0d0f14;--sur:#161a23;--sur2:#1e2330;--bdr:#2a3044;--gold:#f5c842;--gold2:#e6a800;--red:#e84545;--grn:#3dd68c;--blu:#4a9eff;--txt:#e8ecf4;--mut:#6b7799;--F:'Bebas Neue',sans-serif;--B:'DM Sans',sans-serif}
body{background:var(--bg);color:var(--txt);font-family:var(--B);min-height:100vh}
.hdr{background:linear-gradient(135deg,#0d0f14,#1a1f2e);border-bottom:2px solid var(--gold);padding:0 24px;position:sticky;top:0;z-index:100;display:flex;align-items:center;justify-content:space-between;height:64px}
.logo{font-family:var(--F);font-size:28px;letter-spacing:2px;color:var(--gold)}.logo span{color:var(--txt)}
.nav{display:flex;gap:4px;padding:16px 24px 0;border-bottom:1px solid var(--bdr);background:var(--sur);overflow-x:auto}
.ntab{padding:10px 20px 12px;border:none;background:transparent;color:var(--mut);font-family:var(--F);font-size:18px;letter-spacing:1px;cursor:pointer;border-bottom:3px solid transparent;margin-bottom:-1px;transition:all .2s;white-space:nowrap}
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
.dctitle{font-family:var(--F);font-size:22px;letter-spacing:1px}.dcsub{font-size:13px;color:var(--mut);margin-top:2px}
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
.tabs2{display:flex;background:var(--bg);border:1px solid var(--bdr);border-radius:6px;overflow:hidden;margin-bottom:16px;width:fit-content;flex-wrap:wrap}
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
.month-badge{display:inline-block;padding:2px 10px;border-radius:12px;font-size:11px;font-weight:700;letter-spacing:1px;margin-left:8px}
.month-current{background:rgba(61,214,140,.15);color:var(--grn);border:1px solid rgba(61,214,140,.3)}
.month-past{background:var(--sur2);color:var(--mut);border:1px solid var(--bdr)}
/* ENTRY FORM */
.entry-form{max-width:800px;margin:0 auto}
.form-section{background:var(--sur);border:1px solid var(--bdr);border-radius:8px;margin-bottom:20px;overflow:hidden}
.form-section-hdr{padding:14px 20px;background:var(--bg);border-bottom:1px solid var(--bdr);font-family:var(--F);font-size:18px;letter-spacing:1px;display:flex;align-items:center;justify-content:space-between}
.form-section-hdr .num{color:var(--gold)}
.form-group{padding:16px 20px;border-bottom:1px solid rgba(42,48,68,.4)}.form-group:last-child{border-bottom:none}
.form-label{font-size:12px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:var(--mut);margin-bottom:8px;display:block}
.form-input{width:100%;background:var(--bg);border:1px solid var(--bdr);border-radius:6px;padding:10px 14px;color:var(--txt);font-family:var(--B);font-size:14px;outline:none;transition:border-color .15s}
.form-input:focus{border-color:var(--gold)}.form-input::placeholder{color:var(--mut)}
.team-select-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:8px;padding:4px 0}
.team-btn{padding:9px 12px;border:1px solid var(--bdr);border-radius:6px;background:var(--bg);color:var(--txt);font-family:var(--B);font-size:13px;cursor:pointer;transition:all .15s;text-align:left}
.team-btn:hover{border-color:var(--gold);color:var(--gold)}
.team-btn.sel-1x{border-color:var(--gold);background:rgba(245,200,66,.12);color:var(--gold);font-weight:600}
.team-btn.sel-2x{border-color:var(--blu);background:rgba(74,158,255,.12);color:var(--blu);font-weight:600}
.team-btn.sel-3x{border-color:var(--red);background:rgba(232,69,69,.12);color:var(--red);font-weight:600}
.group-pick-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:10px}
.group-pick-label{font-family:var(--F);font-size:16px;letter-spacing:1px}
.pick-check{width:22px;height:22px;border-radius:50%;border:2px solid var(--bdr);display:flex;align-items:center;justify-content:center;font-size:12px;flex-shrink:0}
.pick-check.done{background:var(--grn);border-color:var(--grn);color:#000}
.progress-bar-wrap{margin-bottom:20px}
.progress-bar{height:6px;background:var(--bdr);border-radius:3px;overflow:hidden}
.progress-fill{height:100%;background:linear-gradient(90deg,var(--gold),var(--grn));border-radius:3px;transition:width .3s}
.progress-label{display:flex;justify-content:space-between;font-size:12px;color:var(--mut);margin-bottom:6px}
.submit-btn{width:100%;padding:16px;background:var(--gold);color:#000;border:none;border-radius:8px;font-family:var(--F);font-size:24px;letter-spacing:2px;cursor:pointer;transition:all .2s;margin-top:8px}
.submit-btn:hover:not(:disabled){background:var(--gold2);transform:translateY(-1px)}
.submit-btn:disabled{opacity:.5;cursor:not-allowed}
.success-screen{text-align:center;padding:60px 24px;max-width:600px;margin:0 auto}
.success-icon{font-size:72px;margin-bottom:20px}
.success-title{font-family:var(--F);font-size:48px;letter-spacing:3px;color:var(--grn);margin-bottom:12px}
.success-sub{color:var(--mut);font-size:16px;line-height:1.6;margin-bottom:32px}
.picks-summary{background:var(--sur);border:1px solid var(--bdr);border-radius:8px;padding:20px;text-align:left;margin-bottom:24px}
.picks-summary-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid rgba(42,48,68,.4);font-size:14px}.picks-summary-row:last-child{border-bottom:none}
.picks-summary-label{color:var(--mut)}.picks-summary-value{font-weight:600;color:var(--txt)}
.deadline-banner{background:rgba(232,69,69,.1);border:1px solid rgba(232,69,69,.3);border-radius:8px;padding:20px 24px;margin-bottom:24px;display:flex;align-items:center;gap:16px}
.deadline-banner-icon{font-size:32px}
.deadline-banner-title{font-family:var(--F);font-size:20px;color:var(--red);letter-spacing:1px}
.deadline-banner-sub{font-size:13px;color:var(--mut);margin-top:2px}
.gb-select{width:100%;background:var(--bg);border:1px solid var(--bdr);border-radius:6px;padding:10px 14px;color:var(--txt);font-family:var(--B);font-size:14px;outline:none;cursor:pointer}
.gb-select:focus{border-color:var(--gold)}
.error-msg{background:rgba(232,69,69,.1);border:1px solid rgba(232,69,69,.3);color:var(--red);border-radius:6px;padding:12px 16px;font-size:14px;margin-bottom:16px}
`;

function RB({rank}) {
  return <span className={`rbadge ${rank===1?'r1':rank===2?'r2':rank===3?'r3':''}`}>{rank}</span>;
}

// ── WORLD CUP ENTRY FORM ──────────────────────────────────────────────────────
function WCEntryForm() {
  const isOpen = new Date() < DEADLINE;
  const [picks, setPicks] = useState({});
  const [goldenBoot, setGoldenBoot] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const totalGroups = WC_GROUPS.length;
  const pickedCount = Object.keys(picks).length;
  const allPicked = pickedCount === totalGroups;
  const canSubmit = allPicked && goldenBoot && name.trim() && email.trim() && !submitting;

  const getMult = m => m===2?"2x":m===3?"3x":"1x";

  const handleSubmit = async () => {
    setError("");
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!email.trim() || !email.includes("@")) { setError("Please enter a valid email."); return; }
    if (!allPicked) { setError("Please pick one team from every group."); return; }
    if (!goldenBoot) { setError("Please select a Golden Boot pick."); return; }
    setSubmitting(true);
    try {
      // Check existing entry count for this email
      const checkRes = await fetch(SUBMIT_URL + "?email=" + encodeURIComponent(email.trim()));
      const checkData = await checkRes.json();
      const existingCount = checkData.submissions
        ? checkData.submissions.filter(s => s.email.toLowerCase() === email.trim().toLowerCase()).length
        : 0;
      if (existingCount >= 2) {
        setError("This email already has 2 entries — the maximum allowed. Please use a different email if you'd like to enter again.");
        setSubmitting(false);
        return;
      }
      const payload = { name: name.trim(), email: email.trim(), goldenBoot, ...picks };
      await fetch(SUBMIT_URL, { method:"POST", mode:"no-cors", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload) });
      setSubmitted(true);
    } catch { setError("Something went wrong. Please try again."); }
    setSubmitting(false);
  };

  if (submitted) return (
    <div className="success-screen">
      <div className="success-icon">🎉</div>
      <div className="success-title">YOU'RE IN!</div>
      <div className="success-sub">Your picks have been submitted. Good luck {name}! Check back once the tournament starts to follow your teams.<br/><br/><span style={{color:"var(--gold)"}}>You may submit 1 more entry</span> if you'd like a second lineup.</div>
      <div className="picks-summary">
        <div style={{fontFamily:"var(--F)",fontSize:16,letterSpacing:1,color:"var(--gold)",marginBottom:12}}>YOUR PICKS</div>
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
      <button className="submit-btn" onClick={()=>{setSubmitted(false);setPicks({});setGoldenBoot("");setName("");setEmail("");}}>SUBMIT ANOTHER ENTRY</button>
    </div>
  );

  if (!isOpen) return (
    <div style={{textAlign:"center",padding:"60px 24px"}}>
      <div style={{fontSize:64,marginBottom:16}}>🔒</div>
      <div style={{fontFamily:"var(--F)",fontSize:36,letterSpacing:2,color:"var(--red)",marginBottom:12}}>SUBMISSIONS CLOSED</div>
      <div style={{color:"var(--mut)",fontSize:16}}>The deadline for World Cup picks has passed.</div>
    </div>
  );

  return (
    <div className="entry-form">
      <div className="deadline-banner">
        <div className="deadline-banner-icon">⏰</div>
        <div>
          <div className="deadline-banner-title">PICKS DUE JUNE 11 · 2:00 PM</div>
          <div className="deadline-banner-sub">Entry fee: $35 · 12 team picks + Golden Boot player · Maximum 2 entries per person</div>
        </div>
      </div>
      <div className="progress-bar-wrap">
        <div className="progress-label">
          <span>Groups picked: {pickedCount} / {totalGroups}</span>
          <span>{allPicked?"✅ All groups picked!":`${totalGroups-pickedCount} remaining`}</span>
        </div>
        <div className="progress-bar"><div className="progress-fill" style={{width:`${(pickedCount/totalGroups)*100}%`}}/></div>
      </div>
      <div className="form-section">
        <div className="form-section-hdr"><span><span className="num">01 · </span>YOUR INFO</span></div>
        <div className="form-group">
          <label className="form-label">Your Name</label>
          <input className="form-input" placeholder="First and last name" value={name} onChange={e=>setName(e.target.value)}/>
        </div>
        <div className="form-group">
          <label className="form-label">Email Address</label>
          <input className="form-input" type="email" placeholder="your@email.com" value={email} onChange={e=>setEmail(e.target.value)}/>
        </div>
      </div>
      <div className="form-section">
        <div className="form-section-hdr"><span><span className="num">02 · </span>PICK YOUR 12 TEAMS</span><span style={{fontSize:13,fontFamily:"var(--B)",fontWeight:400,color:"var(--mut)"}}>1 team per group</span></div>
        {WC_GROUPS.map(g=>{
          const picked=picks[`group${g.group}`];
          return (
            <div className="form-group" key={g.group}>
              <div className="group-pick-hdr">
                <div>
                  <div className="group-pick-label" style={{color:g.multiplier===2?"var(--blu)":g.multiplier===3?"var(--red)":"var(--gold)"}}>
                    Pool Group {g.group}
                    {g.multiplier>1&&<span style={{marginLeft:8,fontSize:12}}>{g.multiplier===2?<span className="m2x">2× DOUBLE</span>:<span className="m3x">3× TRIPLE</span>}</span>}
                  </div>
                  {picked&&<div style={{fontSize:12,color:"var(--mut)",marginTop:2}}>Selected: <strong style={{color:"var(--txt)"}}>{picked}</strong></div>}
                </div>
                <div className={`pick-check ${picked?"done":""}`}>{picked?"✓":""}</div>
              </div>
              <div className="team-select-grid">
                {g.teams.map(team=>(
                  <button key={team} className={`team-btn ${picked===team?`sel-${getMult(g.multiplier)}`:""}`} onClick={()=>setPicks(prev=>({...prev,[`group${g.group}`]:team}))}>
                    {picked===team?"✓ ":""}{team}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <div className="form-section">
        <div className="form-section-hdr"><span><span className="num">03 · </span>GOLDEN BOOT PICK</span></div>
        <div className="form-group">
          <label className="form-label">Who will score the most goals in the tournament?</label>
          <div style={{fontSize:12,color:"var(--mut)",marginBottom:10}}>$5 from each entry goes to whoever picks the correct Golden Boot winner. If multiple people pick correctly, the pot splits.</div>
          <select className="gb-select" value={goldenBoot} onChange={e=>setGoldenBoot(e.target.value)}>
            <option value="">— Select a player —</option>
            {GOLDEN_BOOT_PLAYERS.map(p=><option key={p} value={p}>{p}</option>)}
          </select>
        </div>
      </div>
      {error&&<div className="error-msg">⚠️ {error}</div>}
      <div className="form-section" style={{padding:20}}>
        <div style={{fontSize:13,color:"var(--mut)",marginBottom:16,lineHeight:1.6}}>
          By submitting you agree to pay the <strong style={{color:"var(--txt)"}}>$35 entry fee</strong>. Payment instructions will be sent to your email. Your picks are locked once submitted.
        </div>
        <button className="submit-btn" onClick={handleSubmit} disabled={!canSubmit}>
          {submitting?"SUBMITTING...":canSubmit?"SUBMIT MY PICKS →":`COMPLETE ALL FIELDS ${!allPicked?`(${totalGroups-pickedCount} groups left)`:""}`}
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
function Dashboard({setTab, allData, updatedAt}) {
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
            <div className="dico" style={{background:"rgba(61,214,140,.1)"}}>⚽</div>
            <div><div className="dctitle">World Cup Pool</div><div className="dcsub">FIFA World Cup 2026</div></div>
            <span className="bsoon" style={{marginLeft:"auto"}}>OPEN</span>
          </div>
          <div className="dcbody">
            <div className="dsr"><span className="dsl">Format</span><span className="dsv">12 picks + Golden Boot</span></div>
            <div className="dsr"><span className="dsl">Entry</span><span className="dsv">$35</span></div>
            <div className="dsr"><span className="dsl">Picks Due</span><span className="dsv">Jun 11, 2026 · 2:00 PM</span></div>
            <div className="dsr" style={{marginBottom:0}}><span className="dsl">Status</span><span className="dsv" style={{color:"var(--grn)"}}>✅ Submissions Open</span></div>
          </div>
          <button className="dcta">SUBMIT YOUR PICKS →</button>
        </div>
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

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  const [tab, setTab] = useState("dashboard");
  const [allData, setAllData] = useState({});
  const [updatedAt, setUpdatedAt] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  return (
    <>
      <style>{S}</style>
      <div>
        <header className="hdr">
          <div className="logo">POOL<span>HUB</span></div>
          <div style={{fontSize:13,color:"var(--mut)"}}>Fantasy Sports · 2026</div>
        </header>
        <nav className="nav">
          {[{id:"dashboard",label:"🏠 Dashboard"},{id:"hr",label:"⚾ HR Derby"},{id:"wc",label:"⚽ World Cup"}].map(t=>(
            <button key={t.id} className={`ntab ${tab===t.id?"on":""}`} onClick={()=>setTab(t.id)}>{t.label}</button>
          ))}
        </nav>
        <main className="main">
          {tab==="dashboard"&&<Dashboard setTab={setTab} allData={allData} updatedAt={updatedAt}/>}
          {tab==="hr"&&<HRDerby allData={allData} loading={loading}/>}
          {tab==="wc"&&<WorldCup/>}
        </main>
      </div>
    </>
  );
}
