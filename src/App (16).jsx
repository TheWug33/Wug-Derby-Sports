import React, { useState, useEffect } from "react";

const JUNE_CSV  = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTtADRNEx9M4uGiDjqrSppUqUO-YUfDp8WcgRSLvWQUgg7zPcJMFocQ7CNa-ORol3-y4qjpb-f3GC5g/pub?gid=966793280&single=true&output=csv";
const MAY_CSV   = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTtADRNEx9M4uGiDjqrSppUqUO-YUfDp8WcgRSLvWQUgg7zPcJMFocQ7CNa-ORol3-y4qjpb-f3GC5g/pub?gid=2102778375&single=true&output=csv";
const APRIL_CSV = "https://docs.google.com/spreadsheets/d/e/2PACX-1vTtADRNEx9M4uGiDjqrSppUqUO-YUfDp8WcgRSLvWQUgg7zPcJMFocQ7CNa-ORol3-y4qjpb-f3GC5g/pub?gid=172900262&single=true&output=csv";
const SUBS_CSV  = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSIMLdOoB3zeM0gpqCd6ejUT-eLYl1DHYjCz477dv9fF-fhTO27xXvjAtXJNvrbFpr5EFFJiIOefJYE/pub?gid=972756262&single=true&output=csv";
const SUBMIT_URL = "https://script.google.com/macros/s/AKfycbwNOAIXeCzELix1DTOBKYuZ33i2aABv0SObw3l05bBjPFBpkBEWz19XM6Cnzozh0eN19Q/exec";
const DEADLINE  = new Date("2026-06-11T15:00:00");

const WC_GROUPS = [
  {group:1,mult:1,teams:["France","Spain","England","Brazil"]},
  {group:2,mult:1,teams:["Argentina","Portugal","Germany","Netherlands"]},
  {group:3,mult:1,teams:["Norway","Belgium","Colombia","Morocco"]},
  {group:4,mult:1,teams:["Japan","United States","Uruguay","Mexico"]},
  {group:5,mult:1,teams:["Switzerland","Croatia","Ecuador","Turkey"]},
  {group:6,mult:2,teams:["Sweden","Senegal","Paraguay","Austria"]},
  {group:7,mult:2,teams:["Scotland","Canada","Ivory Coast","Czech Republic"]},
  {group:8,mult:2,teams:["Bosnia","Ghana","Egypt","Algeria"]},
  {group:9,mult:2,teams:["South Korea","Tunisia","Australia","Iran"]},
  {group:10,mult:3,teams:["DR Congo","South Africa","Uzbekistan","Panama"]},
  {group:11,mult:3,teams:["Qatar","Iraq","Saudi Arabia","Cape Verde"]},
  {group:12,mult:3,teams:["New Zealand","Curacao","Jordan","Haiti"]},
];

const WC_SCORING = [
  {event:"Each goal scored",pts:1},
  {event:"Group play win",pts:3},
  {event:"Group play draw",pts:1},
  {event:"Win group (1st place)",pts:8},
  {event:"Finish 2nd in group",pts:4},
  {event:"Advance as best 3rd-place",pts:2},
  {event:"Win Round of 32 (reach R16)",pts:8},
  {event:"Reach Quarterfinals",pts:12},
  {event:"Reach Semifinals",pts:24},
  {event:"Reach Final",pts:36},
  {event:"Win Final (Champion)",pts:48},
];

const GOLDEN_BOOT_PLAYERS = [
  "Kylian Mbappé","Harry Kane","Lionel Messi","Erling Haaland","Lamine Yamal",
  "Michael Olise","Cole Palmer","Mikel Oyarzabal","Cristiano Ronaldo","Vinicius Junior",
  "Lautaro Martinez","Ousmane Dembele","Romelu Lukaku","Raphinha","Nick Woltemade",
  "Julian Alvarez","Alvaro Morata","Richarlison","Joao Pedro","Cody Gakpo",
  "Bukayo Saka","Memphis Depay","Ferran Torres","Mikel Merino","Igor Thiago",
  "Jean-Philippe Mateta","Jude Bellingham","Goncalo Ramos","Florian Wirtz","Marcus Thuram",
  "Neymar","Bruno Fernandes","Luis Diaz","Desire Doue","Mohamed Salah",
  "Kai Havertz","Dani Olmo","Deniz Undav","Viktor Gyokeres","Enner Valencia",
  "Donyell Malen","Morgan Rogers","Santiago Gimenez","Darwin Nunez","Eberechi Eze",
  "Lois Openda","Jamal Musiala","Leandro Trossard","Marcus Rashford","Matheus Cunha",
  "Alexander Sorloth","Alexander Isak","Folarin Balogun","Kevin De Bruyne","Christian Pulisic",
  "Anthony Gordon","Rafael Leao","Jeremy Doku","Sadio Mane","Leroy Sane",
  "Jhon Duran","Raul Jimenez","Ante Budimir","Brian Brobbey","Christoph Baumgartner",
  "Ollie Watkins","Omar Marmoush","Arda Guler","Mohammed Kudus","Nicolas Jackson",
  "Jonathan David","Kenan Yildiz","Pedro Neto","Haji Wright","Nico Williams",
  "Ricardo Pepi","Scott McTominay","Bradley Barcola","Casemiro","Charles De Ketelaere",
  "Gabriel Martinelli","Rayan Cherki","Breel Embolo","Ismaila Sarr","Hamza Igamane",
  "Noa Lang","Hirving Lozano","Lee Kang-In","Enzo Fernandez","Jorgen Strand Larsen",
  "Riyad Mahrez","James Rodriguez","Brahim Diaz","Andrej Kramaric","Jhon Arias",
  "Ange-Yoan Bonny","Ivan Toney","Julian Quinones","Pedri","Che Adams",
  "Chris Wood","Oscar Bobb","Cyle Larin","Martin Odegaard","Daizen Maeda",
  "Amad Diallo","Denzel Dumfries","Ermedin Demirovic","Lawrence Shankland","Lucas Paqueta",
  "Nicolas Pepe","Noah Okafor","Zeki Amdouni","Giovanni Reyna","Julio Enciso",
  "Achraf Hakimi","Anthony Elanga","Cedric Bakambu","Dan Ndoye","Marcel Sabitzer",
  "Yoane Wissa","Brenden Aaronson","Lyle Foster","John McGinn",
];

const TEAM_MAP = {
  "USA":"United States","United States":"United States","Türkiye":"Turkey","Turkey":"Turkey",
  "South Korea":"South Korea","Korea Republic":"South Korea","Côte d'Ivoire":"Ivory Coast",
  "Ivory Coast":"Ivory Coast","Bosnia and Herzegovina":"Bosnia","Bosnia":"Bosnia",
  "Curaçao":"Curacao","Curacao":"Curacao","Congo DR":"DR Congo","DR Congo":"DR Congo",
  "France":"France","Spain":"Spain","England":"England","Brazil":"Brazil",
  "Argentina":"Argentina","Portugal":"Portugal","Germany":"Germany","Netherlands":"Netherlands",
  "Norway":"Norway","Belgium":"Belgium","Colombia":"Colombia","Morocco":"Morocco",
  "Japan":"Japan","Uruguay":"Uruguay","Mexico":"Mexico","Switzerland":"Switzerland",
  "Croatia":"Croatia","Ecuador":"Ecuador","Sweden":"Sweden","Senegal":"Senegal",
  "Paraguay":"Paraguay","Austria":"Austria","Scotland":"Scotland","Canada":"Canada",
  "Czech Republic":"Czech Republic","Ghana":"Ghana","Egypt":"Egypt","Algeria":"Algeria",
  "Tunisia":"Tunisia","Australia":"Australia","Iran":"Iran","South Africa":"South Africa",
  "Uzbekistan":"Uzbekistan","Panama":"Panama","Qatar":"Qatar","Iraq":"Iraq",
  "Saudi Arabia":"Saudi Arabia","Cape Verde":"Cape Verde","New Zealand":"New Zealand",
  "Jordan":"Jordan","Haiti":"Haiti",
};

function parseCSV(text) {
  return text.split("\n").map(function(r) {
    var cells = [], cur = "", inQ = false;
    for (var i = 0; i < r.length; i++) {
      var c = r[i];
      if (c === '"') { inQ = !inQ; }
      else if (c === ',' && !inQ) { cells.push(cur.trim()); cur = ""; }
      else { cur += c; }
    }
    cells.push(cur.trim());
    return cells;
  });
}

function parseHRData(text) {
  var rows = parseCSV(text);
  var playerHR = {};
  var monthlyStandings = [];
  var seasonStandings = [];
  var rosters = {};
  var currentTeams = [null,null,null,null];
  var SKIP = ["2025","Total HRs","May","April","June","Season","Player","Monthly Winners",
    "Overall Season Winners","1st - $75","2nd - $50","1st - $300","2nd - $175","3rd - $75",
    "Overall Standings","Standings","Home Run Totals","Player Name","Rank",""];
  var colGroups = [[6,7,8,9],[11,12,13,14],[16,17,18,19],[21,22,23,24]];
  var inSeason = false;

  for (var ri = 0; ri < rows.length; ri++) {
    var row = rows[ri];
    // Player HR lookup
    var nc = row[35]||"", hc = row[36]||"";
    if (nc && hc !== "" && nc !== "Player Name") { playerHR[nc.trim()] = parseInt(hc)||0; }
    var ranked = row[28]||"", rankedHR = row[29]||"";
    if (ranked && rankedHR !== "" && /^\d+\./.test(ranked)) {
      var m = ranked.match(/^\d+\.\s+(.+?)\s+\([A-Z]+\)$/);
      if (m) { playerHR[m[1].trim()] = parseInt(rankedHR)||0; }
    }
    // Monthly standings
    if (ri < 30 && row[0] && !isNaN(parseInt(row[0])) && row[1] && row[1] !== "Overall Standings") {
      monthlyStandings.push({rank:parseInt(row[0]),name:row[1],month:parseInt(row[2])||0,season:parseInt(row[3])||0});
    }
    // Season standings
    if (row[1] === "Overall Standings") { inSeason = true; }
    if (inSeason && row[0] && !isNaN(parseInt(row[0])) && row[1] && row[2]) {
      seasonStandings.push({rank:parseInt(row[0]),name:row[1],season:parseInt(row[2])||0});
    }
    // Rosters
    for (var gi = 0; gi < colGroups.length; gi++) {
      var cg = colGroups[gi];
      var v0=row[cg[0]]||"", v1=row[cg[1]]||"", v2=row[cg[2]]||"", v3=row[cg[3]]||"";
      if (v0 && SKIP.indexOf(v0) === -1 && isNaN(parseInt(v0)) && !v1) {
        currentTeams[gi] = v0;
        if (!rosters[v0]) { rosters[v0] = {players:[],cap:null,month:0,season:0}; }
      } else if (!isNaN(parseInt(v0)) && v1 && SKIP.indexOf(v1) === -1) {
        var team = currentTeams[gi];
        if (team && rosters[team]) {
          var mhr = v2 !== "" ? parseInt(v2) : null;
          var shr = v3 !== "" ? parseInt(v3) : null;
          rosters[team].players.push({name:v1.trim(),cap2025:parseInt(v0),month:mhr,season:shr,swap:mhr===null&&shr===null});
        }
      } else if (v1 === "Total HRs" && !isNaN(parseInt(v0))) {
        var t2 = currentTeams[gi];
        if (t2 && rosters[t2]) {
          rosters[t2].cap = parseInt(v0);
          rosters[t2].month = parseInt(v2)||0;
          rosters[t2].season = parseInt(v3)||0;
        }
      }
    }
    // HR leaders
  }
  var hrLeaders = [];
  for (var li = 0; li < rows.length; li++) {
    var lrow = rows[li];
    var lcell = lrow[28]||"", lhr = lrow[29]||"";
    if (lcell && lhr !== "" && /^\d+\./.test(lcell)) {
      var lm = lcell.match(/^(\d+)\.\s+(.+?)\s+\(([A-Z]+)\)$/);
      if (lm) { hrLeaders.push({rank:parseInt(lm[1]),name:lm[2].trim(),team:lm[3],hr:parseInt(lhr)||0}); }
    }
  }
  var rosterArr = Object.keys(rosters).map(function(k) { return Object.assign({teamName:k}, rosters[k]); });
  return {monthlyStandings:monthlyStandings, seasonStandings:seasonStandings, rosters:rosterArr, hrLeaders:hrLeaders, playerHR:playerHR};
}

function parseSubmissions(text) {
  var rows = parseCSV(text);
  var subs = [];
  for (var i = 1; i < rows.length; i++) {
    var r = rows[i];
    if (!r[1]) continue;
    var entry = {timestamp:r[0],name:r[1],email:r[2]};
    for (var g = 1; g <= 12; g++) { entry["group"+g] = r[g+2]||""; }
    entry.goldenBoot = r[15]||"";
    entry.entryNumber = r[17]||1;
    subs.push(entry);
  }
  return subs;
}

function calcScore(entry, teamStats) {
  var total = 0;
  var breakdown = {};
  for (var g = 1; g <= 12; g++) {
    var team = entry["group"+g]||"";
    var mult = g >= 10 ? 3 : g >= 6 ? 2 : 1;
    var stats = teamStats[team]||{};
    var pts = 0;
    pts += (stats.goals||0) * 1;
    pts += (stats.wins||0) * 3;
    pts += (stats.draws||0) * 1;
    if (stats.groupWin) pts += 8;
    else if (stats.group2nd) pts += 4;
    else if (stats.group3rd) pts += 2;
    if (stats.r32win) pts += 8;
    if (stats.qf) pts += 12;
    if (stats.sf) pts += 24;
    if (stats.final) pts += 36;
    if (stats.champion) pts += 48;
    var scored = pts * mult;
    breakdown["group"+g] = {team:team,pts:pts,mult:mult,scored:scored};
    total += scored;
  }
  return {total:total,breakdown:breakdown};
}

const S = `
@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600&display=swap');
*{box-sizing:border-box;margin:0;padding:0}
body{background:#000;color:#fff;font-family:'DM Sans',sans-serif;min-height:100vh}
.hdr{background:#000;border-bottom:2px solid #fff;padding:0 20px;position:sticky;top:0;z-index:100;display:flex;align-items:center;justify-content:space-between;height:60px}
.logo{font-family:'Bebas Neue',sans-serif;font-size:26px;letter-spacing:2px;color:#00c4b4;cursor:pointer}
.logo span{color:#fff}
.nav{display:flex;gap:2px;padding:14px 20px 0;border-bottom:2px solid #fff;background:#000;overflow-x:auto}
.ntab{padding:9px 18px 11px;border:none;background:transparent;color:#5fa89e;font-family:'Bebas Neue',sans-serif;font-size:17px;letter-spacing:1px;cursor:pointer;border-bottom:3px solid transparent;margin-bottom:-2px;white-space:nowrap}
.ntab.on{color:#00c4b4;border-bottom-color:#fff}
.main{padding:20px;max-width:1200px;margin:0 auto}
.phdr{background:#000;border:2px solid #fff;border-left:5px solid #00c4b4;border-radius:8px;padding:18px 20px;margin-bottom:20px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:10px}
.ptitle{font-family:'Bebas Neue',sans-serif;font-size:30px;letter-spacing:2px;color:#00c4b4}
.pmeta{display:flex;gap:10px;flex-wrap:wrap;align-items:center}
.pill{background:#000;border:1px solid #fff;border-radius:20px;padding:3px 12px;font-size:12px;color:#5fa89e}
.pill strong{color:#fff}
.stabs{display:flex;gap:6px;margin-bottom:18px;flex-wrap:wrap}
.stab{padding:7px 16px;border:1px solid #fff;border-radius:4px;background:#000;color:#5fa89e;font-size:13px;font-weight:500;cursor:pointer}
.stab.on{background:#00c4b4;color:#000;border-color:#fff;font-weight:600}
.card{background:#000;border:2px solid #fff;border-radius:8px;overflow:hidden;margin-bottom:18px}
.chdr{padding:12px 18px;border-bottom:2px solid #fff;font-family:'Bebas Neue',sans-serif;font-size:19px;letter-spacing:1px;color:#00c4b4;display:flex;align-items:center;gap:8px}
table{width:100%;border-collapse:collapse}
th{background:#0a1a1a;padding:9px 14px;text-align:left;font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#5fa89e;border-bottom:2px solid #fff}
td{padding:9px 14px;border-bottom:1px solid #111;font-size:13px}
tr:last-child td{border-bottom:none}
tr:hover td{background:rgba(0,196,180,.06)}
th.r,td.r{text-align:right}
.rb{display:inline-flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:50%;font-size:11px;font-weight:700;background:#0a1a1a;color:#5fa89e;border:1px solid #333}
.rb1{background:#00c4b4;color:#000;border-color:#fff}
.rb2{background:#b0b8cc;color:#000;border-color:#fff}
.rb3{background:#cd7f32;color:#fff;border-color:#fff}
.hn{font-family:'Bebas Neue',sans-serif;font-size:19px;color:#00c4b4}
.lbar{height:4px;background:#111;border-radius:2px;margin-top:4px}
.lfill{height:100%;border-radius:2px;background:#00c4b4}
.podium{display:flex;gap:10px;margin-bottom:18px}
.pod{flex:1;background:#000;border:2px solid #fff;border-radius:8px;padding:14px;text-align:center}
.pod.p1{border-color:#00c4b4}
.pos{font-family:'Bebas Neue',sans-serif;font-size:28px}
.p1 .pos{color:#00c4b4}.p2 .pos{color:#b0b8cc}.p3 .pos{color:#cd7f32}
.pname{font-weight:600;font-size:13px;margin:3px 0 2px}
.pval{font-family:'Bebas Neue',sans-serif;font-size:22px}
.plbl{font-size:10px;color:#5fa89e;letter-spacing:1px}
@media(max-width:500px){.podium{flex-direction:column}}
.spin{width:44px;height:44px;border:4px solid #111;border-top-color:#00c4b4;border-radius:50%;animation:spin .8s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.ctr{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:60px;gap:14px;color:#5fa89e}
.badge-live{background:rgba(0,229,212,.15);color:#00e5d4;border:1px solid #00e5d4;border-radius:4px;padding:2px 8px;font-size:11px;font-weight:700;letter-spacing:1px}
.badge-open{background:rgba(0,196,180,.15);color:#00c4b4;border:1px solid #fff;border-radius:4px;padding:2px 8px;font-size:11px;font-weight:700}
.badge-err{background:rgba(232,69,69,.12);border:1px solid #e84545;color:#e84545;border-radius:4px;padding:3px 10px;font-size:12px;font-weight:600}
.dc{background:#000;border:2px solid #fff;border-radius:10px;overflow:hidden;cursor:pointer;transition:border-color .15s}
.dc:hover{border-color:#00c4b4}
.dctop{padding:18px;border-bottom:2px solid #fff;display:flex;align-items:center;gap:14px}
.dico{width:48px;height:48px;border-radius:8px;border:2px solid #fff;display:flex;align-items:center;justify-content:center;font-size:22px}
.dctitle{font-family:'Bebas Neue',sans-serif;font-size:20px;letter-spacing:1px}
.dcsub{font-size:12px;color:#5fa89e;margin-top:2px}
.dcbody{padding:14px 18px}
.dsr{display:flex;justify-content:space-between;margin-bottom:7px;font-size:12px}
.dsl{color:#5fa89e}.dsv{font-weight:600;color:#fff}
.dcta{display:block;text-align:center;padding:9px;background:#00c4b4;color:#000;font-weight:700;border:none;cursor:pointer;width:100%;font-family:'Bebas Neue',sans-serif;font-size:15px;letter-spacing:1px;border-top:2px solid #fff}
.dgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(280px,1fr));gap:16px;margin-bottom:24px}
.tabs2{display:flex;background:#000;border:2px solid #fff;border-radius:6px;overflow:hidden;margin-bottom:14px;width:fit-content}
.t2{padding:7px 16px;font-size:12px;font-weight:600;cursor:pointer;border:none;background:transparent;color:#5fa89e;letter-spacing:.5px}
.t2.on{background:#00c4b4;color:#000}
.rgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:14px}
.rc{background:#000;border:2px solid #fff;border-radius:8px;overflow:hidden}
.rchdr{padding:10px 14px;background:#0a1a1a;border-bottom:2px solid #fff;display:flex;align-items:center;justify-content:space-between}
.rcname{font-family:'Bebas Neue',sans-serif;font-size:15px;letter-spacing:1px}
.swap-b{font-size:10px;background:rgba(0,196,180,.15);color:#00c4b4;border:1px solid #00c4b4;border-radius:3px;padding:1px 5px;margin-left:5px;font-weight:700}
.ggrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px}
.gc{background:#000;border:2px solid #fff;border-radius:8px;overflow:hidden}
.gc-hdr{padding:9px 14px;display:flex;align-items:center;justify-content:space-between;border-bottom:2px solid #fff}
.gc-name{font-family:'Bebas Neue',sans-serif;font-size:17px;letter-spacing:1px;color:#00c4b4}
.gc-row{padding:7px 14px;font-size:13px;border-bottom:1px solid #111;color:#fff}
.gc-row:last-child{border-bottom:none}
.m2x{color:#00c4b4;font-size:11px;font-weight:700;background:rgba(0,196,180,.1);padding:2px 6px;border-radius:3px;border:1px solid #00c4b4}
.m3x{color:#fff;font-size:11px;font-weight:700;background:rgba(255,255,255,.1);padding:2px 6px;border-radius:3px;border:1px solid #fff}
.m1x{color:#5fa89e;font-size:11px;font-weight:600}
.srow{display:flex;justify-content:space-between;align-items:center;padding:9px 16px;border-bottom:1px solid #111}
.srow:last-child{border-bottom:none}
.spts{font-family:'Bebas Neue',sans-serif;font-size:20px;color:#00c4b4}
.ri{display:flex;gap:10px;padding:9px 0;border-bottom:1px solid #111;font-size:13px;line-height:1.6;color:#ddd}
.ri:last-child{border-bottom:none}
.rn{color:#00c4b4;font-family:'Bebas Neue',sans-serif;font-size:17px;min-width:22px}
.rbox{background:#000;border:1px solid #fff;border-radius:6px;padding:18px}
.fi{background:#000;border:2px solid #333;border-radius:8px;padding:14px;margin-bottom:10px}
.fi.live{border-color:#e84545}
.fi.done{border-color:#333}
.fi-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;font-size:11px;color:#5fa89e;letter-spacing:1px;text-transform:uppercase}
.fi-score{font-family:'Bebas Neue',sans-serif;font-size:26px;text-align:center;min-width:60px}
.fi-team{flex:1;font-weight:700;font-size:14px}
.fi-pickers{font-size:11px;color:#00c4b4;margin-top:3px}
.form-sec{background:#000;border:2px solid #fff;border-radius:8px;margin-bottom:16px;overflow:hidden}
.form-sec-hdr{padding:12px 18px;background:#0a1a1a;border-bottom:2px solid #fff;font-family:'Bebas Neue',sans-serif;font-size:17px;letter-spacing:1px;color:#fff;display:flex;align-items:center;justify-content:space-between}
.form-sec-hdr .num{color:#00c4b4}
.form-grp{padding:14px 18px;border-bottom:1px solid #111}
.form-grp:last-child{border-bottom:none}
.flabel{font-size:11px;font-weight:600;letter-spacing:1px;text-transform:uppercase;color:#5fa89e;margin-bottom:7px;display:block}
.finput{width:100%;background:#000;border:1px solid #fff;border-radius:6px;padding:9px 12px;color:#fff;font-family:'DM Sans',sans-serif;font-size:13px;outline:none}
.finput:focus{border-color:#00c4b4}
.finput::placeholder{color:#5fa89e}
.tbgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:7px;padding:4px 0}
.tbtn{padding:8px 11px;border:1px solid #333;border-radius:6px;background:#000;color:#fff;font-size:12px;cursor:pointer;text-align:left;transition:all .15s}
.tbtn:hover{border-color:#00c4b4;color:#00c4b4}
.tbtn.sel{border-color:#00c4b4;background:rgba(0,196,180,.12);color:#00c4b4;font-weight:600}
.pbar-wrap{margin-bottom:16px}
.pbar{height:5px;background:#111;border-radius:3px;overflow:hidden}
.pfill{height:100%;background:linear-gradient(90deg,#00c4b4,#00e5d4);border-radius:3px;transition:width .3s}
.plbl2{display:flex;justify-content:space-between;font-size:11px;color:#5fa89e;margin-bottom:5px}
.sub-btn{width:100%;padding:14px;background:#00c4b4;color:#000;border:2px solid #fff;border-radius:8px;font-family:'Bebas Neue',sans-serif;font-size:22px;letter-spacing:2px;cursor:pointer;margin-top:6px}
.sub-btn:disabled{opacity:.5;cursor:not-allowed}
.err-msg{background:rgba(232,69,69,.1);border:1px solid #e84545;color:#e84545;border-radius:6px;padding:10px 14px;font-size:13px;margin-bottom:14px}
.ok-screen{text-align:center;padding:50px 20px;max-width:550px;margin:0 auto}
.ok-icon{font-size:64px;margin-bottom:16px}
.ok-title{font-family:'Bebas Neue',sans-serif;font-size:44px;letter-spacing:3px;color:#00c4b4;margin-bottom:10px}
.ok-sub{color:#5fa89e;font-size:15px;line-height:1.6;margin-bottom:28px}
.psum{background:#000;border:2px solid #fff;border-radius:8px;padding:18px;text-align:left;margin-bottom:20px}
.psum-row{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #111;font-size:13px}
.psum-row:last-child{border-bottom:none}
.entry-card{background:#000;border:2px solid #fff;border-radius:8px;overflow:hidden;margin-bottom:12px}
.ec-hdr{padding:10px 14px;background:#0a1a1a;border-bottom:2px solid #fff;display:flex;align-items:center;justify-content:space-between}
.ec-name{font-family:'Bebas Neue',sans-serif;font-size:16px;letter-spacing:1px}
.lookup-step{max-width:500px;margin:0 auto}
.choose-step{max-width:700px;margin:0 auto}
.updated{font-size:12px;color:#5fa89e;display:flex;align-items:center;gap:6px}
.dot{width:7px;height:7px;border-radius:50%;background:#00c4b4;animation:pulse 2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.4}}
`;

function RB({rank}) {
  var cls = rank===1?"rb rb1":rank===2?"rb rb2":rank===3?"rb rb3":"rb";
  return React.createElement("span",{className:cls},rank);
}

function MultBadge({mult}) {
  if (mult===3) return React.createElement("span",{className:"m3x"},"3× TRIPLE");
  if (mult===2) return React.createElement("span",{className:"m2x"},"2× DOUBLE");
  return React.createElement("span",{className:"m1x"},"1×");
}

// ── ENTRY FORM ────────────────────────────────────────────────────────────────
function WCEntryForm() {
  var isOpen = new Date() < DEADLINE;
  var [step, setStep] = useState("lookup");
  var [lookupName, setLookupName] = useState("");
  var [lookupEmail, setLookupEmail] = useState("");
  var [lookupLoading, setLookupLoading] = useState(false);
  var [lookupError, setLookupError] = useState("");
  var [existingEntries, setExistingEntries] = useState([]);
  var [entryNumber, setEntryNumber] = useState(1);
  var [isEditing, setIsEditing] = useState(false);
  var [picks, setPicks] = useState({});
  var [goldenBoot, setGoldenBoot] = useState("");
  var [submitting, setSubmitting] = useState(false);
  var [submitted, setSubmitted] = useState(false);
  var [error, setError] = useState("");

  var totalGroups = WC_GROUPS.length;
  var pickedCount = Object.keys(picks).length;
  var allPicked = pickedCount === totalGroups;
  var canSubmit = allPicked && goldenBoot && !submitting;

  function entryFromRow(entry) {
    var p = {};
    for (var i=1;i<=12;i++) { p["group"+i] = entry["group"+i]||""; }
    return p;
  }

  function handleLookup() {
    setLookupError("");
    if (!lookupName.trim()) { setLookupError("Please enter your name."); return; }
    if (!lookupEmail.trim() || lookupEmail.indexOf("@") === -1) { setLookupError("Please enter a valid email."); return; }
    setLookupLoading(true);
    fetch(SUBMIT_URL+"?email="+encodeURIComponent(lookupEmail.trim()))
      .then(function(r){return r.json();})
      .then(function(data) {
        var entries = data.submissions||[];
        setExistingEntries(entries);
        setLookupLoading(false);
        if (entries.length === 0) {
          setEntryNumber(1); setIsEditing(false); setPicks({}); setGoldenBoot(""); setStep("form");
        } else {
          setStep("choose");
        }
      })
      .catch(function() { setLookupError("Could not check entries. Try again."); setLookupLoading(false); });
  }

  function handleChooseEdit(entry) {
    setEntryNumber(entry.entryNumber||1); setIsEditing(true);
    setPicks(entryFromRow(entry)); setGoldenBoot(entry.goldenBoot||""); setStep("form");
  }

  function handleChooseNew() {
    setEntryNumber(2); setIsEditing(false); setPicks({}); setGoldenBoot(""); setStep("form");
  }

  function handleSubmit() {
    setError("");
    if (!allPicked) { setError("Please pick one team from every group."); return; }
    if (!goldenBoot) { setError("Please select a Golden Boot pick."); return; }
    setSubmitting(true);
    var payload = Object.assign({name:lookupName.trim(),email:lookupEmail.trim(),goldenBoot:goldenBoot,entryNumber:entryNumber},picks);
    fetch(SUBMIT_URL,{method:"POST",mode:"no-cors",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)})
      .then(function() { setSubmitted(true); setSubmitting(false); })
      .catch(function() { setError("Something went wrong. Please try again."); setSubmitting(false); });
  }

  function resetAll() {
    setStep("lookup"); setLookupEmail(""); setLookupName(""); setExistingEntries([]);
    setPicks({}); setGoldenBoot(""); setSubmitted(false); setError(""); setIsEditing(false);
  }

  if (!isOpen) {
    return React.createElement("div",{style:{textAlign:"center",padding:"60px 20px"}},
      React.createElement("div",{style:{fontSize:60,marginBottom:14}},"🔒"),
      React.createElement("div",{style:{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,letterSpacing:2,color:"#e84545",marginBottom:10}},"SUBMISSIONS CLOSED"),
      React.createElement("div",{style:{color:"#5fa89e"}},"The deadline for World Cup picks has passed.")
    );
  }

  if (submitted) {
    return React.createElement("div",{className:"ok-screen"},
      React.createElement("div",{className:"ok-icon"},isEditing?"✏️":"🎉"),
      React.createElement("div",{className:"ok-title"},isEditing?"PICKS UPDATED!":"YOU'RE IN!"),
      React.createElement("div",{className:"ok-sub"},
        isEditing ? "Entry "+entryNumber+" updated, "+lookupName.split(" ")[0]+"!" :
        "Submitted! Good luck "+lookupName.split(" ")[0]+"! Check back once the tournament starts."
      ),
      React.createElement("div",{className:"psum"},
        React.createElement("div",{style:{fontFamily:"'Bebas Neue',sans-serif",fontSize:15,color:"#00c4b4",marginBottom:10,letterSpacing:1}},"YOUR PICKS"),
        WC_GROUPS.map(function(g) {
          return React.createElement("div",{className:"psum-row",key:g.group},
            React.createElement("span",{style:{color:"#5fa89e"}},"Group "+g.group+(g.mult>1?" ("+g.mult+"×)":"")),
            React.createElement("span",{style:{fontWeight:600}},(picks["group"+g.group])||"—")
          );
        }),
        React.createElement("div",{className:"psum-row"},
          React.createElement("span",{style:{color:"#5fa89e"}},"🥇 Golden Boot"),
          React.createElement("span",{style:{fontWeight:600}},goldenBoot||"—")
        )
      ),
      React.createElement("button",{className:"sub-btn",onClick:resetAll},"BACK / NEW ENTRY")
    );
  }

  if (step==="lookup") {
    return React.createElement("div",{className:"lookup-step"},
      React.createElement("div",{style:{background:"rgba(232,69,69,.1)",border:"2px solid #e84545",borderRadius:8,padding:"16px 20px",marginBottom:16,display:"flex",alignItems:"center",gap:14}},
        React.createElement("div",{style:{fontSize:28}},"⏰"),
        React.createElement("div",null,
          React.createElement("div",{style:{fontFamily:"'Bebas Neue',sans-serif",fontSize:18,color:"#e84545",letterSpacing:1}},"PICKS DUE JUNE 11 · 3:00 PM"),
          React.createElement("div",{style:{fontSize:12,color:"#5fa89e",marginTop:2}},"Entry fee: $35 · 12 team picks + Golden Boot · Max 2 entries per person")
        )
      ),
      React.createElement("div",{className:"form-sec"},
        React.createElement("div",{className:"form-sec-hdr"},React.createElement("span",null,React.createElement("span",{className:"num"},"01 · "),"GET STARTED")),
        React.createElement("div",{className:"form-grp"},
          React.createElement("label",{className:"flabel"},"Your Name"),
          React.createElement("input",{className:"finput",placeholder:"First and last name",value:lookupName,onChange:function(e){setLookupName(e.target.value);}})
        ),
        React.createElement("div",{className:"form-grp"},
          React.createElement("label",{className:"flabel"},"Email Address"),
          React.createElement("div",{style:{fontSize:11,color:"#5fa89e",marginBottom:6}},"We'll use this to look up any existing entries so you can edit them."),
          React.createElement("input",{className:"finput",type:"email",placeholder:"your@email.com",value:lookupEmail,
            onChange:function(e){setLookupEmail(e.target.value);},
            onKeyDown:function(e){if(e.key==="Enter")handleLookup();}})
        ),
        lookupError && React.createElement("div",{className:"err-msg",style:{margin:"0 18px 14px"}},"⚠️ "+lookupError),
        React.createElement("div",{style:{padding:"14px 18px"}},
          React.createElement("button",{className:"sub-btn",onClick:handleLookup,disabled:lookupLoading},lookupLoading?"CHECKING...":"CONTINUE →")
        )
      ),
      React.createElement("div",{style:{padding:"14px 18px",background:"#000",border:"2px solid #fff",borderRadius:8,fontSize:12,color:"#5fa89e",lineHeight:1.7}},
        "By submitting you agree to pay the ",React.createElement("strong",{style:{color:"#fff"}},"$35 entry fee"),
        ". Payment can be sent through Zelle to ",React.createElement("strong",{style:{color:"#00c4b4"}},"scott.wbeverly@gmail.com"),
        " or contact that email with any questions. Once the tournament starts, pool entries will be announced on this site, along with an email to the group. Thanks for joining and good luck!"
      )
    );
  }

  if (step==="choose") {
    return React.createElement("div",{className:"choose-step"},
      React.createElement("div",{className:"form-sec"},
        React.createElement("div",{className:"form-sec-hdr"},
          React.createElement("span",null,React.createElement("span",{className:"num"},"✓ "),"FOUND YOUR "+(existingEntries.length===1?"ENTRY":"ENTRIES"))
        ),
        React.createElement("div",{style:{padding:18}},
          React.createElement("div",{style:{fontSize:13,color:"#5fa89e",marginBottom:16}},
            "Hi ",React.createElement("strong",{style:{color:"#fff"}},lookupName.split(" ")[0]),"! Found ",existingEntries.length," existing ",existingEntries.length===1?"entry":"entries"," for ",
            React.createElement("strong",{style:{color:"#00c4b4"}},lookupEmail),". What would you like to do?"
          ),
          existingEntries.map(function(entry,i) {
            return React.createElement("div",{key:i,style:{background:"#0a1a1a",border:"1px solid #fff",borderRadius:8,padding:14,marginBottom:10}},
              React.createElement("div",{style:{fontFamily:"'Bebas Neue',sans-serif",fontSize:16,color:"#00c4b4",marginBottom:8,letterSpacing:1}},"ENTRY "+(entry.entryNumber||i+1)),
              React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr 1fr",gap:"3px 12px",marginBottom:12}},
                WC_GROUPS.map(function(g) {
                  return React.createElement("div",{key:g.group,style:{fontSize:11,display:"flex",justifyContent:"space-between",padding:"2px 0",borderBottom:"1px solid #111"}},
                    React.createElement("span",{style:{color:"#5fa89e"}},"G"+g.group+(g.mult>1?" ("+g.mult+"×)":"")),
                    React.createElement("span",{style:{color:"#fff",fontWeight:600}},entry["group"+g.group]||"—")
                  );
                })
              ),
              React.createElement("div",{style:{fontSize:11,display:"flex",justifyContent:"space-between",padding:"5px 0",marginBottom:12,borderBottom:"1px solid #111"}},
                React.createElement("span",{style:{color:"#5fa89e"}},"🥇 Golden Boot"),
                React.createElement("span",{style:{color:"#fff",fontWeight:600}},entry.goldenBoot||"—")
              ),
              React.createElement("button",{className:"sub-btn",style:{fontSize:15,padding:10},onClick:function(){handleChooseEdit(entry);}},"✏️ EDIT THIS ENTRY")
            );
          }),
          existingEntries.length < 2 && React.createElement("div",{style:{marginTop:8}},
            React.createElement("button",{className:"sub-btn",style:{background:"#0a1a1a",color:"#00c4b4",borderColor:"#00c4b4",fontSize:15,padding:10},onClick:handleChooseNew},"+ SUBMIT A SECOND ENTRY")
          ),
          React.createElement("div",{style:{marginTop:10,textAlign:"center"}},
            React.createElement("button",{onClick:resetAll,style:{background:"transparent",border:"none",color:"#5fa89e",cursor:"pointer",fontSize:12,textDecoration:"underline"}},"← Use a different email")
          )
        )
      )
    );
  }

  // step === "form"
  return React.createElement("div",{style:{maxWidth:800,margin:"0 auto"}},
    React.createElement("div",{style:{background:"#0a1a1a",border:"2px solid #00c4b4",borderRadius:8,padding:"12px 18px",marginBottom:16,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}},
      React.createElement("div",null,
        React.createElement("div",{style:{fontFamily:"'Bebas Neue',sans-serif",fontSize:17,letterSpacing:1,color:"#00c4b4"}},isEditing?"✏️ EDITING ENTRY "+entryNumber:"📝 NEW ENTRY"),
        React.createElement("div",{style:{fontSize:11,color:"#5fa89e",marginTop:2}},lookupName+" · "+lookupEmail)
      ),
      React.createElement("button",{onClick:function(){setStep(existingEntries.length>0?"choose":"lookup");},
        style:{background:"transparent",border:"1px solid #5fa89e",borderRadius:4,color:"#5fa89e",cursor:"pointer",fontSize:11,padding:"3px 10px"}},"← Back")
    ),
    React.createElement("div",{className:"pbar-wrap"},
      React.createElement("div",{className:"plbl2"},
        React.createElement("span",null,"Groups picked: "+pickedCount+" / "+totalGroups),
        React.createElement("span",null,allPicked?"✅ All groups picked!":((totalGroups-pickedCount)+" remaining"))
      ),
      React.createElement("div",{className:"pbar"},React.createElement("div",{className:"pfill",style:{width:((pickedCount/totalGroups)*100)+"%"}}))
    ),
    React.createElement("div",{className:"form-sec"},
      React.createElement("div",{className:"form-sec-hdr"},
        React.createElement("span",null,React.createElement("span",{className:"num"},"01 · "),"PICK YOUR 12 TEAMS"),
        React.createElement("span",{style:{fontSize:12,fontFamily:"'DM Sans',sans-serif",fontWeight:400,color:"#5fa89e"}},"1 team per group")
      ),
      WC_GROUPS.map(function(g) {
        var picked = picks["group"+g.group];
        return React.createElement("div",{className:"form-grp",key:g.group},
          React.createElement("div",{style:{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}},
            React.createElement("div",null,
              React.createElement("div",{style:{fontFamily:"'Bebas Neue',sans-serif",fontSize:15,letterSpacing:1,color:g.mult===3?"#fff":g.mult===2?"#00c4b4":"#00c4b4"}},
                "Pool Group "+g.group+" ",React.createElement(MultBadge,{mult:g.mult})
              ),
              picked && React.createElement("div",{style:{fontSize:11,color:"#5fa89e",marginTop:2}},"Selected: ",React.createElement("strong",{style:{color:"#fff"}},picked))
            ),
            React.createElement("div",{style:{width:20,height:20,borderRadius:"50%",border:"2px solid "+(picked?"#00c4b4":"#333"),background:picked?"#00c4b4":"transparent",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:"#000",fontWeight:700}},picked?"✓":"")
          ),
          React.createElement("div",{className:"tbgrid"},
            g.teams.map(function(team) {
              return React.createElement("button",{
                key:team,
                className:"tbtn"+(picked===team?" sel":""),
                onClick:function(){var np=Object.assign({},picks);np["group"+g.group]=team;setPicks(np);}
              },(picked===team?"✓ ":"")+team);
            })
          )
        );
      })
    ),
    React.createElement("div",{className:"form-sec"},
      React.createElement("div",{className:"form-sec-hdr"},React.createElement("span",null,React.createElement("span",{className:"num"},"02 · "),"GOLDEN BOOT PICK")),
      React.createElement("div",{className:"form-grp"},
        React.createElement("label",{className:"flabel"},"Who will score the most goals in the tournament?"),
        React.createElement("div",{style:{fontSize:11,color:"#5fa89e",marginBottom:8}},"$5 from each entry goes to whoever picks the correct Golden Boot winner. If multiple people pick correctly, the pot splits."),
        React.createElement("select",{className:"finput",value:goldenBoot,onChange:function(e){setGoldenBoot(e.target.value);}},
          React.createElement("option",{value:""},"— Select a player —"),
          GOLDEN_BOOT_PLAYERS.map(function(p){return React.createElement("option",{key:p,value:p},p);})
        )
      )
    ),
    error && React.createElement("div",{className:"err-msg"},"⚠️ "+error),
    React.createElement("div",{className:"form-sec",style:{padding:18}},
      React.createElement("button",{className:"sub-btn",onClick:handleSubmit,disabled:!canSubmit},
        submitting?"SAVING...":isEditing?(canSubmit?"SAVE CHANGES →":"COMPLETE ALL FIELDS"):( canSubmit?"SUBMIT MY PICKS →":"COMPLETE ALL FIELDS "+((!allPicked)?"("+(totalGroups-pickedCount)+" left)":""))
      )
    )
  );
}

// ── WORLD CUP PAGE ────────────────────────────────────────────────────────────
function WorldCup({submissions}) {
  var isLocked = new Date() >= DEADLINE;
  var [sec, setSec] = useState(isLocked ? "entries" : "enter");

  var preTabs = [{id:"enter",label:"✏️ Submit Entry"},{id:"entries",label:"📋 All Entries"},{id:"groups",label:"🌍 Pool Groups"},{id:"scoring",label:"📊 Scoring"},{id:"rules",label:"📖 Rules"}];
  var liveTabs = [{id:"entries",label:"📋 All Entries"},{id:"groups",label:"🌍 Pool Groups"},{id:"scoring",label:"📊 Scoring"},{id:"rules",label:"📖 Rules"}];
  var tabs = isLocked ? liveTabs : preTabs;

  var ml = function(m){if(m===3)return React.createElement(MultBadge,{mult:3});if(m===2)return React.createElement(MultBadge,{mult:2});return React.createElement(MultBadge,{mult:1});};
  var gc = function(m){return m===2?"#0a1a1a":m===3?"#0f1010":"#0a1a1a";};

  return React.createElement("div",null,
    React.createElement("div",{className:"phdr"},
      React.createElement("div",null,
        React.createElement("div",{className:"ptitle"},"⚽ WORLD CUP POOL 2026"),
        React.createElement("div",{style:{fontSize:13,color:"#5fa89e",marginTop:3}},isLocked?"Tournament underway · "+submissions.length+" entries":"Pick 1 team per Pool Group · 12 teams total · Golden Boot side pool")
      ),
      React.createElement("div",{className:"pmeta"},
        React.createElement("div",{className:"pill"},"Entry: ",React.createElement("strong",null,"$35")),
        React.createElement("div",{className:"pill"},"Entries: ",React.createElement("strong",null,submissions.length)),
        isLocked ? React.createElement("span",{className:"badge-live"},"LIVE") : React.createElement("span",{className:"badge-err"},"⏰ Due: Jun 11 · 3PM")
      )
    ),
    React.createElement("div",{className:"stabs"},
      tabs.map(function(s){return React.createElement("button",{key:s.id,className:"stab"+(sec===s.id?" on":""),onClick:function(){setSec(s.id);}},s.label);})
    ),
    sec==="enter" && React.createElement(WCEntryForm,null),
    sec==="entries" && React.createElement("div",null,
      submissions.length===0
        ? React.createElement("div",{className:"card"},React.createElement("div",{style:{padding:40,textAlign:"center",color:"#5fa89e"}},React.createElement("div",{style:{fontSize:40,marginBottom:10}},"📋"),React.createElement("div",{style:{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:2}},"NO ENTRIES YET")))
        : React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14}},
            submissions.map(function(entry,i){
              return React.createElement("div",{key:i,className:"entry-card"},
                React.createElement("div",{className:"ec-hdr"},
                  React.createElement("div",null,
                    React.createElement("div",{className:"ec-name"},entry.name),
                    (entry.entryNumber||1)>1 && React.createElement("div",{style:{fontSize:10,color:"#5fa89e"}},"Entry "+(entry.entryNumber||1))
                  ),
                  React.createElement("div",{style:{fontSize:11,color:"#5fa89e"}},("#"+(i+1)))
                ),
                React.createElement("div",{style:{padding:"6px 0"}},
                  WC_GROUPS.map(function(g){
                    return React.createElement("div",{key:g.group,style:{display:"flex",justifyContent:"space-between",padding:"4px 14px",borderBottom:"1px solid #0a1a1a",fontSize:12}},
                      React.createElement("span",{style:{color:"#5fa89e"}},"Group "+g.group+(g.mult>1?" ("+g.mult+"×)":"")),
                      React.createElement("span",{style:{fontWeight:600}},entry["group"+g.group]||"—")
                    );
                  }),
                  React.createElement("div",{style:{display:"flex",justifyContent:"space-between",padding:"6px 14px",fontSize:12,background:"rgba(0,196,180,.05)"}},
                    React.createElement("span",{style:{color:"#5fa89e"}},"🥇 Golden Boot"),
                    React.createElement("span",{style:{fontWeight:600}},entry.goldenBoot||"—")
                  )
                )
              );
            })
          )
    ),
    sec==="groups" && React.createElement("div",null,
      React.createElement("div",{style:{display:"flex",gap:12,marginBottom:14,flexWrap:"wrap"}},
        React.createElement("div",{style:{fontSize:12,color:"#5fa89e",display:"flex",alignItems:"center",gap:6}},React.createElement("span",{className:"m1x"},"1×")," Groups 1–5"),
        React.createElement("div",{style:{fontSize:12,color:"#5fa89e",display:"flex",alignItems:"center",gap:6}},React.createElement("span",{className:"m2x"},"2× DOUBLE")," Groups 6–9"),
        React.createElement("div",{style:{fontSize:12,color:"#5fa89e",display:"flex",alignItems:"center",gap:6}},React.createElement("span",{className:"m3x"},"3× TRIPLE")," Groups 10–12")
      ),
      React.createElement("div",{className:"ggrid"},
        WC_GROUPS.map(function(g){
          return React.createElement("div",{key:g.group,className:"gc"},
            React.createElement("div",{className:"gc-hdr",style:{background:gc(g.mult)}},
              React.createElement("span",{className:"gc-name"},"Pool Group "+g.group),
              ml(g.mult)
            ),
            g.teams.map(function(t){return React.createElement("div",{key:t,className:"gc-row"},t);})
          );
        })
      )
    ),
    sec==="scoring" && React.createElement("div",{style:{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(280px,1fr))",gap:14}},
      React.createElement("div",{className:"card"},
        React.createElement("div",{className:"chdr"},"📊 Base Scoring"),
        WC_SCORING.map(function(s,i){return React.createElement("div",{className:"srow",key:i},React.createElement("span",{style:{fontSize:13,color:"#ddd"}},s.event),React.createElement("span",{className:"spts"},s.pts));})
      ),
      React.createElement("div",null,
        React.createElement("div",{className:"card",style:{marginBottom:14}},
          React.createElement("div",{className:"chdr"},"✖️ Multipliers"),
          React.createElement("div",{className:"srow"},React.createElement("span",{style:{fontSize:13,color:"#ddd"}},"Groups 1–5"),React.createElement("span",{className:"m1x"},"1× standard")),
          React.createElement("div",{className:"srow"},React.createElement("span",{style:{fontSize:13,color:"#ddd"}},"Groups 6–9"),React.createElement("span",{className:"m2x"},"2× DOUBLE")),
          React.createElement("div",{className:"srow",style:{borderBottom:"none"}},React.createElement("span",{style:{fontSize:13,color:"#ddd"}},"Groups 10–12"),React.createElement("span",{className:"m3x"},"3× TRIPLE"))
        ),
        React.createElement("div",{className:"card"},
          React.createElement("div",{className:"chdr"},"🥇 Golden Boot Side Pool"),
          React.createElement("div",{style:{padding:"12px 14px"}},
            [["$5/entry","Goes into the Golden Boot pot."],["$30/entry","Goes to top 2-3 finishers."],["Split","Multiple correct picks split the pot."],["Rollover","No correct pick? Rolls into main prize pool."]].map(function(kv,i){
              return React.createElement("div",{className:"ri",key:i},React.createElement("span",{className:"rn",style:{minWidth:60,fontSize:11,fontWeight:700}},kv[0]),React.createElement("span",null,kv[1]));
            })
          )
        )
      )
    ),
    sec==="rules" && React.createElement("div",{className:"card"},
      React.createElement("div",{className:"chdr"},"📖 Pool Rules"),
      React.createElement("div",{style:{padding:18}},
        React.createElement("div",{className:"rbox"},
          ["Each participant chooses 1 team from each of the 12 Pool Groups, giving you 12 teams total.",
           "Pool Groups are based on DraftKings odds and FIFA rankings as of 5/18/2026 — NOT the actual FIFA World Cup groups.",
           "Groups 6, 7, 8, and 9 earn DOUBLE points on all scoring events throughout the entire tournament.",
           "Groups 10, 11, and 12 earn TRIPLE points on all scoring events throughout the entire tournament.",
           "Also select one player you think will win the Golden Boot (most goals). This is the side pool.",
           "Picks were due before 3:00 PM on June 11, 2026. Entry fee is $35.",
           "Payouts: $30 of entry goes to top 2-3 finishers; $5 goes to the Golden Boot side pool winner(s)."].map(function(rule,i){
            return React.createElement("div",{className:"ri",key:i},React.createElement("span",{className:"rn"},i+1),React.createElement("span",null,rule));
          })
        )
      )
    )
  );
}

// ── HR DERBY ─────────────────────────────────────────────────────────────────
function HRDerby({allData}) {
  var [sec, setSec] = useState("standings");
  var [monthKey, setMonthKey] = useState("june");
  var [stab, setStab] = useState("season");
  var [search, setSearch] = useState("");
  var [sel, setSel] = useState(null);

  var months = [{key:"june",label:"June",cur:true},{key:"may",label:"May",cur:false},{key:"april",label:"April",cur:false}];
  var cur = allData[monthKey]||allData["june"]||allData["may"]||{monthlyStandings:[],seasonStandings:[],rosters:[],hrLeaders:[]};
  var ms = cur.monthlyStandings||[];
  var ss = cur.seasonStandings||[];
  var ros = cur.rosters||[];
  var leaders = cur.hrLeaders||[];

  var display = stab==="season"
    ? ss.slice().sort(function(a,b){return b.season-a.season;}).map(function(s,i){return Object.assign({},s,{rank:i+1});})
    : ms.slice().sort(function(a,b){return b.month-a.month;}).map(function(s,i){return Object.assign({},s,{rank:i+1});});
  var maxV = display.length ? (stab==="season"?display[0].season:display[0].month)||1 : 1;
  var curMonth = months.find(function(m){return m.key===monthKey;})||months[0];

  var filtRosters = ros.filter(function(r){
    return !search || r.teamName.toLowerCase().indexOf(search.toLowerCase())>-1
      || r.players.some(function(p){return p.name.toLowerCase().indexOf(search.toLowerCase())>-1;});
  });

  return React.createElement("div",null,
    React.createElement("div",{className:"phdr"},
      React.createElement("div",null,
        React.createElement("div",{className:"ptitle"},"⚾ HOME RUN DERBY POOL 2026"),
        React.createElement("div",{style:{fontSize:13,color:"#5fa89e",marginTop:3}},ros.length+" teams · Live stats · Auto-updates daily")
      ),
      React.createElement("div",{className:"pmeta"},
        React.createElement("div",{className:"pill"},"Entry: ",React.createElement("strong",null,"50 units")),
        React.createElement("div",{className:"pill"},"Teams: ",React.createElement("strong",null,ros.length)),
        React.createElement("div",{className:"pill"},"HR Cap: ",React.createElement("strong",null,"156"))
      )
    ),
    React.createElement("div",{className:"stabs"},
      [{id:"standings",label:"🏆 Standings"},{id:"rosters",label:"📋 Rosters"},{id:"leaders",label:"⚾ HR Leaders"},{id:"rules",label:"📖 Rules"}].map(function(s){
        return React.createElement("button",{key:s.id,className:"stab"+(sec===s.id?" on":""),onClick:function(){setSec(s.id);}},s.label);
      })
    ),
    sec==="standings" && React.createElement("div",null,
      display.length>0 && React.createElement("div",{className:"podium"},
        display.slice(0,3).map(function(t,i){
          var v = stab==="season"?t.season:t.month;
          return React.createElement("div",{key:t.name,className:"pod p"+(i+1)},
            React.createElement("div",{className:"pos"},["🥇","🥈","🥉"][i]),
            React.createElement("div",{className:"pname"},t.name),
            React.createElement("div",{className:"pval"},v),
            React.createElement("div",{className:"plbl"},"HOME RUNS")
          );
        })
      ),
      React.createElement("div",{style:{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap",alignItems:"center"}},
        React.createElement("div",{style:{fontSize:11,color:"#5fa89e",letterSpacing:1,textTransform:"uppercase"}},"Viewing Month:"),
        React.createElement("div",{className:"tabs2"},
          months.map(function(m){return React.createElement("button",{key:m.key,className:"t2"+(monthKey===m.key?" on":""),onClick:function(){setMonthKey(m.key);}},m.label+(m.cur?" ●":""));})
        )
      ),
      React.createElement("div",{className:"tabs2"},
        React.createElement("button",{className:"t2"+(stab==="season"?" on":""),onClick:function(){setStab("season");}},"SEASON TOTAL"),
        React.createElement("button",{className:"t2"+(stab==="month"?" on":""),onClick:function(){setStab("month");}},curMonth.label.toUpperCase()+" HRs")
      ),
      React.createElement("div",{className:"card"},
        React.createElement("div",{className:"chdr"},stab==="season"?"🏆 Season Standings":"📅 "+curMonth.label+" Standings",
          React.createElement("span",{style:{marginLeft:"auto",fontSize:11,fontFamily:"'DM Sans',sans-serif",color:"#5fa89e",fontWeight:400}},"Click team → roster")
        ),
        React.createElement("table",null,
          React.createElement("thead",null,React.createElement("tr",null,React.createElement("th",{style:{width:44}},"Rank"),React.createElement("th",null,"Team"),React.createElement("th",{className:"r"},stab==="season"?"Season HRs":curMonth.label+" HRs"),React.createElement("th",{style:{width:140}}))),
          React.createElement("tbody",null,
            display.map(function(s){
              var v = stab==="season"?s.season:s.month;
              var pct = Math.round((v/maxV)*100);
              return React.createElement("tr",{key:s.name,style:{cursor:"pointer"},onClick:function(){setSec("rosters");setSel(s.name);}},
                React.createElement("td",null,React.createElement(RB,{rank:s.rank})),
                React.createElement("td",{style:{fontWeight:500}},s.name),
                React.createElement("td",{className:"r"},React.createElement("span",{className:"hn"},v)),
                React.createElement("td",null,React.createElement("div",{className:"lbar"},React.createElement("div",{className:"lfill",style:{width:pct+"%",background:s.rank===1?"#00c4b4":s.rank===2?"#b0b8cc":s.rank===3?"#cd7f32":"#00c4b4"}})))
              );
            })
          )
        )
      ),
      React.createElement("div",{style:{padding:"10px 14px",background:"#000",border:"2px solid #fff",borderRadius:6,fontSize:12,color:"#5fa89e"}},
        React.createElement("strong",{style:{color:"#00c4b4"}},"Payout:")," Monthly: 1st $75 · 2nd $50 | Season: 1st $300 · 2nd $175 · 3rd $75"
      )
    ),
    sec==="rosters" && React.createElement("div",null,
      React.createElement("div",{style:{display:"flex",gap:10,marginBottom:14,flexWrap:"wrap"}},
        React.createElement("input",{className:"finput",style:{flex:1,minWidth:200},placeholder:"Search team or player...",value:search,onChange:function(e){setSearch(e.target.value);}}),
        sel && React.createElement("button",{className:"stab on",onClick:function(){setSel(null);}},("✕ "+sel))
      ),
      React.createElement("div",{className:"rgrid"},
        (sel?filtRosters.filter(function(r){return r.teamName===sel;}):filtRosters).map(function(r){
          return React.createElement("div",{key:r.teamName,className:"rc"},
            React.createElement("div",{className:"rchdr"},
              React.createElement("div",null,
                React.createElement("div",{className:"rcname"},r.teamName),
                React.createElement("div",{style:{fontSize:10,color:"#5fa89e",marginTop:2}},"Cap: "+(r.cap||"—")+" · Season: "+r.season+" HR · "+curMonth.label+": "+r.month+" HR")
              ),
              React.createElement("div",{style:{display:"flex",gap:10}},
                React.createElement("div",{style:{textAlign:"center"}},React.createElement("div",{style:{fontFamily:"'Bebas Neue',sans-serif",fontSize:17,color:"#00c4b4"}},r.month),React.createElement("div",{style:{fontSize:9,color:"#5fa89e",letterSpacing:1,textTransform:"uppercase"}},curMonth.label)),
                React.createElement("div",{style:{textAlign:"center"}},React.createElement("div",{style:{fontFamily:"'Bebas Neue',sans-serif",fontSize:17,color:"#00e5d4"}},r.season),React.createElement("div",{style:{fontSize:9,color:"#5fa89e",letterSpacing:1,textTransform:"uppercase"}},"SEASON"))
              )
            ),
            React.createElement("div",{style:{display:"grid",gridTemplateColumns:"1fr auto auto auto",padding:"5px 14px 3px",borderBottom:"1px solid #111"}},
              React.createElement("span",{style:{fontSize:9,color:"#5fa89e",letterSpacing:1,textTransform:"uppercase"}},"Player"),
              React.createElement("span",{style:{fontSize:9,color:"#5fa89e",textAlign:"right",minWidth:34}},"Cap"),
              React.createElement("span",{style:{fontSize:9,color:"#5fa89e",textAlign:"right",minWidth:36,paddingLeft:8}},curMonth.label),
              React.createElement("span",{style:{fontSize:9,color:"#5fa89e",textAlign:"right",minWidth:40,paddingLeft:8}},"Season")
            ),
            r.players.map(function(p,i){
              return React.createElement("div",{key:i,style:{padding:"7px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:"1px solid #111",fontSize:12,opacity:p.swap?0.6:1,background:p.swap?"rgba(0,196,180,.03)":""}},
                React.createElement("div",{style:{flex:1,display:"flex",alignItems:"center",gap:5}},
                  React.createElement("span",{style:{fontWeight:p.swap?400:500}},p.name),
                  p.swap && React.createElement("span",{className:"swap-b"},"SWAP")
                ),
                React.createElement("span",{style:{fontSize:10,color:"#5fa89e",textAlign:"right",minWidth:34}},p.cap2025),
                React.createElement("span",{style:{fontFamily:"'Bebas Neue',sans-serif",fontSize:13,color:"#00c4b4",textAlign:"right",minWidth:36,paddingLeft:8}},p.month!=null?p.month:"—"),
                React.createElement("span",{style:{fontFamily:"'Bebas Neue',sans-serif",fontSize:13,color:"#00e5d4",textAlign:"right",minWidth:40,paddingLeft:8}},p.season!=null?p.season:"—")
              );
            })
          );
        })
      )
    ),
    sec==="leaders" && React.createElement("div",{className:"card"},
      React.createElement("div",{className:"chdr"},"⚾ 2026 MLB HR Leaders"),
      React.createElement("table",null,
        React.createElement("thead",null,React.createElement("tr",null,React.createElement("th",{style:{width:44}},"Rank"),React.createElement("th",null,"Player"),React.createElement("th",null,"Team"),React.createElement("th",{className:"r"},"HRs"))),
        React.createElement("tbody",null,
          leaders.slice(0,40).map(function(p,i){
            return React.createElement("tr",{key:i},
              React.createElement("td",null,React.createElement(RB,{rank:p.rank})),
              React.createElement("td",{style:{fontWeight:500}},p.name),
              React.createElement("td",null,React.createElement("span",{style:{background:"#0a1a1a",border:"1px solid #333",borderRadius:3,padding:"1px 7px",fontSize:11,color:"#00c4b4",fontWeight:700}},p.team)),
              React.createElement("td",{className:"r"},React.createElement("span",{className:"hn"},p.hr))
            );
          })
        )
      )
    ),
    sec==="rules" && React.createElement("div",{className:"card"},
      React.createElement("div",{className:"chdr"},"📖 Rules & Payouts"),
      React.createElement("div",{style:{padding:18}},
        React.createElement("div",{className:"rbox"},
          ["Draft 7 players from the player pool. Combined 2025 HR total cannot exceed 156.",
           "Designate an 8th SWAP player. Can replace one roster player before the All-Star Game.",
           "Once a swap is made, no further changes are allowed.",
           "Scoring is cumulative season-long HRs.",
           "October regular season games count. Play-in games do NOT.",
           "No free agent or IR moves beyond the one allowed swap.",
           "Monthly prizes for Top 2 teams (April–September). Monthly totals are NOT cumulative.",
           "End-of-year prizes for Top 3 teams."].map(function(rule,i){
            return React.createElement("div",{className:"ri",key:i},React.createElement("span",{className:"rn"},i+1),React.createElement("span",null,rule));
          })
        )
      )
    )
  );
}

// ── DASHBOARD ─────────────────────────────────────────────────────────────────
function Dashboard({setTab, allData, updatedAt, submissions}) {
  var cur = allData["june"]||allData["may"]||{seasonStandings:[],monthlyStandings:[]};
  var ss = cur.seasonStandings||[];
  var ms = cur.monthlyStandings||[];
  var sl = ss.slice().sort(function(a,b){return b.season-a.season;})[0]||{};
  var ml = ms.slice().sort(function(a,b){return b.month-a.month;})[0]||{};
  var isLocked = new Date() >= DEADLINE;

  return React.createElement("div",null,
    React.createElement("div",{style:{marginBottom:24}},
      React.createElement("div",{style:{fontFamily:"'Bebas Neue',sans-serif",fontSize:32,letterSpacing:3,marginBottom:6}},"ACTIVE POOLS"),
      React.createElement("div",{className:"updated"},React.createElement("div",{className:"dot"}),React.createElement("span",null,"Live data · Updated "+updatedAt))
    ),
    React.createElement("div",{className:"dgrid"},
      React.createElement("div",{className:"dc",onClick:function(){setTab("hr");}},
        React.createElement("div",{className:"dctop"},
          React.createElement("div",{className:"dico"},"⚾"),
          React.createElement("div",null,React.createElement("div",{className:"dctitle"},"Home Run Derby"),React.createElement("div",{className:"dcsub"},"2026 MLB Season · "+ss.length+" Teams")),
          React.createElement("span",{className:"badge-live",style:{marginLeft:"auto"}},"LIVE")
        ),
        React.createElement("div",{className:"dcbody"},
          React.createElement("div",{className:"dsr"},React.createElement("span",{className:"dsl"},"Season Leader"),React.createElement("span",{className:"dsv"},(sl.name||"—")+" ("+(sl.season||0)+" HR)")),
          React.createElement("div",{className:"dsr"},React.createElement("span",{className:"dsl"},"June Leader"),React.createElement("span",{className:"dsv"},(ml.name||"—")+" ("+(ml.month||0)+" HR)")),
          React.createElement("div",{className:"dsr",style:{marginBottom:0}},React.createElement("span",{className:"dsl"},"Season Prize"),React.createElement("span",{className:"dsv"},"1st $300 · 2nd $175 · 3rd $75"))
        ),
        React.createElement("button",{className:"dcta"},"VIEW STANDINGS →")
      ),
      React.createElement("div",{className:"dc",onClick:function(){setTab("wc");}},
        React.createElement("div",{className:"dctop"},
          React.createElement("div",{className:"dico"},"⚽"),
          React.createElement("div",null,React.createElement("div",{className:"dctitle"},"World Cup Pool"),React.createElement("div",{className:"dcsub"},"FIFA World Cup 2026")),
          React.createElement("span",{className:isLocked?"badge-live":"badge-open",style:{marginLeft:"auto"}},isLocked?"LIVE":"OPEN")
        ),
        React.createElement("div",{className:"dcbody"},
          React.createElement("div",{className:"dsr"},React.createElement("span",{className:"dsl"},"Entries"),React.createElement("span",{className:"dsv"},submissions.length+" submitted")),
          React.createElement("div",{className:"dsr"},React.createElement("span",{className:"dsl"},"Entry"),React.createElement("span",{className:"dsv"},"$35")),
          React.createElement("div",{className:"dsr"},React.createElement("span",{className:"dsl"},"Deadline"),React.createElement("span",{className:"dsv"},"Jun 11, 2026 · 3:00 PM")),
          React.createElement("div",{className:"dsr",style:{marginBottom:0}},React.createElement("span",{className:"dsl"},"Status"),React.createElement("span",{className:"dsv",style:{color:"#00c4b4"}},isLocked?"🔴 Tournament Live":"✅ Submissions Open"))
        ),
        React.createElement("button",{className:"dcta"},isLocked?"VIEW POOL →":"SUBMIT YOUR PICKS →")
      )
    ),
    React.createElement("div",{className:"card"},
      React.createElement("div",{className:"chdr"},"🏆 HR Derby — Season Top 5"),
      React.createElement("table",null,
        React.createElement("thead",null,React.createElement("tr",null,React.createElement("th",null,"Rank"),React.createElement("th",null,"Team"),React.createElement("th",{className:"r"},"Season HRs"),React.createElement("th",{className:"r"},"June HRs"))),
        React.createElement("tbody",null,
          ss.slice().sort(function(a,b){return b.season-a.season;}).slice(0,5).map(function(s,i){
            var m = ms.find(function(x){return x.name===s.name;});
            return React.createElement("tr",{key:s.name},
              React.createElement("td",null,React.createElement(RB,{rank:i+1})),
              React.createElement("td",{style:{fontWeight:500}},s.name),
              React.createElement("td",{className:"r"},React.createElement("span",{className:"hn"},s.season)),
              React.createElement("td",{className:"r"},React.createElement("span",{style:{fontFamily:"'Bebas Neue',sans-serif",fontSize:16}},m?m.month:"—"))
            );
          })
        )
      )
    )
  );
}

// ── APP ───────────────────────────────────────────────────────────────────────
export default function App() {
  var [tab, setTab] = useState("dashboard");
  var [allData, setAllData] = useState({});
  var [updatedAt, setUpdatedAt] = useState("");
  var [submissions, setSubmissions] = useState([]);
  var [loading, setLoading] = useState(true);
  var [error, setError] = useState(null);

  useEffect(function() {
    var fetchAll = async function() {
      try {
        var results = await Promise.all([
          fetch(JUNE_CSV).then(function(r){return r.text();}),
          fetch(MAY_CSV).then(function(r){return r.text();}),
          fetch(APRIL_CSV).then(function(r){return r.text();}),
          fetch(SUBS_CSV).then(function(r){return r.text();})
        ]);
        setAllData({
          june: parseHRData(results[0]),
          may:  parseHRData(results[1]),
          april:parseHRData(results[2])
        });
        setSubmissions(parseSubmissions(results[3]));
        setUpdatedAt(new Date().toLocaleTimeString([],{hour:"2-digit",minute:"2-digit"}));
      } catch(e) {
        setError("Could not load data. Please refresh.");
      }
      setLoading(false);
    };
    fetchAll();
  }, []);

  if (error) { return React.createElement(React.Fragment,null,React.createElement("style",null,S),React.createElement("div",{className:"ctr"},React.createElement("div",{style:{fontSize:36}},"⚠️"),React.createElement("div",null,error))); }
  if (loading) { return React.createElement(React.Fragment,null,React.createElement("style",null,S),React.createElement("div",{className:"ctr"},React.createElement("div",{className:"spin"}),React.createElement("div",{style:{fontFamily:"'Bebas Neue',sans-serif",fontSize:22,letterSpacing:2}},"LOADING LIVE DATA..."))); }

  var navTabs = [{id:"dashboard",label:"🏠 Dashboard"},{id:"hr",label:"⚾ HR Derby"},{id:"wc",label:"⚽ World Cup"}];

  return React.createElement(React.Fragment,null,
    React.createElement("style",null,S),
    React.createElement("div",null,
      React.createElement("header",{className:"hdr"},
        React.createElement("div",{className:"logo",onClick:function(){setTab("dashboard");}},"WUG DERBY",React.createElement("span",null," POOLS")),
        React.createElement("div",{style:{fontSize:12,color:"#5fa89e"}},
          new Date() >= DEADLINE
            ? React.createElement("span",{style:{color:"#e84545",fontWeight:700}},"🔴 TOURNAMENT LIVE")
            : "Wug Derby Pools · 2026"
        )
      ),
      React.createElement("nav",{className:"nav"},
        navTabs.map(function(t){return React.createElement("button",{key:t.id,className:"ntab"+(tab===t.id?" on":""),onClick:function(){setTab(t.id);}},t.label);})
      ),
      React.createElement("main",{className:"main"},
        tab==="dashboard" && React.createElement(Dashboard,{setTab:setTab,allData:allData,updatedAt:updatedAt,submissions:submissions}),
        tab==="hr" && React.createElement(HRDerby,{allData:allData}),
        tab==="wc" && React.createElement(WorldCup,{submissions:submissions})
      )
    )
  );
}
