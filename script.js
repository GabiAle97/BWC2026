const LEADERBOARD_URL = "https://www.speedrun.com/api/v1/leaderboards/kdkzvyqd/category/q25r06gk?embed=players,category,game";
const REFRESH_MS = 30000; // cada 30s (subí este valor si querés pegarle menos a la API)

// La API de speedrun.com a veces no manda el header CORS y el navegador
// bloquea el fetch directo. Si eso pasa, reintentamos vía un proxy CORS público.
const PROXY_URL = "https://api.allorigins.win/raw?url=" + encodeURIComponent(LEADERBOARD_URL);

let previousOrder = null;
let usingProxy = false;
let lastErrors = [];
let playerPbCache = new Map();
let categoryCache = new Map();
let gameCache = new Map();
let expandedPlayerId = null;
let finishedQualy = true;
let finishedGroups = false;
let lastLeaderboardSnapshot = null;
let uploadedResults = null;
const RESULTS_STORAGE_KEY = 'bc-results-manual';
const AUTO_RESULTS_PATHS = ['./resultados.json'];

const QUALIFYING_PARTICIPANTS = [
  "LanceLM",
  "im4rcuss",
  "MattGael",
  "SonBeto",
  "mayoness",
  "Shyanji",
  "Daniel_93",
  "LinoBariana",
  "Adrian20v",
  "micwich",
  "TavernaMugiwara",
  "DeepStackDave",
  "Paquito_tatata",
  "NemesisXploder",
  "Savitrue",
  "ascanioxjs",
  "Moose_z80",
  "Owarii1RE",
  "GabiAle97",
  "Kreescu",
  "redshines",
  "Gallardd",
  "JokerUY",
  "insanebb",
  "Bomba_Nemesis",
  "jossho6",
  "Darchaen",
  "N0b0dy__23",
  "Confe_RE",
  "Bethalize",
  "crisdoile2",
  "Spartanfinix117",
  "ElResident",
  "Tuto10",
  "HalfBakedSnake",
  "EsAndreas",
  "SiaoMuleki",
  "LaChicaGo",
  "crazygamingdayz",
  "exper1ment",
  "Sawnek",
  "Homuki",
  "Kenshiro1990",
  "fiveskill",
  "isogai",
  "Yhonna_Fan",
  "Nadox",
  "re_duke",
  "TheNevs",
  "sH1R1U",
  "Rodriguinho_"
];

const QUALIFYING_LIMIT = 32;

const FINAL_GROUPS = {
  A: ["JokerUY", "Fiveskill", "LinoBariana", "Darchaen"],
  B: ["LanceLM", "Adrian20v", "Homuki", "isogai"],
  C: ["im4rcuss", "GabiAle97", "redshines", "HalfBakedSnake"],
  D: ["EsAndreas", "micwich", "Savitrue", "mayoness"],
  E: ["SonBeto", "ascanioxjs", "re_duke", "NemesisXploder"],
  F: ["Gallardd", "Shyanji", "Owarii1RE", "Bomba_Nemesis"],
  G: ["MattGael", "Paquito_tatata", "insanebb", "crisdoile2"],
  H: ["exper1ment", "jossho6", "TheNevs", "Sawnek"]
};

function normalizeParticipantName(name){
  return (name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

function resolvePlayerByName(players, name){
  const target = normalizeParticipantName(name);
  if(!target) return null;

  const candidates = players || [];

  return candidates.find(player => {
    const names = [
      player?.names?.international,
      player?.names?.twitch,
      player?.names?.steam,
      player?.name
    ].filter(Boolean);

    return names.some(candidate => normalizeParticipantName(candidate) === target);
  }) || null;
}

function buildQualifyingRows(runs, players){
  const playersById = new Map((players || []).map(player => [player.id, player]));
  const knownByName = new Map();

  (runs || []).forEach(runEntry => {
    const playerObj = runEntry && runEntry.run && runEntry.run.players && runEntry.run.players[0]
      ? runEntry.run.players[0]
      : null;

    const playerName = playerObj && playerObj.rel === 'guest'
      ? playerObj.name
      : (playerObj && playersById.get(playerObj.id)
        ? playersById.get(playerObj.id).names?.international || 'Jugador'
        : getPlayerName(runEntry, players));

    const normalized = normalizeParticipantName(playerName);
    if(!normalized) return;

    knownByName.set(normalized, {
      name: playerName || 'Jugador',
      place: runEntry.place ?? null,
      time: runEntry.run && runEntry.run.times && runEntry.run.times.primary_t != null
        ? runEntry.run.times.primary_t
        : null,
      playerId: playerObj && playerObj.rel !== 'guest' ? playerObj.id : null
    });
  });

  const displayRows = QUALIFYING_PARTICIPANTS.map((name) => {
    const normalized = normalizeParticipantName(name);
    const known = normalized ? knownByName.get(normalized) : null;
    return {
      name,
      place: known && known.place != null ? known.place : null,
      time: known && known.time != null ? formatTime(known.time) : '?',
      placeLabel: known && known.place != null ? known.place : '?',
      isPending: !known || known.time == null,
      playerId: known && known.playerId ? known.playerId : null,
      isQualified: known && known.place != null && known.place <= QUALIFYING_LIMIT
    };
  });

  const rankedRows = displayRows
    .filter(row => !row.isPending)
    .sort((a, b) => (a.place ?? Number.MAX_SAFE_INTEGER) - (b.place ?? Number.MAX_SAFE_INTEGER));
  const pendingRows = displayRows.filter(row => row.isPending);

  return [...rankedRows, ...pendingRows];
}

async function fetchJsonWithProxy(url, fallbackUrl = null){
  try{
    const res = await fetch(url, { cache: "no-store" });
    if(!res.ok) throw new Error("HTTP " + res.status);
    return await res.json();
  }catch(err){
    const proxyUrl = fallbackUrl || "https://api.allorigins.win/raw?url=" + encodeURIComponent(url);
    const proxyRes = await fetch(proxyUrl, { cache: "no-store" });
    if(!proxyRes.ok) throw new Error("HTTP " + proxyRes.status + " (vía proxy)");
    return await proxyRes.json();
  }
}

async function fetchLeaderboardData(){
  lastErrors = [];
  if(!usingProxy){
    try{
      const res = await fetch(LEADERBOARD_URL, { cache: "no-store" });
      if(!res.ok) throw new Error("HTTP " + res.status);
      return await res.json();
    }catch(err){
      lastErrors.push("Directo: " + err.message);
      usingProxy = true;
    }
  }
  try{
    const res = await fetch(PROXY_URL, { cache: "no-store" });
    if(!res.ok) throw new Error("HTTP " + res.status + " (vía proxy)");
    return await res.json();
  }catch(err){
    lastErrors.push("Proxy: " + err.message);
    throw new Error(lastErrors.join(" | "));
  }
}

function formatTime(seconds){
  if(seconds == null) return "-";
  const h = Math.floor(seconds/3600);
  const m = Math.floor((seconds%3600)/60);
  const s = seconds - h*3600 - m*60;
  const sStr = s.toFixed(s % 1 === 0 ? 0 : 3).padStart(s%1===0 ? 2 : 6, '0');
  let out = "";
  if(h>0) out += h + ":" + String(m).padStart(2,'0') + ":";
  else out += m + ":";
  out += sStr;
  return out;
}

function parseManualTime(value){
  if(value === null || value === undefined || value === '') return null;
  const str = String(value).trim();
  if(!str) return null;
  const normalized = str.replace(',', '.');
  if(!normalized.includes(':')){
    const seconds = Number(normalized);
    return Number.isNaN(seconds) ? null : seconds;
  }
  const parts = normalized.split(':').map(part => Number(part));
  if(parts.some(part => Number.isNaN(part))) return null;
  if(parts.length === 2){
    return parts[0] * 60 + parts[1];
  }
  if(parts.length === 3){
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return null;
}

function formatManualTime(value){
  const seconds = parseManualTime(value);
  if(seconds == null || Number.isNaN(seconds)) return value || '-';
  const minutes = Math.floor(seconds / 60);
  const remainder = seconds - (minutes * 60);
  const secondsText = remainder.toFixed(remainder % 1 === 0 ? 0 : 2).padStart(remainder % 1 === 0 ? 2 : 5, '0');
  return `${String(minutes).padStart(2, '0')}:${secondsText}`;
}

function getStoredResults(){
  try{
    const raw = localStorage.getItem(RESULTS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  }catch(err){
    console.warn('No se pudieron leer los resultados guardados.', err);
    return null;
  }
}

function saveStoredResults(data){
  try{
    localStorage.setItem(RESULTS_STORAGE_KEY, JSON.stringify(data));
  }catch(err){
    console.warn('No se pudieron guardar los resultados.', err);
  }
}

function normalizeManualMatchName(name){
  return normalizeParticipantName(name || '').replace(/^grupo/, '');
}

function resolveManualMatchKey(match){
  const group = match.group || match.grupo || match.round || match.serie || '';
  const key = String(group).trim();
  return key ? key.toUpperCase() : null;
}

function getMatchWinnerName(match, playerA, playerB){
  const winnerValue = typeof match.winner === 'string' ? match.winner.trim().toLowerCase() : String(match.winner ?? '').trim().toLowerCase();

  if(winnerValue === 'draw' || winnerValue === 'empate' || winnerValue === 'tie') return null;

  if(match.winner){
    return match.winner === playerA || normalizeManualMatchName(match.winner) === normalizeManualMatchName(playerA)
      ? playerA
      : match.winner === playerB || normalizeManualMatchName(match.winner) === normalizeManualMatchName(playerB)
        ? playerB
        : null;
  }

  const timeA = parseManualTime(match.timeA ?? match.tiempoA ?? match.time_a ?? match.times?.[playerA] ?? match.result?.timeA ?? match.result?.[playerA]);
  const timeB = parseManualTime(match.timeB ?? match.tiempoB ?? match.time_b ?? match.times?.[playerB] ?? match.result?.timeB ?? match.result?.[playerB]);

  if(timeA == null && timeB == null) return null;
  if(timeA == null) return playerB;
  if(timeB == null) return playerA;
  if(Math.abs(timeA - timeB) < 0.0001) return null;
  return timeA < timeB ? playerA : playerB;
}

function computeGroupStandings(rawResults){
  const matches = Array.isArray(rawResults?.matches) ? rawResults.matches : [];
  const standings = {};

  Object.entries(FINAL_GROUPS).forEach(([letter, names]) => {
    standings[letter] = {};
    names.forEach((name) => {
      standings[letter][normalizeManualMatchName(name)] = {
        name,
        points: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        matches: 0,
        bestTime: null,
        bestTimeLabel: null,
        lastTime: null
      };
    });
  });

  matches.forEach((match) => {
    const group = resolveManualMatchKey(match);
    if(!group || !FINAL_GROUPS[group]) return;

    const playerA = match.playerA || match.jugadorA || match.a || match.teamA || match.player_1;
    const playerB = match.playerB || match.jugadorB || match.b || match.teamB || match.player_2;
    if(!playerA || !playerB) return;

    const aKey = normalizeManualMatchName(playerA);
    const bKey = normalizeManualMatchName(playerB);

    const entryA = standings[group]?.[aKey];
    const entryB = standings[group]?.[bKey];
    if(!entryA || !entryB) return;

    const winner = getMatchWinnerName(match, playerA, playerB);
    const timeARaw = match.timeA ?? match.tiempoA ?? match.time_a ?? match.times?.[playerA] ?? match.result?.timeA ?? match.result?.[playerA];
    const timeBRaw = match.timeB ?? match.tiempoB ?? match.time_b ?? match.times?.[playerB] ?? match.result?.timeB ?? match.result?.[playerB];
    const timeA = parseManualTime(timeARaw);
    const timeB = parseManualTime(timeBRaw);

    const isPendingMatch = (
      (match.winner == null || String(match.winner).trim() === '') &&
      (timeARaw == null || String(timeARaw).trim() === '' || String(timeARaw).trim() === '-' || timeA == null) &&
      (timeBRaw == null || String(timeBRaw).trim() === '' || String(timeBRaw).trim() === '-' || timeB == null)
    );

    if(isPendingMatch){
      return;
    }

    entryA.matches += 1;
    entryB.matches += 1;
    if(String(timeARaw ?? '').trim().toUpperCase() === 'DEATH') entryA.bestTimeLabel = 'DEATH';
    if(String(timeBRaw ?? '').trim().toUpperCase() === 'DEATH') entryB.bestTimeLabel = 'DEATH';
    if(timeA != null) {
      entryA.lastTime = timeA;
      entryA.bestTime = entryA.bestTime == null ? timeA : Math.min(entryA.bestTime, timeA);
    }
    if(timeB != null) {
      entryB.lastTime = timeB;
      entryB.bestTime = entryB.bestTime == null ? timeB : Math.min(entryB.bestTime, timeB);
    }

    if(!winner){
      entryA.points += 1;
      entryB.points += 1;
      entryA.draws += 1;
      entryB.draws += 1;
      return;
    }

    if(winner === playerA){
      entryA.points += 3;
      entryA.wins += 1;
      entryB.losses += 1;
    }else if(winner === playerB){
      entryB.points += 3;
      entryB.wins += 1;
      entryA.losses += 1;
    }
  });

  return standings;
}

function getLoadedResults(){
  return uploadedResults || getStoredResults() || null;
}

async function loadAutoResults(){
  for (const path of AUTO_RESULTS_PATHS) {
    try {
      const response = await fetch(path, { cache: 'no-store' });
      if (!response.ok) continue;
      const text = await response.text();
      const parsed = parseResultsText(text);
      if (!parsed) continue;
      uploadedResults = parsed;
      saveStoredResults(parsed);
      if (lastLeaderboardSnapshot) {
        renderGroupsPanel(lastLeaderboardSnapshot.runs, lastLeaderboardSnapshot.players);
        renderFixturePanel(lastLeaderboardSnapshot.players);
      }
      return true;
    } catch (err) {
      continue;
    }
  }
  return false;
}

function renderResultsPanelFromFile(file){
  const reader = new FileReader();
  reader.onload = () => {
    try{
      const text = String(reader.result || '');
      const json = parseResultsText(text);
      if(!json) throw new Error('No se pudo interpretar el archivo. Usa JSON o CSV con columnas: group,playerA,playerB,timeA,timeB,winner,date,time');
      uploadedResults = json;
      saveStoredResults(json);
      if(lastLeaderboardSnapshot){
        renderGroupsPanel(lastLeaderboardSnapshot.runs, lastLeaderboardSnapshot.players);
        renderFixturePanel(lastLeaderboardSnapshot.players);
      }
    }catch(err){
      console.error(err);
      alert('No se pudo cargar el archivo de resultados: ' + err.message);
    }
  };
  reader.readAsText(file);
}

function parseResultsText(text){
  const trimmed = text.trim();
  if(!trimmed) return null;

  try{
    const json = JSON.parse(trimmed);
    if(json && (Array.isArray(json.matches) || Array.isArray(json))) return json;
  }catch(err){}

  const lines = trimmed.split(/\r?\n/).filter(line => line.trim() && !line.trim().startsWith('#'));
  if(lines.length < 2) return null;

  const header = lines[0].split(',').map(h => h.trim().toLowerCase());
  const rows = lines.slice(1).map(line => {
    const values = line.split(',').map(value => value.trim());
    const row = {};
    header.forEach((key, index) => {
      row[key] = values[index] || '';
    });
    return row;
  });

  return { matches: rows.map(row => ({
    group: row.group || row.grupo || row.round,
    playerA: row.playera || row.player_a || row.a || row.teama || row.teama,
    playerB: row.playerb || row.player_b || row.b || row.teamb || row.teamb,
    timeA: row.timea || row.time_a || row.tiempoa || row.tiempo_a,
    timeB: row.timeb || row.time_b || row.tiempob || row.tiempo_b,
    winner: row.winner || row.ganador || row.result,
    date: row.date || row.fecha,
    time: row.time || row.horario || row.schedule
  })) };
}

function getPlayerName(run, playersData){
  const p = run.run.players[0];
  if(p.rel === "guest") return p.name;
  const found = playersData.find(pl => pl.id === p.id);
  return found ? found.names.international : "Unknown";
}

function countryCodeToFlagEmoji(countryCode){
  if(!countryCode) return null;

  const code = countryCode.toUpperCase();
  if(code.length !== 2 || !/^[A-Z]{2}$/.test(code)) return null;

  return code
    .split('')
    .map(letter => String.fromCodePoint(0x1F1E6 + (letter.charCodeAt(0) - 65)))
    .join('');
}

function countryFlag(playersData, playerId){
  const found = playersData.find(pl => pl.id === playerId);
  if(found && found.location && found.location.country){
    return countryCodeToFlagEmoji(found.location.country.code);
  }
  return null;
}

function formatDate(value){
  if(!value) return "No disponible";
  const date = new Date(value);
  if(Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
}

function playerChannels(player){
  if(!player) return [];

  const channelMap = [];
  const fields = [
    { key: 'twitch', label: 'Twitch' },
    { key: 'youtube', label: 'YouTube' },
    { key: 'twitter', label: 'Twitter/X' },
    { key: 'speedrunslive', label: 'SpeedRunsLive' },
    { key: 'hitbox', label: 'Hitbox' },
    { key: 'weblink', label: 'Web' }
  ];

  fields.forEach(({ key, label }) => {
    const value = player[key];
    if(value && value.trim && value.trim() !== '') {
      channelMap.push({ label, href: value, rel: key });
    }
  });

  return channelMap;
}

async function getCategoryName(categoryId){
  if(!categoryId) return 'Categoría';

  if(categoryCache.has(categoryId)){
    return categoryCache.get(categoryId);
  }

  const url = 'https://www.speedrun.com/api/v1/categories/' + encodeURIComponent(categoryId);

  try{
    const json = await fetchJsonWithProxy(url);
    const name = json && json.data && json.data.name
      ? json.data.name
      : categoryId;

    categoryCache.set(categoryId, name);
    return name;
  }catch(err){
    categoryCache.set(categoryId, categoryId);
    return categoryId;
  }
}

async function getGameName(gameId){
  if(!gameId) return 'Juego';

  if(gameCache.has(gameId)){
    return gameCache.get(gameId);
  }

  const url = 'https://www.speedrun.com/api/v1/games/' + encodeURIComponent(gameId);

  try{
    const json = await fetchJsonWithProxy(url);
    const name = json && json.data && json.data.names
      ? json.data.names.international || json.data.names.twitch
      : gameId;

    gameCache.set(gameId, name);
    return name;
  }catch(err){
    gameCache.set(gameId, gameId);
    return gameId;
  }
}

async function fetchPlayerPersonalBests(player){
  if(!player || !player.id || player.rel === 'guest') return [];

  if(playerPbCache.has(player.id)){
    return playerPbCache.get(player.id);
  }

  const personalBestLink = Array.isArray(player.links)
    ? player.links.find(link => (link.rel || '').toLowerCase().includes('personal-bests'))
    : null;

  if(!personalBestLink || !personalBestLink.uri){
    playerPbCache.set(player.id, []);
    return [];
  }

  try{
    const json = await fetchJsonWithProxy(personalBestLink.uri);
    const pbs = Array.isArray(json.data)
      ? [...json.data].sort((a, b) => (a.place ?? Number.MAX_SAFE_INTEGER) - (b.place ?? Number.MAX_SAFE_INTEGER))
      : [];
    const resolvedPbs = [];

    for(const pb of pbs){
      const run = pb && pb.run ? pb.run : null;
      const gameId = run && run.game ? run.game : null;
      const gameName = gameId ? await getGameName(gameId) : 'Juego';
      const categoryId = run && run.category ? run.category : null;
      const categoryName = categoryId ? await getCategoryName(categoryId) : 'Categoría';
      const primaryTime = run && run.times && run.times.primary_t != null
        ? formatTime(run.times.primary_t)
        : 'N/D';

      const videoLinks = run && run.videos && Array.isArray(run.videos.links)
        ? run.videos.links
        : [];

      resolvedPbs.push({
        gameName,
        categoryName,
        primaryTime,
        submitted: run && run.submitted ? run.submitted : run && run.date ? run.date : null,
        date: run && run.date ? run.date : null,
        videoUri: videoLinks.length > 0 ? videoLinks[0].uri : null
      });
    }

    playerPbCache.set(player.id, resolvedPbs);
    return resolvedPbs;
  }catch(err){
    console.warn('No se pudieron cargar PBs para', player.id, err.message);
    playerPbCache.set(player.id, []);
    return [];
  }
}

function getYoutubeEmbedUrl(videoUrl){
  if(!videoUrl) return null;

  try{
    const url = new URL(videoUrl);
    const host = (url.hostname || '').toLowerCase();

    if(host.includes('youtu.be')){
      const id = (url.pathname || '/').replace(/^\/+/, '').trim();
      if(id){ return 'https://www.youtube.com/embed/' + id; }
    }

    if(host.includes('youtube.com')){
      const v = url.searchParams.get('v');
      if(v && v.trim() !== ''){
        return 'https://www.youtube.com/embed/' + encodeURIComponent(v.trim()) + '?rel=0';
      }

      const path = (url.pathname || '').toLowerCase();
      if(path.includes('/embed/')){
        const parts = path.split('/embed/');
        const id = parts[1] || '';
        if(id){ return 'https://www.youtube.com/embed/' + encodeURIComponent(id); }
      }
    }

    return null;
  }catch(err){
    return null;
  }
}

function buildGroupStage(runs, players){
  const storedResults = getLoadedResults();
  const groupStandings = storedResults ? computeGroupStandings(storedResults) : null;

  if (FINAL_GROUPS && Object.keys(FINAL_GROUPS).length) {
    return Object.entries(FINAL_GROUPS).map(([letter, names]) => {
      const standings = groupStandings && groupStandings[letter] ? Object.values(groupStandings[letter]) : [];
      const playersWithScore = names.map((name) => {
        const playerProfile = resolvePlayerByName(players, name);
        const standing = standings.find(entry => normalizeManualMatchName(entry.name) === normalizeManualMatchName(name));
        return {
          name,
          flag: playerProfile ? countryFlag(players, playerProfile.id) : null,
          matches: standing ? standing.matches : 0,
          wins: standing ? standing.wins : 0,
          draws: standing ? standing.draws : 0,
          losses: standing ? standing.losses : 0,
          points: standing ? standing.points : 0,
          bestTime: standing && standing.bestTime != null ? standing.bestTime : null,
          bestTimeLabel: standing ? standing.bestTimeLabel : null,
          qualifies: false,
          slotLabel: 'Posición'
        };
      }).sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if ((a.bestTime ?? Number.POSITIVE_INFINITY) !== (b.bestTime ?? Number.POSITIVE_INFINITY)) return (a.bestTime ?? Number.POSITIVE_INFINITY) - (b.bestTime ?? Number.POSITIVE_INFINITY);
        return 0;
      });

      playersWithScore.forEach((player, index) => {
        player.qualifies = index < 2;
        player.slotLabel = ['Cabecera', '2ª posición', '3ª posición', '4ª posición'][index] || 'Posición';
      });

      return { letter, players: playersWithScore };
    });
  }

  const orderedRuns = [...(Array.isArray(runs) ? runs : [])]
    .sort((a, b) => (a.place ?? Number.MAX_SAFE_INTEGER) - (b.place ?? Number.MAX_SAFE_INTEGER));

  const groups = Array.from({ length: 8 }, (_, index) => ({
    letter: String.fromCharCode(65 + index),
    players: Array(4).fill(null)
  }));

  orderedRuns.forEach((run, index) => {
    const groupIndex = index % 8;
    const slotIndex = Math.floor(index / 8);

    if(slotIndex >= 4) return;

    const playerObj = run.run && run.run.players && run.run.players[0]
      ? run.run.players[0]
      : null;

    const playerProfile = playerObj && playerObj.rel !== 'guest'
      ? players.find(pl => pl.id === playerObj.id) || null
      : null;

    const playerName = playerObj && playerObj.rel === 'guest'
      ? playerObj.name
      : (playerProfile ? playerProfile.names?.international || 'Jugador' : 'Jugador');

    const flag = playerObj && playerObj.rel !== 'guest'
      ? countryFlag(players, playerObj.id)
      : null;

    groups[groupIndex].players[slotIndex] = {
      name: playerName,
      flag,
      points: '?',
      slotLabel: ['Cabecera', '2ª posición', '3ª posición', '4ª posición'][slotIndex] || 'Posición'
    };
  });

  return groups;
}

function renderGroupsPanel(runs, players){
  finishedQualy = true;
  finishedGroups = false;

  const groups = buildGroupStage(runs, players);
  const groupsHtml = groups.map(group => {
    const playersHtml = group.players.map((player, index) => {
      if(!player){
        return `<tr class="group-player placeholder"><td colspan="8">${['Cabecera', '2ª posición', '3ª posición', '4ª posición'][index]}: por determinar</td></tr>`;
      }

      return `<tr class="group-player">
        <td class="group-player-position">${index + 1}</td>
        <td class="group-player-name"><button class="player-profile-button" type="button" data-player-name="${player.name}">${player.flag ? `<span class="flag">${player.flag}</span>` : ''} ${player.name}</button></td>
        <td class="group-stat">${player.matches}</td>
        <td class="group-stat">${player.wins}</td>
        <td class="group-stat">${player.draws}</td>
        <td class="group-stat">${player.losses}</td>
        <td class="group-best-time">${player.bestTimeLabel || (player.bestTime != null ? formatTime(player.bestTime) : '-')}</td>
        <td class="group-points">${Number(player.points ?? 0)}</td>
      </tr>`;
    }).join('');

    return `
      <div class="group-card">
        <div class="group-header">
          <span>Grupo ${group.letter}</span>
          <span class="group-badge">${group.players.length} jugadores</span>
        </div>
        <div class="group-status">Fase de grupos en curso</div>
        <table class="group-table" aria-label="Tabla del Grupo ${group.letter}">
          <colgroup><col class="group-col-position"><col class="group-col-player"><col span="4" class="group-col-stat"><col class="group-col-time"><col class="group-col-points"></colgroup>
          <thead><tr><th>#</th><th>Jugador</th><th title="Partidos">P</th><th title="Victorias">W</th><th title="Empates">D</th><th title="Derrotas">L</th><th title="Tiempo best">TB</th><th title="Puntos">PTS</th></tr></thead>
          <tbody>${playersHtml}</tbody>
        </table>
      </div>
    `;
  }).join('');

  const container = document.getElementById('grupos-content');
  container.innerHTML = groupsHtml
    ? `<div class="groups-grid">${groupsHtml}</div>`
    : '<div class="loading">Sin datos todavía.</div>';
}

function normalizeDateKey(rawDate){
  if(rawDate == null) return null;

  const value = String(rawDate).trim();
  if(!value || value === '-' || value.toLowerCase() === 'por definir') return null;

  if(/^fecha\s*\d+$/i.test(value)) {
    const match = value.match(/\d+/);
    return match ? `fecha-${match[0]}` : value.toLowerCase();
  }

  const isoMatch = value.match(/^(\d{4})-(\d{1,2})-(\d{1,2})/);
  if(isoMatch){
    const [, year, month, day] = isoMatch;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  const slashMatch = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})$/);
  if(slashMatch){
    const [, day, month, yearRaw] = slashMatch;
    const year = yearRaw.length === 2 ? `20${yearRaw}` : yearRaw;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  const parsed = new Date(value);
  if(!Number.isNaN(parsed.getTime())){
    return parsed.toISOString().slice(0, 10);
  }

  return null;
}

function buildGroupFixture(results = null){
  const firstRoundPatterns = {
    A: [[0, 2], [1, 3]],
    B: [[0, 3], [1, 2]],
    C: [[0, 3], [1, 2]],
    D: [[0, 2], [1, 3]],
    E: [[0, 3], [1, 2]],
    F: [[0, 3], [1, 2]],
    G: [[0, 1], [2, 3]],
    H: [[0, 1], [2, 3]]
  };

  return Object.entries(FINAL_GROUPS).map(([letter, names]) => {
    const dateBuckets = new Map();

    if (results && Array.isArray(results.matches)) {
      results.matches.forEach((record) => {
        const groupKey = resolveManualMatchKey(record);
        if (groupKey !== letter) return;

        const playerA = record.playerA || record.jugadorA || record.a || record.teamA || record.player_1;
        const playerB = record.playerB || record.jugadorB || record.b || record.teamB || record.player_2;
        if (!playerA || !playerB) return;

        const rawDate = record.date || record.fecha || record.day || 'Fecha por definir';
        const normalizedDate = normalizeDateKey(rawDate);
        const bucketKey = normalizedDate || 'sin-fecha';
        if (!dateBuckets.has(bucketKey)) dateBuckets.set(bucketKey, []);
        dateBuckets.get(bucketKey).push({
          playerA,
          playerB,
          date: rawDate,
          time: record.time || record.horario || 'Horario: por definir'
        });
      });
    }

    if (dateBuckets.size === 0) {
      const pattern = firstRoundPatterns[letter] || [[0, 1], [2, 3]];
      dateBuckets.set('fallback', pattern.map(([aIndex, bIndex]) => ({
        playerA: names[aIndex],
        playerB: names[bIndex],
        date: 'Fecha 1',
        time: 'Horario: por definir'
      })));
    }

    const orderedEntries = Array.from(dateBuckets.entries()).sort(([aKey], [bKey]) => {
      if (aKey === 'sin-fecha') return 1;
      if (bKey === 'sin-fecha') return -1;
      if (aKey === 'fallback') return -1;
      if (bKey === 'fallback') return 1;
      return String(aKey).localeCompare(String(bKey), 'en', { numeric: true });
    });

    const splitEntries = orderedEntries.flatMap(([bucketKey, matches]) => {
      if (letter !== 'C' || matches.length <= 2) return [[bucketKey, matches]];

      return Array.from({ length: Math.ceil(matches.length / 2) }, (_, index) => [
        `${bucketKey}-${index + 1}`,
        matches.slice(index * 2, index * 2 + 2)
      ]);
    });

    return {
      letter,
      rounds: splitEntries.map(([bucketKey, matches], index) => ({
        round: bucketKey === 'fallback' ? 'Fecha 1' : `Fecha ${index + 1}`,
        matches
      }))
    };
  });
}

function renderCalendarFixturePanel(players = []){
  const storedResults = getLoadedResults();
  const allMatches = storedResults && Array.isArray(storedResults.matches) ? storedResults.matches : [];
  const calendarBuckets = new Map();

  if(allMatches.length){
    allMatches.forEach((record) => {
      const group = resolveManualMatchKey(record);
      const playerA = record.playerA || record.jugadorA || record.a || record.teamA || record.player_1;
      const playerB = record.playerB || record.jugadorB || record.b || record.teamB || record.player_2;
      if(!group || !playerA || !playerB) return;

      const rawDate = record.date || record.fecha || record.day || 'Fecha por definir';
      const dateKey = normalizeDateKey(rawDate) || 'sin-fecha';
      if(!calendarBuckets.has(dateKey)) calendarBuckets.set(dateKey, []);
      calendarBuckets.get(dateKey).push({ group, playerA, playerB, date: rawDate, time: record.time || record.horario || 'Horario: por definir' });
    });
  }else{
    buildGroupFixture(null).forEach((group) => {
      group.rounds.forEach((round) => {
        const dateKey = normalizeDateKey(round.round) || 'sin-fecha';
        if(!calendarBuckets.has(dateKey)) calendarBuckets.set(dateKey, []);
        round.matches.forEach((match) => calendarBuckets.get(dateKey).push({ ...match, group: group.letter }));
      });
    });
  }

  const orderedDates = Array.from(calendarBuckets.entries()).sort(([aKey], [bKey]) => {
    if(aKey === 'sin-fecha') return 1;
    if(bKey === 'sin-fecha') return -1;
    return aKey.localeCompare(bKey);
  });

  const calendarHtml = orderedDates.map(([dateKey, matches]) => {
    const dateLabel = /^\d{4}-\d{2}-\d{2}$/.test(dateKey)
      ? dateKey.split('-').reverse().join('/')
      : (matches[0]?.date || 'Fecha por definir');
    const matchesHtml = matches.map(match => {
        const playerAProfile = resolvePlayerByName(players, match.playerA);
        const playerBProfile = resolvePlayerByName(players, match.playerB);
        const playerAFlag = playerAProfile ? countryFlag(players, playerAProfile.id) : null;
        const playerBFlag = playerBProfile ? countryFlag(players, playerBProfile.id) : null;

        const resultMatch = allMatches.find((record) => {
          const groupMatch = resolveManualMatchKey(record) || ''; 
          const recordA = record.playerA || record.jugadorA || record.a || record.teamA || record.player_1;
          const recordB = record.playerB || record.jugadorB || record.b || record.teamB || record.player_2;
          return groupMatch === match.group &&
            ((normalizeManualMatchName(recordA) === normalizeManualMatchName(match.playerA) && normalizeManualMatchName(recordB) === normalizeManualMatchName(match.playerB)) ||
             (normalizeManualMatchName(recordA) === normalizeManualMatchName(match.playerB) && normalizeManualMatchName(recordB) === normalizeManualMatchName(match.playerA)));
        });

        const winner = resultMatch ? getMatchWinnerName(resultMatch, resultMatch.playerA || resultMatch.jugadorA || resultMatch.a || resultMatch.teamA || resultMatch.player_1, resultMatch.playerB || resultMatch.jugadorB || resultMatch.b || resultMatch.teamB || resultMatch.player_2) : null;
        const scoreA = resultMatch ? (resultMatch.timeA ?? resultMatch.tiempoA ?? resultMatch.time_a ?? resultMatch.times?.[match.playerA] ?? resultMatch.result?.timeA ?? resultMatch.result?.[match.playerA] ?? '-') : '-';
        const scoreB = resultMatch ? (resultMatch.timeB ?? resultMatch.tiempoB ?? resultMatch.time_b ?? resultMatch.times?.[match.playerB] ?? resultMatch.result?.timeB ?? resultMatch.result?.[match.playerB] ?? '-') : '-';

        const formattedA = scoreA === '-' ? '-' : formatManualTime(scoreA);
        const formattedB = scoreB === '-' ? '-' : formatManualTime(scoreB);

        return `
          <div class="fixture-match">
            <div class="fixture-match-group">Grupo ${match.group}</div>
            <div class="fixture-teams">
              <div class="fixture-team-row ${winner && winner === match.playerA ? 'winner' : ''}">
                <div class="fixture-team">
                  <span class="flag">${playerAFlag || '🏳️'}</span>
                  <button class="player-profile-button fixture-name" type="button" data-player-name="${match.playerA}">${match.playerA}</button>
                </div>
                <span class="fixture-score">${formattedA}</span>
              </div>
              <div class="fixture-team-row ${winner && winner === match.playerB ? 'winner' : ''}">
                <div class="fixture-team">
                  <span class="flag">${playerBFlag || '🏳️'}</span>
                  <button class="player-profile-button fixture-name" type="button" data-player-name="${match.playerB}">${match.playerB}</button>
                </div>
                <span class="fixture-score">${formattedB}</span>
              </div>
            </div>
            <div class="fixture-meta">
              <div class="fixture-meta-row"><span class="fixture-meta-label">Fecha:</span> <span>${resultMatch && (resultMatch.date || resultMatch.fecha) ? (resultMatch.date || resultMatch.fecha) : match.date}</span></div>
              <div class="fixture-meta-row"><span class="fixture-meta-label">Horario:</span> <span>${resultMatch && (resultMatch.time || resultMatch.horario) ? (resultMatch.time || resultMatch.horario) : match.time}</span></div>
            </div>
          </div>
        `;
      }).join('');

      return `
        <div class="fixture-card">
          <div class="fixture-header">
            <span class="fixture-label">${dateLabel}</span>
            <span class="fixture-badge">${matches.length} partido${matches.length === 1 ? '' : 's'}</span>
          </div>
          <div class="fixture-round-body fixture-calendar-matches">${matchesHtml}</div>
        </div>
      `;
  }).join('');

  const container = document.getElementById('fixture-content');
  container.innerHTML = calendarHtml
    ? `<div class="fixture-grid fixture-calendar-grid">${calendarHtml}</div>`
    : '<div class="loading">Sin datos todavía.</div>';
}

function renderFixturePanel(players = []){
  renderCalendarFixturePanel(players);
}

function buildKnockoutBracket(runs, players){
  const groupOrder = Object.keys(FINAL_GROUPS);

  if(!finishedGroups){
    const pendingParticipants = [
      { label: '1º Grupo A', name: 'Por determinar', flag: null, details: 'sorteo pendiente' },
      { label: '2º Grupo B', name: 'Por determinar', flag: null, details: 'sorteo pendiente' },
      { label: '1º Grupo C', name: 'Por determinar', flag: null, details: 'sorteo pendiente' },
      { label: '2º Grupo D', name: 'Por determinar', flag: null, details: 'sorteo pendiente' },
      { label: '1º Grupo E', name: 'Por determinar', flag: null, details: 'sorteo pendiente' },
      { label: '2º Grupo F', name: 'Por determinar', flag: null, details: 'sorteo pendiente' },
      { label: '1º Grupo G', name: 'Por determinar', flag: null, details: 'sorteo pendiente' },
      { label: '2º Grupo H', name: 'Por determinar', flag: null, details: 'sorteo pendiente' },
      { label: '1º Grupo B', name: 'Por determinar', flag: null, details: 'sorteo pendiente' },
      { label: '2º Grupo A', name: 'Por determinar', flag: null, details: 'sorteo pendiente' },
      { label: '1º Grupo D', name: 'Por determinar', flag: null, details: 'sorteo pendiente' },
      { label: '2º Grupo C', name: 'Por determinar', flag: null, details: 'sorteo pendiente' },
      { label: '1º Grupo F', name: 'Por determinar', flag: null, details: 'sorteo pendiente' },
      { label: '2º Grupo E', name: 'Por determinar', flag: null, details: 'sorteo pendiente' },
      { label: '1º Grupo H', name: 'Por determinar', flag: null, details: 'sorteo pendiente' },
      { label: '2º Grupo G', name: 'Por determinar', flag: null, details: 'sorteo pendiente' }
    ];

    return {
      octavos: [
        [pendingParticipants[0], pendingParticipants[1]],
        [pendingParticipants[2], pendingParticipants[3]],
        [pendingParticipants[4], pendingParticipants[5]],
        [pendingParticipants[6], pendingParticipants[7]],
        [pendingParticipants[8], pendingParticipants[9]],
        [pendingParticipants[10], pendingParticipants[11]],
        [pendingParticipants[12], pendingParticipants[13]],
        [pendingParticipants[14], pendingParticipants[15]]
      ],
      cuartos: [
        [{ label: 'Por determinar', name: 'Por determinar', flag: null, details: 'sorteo pendiente' }, { label: 'Por determinar', name: 'Por determinar', flag: null, details: 'sorteo pendiente' }],
        [{ label: 'Por determinar', name: 'Por determinar', flag: null, details: 'sorteo pendiente' }, { label: 'Por determinar', name: 'Por determinar', flag: null, details: 'sorteo pendiente' }],
        [{ label: 'Por determinar', name: 'Por determinar', flag: null, details: 'sorteo pendiente' }, { label: 'Por determinar', name: 'Por determinar', flag: null, details: 'sorteo pendiente' }],
        [{ label: 'Por determinar', name: 'Por determinar', flag: null, details: 'sorteo pendiente' }, { label: 'Por determinar', name: 'Por determinar', flag: null, details: 'sorteo pendiente' }]
      ],
      semis: [
        [{ label: 'Por determinar', name: 'Por determinar', flag: null, details: 'sorteo pendiente' }, { label: 'Por determinar', name: 'Por determinar', flag: null, details: 'sorteo pendiente' }],
        [{ label: 'Por determinar', name: 'Por determinar', flag: null, details: 'sorteo pendiente' }, { label: 'Por determinar', name: 'Por determinar', flag: null, details: 'sorteo pendiente' }]
      ],
      final: [{ label: 'Por determinar', name: 'Por determinar', flag: null, details: 'sorteo pendiente' }, { label: 'Por determinar', name: 'Por determinar', flag: null, details: 'sorteo pendiente' }],
      champion: { label: 'Campeón', name: 'Por determinar', flag: null, details: 'pendiente' }
    };
  }

  const qualifiedParticipants = groupOrder.flatMap((groupLetter) => {
    return FINAL_GROUPS[groupLetter].slice(0, 2).map((name, index) => {
      const playerProfile = resolvePlayerByName(players, name);
      return {
        label: `${index === 0 ? '1º' : '2º'} Grupo ${groupLetter}`,
        name,
        flag: playerProfile ? countryFlag(players, playerProfile.id) : null,
        details: 'clasificado'
      };
    });
  });

  const octavos = [
    [qualifiedParticipants[0], qualifiedParticipants[3]],
    [qualifiedParticipants[4], qualifiedParticipants[7]],
    [qualifiedParticipants[8], qualifiedParticipants[11]],
    [qualifiedParticipants[12], qualifiedParticipants[15]],
    [qualifiedParticipants[2], qualifiedParticipants[1]],
    [qualifiedParticipants[6], qualifiedParticipants[5]],
    [qualifiedParticipants[10], qualifiedParticipants[9]],
    [qualifiedParticipants[14], qualifiedParticipants[13]]
  ];

  const cuartos = [
    [{ label: 'Por determinar', name: 'Por determinar', flag: null, details: 'sorteo pendiente' }, { label: 'Por determinar', name: 'Por determinar', flag: null, details: 'sorteo pendiente' }],
    [{ label: 'Por determinar', name: 'Por determinar', flag: null, details: 'sorteo pendiente' }, { label: 'Por determinar', name: 'Por determinar', flag: null, details: 'sorteo pendiente' }],
    [{ label: 'Por determinar', name: 'Por determinar', flag: null, details: 'sorteo pendiente' }, { label: 'Por determinar', name: 'Por determinar', flag: null, details: 'sorteo pendiente' }],
    [{ label: 'Por determinar', name: 'Por determinar', flag: null, details: 'sorteo pendiente' }, { label: 'Por determinar', name: 'Por determinar', flag: null, details: 'sorteo pendiente' }]
  ];

  const semis = [
    [{ label: 'Por determinar', name: 'Por determinar', flag: null, details: 'sorteo pendiente' }, { label: 'Por determinar', name: 'Por determinar', flag: null, details: 'sorteo pendiente' }],
    [{ label: 'Por determinar', name: 'Por determinar', flag: null, details: 'sorteo pendiente' }, { label: 'Por determinar', name: 'Por determinar', flag: null, details: 'sorteo pendiente' }]
  ];

  const final = [{ label: 'Por determinar', name: 'Por determinar', flag: null, details: 'sorteo pendiente' }, { label: 'Por determinar', name: 'Por determinar', flag: null, details: 'sorteo pendiente' }];

  const champion = { label: 'Campeón', name: 'Por determinar', flag: null, details: 'pendiente' };

  return { octavos, cuartos, semis, final, champion };
}

function renderEliminatoriasPanel(runs, players){
  const bracket = buildKnockoutBracket(runs, players);
  const renderMatch = (match, index, winnerIndex = null) => {
    const teamA = finishedGroups ? match[0] || { label: 'Por determinar', name: 'Por determinar', flag: null, details: 'sorteo pendiente' } : { label: 'Por determinar', name: 'Por determinar', flag: null, details: 'sorteo pendiente' };
    const teamB = finishedGroups ? match[1] || { label: 'Por determinar', name: 'Por determinar', flag: null, details: 'sorteo pendiente' } : { label: 'Por determinar', name: 'Por determinar', flag: null, details: 'sorteo pendiente' };

    const isWinnerA = winnerIndex === 0;
    const isWinnerB = winnerIndex === 1;
    const teamName = (team) => team.name === 'Por determinar'
      ? `<span class="team-name"><span class="team-flag">${team.flag || '🏳️'}</span> ${team.name}</span>`
      : `<button class="player-profile-button team-name" type="button" data-player-name="${team.name}"><span class="team-flag">${team.flag || '🏳️'}</span> ${team.name}</button>`;

    return `
      <div class="knockout-match" data-match="${index}">
        <div class="team-slot ${isWinnerA ? 'winner' : ''}">
          <span class="team-label">${teamA.label}</span>
          ${teamName(teamA)}
          <span class="team-detail">${teamA.details}</span>
        </div>
        <div class="team-slot ${isWinnerB ? 'winner' : ''}">
          <span class="team-label">${teamB.label}</span>
          ${teamName(teamB)}
          <span class="team-detail">${teamB.details}</span>
        </div>
      </div>
    `;
  };

  const renderSide = (matches, side, roundTitle) => {
    const items = matches.map((match, index) => renderMatch(match, `${side}-${index}`));
    return `<div class="bracket-cluster ${side}"><div class="round-title">${roundTitle}</div>${items.join('')}</div>`;
  };

  const bracketHtml = `
    <div class="bracket-wrap">
      <div class="bracket-round tier-octavos">
        <div class="tier-row">
          ${renderSide(bracket.octavos.slice(0, 4), 'left', 'Octavos')}
          ${renderSide(bracket.octavos.slice(4, 8), 'right', 'Octavos')}
        </div>
      </div>

      <div class="bracket-round tier-quarters">
        <div class="tier-row">
          ${renderSide(bracket.cuartos.slice(0, 2), 'left', 'Cuartos')}
          ${renderSide(bracket.cuartos.slice(2, 4), 'right', 'Cuartos')}
        </div>
      </div>

      <div class="bracket-round tier-semis">
        <div class="tier-row">
          ${renderSide(bracket.semis.slice(0, 1), 'left', 'Semifinales')}
          ${renderSide(bracket.semis.slice(1, 2), 'right', 'Semifinales')}
        </div>
      </div>

      <div class="bracket-round final-round">
        <div class="round-title">Final</div>
        <div class="tier-row center-row">${renderMatch(bracket.final, 'final', 0)}</div>
      </div>
    </div>
  `;

  const container = document.getElementById('eliminatorias-content');
  container.innerHTML = bracketHtml;
}

function buildPlayerDetails(player, pbs, runUrl, datePb){
  if(!player){ return '';
  }

  const channelList = playerChannels(player);
  const signupDate = formatDate(player.signup || player.signupDate || player.created || player.date);
  const channelHtml = channelList.length > 0
    ? `<li><strong>Canales:</strong> ${channelList.map((link, index) => {
        const href = link.href ? `href="${link.href}" target="_blank" rel="noopener noreferrer"` : '';
        const label = link.label || link.rel;
        return `<a class="detail-link" ${href}>${label}</a>${index < channelList.length - 1 ? ', ' : ''}`;
      }).join('')}</li>`
    : '<li><strong>Canales:</strong> No disponibles</li>';

  const firstPb = Array.isArray(pbs) && pbs.length > 0 ? pbs[0] : null;
  const pbList = Array.isArray(pbs) && pbs.length > 0
    ? pbs.slice(0, 3).map(pb => `<li>${pb.gameName || 'Juego'} — ${pb.categoryName || 'Categoría'}: ${pb.primaryTime || 'N/D'}</li>`).join('')
    : '<li>No disponibles</li>';

  const submitted = formatDate(datePb);

  const videoHtml = runUrl
    ? `<div class="detail-video-link"><a class="detail-link" href="${runUrl}" target="_blank" rel="noopener noreferrer">Ver video del PB</a></div>`
    : '';

      
  
  return `<div class="player-detail">
    <div class="player-detail-title">${player.names?.international || 'Jugador'}</div>
    <ul class="detail-stats">
      <li><strong>Fecha de inscripción:</strong> ${signupDate}</li>
      ${channelHtml}
      <li class="pb-item"><strong>Personal Bests:</strong>
        <ul class="pb-sublist">${pbList}</ul>
      </li>
      <li><strong>Fecha de subida del PB:</strong> ${submitted}</li>
    </ul>
    ${videoHtml}
  </div>`;
}

function getGroupPlayerSummary(playerName){
  const rawResults = getLoadedResults() || { matches: [] };
  const standings = computeGroupStandings(rawResults);
  const target = normalizeManualMatchName(playerName);

  for(const [letter, entriesByName] of Object.entries(standings)){
    const entries = Object.values(entriesByName).sort((a, b) => {
      if(b.points !== a.points) return b.points - a.points;
      return (a.bestTime ?? Number.POSITIVE_INFINITY) - (b.bestTime ?? Number.POSITIVE_INFINITY);
    });
    const rank = entries.findIndex(entry => normalizeManualMatchName(entry.name) === target);
    if(rank !== -1){
      return { letter, rank: rank + 1, total: entries.length, entry: entries[rank], entries };
    }
  }

  return null;
}

function getGroupMatches(groupLetter){
  const rawResults = getLoadedResults();
  const matches = rawResults && Array.isArray(rawResults.matches) ? rawResults.matches : [];

  return matches
    .filter(match => resolveManualMatchKey(match) === groupLetter)
    .map(match => ({
      playerA: match.playerA || match.jugadorA || match.a || match.teamA || match.player_1,
      playerB: match.playerB || match.jugadorB || match.b || match.teamB || match.player_2,
      timeA: match.timeA ?? match.tiempoA ?? match.time_a ?? match.times?.[match.playerA] ?? match.result?.timeA ?? match.result?.[match.playerA] ?? '-',
      timeB: match.timeB ?? match.tiempoB ?? match.time_b ?? match.times?.[match.playerB] ?? match.result?.timeB ?? match.result?.[match.playerB] ?? '-',
      winner: match.winner || '',
      date: match.date || match.fecha || match.day || 'Fecha por definir',
      time: match.time || match.horario || 'Horario por definir'
    }));
}

function formatCalendarDate(value){
  const key = normalizeDateKey(value);
  return key && /^\d{4}-\d{2}-\d{2}$/.test(key) ? key.split('-').reverse().join('/') : value;
}

function openPlayerModal(playerName){
  const modal = document.getElementById('player-modal');
  const content = document.getElementById('player-modal-content');
  if(!modal || !content) return;

  const players = lastLeaderboardSnapshot?.players || [];
  const profile = resolvePlayerByName(players, playerName);
  const summary = getGroupPlayerSummary(playerName);
  const flag = profile ? countryFlag(players, profile.id) : null;
  const entry = summary?.entry || { matches: 0, wins: 0, draws: 0, losses: 0, bestTime: null, bestTimeLabel: null, points: 0 };
  const bestTime = entry.bestTimeLabel || (entry.bestTime != null ? formatTime(entry.bestTime) : '-');
  const groupMatches = summary ? getGroupMatches(summary.letter) : [];
  const isUpcoming = match => {
    return !(match.winner && String(match.winner).trim()) &&
      parseManualTime(match.timeA) == null && parseManualTime(match.timeB) == null;
  };
  const renderMatch = match => {
    const formattedA = formatManualTime(match.timeA);
    const formattedB = formatManualTime(match.timeB);
    const winnerText = match.winner ? `Ganador: ${match.winner}` : '';
    return `<div class="player-match">
      <div class="player-match-top"><strong>${formatCalendarDate(match.date)}</strong><span>${match.time}</span></div>
      <div class="player-match-teams"><span>${match.playerA}</span><b>${formattedA}</b><span>${match.playerB}</span><b>${formattedB}</b></div>
      <div class="player-match-status">${isUpcoming(match) ? 'Próximo' : (winnerText || 'Finalizado')}</div>
    </div>`;
  };
  const pastMatches = groupMatches.filter(match => !isUpcoming(match));
  const upcomingMatches = groupMatches.filter(match => isUpcoming(match));
  const renderMatchSection = (title, matches, emptyText) => `
    <div class="player-modal-subsection">
      <div class="player-modal-subtitle">${title}</div>
      ${matches.length ? matches.map(renderMatch).join('') : `<div class="player-modal-empty">${emptyText}</div>`}
    </div>`;
  const groupTable = summary ? `<div class="player-modal-section">
    <div class="player-modal-section-title">Posiciones · Grupo ${summary.letter}</div>
    <div class="player-group-table-wrap"><table class="player-group-table"><thead><tr><th>#</th><th>Jugador</th><th>P</th><th>W</th><th>D</th><th>L</th><th>TB</th><th>PTS</th></tr></thead><tbody>
      ${summary.entries.map((groupEntry, index) => `<tr class="${normalizeManualMatchName(groupEntry.name) === normalizeManualMatchName(playerName) ? 'is-selected' : ''}"><td>${index + 1}</td><td>${groupEntry.name}</td><td>${groupEntry.matches}</td><td>${groupEntry.wins}</td><td>${groupEntry.draws}</td><td>${groupEntry.losses}</td><td>${groupEntry.bestTimeLabel || (groupEntry.bestTime != null ? formatTime(groupEntry.bestTime) : '-')}</td><td>${groupEntry.points}</td></tr>`).join('')}
    </tbody></table></div>
  </div>` : '';

  content.innerHTML = `
    <div class="player-modal-kicker">Fase de grupos${summary ? ` · Grupo ${summary.letter}` : ''}</div>
    <h2 id="player-modal-title">${flag ? `<span class="flag">${flag}</span> ` : ''}${playerName}</h2>
    <div class="player-modal-position">${summary ? `<strong>${summary.rank}º</strong> de ${summary.total} en el Grupo ${summary.letter}` : 'Posición pendiente'}</div>
    <div class="player-modal-stats">
      <div><span>P</span><strong>${entry.matches}</strong></div>
      <div><span>W</span><strong>${entry.wins}</strong></div>
      <div><span>D</span><strong>${entry.draws}</strong></div>
      <div><span>L</span><strong>${entry.losses}</strong></div>
      <div><span>TB</span><strong>${bestTime}</strong></div>
      <div><span>PTS</span><strong>${entry.points}</strong></div>
    </div>
    ${groupTable}
    <div class="player-modal-section">
      <div class="player-modal-section-title">Partidos del Grupo ${summary?.letter || ''}</div>
      ${renderMatchSection('Pasadas', pastMatches, 'Todavía no hay partidos finalizados.')}
      ${renderMatchSection('Próximas', upcomingMatches, 'No hay próximos partidos cargados.')}
    </div>
    ${profile ? `<div class="player-modal-note">La posición y los partidos corresponden exclusivamente a la fase de grupos.</div>` : ''}
  `;
  modal.hidden = false;
  document.body.classList.add('modal-open');
}

function closePlayerModal(){
  const modal = document.getElementById('player-modal');
  if(!modal) return;
  modal.hidden = true;
  document.body.classList.remove('modal-open');
}

document.addEventListener('click', (event) => {
  const playerButton = event.target.closest('.player-profile-button');
  if(playerButton){
    openPlayerModal(playerButton.dataset.playerName);
    return;
  }

  if(event.target.closest('[data-close-player-modal]')) closePlayerModal();
});

document.addEventListener('keydown', (event) => {
  if(event.key === 'Escape') closePlayerModal();
});

async function loadLeaderboard(){
  const statusEl = document.getElementById('status');
  try{
    statusEl.textContent = "actualizando…";
    statusEl.className = "status";

    const json = await fetchLeaderboardData();
    const data = json.data;
    const players = data.players.data;
    const runs = Array.isArray(data.runs)
      ? [...data.runs].sort((a, b) => (a.place ?? Number.MAX_SAFE_INTEGER) - (b.place ?? Number.MAX_SAFE_INTEGER))
      : [];

    // Título dinámico si vino embebido
    if(data.category && data.category.data){
      document.getElementById('title').textContent =
        (data.game && data.game.data ? data.game.data.names.international + " — " : "") +
        data.category.data.name;
    }

    const container = document.getElementById('tabla-content');
    if(runs.length === 0){
      container.innerHTML = '<div class="loading">Sin runs registradas todavía.</div>';
      document.getElementById('grupos-content').innerHTML = '<div class="loading">Sin datos para generar grupos.</div>';
      statusEl.textContent = "en vivo";
      statusEl.className = "status live";
      return;
    }

    lastLeaderboardSnapshot = { runs, players };
    renderGroupsPanel(runs, players);
    renderFixturePanel(players);
    renderEliminatoriasPanel(runs, players);
    await loadAutoResults();

    const playerProfileMap = new Map(players.map(player => [player.id, player]));
    const personalBestsByPlayer = new Map();

    const uniquePlayerIds = [...new Set(
      runs
        .map(r => r.run.players[0])
        .filter(p => p && p.rel !== 'guest')
        .map(p => p.id)
    )];

    const pbsLoadPromise = Promise.all(uniquePlayerIds.map(async (playerId) => {
      const player = playerProfileMap.get(playerId);
      if(!player) return;
      const pbs = await fetchPlayerPersonalBests(player);
      personalBestsByPlayer.set(playerId, pbs);
    }));

    const qualifyingRows = buildQualifyingRows(runs, players);
    let html = '<table><thead><tr><th>#</th><th>Jugador</th><th>Tiempo</th></tr></thead><tbody>';
    const currentOrder = [];

    qualifyingRows.forEach(row => {
      const place = row.place;
      const name = row.name;
      const playerObj = row.playerId ? players.find(pl => pl.id === row.playerId) : null;
      const flag = playerObj ? countryFlag(players, row.playerId) : null;
      const time = row.time;
      const isPending = row.isPending;
      const isOutsideGroups = place != null && place > QUALIFYING_LIMIT;
      const runId = row.playerId ? `player-${row.playerId}` : `pending-${name}`;
      currentOrder.push(runId);

      let placeClass = "place";
      if(place === 1) placeClass += " place-1";
      else if(place === 2) placeClass += " place-2";
      else if(place === 3) placeClass += " place-3";
      if(isPending) placeClass += " pending-value";

      const detail = playerObj
        ? buildPlayerDetails(playerObj, personalBestsByPlayer.get(row.playerId), row.playerId ? '' : '', null)
        : '';
      const isExpanded = row.playerId && expandedPlayerId === row.playerId;

      const rowClasses = [
        isPending ? 'pending-row' : '',
        isOutsideGroups ? 'outside-groups-row' : ''
      ].filter(Boolean).join(' ');

      html += `<tr class="${rowClasses}">
        <td class="${placeClass}">${row.placeLabel}</td>
        <td class="player ${isPending ? 'pending-player-cell' : ''}">
          ${row.playerId ? `
            <button class="player-profile-button player-button" type="button" data-player-id="${row.playerId}" data-player-name="${name}">
              <span class="player-name">${name}</span>${flag ? ` <span class="flag">${flag}</span>` : ''}
            </button>
          ` : `<span class="player-name pending-player">${name}</span>`}
        </td>
        <td class="time ${isPending ? 'pending-value' : ''}">${time}</td>
      </tr>
      ${row.playerId ? `<tr class="player-detail-row${isExpanded ? ' is-open' : ''}" data-player-id="${row.playerId}"><td colspan="3">${detail}</td></tr>` : ''}`;
    });

    html += '</tbody></table>';

    const activeDetailRow = container.querySelector('tr.player-detail-row.is-open');
    const activeDetailPlayerId = activeDetailRow ? activeDetailRow.dataset.playerId : null;
    const activeVideoIframe = activeDetailRow ? activeDetailRow.querySelector('iframe') : null;

    container.innerHTML = html;

    if(expandedPlayerId && activeDetailPlayerId && expandedPlayerId === activeDetailPlayerId && activeVideoIframe){
      const newDetailRow = container.querySelector('tr.player-detail-row[data-player-id="' + activeDetailPlayerId + '"]');
      const newVideoIframe = newDetailRow ? newDetailRow.querySelector('iframe') : null;

      if(newDetailRow && newVideoIframe && activeVideoIframe){
        newVideoIframe.replaceWith(activeVideoIframe);
      }
    }

    container.querySelectorAll('button.inline-player-button').forEach(button => {
      button.addEventListener('click', () => {
        const userId = button.dataset.playerId;
        const detailRows = container.querySelectorAll('.player-detail-row');

        if(expandedPlayerId === userId){
          expandedPlayerId = null;
        }else{
          expandedPlayerId = userId;
        }

        detailRows.forEach(row => {
          row.classList.toggle('is-open', row.dataset.playerId === expandedPlayerId);
        });
      });
    });

    pbsLoadPromise.then(() => {
      const detailRows = container.querySelectorAll('.player-detail-row');
      detailRows.forEach(row => {
        const userId = row.dataset.playerId;
        const player = playerProfileMap.get(userId);
        const playerPbs = userId ? personalBestsByPlayer.get(userId) || [] : [];
        const runInfo = runs.find(r => {
          const p = r.run && r.run.players && r.run.players[0];
          return p && p.rel !== 'guest' && p.id === userId;
        });
        const runUrl = runInfo && runInfo.run && runInfo.run.videos && Array.isArray(runInfo.run.videos.links)
          ? runInfo.run.videos.links[0]?.uri || ''
          : '';
        const runDate = runInfo && runInfo.run ? runInfo.run.submitted || null : null;
        row.innerHTML = `<td colspan="3">${buildPlayerDetails(player, playerPbs, runUrl, runDate)}</td>`;
      });
    }).catch(() => {});

    const uploadInput = document.getElementById('results-upload');
    if(uploadInput && !uploadInput.dataset.bound){
      uploadInput.addEventListener('change', async (event) => {
        const file = event.target.files && event.target.files[0];
        if(!file) return;
        renderResultsPanelFromFile(file);
      });
      uploadInput.dataset.bound = 'true';
    }

    previousOrder = currentOrder;

    statusEl.textContent = "en vivo" + (usingProxy ? " (vía proxy)" : "") + " · " + new Date().toLocaleTimeString();
    statusEl.className = "status live";
  }catch(err){
    statusEl.textContent = "error: " + err.message;
    statusEl.className = "status error";
    document.getElementById('tabla-content').innerHTML =
      '<div class="loading">No se pudo cargar el leaderboard.<br><small style="opacity:.7">' +
      err.message.replace(/</g,'&lt;') + '</small></div>';
    console.error(err);
  }
}

loadLeaderboard();

// Pestañas simples para cambiar secciones
function setupTabs(){
  const buttons = document.querySelectorAll('.tab-button');
  const panels = document.querySelectorAll('.tab-panel');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      buttons.forEach(b => b.classList.toggle('active', b === btn));
      panels.forEach(p => p.classList.toggle('active', p.id === target));
    });
  });
}
setupTabs();