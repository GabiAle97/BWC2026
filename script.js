const LEADERBOARD_URL = "https://www.speedrun.com/api/v1/leaderboards/kdkzvyqd/category/q25r06gk?embed=players,category,game";
const SCHEDULE_TIME_ZONE = 'America/Argentina/Buenos_Aires';
const LIVE_STREAM_URL = 'https://www.twitch.tv/basementcup';
// Placeholder: reemplazar la URL de JokerUY cuando esté disponible.
const LIVE_RUNNER_SPLITS_URLS = {
  MattGael: 'https://nathan-testament-addressed-promotes.trycloudflare.com/',
  LanceLM: 'https://equations-undo-lover-objectives.trycloudflare.com/'
};
const LIVE_SPLITS_POLL_MS = 1000;
const LIVE_WINDOW_MS = 200 * 60 * 1000;
const FIXTURE_LIVE_WINDOW_MS = 8 * 60 * 60 * 1000;
const POST_MATCH_HOME_WINDOW_MS = 10 * 60 * 1000;

let previousOrder = null;
let lastErrors = [];
let playerPbCache = new Map();
let playerPbRequests = new Map();
let categoryCache = new Map();
let categoryNameRequests = new Map();
let gameCache = new Map();
let gameNameRequests = new Map();
let homePlayerProfileCache = new Map();
let homePlayerProfileRequests = new Map();
let finishedQualy = true;
let finishedGroups = false;
let lastLeaderboardSnapshot = null;
let uploadedResults = null;
const RESULTS_STORAGE_KEY = 'bc-results-manual';
const AUTO_RESULTS_PATHS = ['./resultados.json'];
const VISIT_COUNTER_BASE_URL = 'https://api.counterapi.dev/v2/visitas/bwc-views';
const RPD_COUNTER_BASE_URL = 'https://api.counterapi.dev/v2/visitas/rpd';
const JD_COUNTER_BASE_URL = 'https://api.counterapi.dev/v2/visitas/diario-de-jill';
const RPD_RIGHT_COUNTER_BASE_URL = 'https://api.counterapi.dev/v2/visitas/rpd-right';
const STATS_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1kMWVJ297TRajvaZ-eAOMCu0N_4xeoug9BA_cOMjWP70/gviz/tq?tqx=out:json&gid=1434864776';
const STATS_RO16_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1kMWVJ297TRajvaZ-eAOMCu0N_4xeoug9BA_cOMjWP70/gviz/tq?tqx=out:json&gid=999352150';
const STATS_FINAL_TABLE_URL = 'https://docs.google.com/spreadsheets/d/1kMWVJ297TRajvaZ-eAOMCu0N_4xeoug9BA_cOMjWP70/gviz/tq?tqx=out:json&gid=582531798';
const MATCH_SCHEDULE_GROUPS_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1kMWVJ297TRajvaZ-eAOMCu0N_4xeoug9BA_cOMjWP70/gviz/tq?tqx=out:json&sheet=Match%20Schedule%20(Groups)';
const MATCH_SCHEDULE_ROUND_OF_16_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1kMWVJ297TRajvaZ-eAOMCu0N_4xeoug9BA_cOMjWP70/gviz/tq?tqx=out:json&sheet=Match%20Schedule%20(Round%20of%2016)';
// Hojas propias: solo se usan para partidos marcados RESCHEDULED en el sheet oficial
// cuya fecha oficial ya pasó (el oficial no actualizó fecha ni resultado).
const MATCH_SCHEDULE_OVERRIDE_BASE = 'https://docs.google.com/spreadsheets/d/17RvnKg48Yhv-5p-Ze_9ArQEy1rySyidDc0e1yDgkgPE/gviz/tq?tqx=out:json&sheet=';
const MATCH_SCHEDULE_ROUND_OF_16_OVERRIDE_URL = MATCH_SCHEDULE_OVERRIDE_BASE + 'Match%20Schedule%20(Round%20of%2016)';
const MATCH_SCHEDULE_QUARTERS_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1kMWVJ297TRajvaZ-eAOMCu0N_4xeoug9BA_cOMjWP70/gviz/tq?tqx=out:json&sheet=Match%20Schedule%20(Quarter%20Finals)';
const MATCH_SCHEDULE_QUARTERS_OVERRIDE_URL = MATCH_SCHEDULE_OVERRIDE_BASE + 'Match%20Schedule%20(Quarter%20Finals)&headers=0';
const MATCH_SCHEDULE_SEMIFINALS_FIFTH_PLACE_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1kMWVJ297TRajvaZ-eAOMCu0N_4xeoug9BA_cOMjWP70/gviz/tq?tqx=out:json&gid=2110979049';
const MATCH_SCHEDULE_SEMIFINALS_OVERRIDE_URL = MATCH_SCHEDULE_OVERRIDE_BASE + 'Match%20Schedule%20(Semifinals)&headers=0';
const MATCH_SCHEDULE_FINAL_SHEET_URL = '';
const MATCH_SCHEDULE_FINAL_OVERRIDE_URL = MATCH_SCHEDULE_OVERRIDE_BASE + 'Match%20Schedule%20(Final)&headers=0';
const MATCH_SCHEDULE_THIRD_PLACE_SHEET_URL = '';
const MATCH_SCHEDULE_THIRD_PLACE_OVERRIDE_URL = MATCH_SCHEDULE_OVERRIDE_BASE + 'Match%20Schedule%20(Third%20Place)&headers=0';
const MATCH_SCHEDULE_MISTERY_SHEET_URL = MATCH_SCHEDULE_OVERRIDE_BASE + 'Match%20Schedule%20(Mistery)';
// Google Apps Script: valores + color de fondo (rojo = mejor estadística del match)
const MATCH_DETAILS_COLORS_URL = 'https://script.googleusercontent.com/macros/echo?user_content_key=AUkAhnTiKWSdExoMAu5gmoFzM0uf-n6jre2lFf1svwwypsX04R5LVh-eUlBQVoMMHVbU4G7FEmkoEsXJcwazsEY10tdJMUTHyPvTletCpQ4FVsyS42QqbzApbh0vLaYvQeNNWleI7HnECXQTjiIn3ERtgD2t8ptkNMyMhMKmrVWtCXxTUGlBdT9ZM5dfypXuJa8o8AxUIWBZyqH4r3tG1jXDLzWkCZdwJakjG3ie_KeywnXZcnAqvUQB-xTzDgXXYZaxEyQjuVAtMCVVufyb--sjf8cfyg_JSQ&lib=M9VJ9oMlN8TdVrQ7_5NsBOU_wfAbH3W78';
// Fallback gviz (sin colores) si el script falla
const MATCH_DETAILS_SHEET_URL = 'https://docs.google.com/spreadsheets/d/1SoDlnUw47lV93_Mu1Gy195i5ukHOVGwta8ab_TAQPNg/gviz/tq?tqx=out:json';
let externalMatchDetails = null; // Map: sorted "normA|normB" -> { playerA, playerB, timeA, timeB, timeABetter, timeBBetter, segments: [{label, valueA, valueB, betterA, betterB}] }
let externalMatchDetailsLoad = null;
// --- Internacionalización (i18n) ---
const SUPPORTED_LANGS = ['es', 'en'];
const LANG_STORAGE_KEY = 'bc-lang';

const TRANSLATIONS = {
  es: {
    navInicio: 'Inicio', navTabla: 'Clasificatorias', navStats: 'Estadísticas',
    navGrupos: 'Fase de Grupos', navFixture: 'Fixture', navEliminatorias: 'Eliminatorias', navAbout: 'Acerca de mí',
    loadingLive: 'Buscando partida en vivo…', loadingTabla: 'Cargando datos…', loadingStats: 'Cargando estadísticas…',
    pendingGrupos: 'Fase de Grupos: contenido pendiente.', pendingFixture: 'Fixture: contenido pendiente.', pendingEliminatorias: 'Eliminatorias: contenido pendiente.', pendingPredicciones: 'Predicciones: contenido pendiente.',
    aboutClose: 'Cerrar',
    footerSource: '· Fuente: speedrun.com API',
    tbd: 'Por determinar', qualified: 'Clasificado', champion: 'Campeón', drawPending: 'sorteo pendiente', pendingSingle: 'pendiente',
    goldMedal: 'Medalla de oro', silverMedal: 'Medalla de plata', bronzeMedal: 'Medalla de bronce',
    leader: 'Cabecera', position2: '2ª posición', position3: '3ª posición', position4: '4ª posición', position: 'Posición',
    player: 'Jugador', category: 'Categoría', game: 'Juego', noGroup: 'Sin grupo', group: 'Grupo', time: 'Tiempo',
    live: 'EN VIVO', watchStream: 'Ver transmisión', groupStageInProgress: 'Fase de grupos en curso',
    liveSplitsTitle: 'Comparativa de runners', liveSplitsConnecting: 'Conectando con LiveSplit…',
    liveSplitsUnavailable: 'Splits temporalmente no disponibles', liveSplitsFinished: 'RUN FINALIZADA',
    liveSplitsWaiting: 'Esperando los dos feeds', liveSplitsTie: 'Van parejos',
    liveSplitsTieCommon: 'Van parejos en el último split común',
    liveSplitsWaitingCommon: 'Esperando un split común para comparar tiempos…',
    liveSplitsWaitingRunners: 'Esperando a los runners',
    liveSplitsWaitingData: 'Esperando datos de splits…', liveSplitsAtSplit: 'en split',
    liveSplitsMismatch: 'Los splits no coinciden', liveSplitsAhead: 'va adelante', liveSplitsGap: 'de diferencia',
    liveSplitsRunnerAhead: 'ADELANTE',
    players: 'jugadores', date: 'Fecha', schedule: 'Horario',
    matchSingular: 'partido', matchPlural: 'partidos',
    noLiveMatch: 'Aún no empezó ninguna partida', noLiveMatchSub: 'Cuando comience un enfrentamiento, aparecerá aquí.',
    statsLoadError: 'No se pudieron cargar las estadísticas.', noDataYet: 'Sin datos todavía.', noMatchesLoaded: 'Sin partidos cargados todavía.',
    roundOf16: 'Octavos', quarterfinals: 'Cuartos', semifinals: 'Semifinales', final: 'Final', thirdPlace: 'Tercer puesto', fifthPlace: 'Quinto puesto',
    mysteryRunners: 'Mystery Runners', exhibition: 'Exhibición', mysteryRunnerOne: 'Runner 1', mysteryRunnerTwo: 'Runner 2',
    standings: 'Posiciones', groupStage: 'Fase de grupos', twitchChannel: 'Canal de Twitch', of: 'de', inGroup: 'en el Grupo',
    positionPending: 'Posición pendiente', matchesOfGroup: 'Partidos del Grupo',
    pastMatches: 'Pasadas', upcomingMatches: 'Próximas', noPastMatches: 'Todavía no hay partidos finalizados.', noUpcomingMatches: 'No hay próximos partidos cargados.',
    groupStageOnlyNote: 'La posición y los partidos corresponden exclusivamente a la fase de grupos.',
    noRunsYet: 'Sin runs registradas todavía.', noDataForGroups: 'Sin datos para generar grupos.', leaderboardLoadError: 'No se pudo cargar el leaderboard.',
    upcomingLabel: 'Próximo', finishedLabel: 'Finalizado', inProgressLabel: 'En curso',
    colMatches: 'Partidos', colWins: 'Victorias', colDraws: 'Empates', colLosses: 'Derrotas', colBestTime: 'Tiempo best', colPoints: 'Puntos',
    dateLabel: 'Fecha', visits: 'Visitas', notAvailable: 'No disponible', notAvailableShort: 'N/D', notAvailablePlural: 'No disponibles',
    channels: 'Canales', signupDate: 'Fecha de inscripción', pbUploadDate: 'Fecha de subida del PB',
    personalBests: 'Personal Bests', loadingPersonalBests: 'Cargando Personal Bests…',
    aboutKicker: 'Streamer · Speedrunner · Creador', aboutSectionLabel: 'Sobre mí',
    aboutCopy1: 'Soy <strong>Gabriel Pereyra</strong>, streamer en Twitch conocido como <strong>GabiAle97</strong>. Creo contenido de gaming, speedrunning y videojuegos clásicos, además de proyectos técnicos y herramientas para la comunidad.',
    aboutCopy2: 'Soy un participante de la <strong>Basement World Cup 2026</strong>, así que me veran enfrentarme a los mejores runners de RE3 de este año. <strong>NOS VEMOS ALLÁ!</strong>',
    aboutSupportTitle: 'Invitame un Cafecito', aboutSupportSub: 'Ayudá a sostener el contenido y los proyectos',
    aboutNote: 'Gracias por acompañar y ser parte de la comunidad.', aboutFileButton: 'Diario de Jill',
    diaryPage1: '<p>Septiembre 3. Tarde</p><br><p>La ciudad está infestada de zombis.</p><p>Los gritos de gente siendo masticada... Una y otra vez.</p><p>Debo encontrar una manera de salir de esta pesadilla.</p><p>No importa lo que haga, siempre vuelvo al punto de partida.</p><p>Es como si viviera en un bucle interminable de terror y desesperación.</p><br><p>Escuché disparos en algun lugar cerca de la RPD. Voy a investigar.</p><p>Malditas publicidades, estan por todos lados... Ojalá te pudras en el infierno, Umbrella...</p>',
    diaryPage2: '<p>Septiembre 4. Madrugada</p><br><p>A penas pude salir con vida.</p><p>Brad... Lo siento tanto. Debi disparar... No pude salvarte.</p><p>Esa maldita cosa es imparable, no importa cuantas balas desperdicie en él.</p><p>Parece una máquina programada con una misión, no es una mutación del virus...</p><p>Tengo que conseguir armamento pesado, si quiero llegar al final del camino en una pieza.</p><br><p>Debo encontrar a ese tipo de la radio. Iré al restaurante cerca de la plaza.</p><p>Si sobrevivió hasta ahora, puede tener ideas para escapar...</p>',
    diaryPage3: '<p>Septiembre 4. Noche</p><br><p>¡Ya estoy harta de esa cosa!</p><p>Carlos y yo tuvimos suerte de escapar más de una vez, pero sé que nos sigue.</p><p>Lo vi caer, una y otra vez, pero siempre se levanta.</p><p>Aunque, es extraño, pareciera que quiere algo más que matarnos.</p><p>Si no, ¿Por qué deja siempre un objeto util cuando cae?</p><br><p>Me pareció ver a alguien entre las sombras, pero desapareció antes de que pudiera acercarme.</p><p>¿Es él? ¿O solo estoy viendo cosas por el cansancio y el miedo?</p>',
    diaryPage4: '<p>Septiembre 6. Noche</p><br><p>Acabo de despertar</p><p>Ese hijo de perra logró infectarme. Creí haber muerto, pero Carlos me salvó.</p><p>Nuestra huída fracasó, el helicoptero se hizo trizas, y ya no nos queda tiempo.</p><p>Pero tengo una última esperanza... Una última escapatoria...</p><p>Si tan solo... Pudiera alcanzarme...</p><p>Sé que suena desquiciado, pero me vi a mi misma pelear con uñas y dientes para alcanzar a otra yo...</p><p>Quizá sea obra del virus, pero no puedo evitar sentir que hay otra versión de mí luchando por sobrevivir en algún lugar.</p><p>No quiero volver al principio... Y tener que vivir esto otra vez.</p><p>Pero por ahora... Debo seguir adelante.</p>',
    matchDetailsTitle: 'Detalle del partido', matchDetailsNoData: 'Sin detalles de segmento disponibles para este partido.', matchDetailsSegment: 'Estadísticas del partido', matchDetailsFinalTime: 'Tiempo final', navPredicciones: 'Predicciones',
    predictionsTitle: 'Tu predicción', predictionsHint: 'Tocá un jugador para elegirlo como ganador del partido. Los ganadores avanzan automáticamente.',
    predictionsReset: 'Reiniciar', predictionsShare: 'Compartir', predictionsDownload: 'Descargar imagen',
    predictionsSharing: 'Generando imagen…', predictionsShareDone: '¡Listo!', predictionsShareError: 'No se pudo generar la imagen.',
    predictionsPickWinner: 'Elegí un ganador', predictionsChampionPick: 'Campeón predicho',
    predictionsCopy: 'Copiar imagen', predictionsCopied: '¡Copiada!', predictionsCopyError: 'No se pudo copiar.',
    predictionsShareMenu: 'Compartir predicción', predictionsShareNative: 'Compartir…', predictionsShareX: 'Compartir en X',
    predictionsShareWhatsApp: 'WhatsApp', predictionsShareDiscord: 'Discord',
    predictionsDiscordHint: 'Imagen y mensaje copiados. Pegá en Discord (Ctrl+V / Cmd+V).',
    statsStageTournament: 'Torneo', statsStageGroups: 'Fase de Grupos', statsStageRo16: 'Octavos', statsStageQf: 'Cuartos',
    statsStageSf: 'Semifinales', statsStageFinal: 'Final',
    statsMatch: 'Partido', statsComingSoon: 'Estadísticas de esta fase próximamente.',
    statsBasement: 'Basement', statsTrainCrash: 'Train Crash', statsTime: 'Tiempo',
    statsOverallPb: 'Overall PB', statsTablaFinal: 'Tabla Final', statsQualifiersPb: 'Qualifiers PB', statsWinRate: 'Win Rate',
    statsFinalBestTime: 'Mejor tiempo', statsFinalWorstTime: 'Peor tiempo', statsFinalDiffPb: 'Diff. PB',
    statsFinalTotalRuns: 'Runs totales', statsFinalFinishedRuns: 'Runs terminadas', statsFinalWinPct: '% wins',
    statsBasementPb: 'Basement PB', statsTrainCrashPb: 'Traincrash PB',
    statsTournamentPb: 'Tournament PB',
    statsTournamentBest: 'Tournament Best', statsWorstBasement: 'Worst Basement',
    statsWorstTrainCrash: 'Worst Train Crash', statsWorstCompleteRun: 'Worst Complete Run',
    statsBestPb: 'Best PB', statsWorstPb: 'Worst PB',
    statsSortBy: 'Ordenar por', statsSortAsc: 'Ascendente', statsSortDesc: 'Descendente'
  },
  en: {
    navInicio: 'Home', navTabla: 'Qualifiers', navStats: 'Statistics',
    navGrupos: 'Group Stage', navFixture: 'Fixture', navEliminatorias: 'Playoffs', navAbout: 'About me',
    loadingLive: 'Looking for a live match…', loadingTabla: 'Loading data…', loadingStats: 'Loading statistics…',
    pendingGrupos: 'Group Stage: content coming soon.', pendingFixture: 'Fixture: content coming soon.', pendingEliminatorias: 'Playoffs: content coming soon.', pendingPredicciones: 'Predictions: content coming soon.',
    aboutClose: 'Close',
    footerSource: '· Source: speedrun.com API',
    tbd: 'TBD', qualified: 'Qualified', champion: 'Champion', drawPending: 'draw pending', pendingSingle: 'pending',
    goldMedal: 'Gold medal', silverMedal: 'Silver medal', bronzeMedal: 'Bronze medal',
    leader: 'Leader', position2: '2nd place', position3: '3rd place', position4: '4th place', position: 'Position',
    player: 'Player', category: 'Category', game: 'Game', noGroup: 'No group', group: 'Group', time: 'Time',
    live: 'LIVE', watchStream: 'Watch stream', groupStageInProgress: 'Group stage in progress',
    liveSplitsTitle: 'Runner comparison', liveSplitsConnecting: 'Connecting to LiveSplit…',
    liveSplitsUnavailable: 'Splits temporarily unavailable', liveSplitsFinished: 'RUN FINISHED',
    liveSplitsWaiting: 'Waiting for both feeds', liveSplitsTie: 'Neck and neck',
    liveSplitsTieCommon: 'Tied at the last common split',
    liveSplitsWaitingCommon: 'Waiting for a common split to compare times…',
    liveSplitsWaitingRunners: 'Waiting for the runners',
    liveSplitsWaitingData: 'Waiting for split data…', liveSplitsAtSplit: 'at split',
    liveSplitsMismatch: 'Splits do not match', liveSplitsAhead: 'is ahead', liveSplitsGap: 'gap',
    liveSplitsRunnerAhead: 'AHEAD',
    players: 'players', date: 'Date', schedule: 'Time',
    matchSingular: 'match', matchPlural: 'matches',
    noLiveMatch: 'No match has started yet', noLiveMatchSub: 'When a match starts, it will appear here.',
    statsLoadError: 'Could not load statistics.', noDataYet: 'No data yet.', noMatchesLoaded: 'No matches loaded yet.',
    roundOf16: 'Round of 16', quarterfinals: 'Quarter Finals', semifinals: 'Semifinals', final: 'Final', thirdPlace: 'Third place', fifthPlace: 'Fifth place',
    mysteryRunners: 'Mystery Runners', exhibition: 'Exhibition', mysteryRunnerOne: 'Runner 1', mysteryRunnerTwo: 'Runner 2',
    standings: 'Standings', groupStage: 'Group stage', twitchChannel: 'Twitch channel', of: 'of', inGroup: 'in Group',
    positionPending: 'Position pending', matchesOfGroup: 'Matches of Group',
    pastMatches: 'Past', upcomingMatches: 'Upcoming', noPastMatches: 'No finished matches yet.', noUpcomingMatches: 'No upcoming matches loaded.',
    groupStageOnlyNote: 'The position and matches correspond exclusively to the group stage.',
    noRunsYet: 'No runs registered yet.', noDataForGroups: 'No data to generate groups.', leaderboardLoadError: 'Could not load the leaderboard.',
    upcomingLabel: 'Upcoming', finishedLabel: 'Finished', inProgressLabel: 'In progress',
    colMatches: 'Matches', colWins: 'Wins', colDraws: 'Draws', colLosses: 'Losses', colBestTime: 'Best time', colPoints: 'Points',
    dateLabel: 'Date', visits: 'Visits', notAvailable: 'Not available', notAvailableShort: 'N/A', notAvailablePlural: 'Not available',
    channels: 'Channels', signupDate: 'Signup date', pbUploadDate: 'PB upload date',
    personalBests: 'Personal Bests', loadingPersonalBests: 'Loading Personal Bests…',
    aboutKicker: 'Streamer · Speedrunner · Creator', aboutSectionLabel: 'About me',
    aboutCopy1: 'I\'m <strong>Gabriel Pereyra</strong>, a Twitch streamer known as <strong>GabiAle97</strong>. I create gaming, speedrunning and classic video game content, plus technical projects and tools for the community.',
    aboutCopy2: 'I\'m a participant in the <strong>Basement World Cup 2026</strong>, so you\'ll see me facing off against the best RE3 runners this year. <strong>SEE YOU THERE!</strong>',
    aboutSupportTitle: 'Buy me a Cafecito', aboutSupportSub: 'Help support the content and projects',
    aboutNote: 'Thanks for following along and being part of the community.', aboutFileButton: 'Jill\'s Diary',
    diaryPage1: '<p>September 3. Afternoon</p><br><p>The city is infested with zombies.</p><p>The screams of people being devoured... Over and over again.</p><p>I have to find a way out of this nightmare.</p><p>No matter what I do, I always end up back at square one.</p><p>It\'s as if I\'m living in an endless loop of terror and despair.</p><br><p>I heard gunshots somewhere near the RPD. I\'m going to investigate.</p><p>Damn ads, they\'re everywhere... I hope you rot in hell, Umbrella...</p>',
    diaryPage2: '<p>September 4. Early morning</p><br><p>I barely made it out alive.</p><p>Brad... I\'m so sorry. I should have shot... I couldn\'t save you.</p><p>That damn thing is unstoppable, no matter how many bullets I waste on it.</p><p>It looks like a machine programmed with a mission, not a mutation of the virus...</p><p>I need to get some heavy weaponry if I want to make it to the end in one piece.</p><br><p>I have to find that guy from the radio. I\'ll head to the restaurant near the plaza.</p><p>If he\'s survived this long, he might have ideas on how to escape...</p>',
    diaryPage3: '<p>September 4. Night</p><br><p>I\'m sick of that thing!</p><p>Carlos and I got lucky escaping more than once, but I know it\'s still following us.</p><p>I\'ve seen it fall, again and again, but it always gets back up.</p><p>Still, it\'s strange, it seems like it wants something more than just killing us.</p><p>Otherwise, why does it always drop something useful when it falls?</p><br><p>I thought I saw someone in the shadows, but he disappeared before I could get closer.</p><p>Is it him? Or am I just seeing things from exhaustion and fear?</p>',
    diaryPage4: '<p>September 6. Night</p><br><p>I just woke up.</p><p>That son of a bitch managed to infect me. I thought I\'d be dead already, but Carlos saved me.</p><p>Our plan failed, the helicopter was smashed to pieces, and we\'re out of time.</p><p>But I have one last hope... My Last Escape...</p><p>If only... I could reach me...</p><p>I know it sounds insane, but I saw myself fighting tooth and nail to reach another me...</p><p>Maybe it\'s the virus talking, but I can\'t help feeling that there\'s another version of me out there fighting to survive.</p><p>I don\'t want to go back to the beginning... And have to live through this again.</p><p>But for now... I have to keep going.</p>',
    matchDetailsTitle: 'Match details', matchDetailsNoData: 'No segment details available for this match.', matchDetailsSegment: 'Match statistics', matchDetailsFinalTime: 'Final time', navPredicciones: 'Predictions',
    predictionsTitle: 'Your prediction', predictionsHint: 'Tap a player to pick them as the match winner. Winners advance automatically.',
    predictionsReset: 'Reset', predictionsShare: 'Share', predictionsDownload: 'Download image',
    predictionsSharing: 'Generating image…', predictionsShareDone: 'Done!', predictionsShareError: 'Could not generate the image.',
    predictionsPickWinner: 'Pick a winner', predictionsChampionPick: 'Predicted champion',
    predictionsCopy: 'Copy image', predictionsCopied: 'Copied!', predictionsCopyError: 'Could not copy.',
    predictionsShareMenu: 'Share prediction', predictionsShareNative: 'Share…', predictionsShareX: 'Share on X',
    predictionsShareWhatsApp: 'WhatsApp', predictionsShareDiscord: 'Discord',
    predictionsDiscordHint: 'Image and message copied. Paste in Discord (Ctrl+V / Cmd+V).',
    statsStageTournament: 'Tournament', statsStageGroups: 'Group Stage', statsStageRo16: 'Round of 16', statsStageQf: 'Quarter Finals',
    statsStageSf: 'Semifinals', statsStageFinal: 'Final',
    statsMatch: 'Match', statsComingSoon: 'Statistics for this stage coming soon.',
    statsBasement: 'Basement', statsTrainCrash: 'Train Crash', statsTime: 'Time',
    statsOverallPb: 'Overall PB', statsTablaFinal: 'Final Table', statsQualifiersPb: 'Qualifiers PB', statsWinRate: 'Win Rate',
    statsFinalBestTime: 'Best time', statsFinalWorstTime: 'Worst time', statsFinalDiffPb: 'Diff. PB',
    statsFinalTotalRuns: 'Total runs', statsFinalFinishedRuns: 'Finished runs', statsFinalWinPct: '% wins',
    statsBasementPb: 'Basement PB', statsTrainCrashPb: 'Traincrash PB',
    statsTournamentPb: 'Tournament PB',
    statsTournamentBest: 'Tournament Best', statsWorstBasement: 'Worst Basement',
    statsWorstTrainCrash: 'Worst Train Crash', statsWorstCompleteRun: 'Worst Complete Run',
    statsBestPb: 'Best PB', statsWorstPb: 'Worst PB',
    statsSortBy: 'Sort by', statsSortAsc: 'Ascending', statsSortDesc: 'Descending'
  }
};

function detectLanguage(){
  try{
    const stored = localStorage.getItem(LANG_STORAGE_KEY);
    if(stored && SUPPORTED_LANGS.includes(stored)) return stored;
  }catch(err){}
  const browserLangs = navigator.languages && navigator.languages.length ? navigator.languages : [navigator.language || 'es'];
  for(const lang of browserLangs){
    const short = String(lang || '').slice(0, 2).toLowerCase();
    if(SUPPORTED_LANGS.includes(short)) return short;
  }
  return 'es';
}

let currentLang = detectLanguage();

function t(key){
  return (TRANSLATIONS[currentLang] && TRANSLATIONS[currentLang][key]) ?? TRANSLATIONS.es[key] ?? key;
}

function applyStaticTranslations(){
  document.documentElement.lang = currentLang;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    el.innerHTML = t(el.dataset.i18nHtml);
  });
  document.querySelectorAll('[data-i18n-attr]').forEach(el => {
    el.dataset.i18nAttr.split(';').forEach(pair => {
      const [attr, key] = pair.split(':').map(part => part.trim());
      if(attr && key) el.setAttribute(attr, t(key));
    });
  });
  document.querySelectorAll('.lang-button').forEach(button => {
    button.classList.toggle('active', button.dataset.lang === currentLang);
  });
}

function setLanguage(lang){
  if(!SUPPORTED_LANGS.includes(lang) || lang === currentLang) return;
  currentLang = lang;
  try{ localStorage.setItem(LANG_STORAGE_KEY, lang); }catch(err){}
  location.reload();
}

document.addEventListener('DOMContentLoaded', () => {
  applyStaticTranslations();
  document.querySelectorAll('.lang-button').forEach(button => {
    button.addEventListener('click', () => setLanguage(button.dataset.lang));
  });
});

let externalPlayerStats = new Map();
let externalFinalTable = [];
let externalKnockoutStats = {
  ro16: new Map(),
  qf: new Map(),
  sf: new Map(),
  thirdplace: new Map(),
  final: new Map()
};
let externalStatsLoad = null;
let externalMatchSchedule = null;
let externalMatchScheduleLoad = null;
let externalMysteryMatches = [];
let knockoutRunTimingsByPair = new Map();
let knockoutRunTimingsByStage = {
  quarters: new Map(),
  semifinals: new Map(),
  final: new Map()
};
let homeRunElapsedTimer = null;
let homeLiveSplitsPollTimer = null;
let homeLiveSplitsTickTimer = null;
let homeLiveSplitsRequestPending = false;
let homeLiveSplitsState = {};
let homeLiveSplitsLastErrorAt = {};
let homeLiveSplitsHistory = {};
let statsUiState = {
  stage: 'overall',
  dualSortBy: 'best',   // 'best' | 'worst'
  dualSortDir: 'asc'    // 'asc' | 'desc'
};

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

const PLAYER_COUNTRY_FALLBACKS = {
  lancelm: 'ES',
  im4rcuss: 'BR',
  mattgael: 'AR',
  sonbeto: 'AR',
  mayoness: 'BR',
  shyanji: 'BR',
  linobariana: 'IT',
  adrian20v: 'EC',
  micwich: 'IT',
  tavernamugiwara: 'BR',
  deepstackdave: 'GB',
  paquitotatata: 'AR',
  nemesisxploder: 'RU',
  savitrue: 'RU',
  ascanioxjs: 'VE',
  moosez80: 'EC',
  owarii1re: 'AR',
  gabiale97: 'AR',
  redshines: 'AR',
  gallardd: 'AR',
  jokeruy: 'UY',
  insanebb: 'RU',
  bombanemesis: 'BR',
  jossho6: 'EC',
  darchaen: 'CA',
  n0b0dy23: 'DE',
  confere: 'ES',
  crisdoile2: 'MX',
  elresident: 'AR',
  halfbakedsnake: 'NL',
  esandreas: 'GT',
  lachicago: 'PE',
  crazygamingdayz: 'US',
  sawnek: 'GB',
  homuki: 'PL',
  fiveskill: 'IT',
  isogai: 'JP',
  yhonnafan: 'BO',
  nadox: 'BR',
  reduke: 'AR',
  thenevs: 'BR',
  kenshiro1990: 'IT',
  exper1ment: 'RU',
  sh1r1u: null,
  daniel93: null,
  kreescu: null,
  bethalize: null,
  spartanfinix117: null,
  tuto10: null,
  siaomuleki: null,
  rodriguinho: null
};

const FINAL_GROUPS = {
  A: ["JokerUY", "Fiveskill", "LinoBariana", "Darchaen"],
  B: ["LanceLM", "Adrian20v", "Homuki", "isogai"],
  C: ["im4rcuss", "GabiAle97", "redshines", "HalfBakedSnake"],
  D: ["EsAndreas", "micwich", "Savitrue", "mayoness"],
  E: ["Ascanioxjs", "Re_duke", "SonBeto", "NemesisXploder"],
  F: ["Shyanji", "Owarii1RE", "Gallardd", "Bomba_Nemesis"],
  G: ["MattGael", "Paquito_tatata", "insanebb", "crisdoile2"],
  H: ["exper1ment", "jossho6", "TheNevs", "Sawnek"]
};

const PLAYER_NAME_ALIASES = {
  nevs: 'thenevs',
  lance: 'lancelm',
  paquito: 'paquitotatata',
  gabiale: 'gabiale97',
  snake: 'halfbakedsnake',
  owarii: 'owarii1re',
  bomba: 'bombanemesis',
  adrian: 'adrian20v',
  crisdoile: 'crisdoile2',
  xploder: 'nemesisxploder',
  shyanjii: 'shyanji'
};

const PLAYER_LOCAL_IMAGE_ALIASES = {
  im4rcuss: 'im4rcus'
};

function normalizeParticipantName(name){
  const normalized = (name || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')
    .trim();
  return PLAYER_NAME_ALIASES[normalized] || normalized;
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

async function getHomePlayerProfile(name){
  const key = normalizeParticipantName(name);
  if(homePlayerProfileCache.has(key)){
    return homePlayerProfileCache.get(key);
  }
  if(homePlayerProfileRequests.has(key)){
    return homePlayerProfileRequests.get(key);
  }

  const request = (async () => {
    try{
      const url = 'https://www.speedrun.com/api/v1/users?lookup=' + encodeURIComponent(name);
      const json = await fetchJson(url);
      const profiles = Array.isArray(json.data) ? json.data : [];
      const profile = profiles.find(candidate => normalizeParticipantName(
        candidate.names?.international || candidate.names?.twitch || ''
      ) === key) || null;
      homePlayerProfileCache.set(key, profile);
      return profile;
    }catch(err){
      console.warn('No se pudo cargar el perfil de Speedrun.com para', name, err.message);
      homePlayerProfileCache.set(key, null);
      return null;
    }finally{
      homePlayerProfileRequests.delete(key);
    }
  })();
  homePlayerProfileRequests.set(key, request);
  return request;
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
        ? playersById.get(playerObj.id).names?.international || t('player')
        : getPlayerName(runEntry, players));

    const normalized = normalizeParticipantName(playerName);
    if(!normalized) return;

    knownByName.set(normalized, {
      name: playerName || t('player'),
      place: runEntry.place ?? null,
      time: runEntry.run && runEntry.run.times && runEntry.run.times.primary_t != null
        ? runEntry.run.times.primary_t
        : null,
      playerId: playerObj && playerObj.rel !== 'guest' ? playerObj.id : null
    });
  });

  const displayRows = QUALIFYING_PARTICIPANTS.map((name) => {
    const normalized = normalizeParticipantName(name);
    const leaderboardEntry = normalized ? knownByName.get(normalized) : null;
    const sheetStats = normalized ? externalPlayerStats.get(normalized) : null;
    const sheetPlace = Number(sheetStats?.rank);
    const sheetTime = parseManualTime(sheetStats?.qualifiersPb);
    const sheetEntry = Number.isInteger(sheetPlace) && sheetPlace > 0 && sheetTime != null
      ? { name, place: sheetPlace, time: sheetTime, playerId: null }
      : null;
    const known = sheetEntry || leaderboardEntry;
    return {
      name,
      place: known && known.place != null ? known.place : null,
      time: known && known.time != null ? formatTime(known.time) : '?',
      placeLabel: known && known.place != null ? known.place : '?',
      isPending: !known || known.time == null,
      playerId: known && known.playerId ? known.playerId : null,
      hasSheetRank: Boolean(sheetEntry),
      isQualified: known && known.place != null && known.place <= QUALIFYING_LIMIT
    };
  });

  const sheetRankedRows = displayRows
    .filter(row => !row.isPending && row.hasSheetRank)
    .sort((a, b) => a.place - b.place);
  const additionalRankedRows = displayRows
    .filter(row => !row.isPending && !row.hasSheetRank)
    .sort((a, b) => (a.place ?? Number.MAX_SAFE_INTEGER) - (b.place ?? Number.MAX_SAFE_INTEGER));
  const lastSheetPlace = sheetRankedRows[sheetRankedRows.length - 1]?.place ?? 0;
  additionalRankedRows.forEach((row, index) => {
    row.place = lastSheetPlace + index + 1;
    row.placeLabel = row.place;
  });
  const rankedRows = [...sheetRankedRows, ...additionalRankedRows];
  const pendingRows = displayRows.filter(row => row.isPending);

  return [...rankedRows, ...pendingRows];
}

async function fetchJson(url){
  const res = await fetch(url, { cache: "no-store" });
  if(!res.ok) throw new Error("HTTP " + res.status);
  return await res.json();
}

async function fetchLeaderboardData(){
  lastErrors = [];
  try{
    return await fetchJson(LEADERBOARD_URL);
  }catch(err){
    lastErrors.push("Directo: " + err.message);
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

function parseScheduledDateTime(dateValue, timeValue){
  const dateText = String(dateValue || '').trim();
  const timeText = String(timeValue || '').trim();
  const dateMatch = dateText.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  const timeMatch = timeText.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if(!dateMatch || !timeMatch) return null;

  const [, year, month, day] = dateMatch;
  const [, hours, minutes, seconds = '0'] = timeMatch;
  const wallClock = Date.UTC(Number(year), Number(month) - 1, Number(day), Number(hours), Number(minutes), Number(seconds));
  const timeZoneParts = new Intl.DateTimeFormat('en-US', {
    timeZone: SCHEDULE_TIME_ZONE,
    timeZoneName: 'longOffset'
  }).formatToParts(new Date(wallClock));
  const offsetText = timeZoneParts.find(part => part.type === 'timeZoneName')?.value || 'GMT';
  const offsetMatch = offsetText.match(/GMT([+-])(\d{2}):?(\d{2})?/);
  const offsetMinutes = offsetMatch
    ? (Number(offsetMatch[2]) * 60 + Number(offsetMatch[3] || 0)) * (offsetMatch[1] === '-' ? -1 : 1)
    : 0;
  const date = new Date(wallClock - offsetMinutes * 60 * 1000);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatScheduledDateTime(dateValue, timeValue){
  const date = parseScheduledDateTime(dateValue, timeValue);
  if(!date) return null;

  return {
    date,
    dateLabel: date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }),
    timeLabel: date.toLocaleTimeString('es-AR', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    })
  };
}

function isMatchLive(startDate){
  if(!startDate) return false;
  const elapsed = Date.now() - startDate.getTime();
  return elapsed >= 0 && elapsed <= LIVE_WINDOW_MS;
}

function getKnockoutSeriesTarget(stageValue, groupValue = ''){
  const stage = String(stageValue || '').toLowerCase();
  const group = String(groupValue || '').toLowerCase();
  const combined = `${stage} ${group}`;
  const isKnockout = /r16|round\s*of\s*16|octavos|qf|quarter|cuartos|sf|semi|final|third[\s_-]*place|3rd[\s_-]*place|tercer[\s_-]*puesto|fifth[\s_-]*place|5th[\s_-]*place|quinto[\s_-]*puesto/i.test(combined);
  if(!isKnockout) return null;
  if(/third[\s_-]*place|3rd[\s_-]*place|tercer[\s_-]*puesto/i.test(combined)) return 2;
  return /(^|\s)final(\s|$)/i.test(combined) ? 3 : 2;
}

function isSeriesDecided(match){
  if(!match) return false;
  const target = getKnockoutSeriesTarget(match.stage, match.group);
  const scoreA = String(match.seriesScoreA ?? '').trim();
  const scoreB = String(match.seriesScoreB ?? '').trim();
  if(target != null && scoreA !== '' && scoreB !== ''){
    const a = Number(scoreA);
    const b = Number(scoreB);
    if(Number.isFinite(a) && Number.isFinite(b)) return a >= target || b >= target;
  }
  return Boolean(match.winner);
}

/**
 * Candidato a EN VIVO: el partido ya debería haber empezado según el fixture
 * y la serie no terminó. El estado de Twitch no se consulta.
 */
function isFixtureMatchLiveCandidate(match, scheduleDate){
  if(!match || !scheduleDate) return false;
  const elapsed = Date.now() - scheduleDate.getTime();
  if(elapsed < 0) return false;

  const hasSeriesWinner = isSeriesDecided(match);
  const matchPairKey = knockoutRunPairKey(match.playerA, match.playerB);
  const hasActiveRunTiming = !hasSeriesWinner && knockoutRunTimingsByPair.has(matchPairKey);
  const isRegularLiveWindow = elapsed <= FIXTURE_LIVE_WINDOW_MS;
  const isRecentlyFinishedWindow = hasSeriesWinner && elapsed <= FIXTURE_LIVE_WINDOW_MS + POST_MATCH_HOME_WINDOW_MS;

  return hasActiveRunTiming || isRegularLiveWindow || isRecentlyFinishedWindow;
}


const LIVE_STATUS_POLL_MS = 30 * 1000;
let liveStatusPollTimer = null;

async function refreshLiveStatusFromSchedule(){
  try{
    // Refrescar schedule por si cambió el marcador o comenzó un partido
    await loadExternalMatchSchedule();
    if(lastLeaderboardSnapshot?.players){
      renderHomePanel(lastLeaderboardSnapshot.players);
      const fixturePanel = document.getElementById('fixture');
      if(fixturePanel && fixturePanel.classList.contains('active')){
        renderFixturePanel(lastLeaderboardSnapshot.players);
      }
    }
  }catch(err){
    console.warn('No se pudo actualizar el estado en vivo.', err);
  }
}

function startLiveStatusPolling(){
  if(liveStatusPollTimer) return;
  liveStatusPollTimer = setInterval(refreshLiveStatusFromSchedule, LIVE_STATUS_POLL_MS);
}

function getPlayerAvatarMarkup(player, avatar){
  const imageUrl = player?.assets?.image?.uri;
  const playerName = typeof player === 'string'
    ? player
    : player?.names?.international || player?.names?.twitch || player?.name;
  const profileKeyAttribute = avatar && playerName
    ? ` data-player-profile-key="${normalizeParticipantName(playerName)}"`
    : '';
  const localImageName = playerName
    ? PLAYER_LOCAL_IMAGE_ALIASES[normalizeParticipantName(playerName)] || playerName
    : null;
  if (avatar) {
    if(imageUrl){
      return `<img src="${imageUrl}" class="md-avatar"${profileKeyAttribute} alt="" loading="lazy">`;
    }

    if(localImageName){
      const localImageUrl = `./playerimg/${encodeURIComponent(localImageName)}.png`;
      return `<img src="${localImageUrl}" class="md-avatar"${profileKeyAttribute} alt="" loading="lazy">`;
    }

    return '<span class="home-avatar-placeholder" aria-hidden="true">🏃</span>';
  }else{
    if(imageUrl){
      return `<img src="${imageUrl}" alt="" loading="lazy">`;
    }

    if(localImageName){
      const localImageUrl = `./playerimg/${encodeURIComponent(localImageName)}.png`;
      return `<img src="${localImageUrl}" alt="" loading="lazy">`;
    }

    return '<span class="home-avatar-placeholder" aria-hidden="true">🏃</span>';
  }
}

function parseLiveSplitDuration(value){
  const match = String(value || '').trim().match(/^(\d+):(\d{2}):(\d{2})(?:\.(\d+))?$/);
  if(!match) return null;
  const fraction = Number(`0.${match[4] || '0'}`);
  return ((Number(match[1]) * 60 + Number(match[2])) * 60 + Number(match[3]) + fraction) * 1000;
}

function formatLiveSplitDuration(milliseconds){
  const totalMilliseconds = Math.max(0, Math.floor(milliseconds));
  const totalSeconds = Math.floor(totalMilliseconds / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  const centiseconds = Math.floor((totalMilliseconds % 1000) / 10);
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(centiseconds).padStart(2, '0')}`;
}

function updateHomeLiveSplitsPanel(){
  const panel = document.getElementById('home-live-splits');
  if(!panel) return;

  const runnerStates = {};
  Object.keys(LIVE_RUNNER_SPLITS_URLS).forEach(runner => {
    const card = panel.querySelector(`.home-split-runner[data-runner="${runner}"]`);
    if(!card) return;

    const state = homeLiveSplitsState[runner];
    const referenceTime = state?.timestampMs || state?.receivedAt || 0;
    const isFresh = Boolean(state && Date.now() - referenceTime <= 15000);
    runnerStates[runner] = isFresh ? state : null;
    const nameElement = card.querySelector('.home-split-name');
    const timeElement = card.querySelector('.home-split-time');
    const phaseElement = card.querySelector('.home-split-phase');

    if(!isFresh){
      nameElement.textContent = '—';
      timeElement.textContent = '—';
      phaseElement.textContent = homeLiveSplitsLastErrorAt[runner] ? t('liveSplitsUnavailable') : t('liveSplitsConnecting');
      phaseElement.classList.remove('is-live');
      card.classList.remove('is-ahead');
      return;
    }

    nameElement.textContent = state.split || '—';
    const isRunning = /running/i.test(state.phase);
    timeElement.textContent = state.timeMs == null ? '—' : formatLiveSplitDuration(state.timeMs);
    phaseElement.textContent = isRunning
      ? t('live')
      : (/finish|complete|ended/i.test(state.phase) ? t('liveSplitsFinished') : (state.phase || '—'));
    phaseElement.classList.toggle('is-live', isRunning);
    card.classList.remove('is-ahead');
  });

  const leaderElement = panel.querySelector('.home-live-splits-leader');
  const runnerNames = [...panel.querySelectorAll('.home-split-runner')].map(card => card.dataset.runner);
  const [runnerA, runnerB] = runnerNames;
  const stateA = runnerStates[runnerA];
  const stateB = runnerStates[runnerB];
  if(!stateA || !stateB){
    const availableRunner = stateA ? runnerA : stateB ? runnerB : null;
    leaderElement.textContent = availableRunner
      ? `${t('liveSplitsWaiting')}: ${availableRunner === runnerA ? runnerB : runnerA}`
      : t('liveSplitsWaiting');
    return;
  }

  const hasComparableIndices = Number.isFinite(stateA.splitIndex) && Number.isFinite(stateB.splitIndex);
  const historyA = homeLiveSplitsHistory[runnerA] || new Map();
  const historyB = homeLiveSplitsHistory[runnerB] || new Map();
  const commonSplits = [...historyA.keys()]
    .filter(index => historyB.has(index))
    .sort((a, b) => b - a);
  const comparisonSplit = commonSplits[0];
  const splitTimeA = comparisonSplit == null ? null : historyA.get(comparisonSplit);
  const splitTimeB = comparisonSplit == null ? null : historyB.get(comparisonSplit);
  const gapMs = splitTimeA == null || splitTimeB == null
    ? null
    : Math.abs(splitTimeA - splitTimeB);
  let leader = null;
  if(hasComparableIndices && stateA.splitIndex !== stateB.splitIndex){
    leader = stateA.splitIndex > stateB.splitIndex ? runnerA : runnerB;
  }else if(gapMs > 0){
    leader = splitTimeA < splitTimeB ? runnerA : runnerB;
  }

  if(!leader){
    const isWaitingForRunners = stateA.timeMs === 0 || stateB.timeMs === 0;
    leaderElement.textContent = isWaitingForRunners
      ? t('liveSplitsWaitingRunners')
      : hasComparableIndices && stateA.splitIndex === stateB.splitIndex
        ? (gapMs === 0
          ? t('liveSplitsTieCommon')
          : t('liveSplitsWaitingCommon'))
        : t('liveSplitsWaitingData');
    return;
  }
  leaderElement.textContent = `${leader} ${t('liveSplitsAhead')}`;
  panel.querySelector(`.home-split-runner[data-runner="${leader}"]`)?.classList.add('is-ahead');
  if(gapMs != null){
    leaderElement.textContent += ` · ${formatLiveSplitDuration(gapMs)} ${t('liveSplitsAtSplit')} ${comparisonSplit}`;
    const trailingRunner = leader === runnerA ? runnerB : runnerA;
    const trailingTimeElement = panel.querySelector(`.home-split-runner[data-runner="${trailingRunner}"] .home-split-time`);
    if(trailingTimeElement) trailingTimeElement.textContent = `+${formatLiveSplitDuration(gapMs)}`;
  }
}

async function pollHomeLiveSplits(){
  if(homeLiveSplitsRequestPending || !document.getElementById('home-live-splits')) return;
  homeLiveSplitsRequestPending = true;
  const feeds = await Promise.all(Object.entries(LIVE_RUNNER_SPLITS_URLS).map(async ([runner, url]) => {
    try{
      const response = await fetch(url, { cache: 'no-store' });
      if(!response.ok) throw new Error('HTTP ' + response.status);
      return { runner, data: await response.json() };
    }catch(err){
      console.warn(`No se pudieron cargar los splits en vivo de ${runner}.`, err);
      return { runner, error: err };
    }
  }));
  feeds.forEach(({ runner, data, error }) => {
    if(error){
      homeLiveSplitsLastErrorAt[runner] = Date.now();
      return;
    }
    const timestamp = Number(data?.timestamp);
    const splitIndex = data?.splitIndex == null ? null : Number(data.splitIndex);
    const receivedAt = Date.now();
    const split = String(data?.split || '').trim();
    const phase = String(data?.phase || '').trim();
    const lastSplitTimeMs = parseLiveSplitDuration(data?.lastSplitTime);
    const previousState = homeLiveSplitsState[runner];
    if(Number.isFinite(splitIndex) && lastSplitTimeMs != null
      && (!previousState
        || previousState.lastSplitTimeMs !== lastSplitTimeMs
        || previousState.splitIndex === splitIndex)){
      if(!homeLiveSplitsHistory[runner]) homeLiveSplitsHistory[runner] = new Map();
      homeLiveSplitsHistory[runner].set(splitIndex, lastSplitTimeMs);
    }
    homeLiveSplitsState[runner] = {
      split,
      splitIndex: Number.isFinite(splitIndex) ? splitIndex : null,
      lastSplitTimeMs,
      phase,
      timeMs: parseLiveSplitDuration(data?.time),
      timestampMs: Number.isFinite(timestamp) ? (timestamp > 1e12 ? timestamp : timestamp * 1000) : 0,
      receivedAt
    };
    delete homeLiveSplitsLastErrorAt[runner];
  });
  homeLiveSplitsRequestPending = false;
  updateHomeLiveSplitsPanel();
}

function startHomeLiveSplitsPolling(){
  if(homeLiveSplitsPollTimer) return;
  homeLiveSplitsState = {};
  homeLiveSplitsLastErrorAt = {};
  homeLiveSplitsHistory = Object.fromEntries(
    Object.keys(LIVE_RUNNER_SPLITS_URLS).map(runner => [runner, new Map()])
  );
  pollHomeLiveSplits();
  homeLiveSplitsPollTimer = setInterval(pollHomeLiveSplits, LIVE_SPLITS_POLL_MS);
  homeLiveSplitsTickTimer = setInterval(updateHomeLiveSplitsPanel, 1000);
}

function stopHomeLiveSplitsPolling(){
  if(homeLiveSplitsPollTimer){
    clearInterval(homeLiveSplitsPollTimer);
    homeLiveSplitsPollTimer = null;
  }
  if(homeLiveSplitsTickTimer){
    clearInterval(homeLiveSplitsTickTimer);
    homeLiveSplitsTickTimer = null;
  }
  homeLiveSplitsState = {};
  homeLiveSplitsLastErrorAt = {};
  homeLiveSplitsHistory = {};
}

function renderHomePanel(players = []){
  const container = document.getElementById('inicio-content');
  if(!container) return;

  const results = externalMatchSchedule || getLoadedResults();
  const matches = Array.isArray(results?.matches) ? results.matches : [];
  const liveMysteryMatch = externalMysteryMatches
    .map(match => ({ match, schedule: formatScheduledDateTime(match.date, match.time) }))
    .find(item => item.schedule && isMatchLive(item.schedule.date));
  const liveMatch = liveMysteryMatch || matches
    .map(match => ({ match, schedule: formatScheduledDateTime(match.date, match.time) }))
    .find(item => item.schedule && isFixtureMatchLiveCandidate(item.match, item.schedule.date));

  if(!liveMatch){
    stopHomeLiveSplitsPolling();
    if(homeRunElapsedTimer){
      clearInterval(homeRunElapsedTimer);
      homeRunElapsedTimer = null;
    }
    container.innerHTML = `
      <div class="home-empty">
        <span class="home-empty-mark" aria-hidden="true">◷</span>
        <h2>${t('noLiveMatch')}</h2>
        <p>${t('noLiveMatchSub')}</p>
      </div>
    `;
    return;
  }

  const { match, schedule } = liveMatch;
  const isMattGaelLive = [match.playerA, match.playerB]
    .some(name => normalizeManualMatchName(name).toLowerCase() === 'mattgael');
  const liveSplitRunnerNames = [match.playerA, match.playerB]
    .map(name => Object.keys(LIVE_RUNNER_SPLITS_URLS).find(runner =>
      normalizeManualMatchName(runner).toLowerCase() === normalizeManualMatchName(name).toLowerCase()
    ))
    .filter(Boolean);
  const flagA = participantCountryFlag(players, match.playerA) || '🏳️';
  const flagB = participantCountryFlag(players, match.playerB) || '🏳️';
  const playerAProfile = resolvePlayerByName(players, match.playerA) || match.playerA;
  const playerBProfile = resolvePlayerByName(players, match.playerB) || match.playerB;
  const playerAProfileIsLoaded = typeof playerAProfile !== 'string';
  const playerBProfileIsLoaded = typeof playerBProfile !== 'string';
  const playerAAvatarKey = normalizeParticipantName(match.playerA);
  const playerBAvatarKey = normalizeParticipantName(match.playerB);

  const stage = String(match.stage || '').toLowerCase();
  const group = String(match.group || '');
  const homeMatchPairKey = knockoutRunPairKey(match.playerA, match.playerB);
  const isMystery = stage === 'mystery';
  const isR16 = stage === 'r16' || group === 'R16' || /octavos|round\s*of\s*16/i.test(stage + group);
  const isQf = stage === 'qf' || /cuartos|quarter/i.test(stage + group);
  const isSf = stage === 'sf' || /semi/i.test(stage + group);
  const isThirdPlace = stage === 'thirdplace' || /third[\s_-]*place|3rd[\s_-]*place|tercer[\s_-]*puesto/i.test(stage + group);
  const isFinal = stage === 'final' || (/final/i.test(stage + group) && !/semi/i.test(stage + group));
  const stageRunTimings = isQf
    ? knockoutRunTimingsByStage.quarters
    : isSf
      ? knockoutRunTimingsByStage.semifinals
      : isThirdPlace
        ? knockoutRunTimingsByStage.thirdplace
      : isFinal
        ? knockoutRunTimingsByStage.final
        : null;
  const runTiming = stageRunTimings?.get(homeMatchPairKey)
    || (stageRunTimings?.size === 1 ? stageRunTimings.values().next().value : null)
    || null;
  const showRunElapsed = runTiming?.startSeconds != null;

  const stageLabel = isMystery
    ? `${t('mysteryRunners')} · ${t('exhibition')}`
    : isFinal
    ? t('final')
    : isSf
      ? t('semifinals')
            : isThirdPlace
        ? t('thirdPlace')
      : isQf
        ? t('quarterfinals')
        : isR16
          ? t('roundOf16')
          : (FINAL_GROUPS[group] ? `${t('group')} ${group}` : (group ? `${t('group')} ${group}` : t('groupStage')));

  const hasSeries = match.seriesScoreA != null && match.seriesScoreB != null
    && String(match.seriesScoreA).trim() !== '' && String(match.seriesScoreB).trim() !== '';
  const seriesRunsCompleted = hasSeries
    ? Number(match.seriesScoreA) + Number(match.seriesScoreB)
    : 0;
  const maxRuns = isFinal ? 5 : (isR16 || isQf || isSf || isThirdPlace ? 3 : 1);
  const currentRunNumber = Number.isFinite(seriesRunsCompleted)
    ? Math.min(maxRuns, Math.max(1, seriesRunsCompleted + 1))
    : 1;
  const bestOfLabel = isMystery
    ? t('exhibition').toUpperCase()
    : isFinal
    ? `RUN ${currentRunNumber} OF 5`
    : (isR16 || isQf || isSf || isThirdPlace)
      ? `RUN ${currentRunNumber} OF 3`
      : `RUN ${currentRunNumber} OF 1`;

  // Juegos del schedule + fallback desde sheet de detalles (Match 49/50/51)
  let games = Array.isArray(match.games) ? match.games.slice() : [];
  if(externalMatchDetails){
    const key = [normalizeManualMatchName(match.playerA), normalizeManualMatchName(match.playerB)].sort().join('|');
    const details = externalMatchDetails.get(key);
    if(details && Array.isArray(details.games) && details.games.length){
      const sameOrder = normalizeManualMatchName(details.playerA) === normalizeManualMatchName(match.playerA);
      const detailGames = details.games.map(game => sameOrder
        ? { timeA: game.timeA, timeB: game.timeB }
        : { timeA: game.timeB, timeB: game.timeA }
      );
      // Preferir detalles si traen más mapas o si el schedule no tiene juegos
      if(detailGames.length >= games.length){
        games = detailGames;
      }
    }
  }
  if(!games.length && ((match.timeA && match.timeA !== '-') || (match.timeB && match.timeB !== '-'))){
    games = [{ timeA: match.timeA || '-', timeB: match.timeB || '-' }];
  }

  let displayA;
  let displayB;
  let scoreIsSeries = false;
  if(hasSeries){
    displayA = String(match.seriesScoreA);
    displayB = String(match.seriesScoreB);
    scoreIsSeries = true;
  }else if(games.length){
    const last = games[games.length - 1];
    displayA = last.timeA && last.timeA !== '-' ? (formatManualTime(last.timeA) || last.timeA) : '-';
    displayB = last.timeB && last.timeB !== '-' ? (formatManualTime(last.timeB) || last.timeB) : '-';
  }else{
    displayA = match.timeA && match.timeA !== '-' ? (formatManualTime(match.timeA) || match.timeA) : '-';
    displayB = match.timeB && match.timeB !== '-' ? (formatManualTime(match.timeB) || match.timeB) : '-';
  }

  const formatGameTime = (raw) => {
    const text = String(raw ?? '').trim();
    if(!text || text === '-') return '—';
    if(/^(DEAD|DEATH|DIED)\b/i.test(text)) return text.toUpperCase().startsWith('DEAD') ? 'DEAD' : 'DIED';
    return formatManualTime(text) || text;
  };

  // Lista de tiempos por mapa, uno debajo del otro bajo el marcador de cada jugador
  let gamesForDisplay = games;
  if(!gamesForDisplay.length && ((match.timeA && match.timeA !== '-') || (match.timeB && match.timeB !== '-'))){
    gamesForDisplay = [{ timeA: match.timeA || '-', timeB: match.timeB || '-' }];
  }

  const gamesListA = gamesForDisplay.length
    ? `<ul class="home-games-list">${gamesForDisplay.map((game, index) =>
        `<li><span class="home-game-time">${formatGameTime(game.timeA)}</span></li>`
      ).join('')}</ul>`
    : '';
  const gamesListB = gamesForDisplay.length
    ? `<ul class="home-games-list">${gamesForDisplay.map((game, index) =>
        `<li><span class="home-game-time ">${formatGameTime(game.timeB)}</span></li>`
      ).join('')}</ul>`
    : '';

  container.innerHTML = `
    <div class="home-live-card">
      <div class="home-live-backdrop"></div>
      <div class="home-live-header">
        <span class="home-live-pill"><i></i> ${t('live')}</span>
        <span>${stageLabel}</span>
      </div>
      <div class="home-matchup">
        <div class="home-contestant">
          <div class="home-avatar" data-home-avatar-key="${playerAAvatarKey}">${getPlayerAvatarMarkup(playerAProfile)}</div>
          <div class="home-player-name">${match.playerA}</div>
          <div class="home-player-flag">${flagA}</div>
          <div class="home-player-time ${scoreIsSeries ? 'home-series-score' : ''}">${displayA}</div>
          ${gamesListA}
        </div>
        <div class="home-versus">
          <strong>VS</strong>
          <span class="home-best-of">${bestOfLabel}</span>
          ${showRunElapsed ? '<span class="home-run-elapsed" id="home-run-elapsed">00:00</span>' : ''}
        </div>
        <div class="home-contestant">
          <div class="home-avatar" data-home-avatar-key="${playerBAvatarKey}">${getPlayerAvatarMarkup(playerBProfile)}</div>
          <div class="home-player-name">${match.playerB}</div>
          <div class="home-player-flag">${flagB}</div>
          <div class="home-player-time ${scoreIsSeries ? 'home-series-score' : ''}">${displayB}</div>
          ${gamesListB}
        </div>
      </div>
      ${isMattGaelLive ? `
        <section class="home-live-splits" id="home-live-splits" aria-live="polite">
          <div class="home-live-splits-heading">
            <span>${t('liveSplitsTitle')}</span>
            <strong class="home-live-splits-leader">${t('liveSplitsWaiting')}</strong>
          </div>
          <div class="home-live-splits-runners">
            ${liveSplitRunnerNames.map(runner => `
              <div class="home-split-runner" data-runner="${runner}">
                <div class="home-split-runner-heading">
                  <span class="home-split-runner-name">${runner}</span>
                  <span class="home-split-ahead">${t('liveSplitsRunnerAhead')}</span>
                </div>
                <span class="home-split-name">${t('liveSplitsConnecting')}</span>
                <div class="home-split-runner-footer">
                  <span class="home-split-phase">—</span>
                  <strong class="home-split-time">—</strong>
                </div>
              </div>
            `).join('')}
          </div>
        </section>
      ` : ''}
      <div class="home-live-footer">
        <span>${schedule.dateLabel} · ${schedule.timeLabel}</span>
        <a href="${LIVE_STREAM_URL}" target="_blank" rel="noopener noreferrer">${t('watchStream')}</a>
      </div>
    </div>
  `;

  [
    [match.playerA, playerAProfileIsLoaded, playerAAvatarKey],
    [match.playerB, playerBProfileIsLoaded, playerBAvatarKey]
  ].forEach(([playerName, profileIsLoaded, avatarKey]) => {
    if(profileIsLoaded) return;
    getHomePlayerProfile(playerName).then(profile => {
      const imageUrl = profile?.assets?.image?.uri;
      if(!imageUrl || !container.isConnected) return;
      const avatar = container.querySelector(`[data-home-avatar-key="${avatarKey}"]`);
      const image = avatar?.querySelector('img');
      if(image) image.src = imageUrl;
    });
  });

  if(isMattGaelLive){
    startHomeLiveSplitsPolling();
  }else{
    stopHomeLiveSplitsPolling();
  }

  if(homeRunElapsedTimer){
    clearInterval(homeRunElapsedTimer);
    homeRunElapsedTimer = null;
  }
  if(showRunElapsed){
    const elapsedElement = document.getElementById('home-run-elapsed');
    const updateElapsed = () => {
      if(!elapsedElement) return;
      const nowSeconds = getScheduleClockSeconds();
      let elapsedSeconds = nowSeconds - runTiming.startSeconds;
      const crossesMidnight = runTiming.endSeconds != null
        && runTiming.endSeconds < runTiming.startSeconds;
      if(elapsedSeconds < 0 && crossesMidnight) elapsedSeconds += 24 * 60 * 60;
      else if(elapsedSeconds < 0) elapsedSeconds = 0;

      if(runTiming.endSeconds != null && runTiming.endSeconds !== runTiming.startSeconds){
        const runDuration = (runTiming.endSeconds - runTiming.startSeconds + 24 * 60 * 60) % (24 * 60 * 60);
        if(runDuration > 0 && elapsedSeconds >= runDuration){
          elapsedElement.remove();
          if(homeRunElapsedTimer){
            clearInterval(homeRunElapsedTimer);
            homeRunElapsedTimer = null;
          }
          return;
        }
      }
      const minutes = Math.floor(elapsedSeconds / 60);
      const seconds = elapsedSeconds % 60;
      elapsedElement.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    };
    updateElapsed();
    homeRunElapsedTimer = setInterval(updateElapsed, 1000);
  }
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

async function loadVisitCounter(){
  const counter = document.getElementById('visit-counter');
  if(!counter) return;

  try{
    const response = await fetch(`${VISIT_COUNTER_BASE_URL}/up`, {
      cache: 'no-store'
    });
    if(!response.ok) throw new Error('HTTP ' + response.status);
    const data = await response.json();
    const count = data?.data?.up_count ?? data?.data?.value ?? data?.data?.count ?? data?.value ?? data?.count;
    if(count == null) throw new Error('Respuesta sin contador');
    counter.textContent = `· ${t('visits')}: ${Number(count).toLocaleString(currentLang === 'es' ? 'es-AR' : 'en-US')}`;
  }catch(err){
    counter.hidden = true;
    console.warn('No se pudo cargar el contador de visitas.', err);
  }
}

async function loadRpdVisitCounter(){
  try{
    const response = await fetch(`${RPD_COUNTER_BASE_URL}/up`, {
      cache: 'no-store'
    });
  }catch(err){
    console.log(err)
  }
}

async function loadJdVisitCounter(){
  try{
    const response = await fetch(`${JD_COUNTER_BASE_URL}/up`, {
      cache: 'no-store'
    });
  }catch(err){
    console.log(err)
  }
}

async function loadRpdRightVisitCounter(){
  try{
    const response = await fetch(`${RPD_RIGHT_COUNTER_BASE_URL}/up`, {
      cache: 'no-store'
    });
  }catch(err){
    console.log(err)
  }
}

function parseGvizTable(rawText){
  const jsonText = String(rawText || '')
    .replace(/^\s*\/\*O_o\*\/\s*google\.visualization\.Query\.setResponse\(/, '')
    .replace(/\);\s*$/, '');
  return JSON.parse(jsonText)?.table || null;
}

function sheetCellValue(row, index){
  const cell = row?.c?.[index];
  if(cell == null) return '';
  const value = cell.v;
  if(value == null || value === '') return '';
  return String(value).trim();
}

async function loadExternalPlayerStats(){
  try{
    const response = await fetch(STATS_SHEET_URL, { cache: 'no-store' });
    if(!response.ok) throw new Error('HTTP ' + response.status);
    const table = parseGvizTable(await response.text());
    const normalizeSheetHeader = value => String(value || '').replace(/\s+/g, ' ').trim().toLowerCase();
    const columns = (table?.cols || []).map(column => normalizeSheetHeader(column.label));
    const rows = table?.rows || [];
    const valueAt = (row, label) => {
      const index = columns.indexOf(label);
      return index >= 0 ? sheetCellValue(row, index) : '';
    };

    externalPlayerStats = new Map();
    rows.forEach(row => {
      const name = valueAt(row, 'statistics runner');
      if(!name) return;
      externalPlayerStats.set(normalizeParticipantName(name), {
        name,
        rank: valueAt(row, 'rank'),
        flag: valueAt(row, 'flag'),
        overallPb: valueAt(row, 'overall pb'),
        qualifiersPb: valueAt(row, 'qualifiers pb'),
        basementPb: valueAt(row, 'best basement'),
        trainCrash: valueAt(row, 'best tc'),
        tournamentBest: valueAt(row, 'tournament best'),
        worstBasement: valueAt(row, 'worst basement'),
        worstTC: valueAt(row, 'worst tc'),
        worstTB: valueAt(row, 'worst tb'),
        winLoss: valueAt(row, 'win - losess')
      });
    });
  }catch(err){
    externalPlayerStats = new Map();
    console.warn('No se pudieron cargar las estadísticas de Google Sheets.', err);
  }
}

/** Parse knockout-style sheet: Rank, Flag, Runner, W-L, Overall PB, Qualifiers PB, then per-match triples (Basement, Train Crash, Time). */
async function loadKnockoutStageStats(url, stageKey, matchCount){
  try{
    const response = await fetch(url, { cache: 'no-store' });
    if(!response.ok) throw new Error('HTTP ' + response.status);
    const table = parseGvizTable(await response.text());
    const rows = table?.rows || [];
    const map = new Map();

    rows.forEach(row => {
      const name = sheetCellValue(row, 2);
      if(!name) return;
      const matches = {};
      for(let m = 1; m <= matchCount; m++){
        const base = 6 + (m - 1) * 3;
        const matchData = {
          basement: sheetCellValue(row, base),
          trainCrash: sheetCellValue(row, base + 1),
          time: sheetCellValue(row, base + 2)
        };
        matches[m] = matchData;
        matches[String(m)] = matchData;
      }
      map.set(normalizeParticipantName(name), {
        name,
        flag: sheetCellValue(row, 1),
        winLoss: sheetCellValue(row, 3),
        overallPb: sheetCellValue(row, 4),
        qualifiersPb: sheetCellValue(row, 5),
        matches
      });
    });

    externalKnockoutStats[stageKey] = map;
  }catch(err){
    externalKnockoutStats[stageKey] = new Map();
    console.warn(`No se pudieron cargar las estadísticas de ${stageKey}.`, err);
  }
}

async function loadFinalTableStats(){
  try{
    const response = await fetch(STATS_FINAL_TABLE_URL, { cache: 'no-store' });
    if(!response.ok) throw new Error('HTTP ' + response.status);
    const table = parseGvizTable(await response.text());
    const rows = table?.rows || [];
    const parsed = [];

    rows.forEach((row, index) => {
      const flag = sheetCellValue(row, 0);
      const runnerRaw = sheetCellValue(row, 1);
      const ranking = sheetCellValue(row, 2);
      const bestTime = sheetCellValue(row, 3);
      const worstTime = sheetCellValue(row, 4);
      const diffPb = sheetCellValue(row, 5);
      const totalRuns = sheetCellValue(row, 6);
      const finishedRuns = sheetCellValue(row, 7);
      const wins = sheetCellValue(row, 8);
      const losses = sheetCellValue(row, 9);
      const winPct = sheetCellValue(row, 10);

      // Primera fila = encabezados embebidos en la hoja
      if(index === 0 && /runner/i.test(runnerRaw) && /ranking/i.test(ranking)) return;
      if(!ranking && !runnerRaw) return;

      const displayName = runnerRaw
        ? (normalizeSchedulePlayerName(runnerRaw) || runnerRaw)
        : '';

      parsed.push({
        flag,
        name: displayName,
        ranking,
        bestTime,
        worstTime,
        diffPb,
        totalRuns,
        finishedRuns,
        wins,
        losses,
        winPct,
        isPlaceholder: !displayName
      });
    });

    externalFinalTable = parsed;
  }catch(err){
    externalFinalTable = [];
    console.warn('No se pudo cargar la Tabla Final.', err);
  }
}

async function loadAllExternalStats(){
  await Promise.all([
    loadExternalPlayerStats(),
    loadKnockoutStageStats(STATS_RO16_SHEET_URL, 'ro16', 3),
    loadFinalTableStats()
    // Cuartos / Semis / Final: agregar URLs cuando existan las hojas
  ]);
}

function getSheetCell(row, index){
  const cell = row?.c?.[index];
  return String(cell?.f ?? cell?.v ?? '').trim();
}

function normalizeSchedulePlayerName(name){
  const aliases = {
    adrian: 'Adrian20v',
    lance: 'LanceLM',
    snake: 'HalfBakedSnake',
    gabiale: 'GabiAle97',
    xploder: 'NemesisXploder',
    owarii: 'Owarii1RE',
    bomba: 'Bomba_Nemesis',
    nevs: 'TheNevs',
    paquito: 'Paquito_tatata',
    crisdoile: 'crisdoile2',
    reduke: 'Re_duke'
  };
  const normalized = normalizeManualMatchName(name);
  const candidate = aliases[normalized] || name;
  const pageName = Object.values(FINAL_GROUPS)
    .flat()
    .find(playerName => normalizeManualMatchName(playerName) === normalizeManualMatchName(candidate));
  return pageName || candidate;
}

function parseScheduleDayLabel(value){
  const match = String(value || '').trim().match(/^DAY\s+(\d+)\s+([A-ZÁÉÍÓÚ]+)[.]?\s+(\d{1,2})$/i);
  if(!match) return null;

  const months = {
    JAN: 1, FEB: 2, MAR: 3, APR: 4, MAY: 5, JUN: 6,
    JUL: 7, AUG: 8, SEP: 9, SEPT: 9, OCT: 10, NOV: 11, DEC: 12
  };
  const month = months[match[2].toUpperCase()];
  const dayOfMonth = Number(match[3]);
  return month && dayOfMonth >= 1 && dayOfMonth <= 31
    ? `2026-${String(month).padStart(2, '0')}-${String(dayOfMonth).padStart(2, '0')}`
    : null;
}

function parseScheduleDateCells(dayValue, dateValue){
  const fullDate = parseScheduleDayLabel(dateValue);
  if(fullDate) return fullDate;

  // "sept. 24" / "sep 24" / "1 oct."
  const monthDay = String(dateValue || '').trim().match(/^([A-ZÁÉÍÓÚ]{3,})[.]?\s+(\d{1,2})$/i);
  if(monthDay){
    return parseScheduleDayLabel(`DAY 1 ${monthDay[1]} ${monthDay[2]}`);
  }
  const dayMonth = String(dateValue || '').trim().match(/^(\d{1,2})\s+([A-ZÁÉÍÓÚ]{3,})[.]?$/i);
  if(dayMonth){
    return parseScheduleDayLabel(`DAY 1 ${dayMonth[2]} ${dayMonth[1]}`);
  }

  const compactDate = `${String(dayValue || '').trim()} ${String(dateValue || '').trim()}`
    .replace(/\s+/g, ' ')
    .trim();
  const compactMatch = compactDate.match(/^(\d{1,2})\s+([A-ZÁÉÍÓÚ]+)[.]?$/i);
  if(compactMatch){
    return parseScheduleDayLabel(`DAY 1 ${compactMatch[2]} ${compactMatch[1]}`);
  }

  const combinedDate = `${String(dayValue || '').trim()} ${String(dateValue || '').trim()}`;
  const combinedMatch = combinedDate.match(/^DAY\s+\d+\s+([A-ZÁÉÍÓÚ]+)[.]?\s+(\d{1,2})$/i);
  if(!combinedMatch) return null;

  return parseScheduleDayLabel(`DAY 1 ${combinedMatch[1]} ${combinedMatch[2]}`);
}

function normalizeScheduleTime(value){
  const match = String(value || '').match(/(\d{1,2}:\d{2})/);
  return match ? match[1] : String(value || '').trim();
}

function isScheduleDetailValue(value){
  const text = String(value || '').trim().toUpperCase();
  const isDiedPattern = /^(DIED|DEAD)\b/.test(text);
  return text === '' || text === '-' || text === 'DEATH' || text === 'DIED' || text === 'DEAD'
    || isDiedPattern || /^\d{1,2}:\d{2}(?:\.\d+)?$/.test(text);
}

function isValidSchedulePlayerName(value){
  const text = String(value || '').trim();
  if(!text) return false;
  if(text === '-' || text === 'TBD' || text === '—' || text === '–') return false;
  if(isScheduleDetailValue(text)) return false;
  if(/^DAY\s*\d+/i.test(text)) return false;
  if(/^BO\s*\d+$/i.test(text)) return false;
  if(/^GROUP\s+[A-H]$/i.test(text)) return false;
  // Fechas tipo "sept. 25", "1 oct.", "sep 25"
  if(/^[a-záéíóúüñ]{3,}\.?\s+\d{1,2}$/i.test(text)) return false;
  if(/^\d{1,2}\s+[a-záéíóúüñ]{3,}\.?$/i.test(text)) return false;
  if(/^\d{4}-\d{2}-\d{2}$/.test(text)) return false;
  // Solo números o marcadores de serie
  if(/^\d+$/.test(text)) return false;
  return true;
}

function resolveScheduleSeriesWinner(scoreA, scoreB, playerA, playerB, stage = '', group = ''){
  const a = Number(String(scoreA ?? '').trim());
  const b = Number(String(scoreB ?? '').trim());
  if(!Number.isFinite(a) || !Number.isFinite(b) || String(scoreA).trim() === '' || String(scoreB).trim() === '') return '';
  const target = getKnockoutSeriesTarget(stage, group);
  if(target != null){
    if(a < target && b < target) return '';
  }else if(a === b){
    return '';
  }
  if(a !== b){
    return a > b
      ? normalizeSchedulePlayerName(playerA)
      : normalizeSchedulePlayerName(playerB);
  }
  return '';
}

function isRescheduledMarker(value){
  return /^RESCHEDULED$/i.test(String(value || '').trim());
}

function collectScheduleGames(rows, rowIndex, start, scheduleCol){
  const games = [];
  for(let candidateIndex = rowIndex + 1; candidateIndex <= rowIndex + 8; candidateIndex++){
    const candidateRow = rows[candidateIndex];
    if(!candidateRow) break;

    const valueA = getSheetCell(candidateRow, start);
    const valueB = getSheetCell(candidateRow, start + 3);
    const groupValue = getSheetCell(candidateRow, scheduleCol);

    // Siguiente partido (dos nombres válidos)
    if(isValidSchedulePlayerName(valueA) && isValidSchedulePlayerName(valueB)) break;

    // Encabezado de día
    if(/^DAY\s+\d+/i.test(valueA) || /^DAY\s+\d+/i.test(getSheetCell(candidateRow, 0))) break;

    // Fila BO3 / vacía: seguir buscando tiempos
    if(/^BO\s*\d+$/i.test(groupValue) && !valueA && !valueB) continue;
    if(!valueA && !valueB) continue;

    if(isRescheduledMarker(valueA) || isRescheduledMarker(valueB) || isRescheduledMarker(groupValue)) continue;

    const hasGameTime = isScheduleDetailValue(valueA) || isScheduleDetailValue(valueB);
    if(!hasGameTime) break;

    // Ambos vacíos o solo guiones → placeholder, ignorar
    const cleanA = (!valueA || valueA === '-') ? '-' : valueA;
    const cleanB = (!valueB || valueB === '-') ? '-' : valueB;
    if(cleanA === '-' && cleanB === '-') continue;

    games.push({ timeA: cleanA, timeB: cleanB });
  }
  return games;
}

function isScheduleClockTime(value){
  return /^\d{1,2}:\d{2}$/.test(String(value || '').trim());
}

function scheduleMatchPairKey(match){
  const players = [normalizeManualMatchName(match.playerA), normalizeManualMatchName(match.playerB)].sort();
  return `${players[0]}|${players[1]}`;
}

/** Fecha local (UTC-3) de hoy, comparable con las fechas YYYY-MM-DD del fixture. */
function getScheduleTodayKey(){
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: SCHEDULE_TIME_ZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date());
  const year = parts.find(part => part.type === 'year')?.value;
  const month = parts.find(part => part.type === 'month')?.value;
  const day = parts.find(part => part.type === 'day')?.value;
  return year && month && day ? `${year}-${month}-${day}` : '';
}

function hasValidScheduleDate(match){
  return /^\d{4}-\d{2}-\d{2}$/.test(String(match?.date || '').trim());
}

function hasScheduleResultValue(value){
  const normalized = String(value ?? '').trim();
  return normalized !== '' && normalized !== '-' && !/^TBD$/i.test(normalized);
}

function hasScheduleMatchResult(match){
  return Boolean(
    hasScheduleResultValue(match?.winner) ||
    hasScheduleResultValue(match?.seriesScoreA) ||
    hasScheduleResultValue(match?.seriesScoreB) ||
    hasScheduleResultValue(match?.timeA) ||
    hasScheduleResultValue(match?.timeB) ||
    (Array.isArray(match?.games) && match.games.some(game =>
      hasScheduleResultValue(game?.timeA) || hasScheduleResultValue(game?.timeB)
    ))
  );
}

function mergeScheduleMatchResults(match, override){
  if(!hasScheduleMatchResult(override)) return match;
  const merged = { ...match };
  ['winner', 'seriesScoreA', 'seriesScoreB', 'timeA', 'timeB'].forEach(field => {
    if(!hasScheduleResultValue(merged[field]) && hasScheduleResultValue(override[field])){
      merged[field] = override[field];
    }
  });
  const officialHasGameResults = Array.isArray(merged.games) && merged.games.some(game =>
    hasScheduleResultValue(game?.timeA) || hasScheduleResultValue(game?.timeB)
  );
  const overrideHasGameResults = Array.isArray(override.games) && override.games.some(game =>
    hasScheduleResultValue(game?.timeA) || hasScheduleResultValue(game?.timeB)
  );
  if(!officialHasGameResults && overrideHasGameResults){
    merged.games = override.games;
  }
  return merged;
}

function getScheduleMatchResultFields(match){
  return {
    winner: match.winner,
    seriesScoreA: match.seriesScoreA,
    seriesScoreB: match.seriesScoreB,
    timeA: match.timeA,
    timeB: match.timeB,
    games: match.games
  };
}

function isTbdScheduleValue(value){
  return /^TBD$/i.test(String(value || '').trim());
}

/**
 * Los resultados ausentes se completan desde la hoja alternativa. El calendario
 * oficial solo se pisa si está marcado RESCHEDULED y ya pasó, o si su fecha es
 * TBD y la reserva tiene una fecha válida.
 */
function applyRescheduledOverrides(officialMatches, overrideMatches){
  if(!Array.isArray(officialMatches) || !officialMatches.length) return officialMatches || [];
  if(!Array.isArray(overrideMatches) || !overrideMatches.length) return officialMatches;

  const today = getScheduleTodayKey();
  const overridesByPair = new Map();
  overrideMatches.forEach(match => {
    overridesByPair.set(scheduleMatchPairKey(match), match);
  });

  return officialMatches.map(match => {
    const override = overridesByPair.get(scheduleMatchPairKey(match));
    if(!override) return match;
    const resultMatch = mergeScheduleMatchResults(match, override);

    const rescheduledStale = Boolean(
      match.rescheduled && match.date && today && String(match.date) < today
    );
    const officialDateMissing = Boolean(match.dateTbd || !hasValidScheduleDate(match));
    if(!rescheduledStale && !officialDateMissing) return resultMatch;
    if(officialDateMissing && !hasValidScheduleDate(override)) return resultMatch;

    if(officialDateMissing && !rescheduledStale){
      return {
        ...resultMatch,
        date: override.date,
        time: isScheduleClockTime(override.time) ? override.time : match.time,
        dateTbd: false,
        overridden: true
      };
    }

    return {
      ...match,
      ...override,
      ...getScheduleMatchResultFields(resultMatch),
      group: match.group,
      stage: match.stage,
      rescheduled: false,
      dateTbd: false,
      overridden: true
    };
  });
}

function removeRescheduledDuplicates(matches){
  const uniqueMatches = new Map();

  matches.forEach(match => {
    const players = [normalizeManualMatchName(match.playerA), normalizeManualMatchName(match.playerB)].sort();
    const key = `${match.group}|${players[0]}|${players[1]}`;
    const previous = uniqueMatches.get(key);
    if(!previous || isScheduleClockTime(match.time) || !isScheduleClockTime(previous.time)){
      uniqueMatches.set(key, match);
    }
  });

  return [...uniqueMatches.values()];
}

function inferScheduleGroup(playerA, playerB){
  const normalizedA = normalizeManualMatchName(playerA);
  const normalizedB = normalizeManualMatchName(playerB);
  return Object.entries(FINAL_GROUPS).find(([, players]) => {
    const names = players.map(normalizeManualMatchName);
    return names.includes(normalizedA) && names.includes(normalizedB);
  })?.[0] || null;
}

function parseMatchScheduleTable(table, options = {}){
  const {
    stage = 'groups', // 'groups' | 'r16' | 'quarters' | 'semifinals' | 'final' | 'thirdplace' | 'fifthplace'
    defaultGroup = null,
    dateLabelPrefix = null,
    roundIndexes = null
  } = options;
  const rows = table?.rows || [];
  const allRounds = [
    { start: 1, schedule: 6, dateDay: 0, date: 1 },
    { start: 9, schedule: 14, dateDay: 8, date: 9 },
    { start: 17, schedule: 22, dateDay: 16, date: 17 }
  ];
  const rounds = roundIndexes
    ? allRounds.filter((_, index) => roundIndexes.includes(index))
    : allRounds;
  const matchesByRound = rounds.map(() => []);
  const currentDates = rounds.map(() => null);
  const roundDateTbd = rounds.map(() => false);
  let sheetHasTbdDate = false;
  const fallbackGroup = defaultGroup || (stage === 'r16' || stage === 'quarters' || stage === 'semifinals' || stage === 'final' || stage === 'thirdplace' || stage === 'fifthplace' ? stage.toUpperCase() : t('noGroup'));

  for(let rowIndex = 0; rowIndex < rows.length; rowIndex++){
    const row = rows[rowIndex];
    const nextRow = rows[rowIndex + 1];

    rounds.forEach(({ start, schedule, dateDay, date }, roundIndex) => {
      const dayCell = getSheetCell(row, dateDay);
      const dateCell = getSheetCell(row, date);
      if(isTbdScheduleValue(dateCell) || isTbdScheduleValue(dayCell)){
        sheetHasTbdDate = true;
        currentDates[roundIndex] = '';
        roundDateTbd[roundIndex] = true;
      }else{
        const parsedDate = parseScheduleDateCells(dayCell, dateCell);
        if(parsedDate){
          currentDates[roundIndex] = parsedDate;
          roundDateTbd[roundIndex] = false;
        }
      }

      const playerA = getSheetCell(row, start);
      const playerB = getSheetCell(row, start + 3);
      if(!isValidSchedulePlayerName(playerA) || !isValidSchedulePlayerName(playerB)) return;

      let detailRowIndex = null;
      for(let candidateIndex = rowIndex + 1; candidateIndex <= rowIndex + 3; candidateIndex++){
        const candidateRow = rows[candidateIndex];
        if(!candidateRow) break;

        const groupValue = getSheetCell(candidateRow, schedule);
        if(/GROUP\s+([A-H])/i.test(groupValue) || /R\s*16|ROUND\s*OF\s*16|OCTAVOS/i.test(groupValue) || /QUARTERS|CUARTOS/i.test(groupValue) || /SEMIFINALS|SEMIFINALES/i.test(groupValue) || /FINAL|FINAL/i.test(groupValue) || /FIFTH|5TH|QUINTO/i.test(groupValue)){
          detailRowIndex = candidateIndex;
          break;
        }

        // Si esta fila ya es la fila de jugadores de OTRO partido, nuestra
        // propia fila de detalle (probablemente un W.O. sin "GROUP X") no
        // está más adelante: dejamos de buscar en vez de robar la ajena.
        const candidateA = getSheetCell(candidateRow, start);
        const candidateB = getSheetCell(candidateRow, start + 3);
        const looksLikeAnotherMatchRow = candidateA && candidateB &&
          candidateA !== 'TBD' && candidateB !== 'TBD' &&
          !isScheduleDetailValue(candidateA) && !isScheduleDetailValue(candidateB);
        if(looksLikeAnotherMatchRow) break;
      }
      const detailRow = rows[detailRowIndex] || nextRow || { c: [] };
      const groupValue = getSheetCell(detailRow, schedule);
      const groupMatch = groupValue.match(/GROUP\s+([A-H])/i);
      const group = groupMatch?.[1]?.toUpperCase()
        || inferScheduleGroup(playerA, playerB)
        || (/R\s*16|ROUND\s*OF\s*16|OCTAVOS/i.test(groupValue) ? 'R16' : null)
        || (/QUARTERS|CUARTOS/i.test(groupValue) ? 'QUARTERS' : null)
        || (/SEMIFINALS|SEMIFINALES/i.test(groupValue) ? 'SEMIFINALS' : null)
        || (/FIFTH|5TH|QUINTO/i.test(groupValue) ? 'FIFTH_PLACE' : null)
        || (/FINAL|FINAL/i.test(groupValue) ? 'FINAL' : null)
        || fallbackGroup;

      const scoreA = getSheetCell(row, start + 1);
      const scoreB = getSheetCell(row, start + 2);
      const games = collectScheduleGames(rows, rowIndex, start, schedule);
      const timeA = games[0]?.timeA || getSheetCell(detailRow, start) || '-';
      const timeB = games[0]?.timeB || getSheetCell(detailRow, start + 3) || '-';
      const nearbyCells = [
        getSheetCell(row, schedule),
        getSheetCell(nextRow, schedule),
        getSheetCell(detailRow, schedule),
        getSheetCell(rows[rowIndex + 2], schedule),
        getSheetCell(rows[rowIndex + 3], schedule)
      ];
      const rescheduled = nearbyCells.some(isRescheduledMarker);
      let scheduleValue = getSheetCell(row, schedule);
      // En octavos la celda puede ser "BO3"; el horario real suele estar en la misma fila
      if(/^BO\s*\d+$/i.test(scheduleValue)){
        for(let c = schedule - 2; c <= schedule + 1; c++){
          const candidate = normalizeScheduleTime(getSheetCell(row, c));
          if(isScheduleClockTime(candidate)){
            scheduleValue = candidate;
            break;
          }
        }
      }
      if(!isScheduleClockTime(normalizeScheduleTime(scheduleValue))){
        for(let c = schedule - 1; c <= schedule + 1; c++){
          const candidate = normalizeScheduleTime(getSheetCell(row, c));
          if(isScheduleClockTime(candidate)){
            scheduleValue = candidate;
            break;
          }
        }
      }
      const normalizedScheduleTime = normalizeScheduleTime(scheduleValue);
      const hasScheduledTime = isScheduleClockTime(normalizedScheduleTime);
      const hasSeriesScore = /^\d+$/.test(String(scoreA).trim()) && /^\d+$/.test(String(scoreB).trim());
      const dateIsTbd = roundDateTbd[roundIndex];
      const hasResult = Boolean(
        (scoreA && scoreA !== '-') ||
        (scoreB && scoreB !== '-') ||
        (timeA && timeA !== '-') ||
        (timeB && timeB !== '-') ||
        games.length
      );
      if(!hasScheduledTime && !hasResult && !dateIsTbd) return;
      const winner = resolveScheduleSeriesWinner(scoreA, scoreB, playerA, playerB, stage, group);

      matchesByRound[roundIndex].push({
        group,
        stage,
        playerA: normalizeSchedulePlayerName(playerA),
        playerB: normalizeSchedulePlayerName(playerB),
        timeA: timeA || '-',
        timeB: timeB || '-',
        seriesScoreA: hasSeriesScore ? String(scoreA).trim() : null,
        seriesScoreB: hasSeriesScore ? String(scoreB).trim() : null,
        games,
        winner,
        date: dateIsTbd ? '' : (currentDates[roundIndex] || ''),
        time: normalizedScheduleTime,
        rescheduled,
        dateTbd: dateIsTbd
      });
    });
  }

  // Grupos: 3 bloques de columnas (fechas 1-3).
  // Octavos: un solo bloque con los 8 partidos (ordenados por fecha/hora).
  let dates;
  if(stage === 'r16' || stage === 'quarters' || stage === 'semifinals' || stage === 'final' || stage === 'thirdplace' || stage === 'fifthplace'){
    const allMatches = removeRescheduledDuplicates(matchesByRound.flat())
      .map(({ group: _g, ...match }) => ({ ...match, group: stage.toUpperCase(), stage }))
      .sort((a, b) => {
        const dateCmp = String(a.date || '').localeCompare(String(b.date || ''));
        if(dateCmp !== 0) return dateCmp;
        return String(a.time || '').localeCompare(String(b.time || ''));
      });
    dates = [{
      number: 1,
      label: dateLabelPrefix || t(stage === 'thirdplace' ? 'thirdPlace' : stage === 'fifthplace' ? 'fifthPlace' : stage),
      stage,
      groups: [{
        name: 'R16',
        matches: allMatches
      }]
    }];
  }else{
    const roundsForLabels = matchesByRound.map((matches, index) => ({ matches, index }));
    const totalDates = roundsForLabels.length || 1;
    dates = roundsForLabels.map(({ matches }, labelIndex) => {
      const number = labelIndex + 1;
      const baseLabel = `${t('dateLabel')} ${number} ${t('of')} ${totalDates}`;
      const label = dateLabelPrefix ? `${dateLabelPrefix} · ${baseLabel}` : baseLabel;
      const groupNames = [...Object.keys(FINAL_GROUPS), ...new Set(matches.map(match => match.group).filter(group => !FINAL_GROUPS[group]))];
      return {
        number,
        label,
        stage,
        groups: groupNames.map(group => ({
          name: group,
          matches: removeRescheduledDuplicates(matches)
            .filter(match => match.group === group)
            .map(({ group: _g, ...match }) => ({ ...match, stage: match.stage || stage }))
        }))
      };
    });
  }

  const normalized = normalizeResultsData({ dates });
  if(normalized) normalized.hasTbdDate = sheetHasTbdDate;
  return normalized;
}

async function fetchGvizSheetTable(url){
  if(!url) return null;
  const response = await fetch(url, { cache: 'no-store' });
  if(!response.ok) throw new Error('HTTP ' + response.status);
  const text = await response.text();
  const jsonText = text.replace(/^\s*\/\*O_o\*\/\s*google\.visualization\.Query\.setResponse\(/, '').replace(/\);\s*$/, '');
  return JSON.parse(jsonText)?.table;
}

function parseStageOverrideMatches(table, stage, defaultGroup, dateLabelPrefix){
  if(!table) return [];
  return parseMatchScheduleTable(table, {
    stage,
    defaultGroup,
    dateLabelPrefix
  })?.matches || [];
}

function parseSheetClockTimeSeconds(table, rowIndex, columnIndex){
  const cell = table?.rows?.[rowIndex]?.c?.[columnIndex];
  const formatted = String(cell?.f ?? '').trim();
  const raw = String(cell?.v ?? '').trim();
  const value = `${formatted} ${raw}`;
  const dateValue = value.match(/Date\(\d+,\d+,\d+,\s*(\d{1,2}),\s*(\d{1,2}),\s*(\d{1,2})/);
  const timeValue = formatted.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/)
    || raw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  const match = dateValue || timeValue;
  if(!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  const second = Number(match[3] || 0);
  if(hour > 23 || minute > 59 || second > 59) return null;
  return hour * 3600 + minute * 60 + second;
}

function getScheduleClockSeconds(){
  const nowParts = new Intl.DateTimeFormat('en-GB', {
    timeZone: SCHEDULE_TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  }).formatToParts(new Date());
  return Number(nowParts.find(part => part.type === 'hour')?.value || 0) * 3600
    + Number(nowParts.find(part => part.type === 'minute')?.value || 0) * 60
    + Number(nowParts.find(part => part.type === 'second')?.value || 0);
}

function knockoutRunPairKey(playerA, playerB){
  return [normalizeSchedulePlayerName(playerA), normalizeSchedulePlayerName(playerB)]
    .map(normalizeManualMatchName)
    .sort()
    .join('|');
}

function resolveActiveKnockoutRunTimings(table){
  const nowSeconds = getScheduleClockSeconds();
  const daySeconds = 24 * 60 * 60;
  const activeRuns = new Map();
  const rows = table?.rows || [];
  const blockStarts = [1, 9, 17];

  blockStarts.forEach(playerCol => {
    let currentPairKey = null;
    rows.forEach((row, rowIndex) => {
      const possiblePlayers = Array.from({ length: 4 }, (_, offset) => getSheetCell(row, playerCol + offset))
        .filter(isValidSchedulePlayerName);
      if(possiblePlayers.length >= 2){
        // Las hojas de respaldo no siempre ubican al segundo jugador en la misma columna:
        // puede estar en D o E. Los resultados y las horas se descartan arriba.
        currentPairKey = knockoutRunPairKey(possiblePlayers[0], possiblePlayers[1]);
      }else{
        const dayMarker = getSheetCell(row, playerCol - 1);
        if(/^DAY\s+\d+/i.test(dayMarker)) currentPairKey = null;
      }
      if(!currentPairKey) return;

      const startSeconds = parseSheetClockTimeSeconds(table, rowIndex, playerCol - 1);
      if(startSeconds == null) return;
      const endSeconds = parseSheetClockTimeSeconds(table, rowIndex, playerCol + 4);
      let isActive = false;
      if(endSeconds == null || endSeconds === startSeconds){
        // Sin hora de fin, o inicio y fin iguales: la run sigue en curso.
        isActive = nowSeconds >= startSeconds;
      }else{
        const duration = (endSeconds - startSeconds + daySeconds) % daySeconds;
        const elapsed = (nowSeconds - startSeconds + daySeconds) % daySeconds;
        isActive = duration > 0 && elapsed < duration;
      }
      if(!isActive) return;

      const previous = activeRuns.get(currentPairKey);
      const elapsed = (nowSeconds - startSeconds + daySeconds) % daySeconds;
      const previousElapsed = previous
        ? (nowSeconds - previous.startSeconds + daySeconds) % daySeconds
        : Number.POSITIVE_INFINITY;
      if(!previous || elapsed < previousElapsed){
        activeRuns.set(currentPairKey, { startSeconds, endSeconds });
      }
    });
  });

  return activeRuns;
}

function parseMysteryScheduleTable(table){
  const rows = table?.rows || [];
  const columnLabels = (table?.cols || []).map(column => String(column?.label || '').trim());
  const rounds = [
    { schedule: 6, dateDay: 0, date: 1 },
    { schedule: 14, dateDay: 8, date: 9 },
    { schedule: 22, dateDay: 16, date: 17 }
  ];
  const matches = [];

  rounds.forEach(({ schedule, dateDay, date }) => {
    let currentDate = '';
    rows.forEach(row => {
      const dayCell = getSheetCell(row, dateDay);
      const dateCell = getSheetCell(row, date);
      if(isTbdScheduleValue(dayCell) || isTbdScheduleValue(dateCell)){
        currentDate = '';
      }else{
        currentDate = parseScheduleDateCells(dayCell, dateCell) || currentDate;
      }

      const time = normalizeScheduleTime(getSheetCell(row, schedule));
      if(!currentDate || !isScheduleClockTime(time)) return;
      if(matches.some(match => match.date === currentDate && match.time === time)) return;

      const playerA = getSheetCell(row, schedule - 5);
      const playerB = getSheetCell(row, schedule - 2);
      matches.push({
        stage: 'mystery',
        group: 'MYSTERY',
        playerA: isValidSchedulePlayerName(playerA) ? normalizeSchedulePlayerName(playerA) : t('mysteryRunnerOne'),
        playerB: isValidSchedulePlayerName(playerB) ? normalizeSchedulePlayerName(playerB) : t('mysteryRunnerTwo'),
        date: currentDate,
        time,
        seriesScoreA: null,
        seriesScoreB: null,
        games: [],
        winner: ''
      });
    });
  });

  // La hoja de Mystery publica la fecha y la hora en los encabezados de columna,
  // no en las filas de datos como las demás hojas del fixture.
  if(!matches.length){
    const dateLabel = columnLabels
      .map(label => label.match(/\b(\d{1,2}\s+[A-ZÁÉÍÓÚ]{3,}\.?)/i)?.[1])
      .find(Boolean);
    const timeLabel = columnLabels.find(label => /\bTIME\b/i.test(label) && /\d{1,2}:\d{2}/.test(label));
    const date = dateLabel ? parseScheduleDateCells('', dateLabel) : null;
    const time = timeLabel ? normalizeScheduleTime(timeLabel) : '';

    if(date && isScheduleClockTime(time)){
      matches.push({
        stage: 'mystery',
        group: 'MYSTERY',
        playerA: t('mysteryRunnerOne'),
        playerB: t('mysteryRunnerTwo'),
        date,
        time,
        seriesScoreA: null,
        seriesScoreB: null,
        games: [],
        winner: ''
      });
    }
  }

  return matches;
}

function sortScheduleMatches(matches){
  return [...(matches || [])].sort((a, b) => {
    const dateCmp = String(a.date || '').localeCompare(String(b.date || ''));
    if(dateCmp !== 0) return dateCmp;
    return String(a.time || '').localeCompare(String(b.time || ''));
  });
}

function applyStageRescheduleOverrides(schedule, stage, overrideMatches, options = {}){
  if(!schedule?.dates || !overrideMatches?.length) return;
  const stageKey = String(stage || '').toLowerCase();
  schedule.dates.forEach(date => {
    if(String(date.stage || '').toLowerCase() !== stageKey) return;
    (date.groups || []).forEach(group => {
      group.matches = applyRescheduledOverrides(group.matches, overrideMatches);
    });
    if(Array.isArray(date.matches)){
      date.matches = sortScheduleMatches(applyRescheduledOverrides(date.matches, overrideMatches));
      date.matches.forEach(match => {
        match.fixtureDateNumber = Number(date.number || date.numero || 1);
      });
    }

    // El oficial deja el día en TBD y no lista el cruce: si la reserva tiene fecha, se agrega.
    if(!options.includeMissing || !Array.isArray(date.matches)) return;
    const seen = new Set(date.matches.map(scheduleMatchPairKey));
    overrideMatches.forEach(match => {
      if(!hasValidScheduleDate(match)) return;
      const key = scheduleMatchPairKey(match);
      if(seen.has(key)) return;
      seen.add(key);
      const added = {
        ...match,
        group: stageKey.toUpperCase(),
        stage: stageKey,
        fixtureDateNumber: Number(date.number || date.numero || 1),
        dateTbd: false,
        overridden: true
      };
      date.matches.push(added);
      const group = date.groups?.[0];
      if(group) group.matches = [...(group.matches || []), added];
    });
    date.matches = sortScheduleMatches(date.matches);
    (date.groups || []).forEach(group => {
      group.matches = sortScheduleMatches(group.matches);
    });
  });
  schedule.matches = schedule.dates.flatMap(date => date.matches || []);
}

function applyLocalMatchStageCorrections(schedule){
  if(!Array.isArray(schedule?.dates)) return;

  const correctedPair = ['mattgael', 'thenevs'].sort().join('|');
  let matchToMove = null;
  const isCorrectedPair = match => scheduleMatchPairKey(match) === correctedPair;

  schedule.dates.forEach(date => {
    const stage = String(date.stage || '').toLowerCase();
    if(stage === 'quarters'){
      const misplacedMatch = (date.matches || []).find(isCorrectedPair);
      if(misplacedMatch) matchToMove = { ...misplacedMatch };
    }
    if(stage === 'quarters' || stage === 'r16'){
      date.matches = (date.matches || []).filter(match => !isCorrectedPair(match));
      (date.groups || []).forEach(group => {
        group.matches = (group.matches || []).filter(match => !isCorrectedPair(match));
      });
    }
  });

  if(matchToMove){
    const r16Date = schedule.dates.find(date => String(date.stage || '').toLowerCase() === 'r16');
    if(r16Date){
      const correctedMatch = {
        ...matchToMove,
        group: 'R16',
        stage: 'r16',
        fixtureDateNumber: Number(r16Date.number || r16Date.numero || 1),
        locallyCorrected: true
      };
      r16Date.matches = sortScheduleMatches([...(r16Date.matches || []), correctedMatch]);
      const r16Group = r16Date.groups?.[0];
      if(r16Group){
        r16Group.matches = sortScheduleMatches([...(r16Group.matches || []), correctedMatch]);
      }
    }
  }

  schedule.matches = schedule.dates.flatMap(date => date.matches || []);
}

function addLocalMissingScheduleMatch(schedule, stage, playerA, playerB, overrideMatches){
  if(!Array.isArray(schedule?.dates) || !Array.isArray(overrideMatches)) return;

  const targetKey = scheduleMatchPairKey({ playerA, playerB });
  const sourceMatch = overrideMatches.find(match => scheduleMatchPairKey(match) === targetKey);
  const targetDate = schedule.dates.find(date => String(date.stage || '').toLowerCase() === stage);
  if(!sourceMatch || !targetDate || (targetDate.matches || []).some(match => scheduleMatchPairKey(match) === targetKey)) return;

  const addedMatch = {
    ...sourceMatch,
    group: stage.toUpperCase(),
    stage,
    fixtureDateNumber: Number(targetDate.number || targetDate.numero || 1),
    dateTbd: !hasValidScheduleDate(sourceMatch),
    overridden: true,
    locallyAdded: true
  };
  targetDate.matches = sortScheduleMatches([...(targetDate.matches || []), addedMatch]);
  const targetGroup = targetDate.groups?.[0];
  if(targetGroup){
    targetGroup.matches = sortScheduleMatches([...(targetGroup.matches || []), addedMatch]);
  }
  schedule.matches = schedule.dates.flatMap(date => date.matches || []);
}

function mergeMatchSchedules(groupsSchedule, r16Schedule, quartersSchedule, semifinalsSchedule, thirdPlaceSchedule, fifthPlaceSchedule, finalSchedule){
  if(!groupsSchedule && !r16Schedule && !quartersSchedule && !semifinalsSchedule && !thirdPlaceSchedule && !fifthPlaceSchedule && !finalSchedule) return null;

  const groupsDates = groupsSchedule?.dates || [];
  const r16Dates = (r16Schedule.dates || []).map((date, index) => ({
    ...date,
    number: groupsDates.length + index + 1,
    label: date.label || t('roundOf16'),
    stage: 'r16'
  }));
  const quartersDates = (quartersSchedule?.dates || []).map((date, index) => ({
    ...date,
    number: groupsDates.length + r16Dates.length + index + 1,
    label: date.label || t('quarterfinals'),
    stage: 'quarters'
  }));

  const semifinalsDates = (semifinalsSchedule?.dates || []).map((date, index) => ({
    ...date,
    number: groupsDates.length + r16Dates.length + quartersDates.length + index + 1,
    label: date.label || t('semifinals'),
    stage: 'semifinals'
  }));

  const thirdPlaceDates = (thirdPlaceSchedule?.dates || []).map((date, index) => ({
    ...date,
    number: groupsDates.length + r16Dates.length + quartersDates.length + semifinalsDates.length + index + 1,
    label: date.label || t('thirdPlace'),
    stage: 'thirdplace'
  }));

  const fifthPlaceDates = (fifthPlaceSchedule?.dates || []).map((date, index) => ({
    ...date,
    number: groupsDates.length + r16Dates.length + quartersDates.length + semifinalsDates.length + thirdPlaceDates.length + index + 1,
    label: date.label || t('fifthPlace'),
    stage: 'fifthplace'
  }));

  const finalDates = (finalSchedule?.dates || []).map((date, index) => ({
    ...date,
    number: groupsDates.length + r16Dates.length + quartersDates.length + semifinalsDates.length + thirdPlaceDates.length + fifthPlaceDates.length + index + 1,
    label: date.label || t('final'),
    stage: 'final'
  }));

  return normalizeResultsData({
    dates: [...groupsDates, ...r16Dates, ...quartersDates, ...semifinalsDates, ...thirdPlaceDates, ...fifthPlaceDates, ...finalDates]
  });
}

async function loadExternalMatchSchedule(){
  try{
    const loadSheet = (url, label) => fetchGvizSheetTable(url).catch(err => {
      console.warn('No se pudo cargar ' + label + '.', err);
      return null;
    });
    const [
      groupsTable, r16Table, r16OverrideTable,
      quartersTable, quartersOverrideTable,
      semifinalsTable, semifinalsOverrideTable,
      finalTable, finalOverrideTable, thirdPlaceTable, mysteryTable
    ] = await Promise.all([
      loadSheet(MATCH_SCHEDULE_GROUPS_SHEET_URL, 'Match Schedule (Groups)'),
      loadSheet(MATCH_SCHEDULE_ROUND_OF_16_SHEET_URL, 'Match Schedule (Round of 16)'),
      loadSheet(MATCH_SCHEDULE_ROUND_OF_16_OVERRIDE_URL, 'respaldo Round of 16'),
      loadSheet(MATCH_SCHEDULE_QUARTERS_SHEET_URL, 'Match Schedule (Quarter Finals)'),
      loadSheet(MATCH_SCHEDULE_QUARTERS_OVERRIDE_URL, 'respaldo Quarter Finals'),
      loadSheet(MATCH_SCHEDULE_SEMIFINALS_FIFTH_PLACE_SHEET_URL, 'Match Schedule (Semifinals / Fifth Place)'),
      loadSheet(MATCH_SCHEDULE_SEMIFINALS_OVERRIDE_URL, 'respaldo Semifinals'),
      loadSheet(MATCH_SCHEDULE_FINAL_SHEET_URL, 'Match Schedule (Final)'),
      loadSheet(MATCH_SCHEDULE_FINAL_OVERRIDE_URL, 'respaldo Final'),
      loadSheet(MATCH_SCHEDULE_THIRD_PLACE_OVERRIDE_URL, 'Match Schedule (Third Place)'),
      loadSheet(MATCH_SCHEDULE_MISTERY_SHEET_URL, 'Match Schedule (Mistery)')
    ]);
    const fifthPlaceTable = semifinalsTable;
    knockoutRunTimingsByStage = {
      quarters: resolveActiveKnockoutRunTimings(quartersOverrideTable),
      semifinals: resolveActiveKnockoutRunTimings(semifinalsOverrideTable),
      thirdplace: resolveActiveKnockoutRunTimings(thirdPlaceTable),
      final: resolveActiveKnockoutRunTimings(finalOverrideTable)
    };
    knockoutRunTimingsByPair = new Map(Object.values(knockoutRunTimingsByStage).flatMap(timings => [...timings]));
    externalMysteryMatches = parseMysteryScheduleTable(mysteryTable);
    const groupsSchedule = groupsTable
      ? parseMatchScheduleTable(groupsTable, { stage: 'groups' })
      : null;
    const r16Schedule = r16Table
      ? parseMatchScheduleTable(r16Table, {
          stage: 'r16',
          defaultGroup: 'R16',
          dateLabelPrefix: t('roundOf16')
        })
      : null;
    const r16OverrideMatches = parseStageOverrideMatches(r16OverrideTable, 'r16', 'R16', t('roundOf16'));
    const quartersSchedule = quartersTable
      ? parseMatchScheduleTable(quartersTable, {
          stage: 'quarters',
          defaultGroup: 'QF',
          dateLabelPrefix: t('quarterfinals')
        })
      : null;
    const semifinalsSchedule = (semifinalsTable || semifinalsOverrideTable)
      ? parseMatchScheduleTable(semifinalsTable || semifinalsOverrideTable, {
          stage: 'semifinals',
          defaultGroup: 'SF',
          dateLabelPrefix: t('semifinals'),
          roundIndexes: semifinalsTable ? [1] : null
        })
      : null;
    const finalSchedule = (finalTable || finalOverrideTable)
      ? parseMatchScheduleTable(finalTable || finalOverrideTable, {
          stage: 'final',
          defaultGroup: 'F',
          dateLabelPrefix: t('final')
        })
      : null;
    const thirdPlaceSchedule = thirdPlaceTable
      ? parseMatchScheduleTable(thirdPlaceTable, {
          stage: 'thirdplace',
          defaultGroup: 'THIRD_PLACE',
          dateLabelPrefix: t('thirdPlace')
        })
      : null;
      const fifthPlaceSchedule = fifthPlaceTable
        ? parseMatchScheduleTable(fifthPlaceTable, {
            stage: 'fifthplace',
            defaultGroup: 'FIFTH_PLACE',
            dateLabelPrefix: t('fifthPlace'),
            roundIndexes: [0]
          })
        : null;
      externalMatchSchedule = mergeMatchSchedules(groupsSchedule, r16Schedule, quartersSchedule, semifinalsSchedule, thirdPlaceSchedule, fifthPlaceSchedule, finalSchedule);
    applyStageRescheduleOverrides(externalMatchSchedule, 'r16', r16OverrideMatches, {
      includeMissing: Boolean(r16Schedule?.hasTbdDate)
    });
    const quartersOverrideMatches = parseStageOverrideMatches(quartersOverrideTable, 'quarters', 'QF', t('quarterfinals'));
    applyStageRescheduleOverrides(
      externalMatchSchedule,
      'quarters',
      quartersOverrideMatches,
      { includeMissing: Boolean(quartersSchedule?.hasTbdDate) }
    );
    addLocalMissingScheduleMatch(externalMatchSchedule, 'quarters', 'SonBeto', 'MattGael', quartersOverrideMatches);
    applyStageRescheduleOverrides(
      externalMatchSchedule,
      'semifinals',
      parseStageOverrideMatches(semifinalsOverrideTable, 'semifinals', 'SF', t('semifinals')),
      { includeMissing: Boolean(semifinalsSchedule?.hasTbdDate) }
    );
    applyStageRescheduleOverrides(
      externalMatchSchedule,
      'thirdplace',
      parseStageOverrideMatches(thirdPlaceTable, 'thirdplace', 'THIRD_PLACE', t('thirdPlace')),
      { includeMissing: Boolean(thirdPlaceSchedule?.hasTbdDate) }
    );
    applyStageRescheduleOverrides(
      externalMatchSchedule,
      'final',
      parseStageOverrideMatches(finalOverrideTable, 'final', 'F', t('final')),
      { includeMissing: Boolean(finalSchedule?.hasTbdDate) }
    );
    applyLocalMatchStageCorrections(externalMatchSchedule);
    return externalMatchSchedule;
  }catch(err){
    externalMatchSchedule = null;
    externalMysteryMatches = [];
    console.warn('No se pudo cargar Match Schedule desde Google Sheets.', err);
    return null;
  }
}

function isBetterCellBackground(background){
  const bg = String(background || '').trim().toLowerCase();
  if(!bg || bg === '#ffffff' || bg === '#fff' || bg === 'white' || bg === 'transparent') return false;
  // Amarillo puro del sheet (#ffff00) u otros amarillos cercanos
  if(bg === '#ffff00' || bg === 'rgb(255, 255, 0)' || bg === 'yellow') return false;
  // Verde puro del sheet (#00ff00) u otros verdes cercanos
  if(bg === '#00ff00' || bg === 'rgb(0, 255, 0)' || bg === 'green') return true;
  const hex = bg.match(/^#([0-9a-f]{3}|[0-9a-f]{6})$/i);
  if(!hex) return false;
  let r, g, b;
  if(hex[1].length === 3){
    r = parseInt(hex[1][0] + hex[1][0], 16);
    g = parseInt(hex[1][1] + hex[1][1], 16);
    b = parseInt(hex[1][2] + hex[1][2], 16);
  }else{
    r = parseInt(hex[1].slice(0, 2), 16);
    g = parseInt(hex[1].slice(2, 4), 16);
    b = parseInt(hex[1].slice(4, 6), 16);
  }
  // Verde dominante: G alto, R y B bajos
  return g >= 80 && r <= 80 && b <= 80;
}

function cellValue(cell){
  return String(cell?.value ?? '').trim();
}

function parseHeaderPlayerAndTime(label){
  const text = String(label || '').trim();
  const withoutMatch = text.replace(/^Match\s+\d+\s+/i, '').trim();
  const timeMatch = withoutMatch.match(/^(.*?)\s+((?:\d{1,2}:\d{2}(?:\.\d+)?)|DIED)$/i);
  if(timeMatch){
    return {
      name: timeMatch[1].trim(),
      time: timeMatch[2].toUpperCase() === 'DIED' ? 'DIED' : timeMatch[2]
    };
  }
  return { name: withoutMatch, time: null };
}

// Parseo del endpoint Apps Script: rows[i][j] = { value, background }
// Formato BO3/BO5 (varios mapas del mismo cruce en columnas consecutivas):
// row 0: Match 49, '', Match 50, '', Match 51, ...
// row 1: Jugador, playerA, playerB, playerA, playerB, ...
// row 2: Time, timeA, timeB, timeA, timeB, ...
// row 3+: segmento, valueA, valueB, valueA, valueB, ...
// Verde de fondo = mejor estadística de esa fila.
function parseMatchDetailsColorsPayload(payload){
  const sheets = payload?.sheets || [];
  const dates = sheets.map(sheet => sheet?.rows || []);
  const detailsMap = new Map();

  const pushGame = (map, playerA, playerB, game) => {
    const key = [normalizeManualMatchName(playerA), normalizeManualMatchName(playerB)].sort().join('|');
    let entry = map.get(key);
    if(!entry){
      entry = {
        playerA,
        playerB,
        timeA: game.timeA,
        timeB: game.timeB,
        timeABetter: game.timeABetter,
        timeBBetter: game.timeBBetter,
        segments: game.segments,
        games: []
      };
      map.set(key, entry);
    }
    entry.games.push(game);
    // Compat: primer juego como resumen si aún no había
    if(entry.games.length === 1){
      entry.timeA = game.timeA;
      entry.timeB = game.timeB;
      entry.timeABetter = game.timeABetter;
      entry.timeBBetter = game.timeBBetter;
      entry.segments = game.segments;
    }
  };

  for(const rows of dates){
    if(!rows || rows.length < 3) continue;

    const headerRow = rows[0] || [];
    const playerRow = rows[1] || [];
    const timeRow = rows[2] || [];
    const maxCols = Math.max(
      headerRow.length,
      playerRow.length,
      timeRow.length,
      ...rows.map(r => (r || []).length)
    );

    for(let colA = 1; colA + 1 < maxCols; colA += 2){
      const colB = colA + 1;
      const nameA = cellValue(playerRow[colA]);
      const nameB = cellValue(playerRow[colB]);
      if(!nameA || !nameB) continue;

      const playerA = normalizeSchedulePlayerName(nameA);
      const playerB = normalizeSchedulePlayerName(nameB);
      const timeARaw = cellValue(timeRow[colA]) || '-';
      const timeBRaw = cellValue(timeRow[colB]) || '-';
      const timeABetter = isBetterCellBackground(timeRow[colA]?.background);
      const timeBBetter = isBetterCellBackground(timeRow[colB]?.background);

      // Label "Match 49" suele estar en colA; si está vacío, mirar colA-1 o el texto de la fila 0
      let matchLabel = cellValue(headerRow[colA]) || cellValue(headerRow[colA - 1]) || cellValue(headerRow[colB]) || '';
      if(!matchLabel && headerRow[colA]?.value) matchLabel = String(headerRow[colA].value).trim();
      if(!/^match\s*\d+/i.test(matchLabel)){
        // Si el header de esta columna no es Match N, buscar en el bloque
        for(let c = colA; c >= Math.max(1, colA - 1); c--){
          const candidate = cellValue(headerRow[c]);
          if(/^match\s*\d+/i.test(candidate)){
            matchLabel = candidate;
            break;
          }
        }
      }

      const segments = [];
      for(let ri = 3; ri < rows.length; ri++){
        const row = rows[ri] || [];
        const label = cellValue(row[0]);
        if(!label) continue;
        // Saltar filas de encabezado repetidas
        if(/^jugador$/i.test(label) || /^time$/i.test(label)) continue;
        const valueA = cellValue(row[colA]) || '-';
        const valueB = cellValue(row[colB]) || '-';
        if(valueA === '-' && valueB === '-' && !cellValue(row[colA]) && !cellValue(row[colB])) continue;
        segments.push({
          label,
          valueA,
          valueB,
          betterA: isBetterCellBackground(row[colA]?.background),
          betterB: isBetterCellBackground(row[colB]?.background)
        });
      }

      pushGame(detailsMap, playerA, playerB, {
        matchLabel: matchLabel || null,
        timeA: timeARaw,
        timeB: timeBRaw,
        timeABetter,
        timeBBetter,
        segments
      });
    }
  }

  return detailsMap;
}

// Fallback gviz (sin colores de celda)
// Soporta el mismo layout horizontal: pares de columnas por mapa (Match 49/50/51...)
function parseMatchDetailsTable(table){
  const cols = table?.cols || [];
  const rows = table?.rows || [];
  const detailsMap = new Map();

  const pushGame = (playerA, playerB, game) => {
    const key = [normalizeManualMatchName(playerA), normalizeManualMatchName(playerB)].sort().join('|');
    let entry = detailsMap.get(key);
    if(!entry){
      entry = {
        playerA,
        playerB,
        timeA: game.timeA,
        timeB: game.timeB,
        timeABetter: false,
        timeBBetter: false,
        segments: game.segments,
        games: []
      };
      detailsMap.set(key, entry);
    }
    entry.games.push(game);
    if(entry.games.length === 1){
      entry.timeA = game.timeA;
      entry.timeB = game.timeB;
      entry.segments = game.segments;
    }
  };

  // Preferir filas Jugador/Time si existen (mismo formato que Apps Script)
  const labelOf = (row) => String(row?.c?.[0]?.v ?? row?.c?.[0]?.f ?? '').trim();
  let playerRowIndex = rows.findIndex(row => /^jugador$/i.test(labelOf(row)));
  let timeRowIndex = rows.findIndex(row => /^time$/i.test(labelOf(row)));

  if(playerRowIndex >= 0 && timeRowIndex >= 0){
    const playerRow = rows[playerRowIndex]?.c || [];
    const timeRow = rows[timeRowIndex]?.c || [];
    const maxCols = Math.max(playerRow.length, timeRow.length, cols.length);
    const headerRow = playerRowIndex > 0 ? (rows[playerRowIndex - 1]?.c || []) : [];

    for(let colA = 1; colA + 1 < maxCols; colA += 2){
      const colB = colA + 1;
      const nameA = String(playerRow[colA]?.v ?? playerRow[colA]?.f ?? '').trim();
      const nameB = String(playerRow[colB]?.v ?? playerRow[colB]?.f ?? '').trim();
      if(!nameA || !nameB) continue;

      const playerA = normalizeSchedulePlayerName(nameA);
      const playerB = normalizeSchedulePlayerName(nameB);
      const timeA = String(timeRow[colA]?.v ?? timeRow[colA]?.f ?? '').trim() || '-';
      const timeB = String(timeRow[colB]?.v ?? timeRow[colB]?.f ?? '').trim() || '-';
      let matchLabel = String(headerRow[colA]?.v ?? headerRow[colA]?.f ?? '').trim()
        || String(headerRow[colB]?.v ?? headerRow[colB]?.f ?? '').trim();

      const segments = [];
      rows.forEach((row, ri) => {
        if(ri === playerRowIndex || ri === timeRowIndex) return;
        const cells = row?.c || [];
        const label = String(cells[0]?.v ?? cells[0]?.f ?? '').trim();
        if(!label || /^jugador$/i.test(label) || /^time$/i.test(label)) return;
        const valueA = String(cells[colA]?.v ?? cells[colA]?.f ?? '').trim() || '-';
        const valueB = String(cells[colB]?.v ?? cells[colB]?.f ?? '').trim() || '-';
        if(valueA === '-' && valueB === '-' && !cells[colA] && !cells[colB]) return;
        segments.push({ label, valueA, valueB, betterA: false, betterB: false });
      });

      pushGame(playerA, playerB, {
        matchLabel: matchLabel || null,
        timeA,
        timeB,
        timeABetter: false,
        timeBBetter: false,
        segments
      });
    }
    return detailsMap;
  }

  // Fallback antiguo: nombres en headers de columna
  for(let colA = 1; colA + 1 < cols.length; colA += 2){
    const colB = colA + 1;
    const headerA = parseHeaderPlayerAndTime(cols[colA]?.label);
    const headerB = parseHeaderPlayerAndTime(cols[colB]?.label);
    if(!headerA.name || !headerB.name) continue;

    const playerA = normalizeSchedulePlayerName(headerA.name);
    const playerB = normalizeSchedulePlayerName(headerB.name);
    const timeA = headerA.time || '-';
    const timeB = headerB.time || '-';

    const segments = [];
    rows.forEach(row => {
      const cells = row?.c || [];
      const label = String(cells[0]?.v ?? cells[0]?.f ?? '').trim();
      if(!label) return;
      const valueA = String(cells[colA]?.v ?? cells[colA]?.f ?? '').trim() || '-';
      const valueB = String(cells[colB]?.v ?? cells[colB]?.f ?? '').trim() || '-';
      if(valueA === '-' && valueB === '-' && !cells[colA] && !cells[colB]) return;
      segments.push({ label, valueA, valueB, betterA: false, betterB: false });
    });

    pushGame(playerA, playerB, {
      matchLabel: null,
      timeA,
      timeB,
      timeABetter: false,
      timeBBetter: false,
      segments
    });
  }

  return detailsMap;
}

let pendingMatchDetailsModal = null; // { playerA, playerB, groupLetter }

async function loadExternalMatchDetails(){
  // 1) Preferir Apps Script (incluye colores rojos = mejor)
  try{
    const response = await fetch(MATCH_DETAILS_COLORS_URL, { cache: 'no-store' });
    if(!response.ok) throw new Error('HTTP ' + response.status);
    const payload = await response.json();
    const map = parseMatchDetailsColorsPayload(payload);
    if(map && map.size > 0){
      externalMatchDetails = map;
      if(pendingMatchDetailsModal){
        const { playerA, playerB, groupLetter } = pendingMatchDetailsModal;
        pendingMatchDetailsModal = null;
        openMatchDetailsModal(playerA, playerB, groupLetter);
      }
      if(lastLeaderboardSnapshot?.players){
        renderHomePanel(lastLeaderboardSnapshot.players);
      }
      renderStatsPanel();
      return externalMatchDetails;
    }
    throw new Error('Payload de colores vacío');
  }catch(err){
    console.warn('No se pudieron cargar Match Details con colores (Apps Script). Reintentando gviz…', err);
  }

  // 2) Fallback gviz
  try{
    const response = await fetch(MATCH_DETAILS_SHEET_URL, { cache: 'no-store' });
    if(!response.ok) throw new Error('HTTP ' + response.status);
    const text = await response.text();
    const jsonText = text.replace(/^\s*\/\*O_o\*\/\s*google\.visualization\.Query\.setResponse\(/, '').replace(/\);\s*$/, '');
    const table = JSON.parse(jsonText)?.table;
    externalMatchDetails = parseMatchDetailsTable(table);
    if(pendingMatchDetailsModal){
      const { playerA, playerB, groupLetter } = pendingMatchDetailsModal;
      pendingMatchDetailsModal = null;
      openMatchDetailsModal(playerA, playerB, groupLetter);
    }
    if(lastLeaderboardSnapshot?.players){
      renderHomePanel(lastLeaderboardSnapshot.players);
    }
    renderStatsPanel();
    return externalMatchDetails;
  }catch(err){
    externalMatchDetails = null;
    console.warn('No se pudo cargar Match Details desde Google Sheets.', err);
    if(pendingMatchDetailsModal){
      const { playerA, playerB, groupLetter } = pendingMatchDetailsModal;
      pendingMatchDetailsModal = null;
      openMatchDetailsModal(playerA, playerB, groupLetter);
    }
    return null;
  }
}

function getMatchDetailsForPlayers(playerA, playerB){
  if(!externalMatchDetails) return null;
  const key = [normalizeManualMatchName(playerA), normalizeManualMatchName(playerB)].sort().join('|');
  return externalMatchDetails.get(key) || null;
}

function isMatchDetailsLoading(){
  return !externalMatchDetails && externalMatchDetailsLoad != null;
}

function parsePbSeconds(value){
  const text = String(value || '').trim();
  if(!text || text === '-') return null;

  const parts = text.split(':');
  if(parts.length < 2 || parts.length > 3) return null;

  const minutesOrHours = Number(parts[0]);
  const seconds = Number(parts[1].replace(/[^0-9.].*$/, ''));
  if(!Number.isFinite(minutesOrHours) || !Number.isFinite(seconds)) return null;

  if(parts.length === 3){
    const hours = minutesOrHours;
    const minutes = Number(parts[1]);
    const finalSeconds = Number(parts[2].replace(/[^0-9.].*$/, ''));
    return Number.isFinite(minutes) && Number.isFinite(finalSeconds)
      ? hours * 3600 + minutes * 60 + finalSeconds
      : null;
  }

  return minutesOrHours * 60 + seconds;
}

function getStatsFlagMarkup(stats){
  const sheetFlag = String(stats?.flag || '').trim();
  if(sheetFlag){
    const flagMarkup = countryCodeToFlagMarkup(sheetFlag);
    if(flagMarkup) return flagMarkup;
  }
  return participantCountryFlag(lastLeaderboardSnapshot?.players || [], stats?.name) || '';
}

function isDeathStatValue(value){
  const text = String(value || '').trim().toUpperCase();
  return text === 'DEATH' || text === 'DIED' || /^DIED\b/.test(text);
}

/** Orden provisional de muertes: más temprano en la ruta = peor (menor índice).
 *  Se irán agregando entradas a medida que ocurran nuevas muertes. */
const DEATH_LOCATION_ORDER = [
  'nemy ct',
  '1st floor',
  'carlos',
  'hunter factory',
  'nemy acid',
  'neme acid',
  'nemy final'
];

function getDeathLocationRank(value){
  const text = String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  if(!isDeathStatValue(value)) return null;

  let best = Number.MAX_SAFE_INTEGER;
  DEATH_LOCATION_ORDER.forEach((keyword, index) => {
    if(text.includes(keyword) && index < best) best = index;
  });
  // Muertes sin keyword conocido: después de las conocidas, antes de tiempos completados
  return best === Number.MAX_SAFE_INTEGER ? DEATH_LOCATION_ORDER.length : best;
}

function sortStatsRows(rows, worstFirst){
  rows.sort((a, b) => {
    const aDeath = Boolean(a.isDeath);
    const bDeath = Boolean(b.isDeath);
    if(worstFirst){
      // DIED es peor que cualquier tiempo completado → va primero en "worst"
      if(aDeath && !bDeath) return -1;
      if(bDeath && !aDeath) return 1;
      if(aDeath && bDeath){
        const rankA = a.deathRank ?? getDeathLocationRank(a.value);
        const rankB = b.deathRank ?? getDeathLocationRank(b.value);
        if(rankA !== rankB) return rankA - rankB; // más temprano = peor
        return a.name.localeCompare(b.name);
      }
      if(a.seconds == null && b.seconds == null) return a.name.localeCompare(b.name);
      if(a.seconds == null) return 1;
      if(b.seconds == null) return -1;
      return b.seconds - a.seconds || a.name.localeCompare(b.name);
    }
    // Mejor primero: DIED al final; entre muertes, la más tardía es "mejor"
    if(aDeath && !bDeath) return 1;
    if(bDeath && !aDeath) return -1;
    if(aDeath && bDeath){
      const rankA = a.deathRank ?? getDeathLocationRank(a.value);
      const rankB = b.deathRank ?? getDeathLocationRank(b.value);
      if(rankA !== rankB) return rankB - rankA;
      return a.name.localeCompare(b.name);
    }
    if(a.seconds == null && b.seconds == null) return a.name.localeCompare(b.name);
    if(a.seconds == null) return 1;
    if(b.seconds == null) return -1;
    return a.seconds - b.seconds || a.name.localeCompare(b.name);
  });
  return rows;
}

function renderStatsRankingTable(container, rows, valueLabel){
  if(!rows.length){
    container.innerHTML = `<div class="loading">${t('noDataYet')}</div>`;
    return;
  }
  container.innerHTML = `<div class="stats-table-wrap"><table class="stats-table"><thead><tr><th>#</th><th>${t('player')}</th><th>${valueLabel}</th></tr></thead><tbody>${rows.map((row, index) => `
    <tr class="${index === 0 ? 'stats-first' : ''} ${index === rows.length - 1 ? 'stats-last' : ''}"><td class="stats-rank">${index + 1}</td><td class="stats-player"><button class="player-profile-button stats-player-button" type="button" data-player-name="${row.name}">${row.flag ? `<span class="flag">${row.flag}</span>` : ''}<span>${row.name}</span></button></td><td class="stats-value${row.seconds == null ? ' stats-missing' : ''}">${row.value || '-'}</td></tr>
  `).join('')}</tbody></table></div>`;
}

function parseWinLoss(value){
  const match = String(value || '').trim().match(/(\d+)\s*[-–—]\s*(\d+)/);
  if(!match) return null;
  return { wins: Number(match[1]), losses: Number(match[2]) };
}

function sortWinRateRows(rows){
  rows.sort((a, b) => {
    if(a.wins == null && b.wins == null) return a.name.localeCompare(b.name);
    if(a.wins == null) return 1;
    if(b.wins == null) return -1;
    if(b.wins !== a.wins) return b.wins - a.wins;
    if(a.losses !== b.losses) return a.losses - b.losses;
    // Empate en W-L: decide Tournament Best (menor tiempo gana)
    if(a.tournamentBestSeconds == null && b.tournamentBestSeconds == null) return a.name.localeCompare(b.name);
    if(a.tournamentBestSeconds == null) return 1;
    if(b.tournamentBestSeconds == null) return -1;
    if(a.tournamentBestSeconds !== b.tournamentBestSeconds){
      return a.tournamentBestSeconds - b.tournamentBestSeconds;
    }
    return a.name.localeCompare(b.name);
  });
  return rows;
}

function getFinalRankingTierClass(ranking){
  const text = String(ranking || '').trim().toLowerCase().replace(/\s+/g, ' ');
  if(!text) return '';
  if(/^top\s*1$/.test(text) || text === '1') return 'tier-top1';
  if(/^top\s*2$/.test(text) || text === '2') return 'tier-top2';
  if(/^top\s*3$/.test(text) || text === '3') return 'tier-top3';
  if(/^top\s*4$/.test(text) || text === '4') return 'tier-top4';
  if(/5\s*[-–—]\s*8/.test(text) || text === 'top 5-8') return 'tier-top5-8';
  if(/9\s*[-–—]\s*16/.test(text) || text === 'top 9-16') return 'tier-top9-16';
  if(/17\s*[-–—]\s*24/.test(text) || text === 'top 17-24') return 'tier-top17-24';
  if(/25\s*[-–—]\s*32/.test(text) || text === 'top 25-32') return 'tier-top25-32';
  return '';
}

function renderFinalTableStats(container){
  if(!externalFinalTable.length){
    container.innerHTML = `<div class="loading">${t('statsLoadError')}</div>`;
    return;
  }

  const header = `
    <tr>
      <th>${t('position')}</th>
      <th>${t('player')}</th>
      <th>${t('statsFinalBestTime')}</th>
      <th>${t('statsFinalWorstTime')}</th>
      <th>${t('statsFinalDiffPb')}</th>
      <th>${t('statsFinalTotalRuns')}</th>
      <th>${t('statsFinalFinishedRuns')}</th>
      <th>${t('colWins')}</th>
      <th>${t('colLosses')}</th>
      <th>${t('statsFinalWinPct')}</th>
    </tr>`;

  const body = externalFinalTable.map(row => {
    const flag = row.flag
      ? (countryCodeToFlagMarkup(row.flag) || '')
      : (row.name ? getStatsFlagMarkup({ name: row.name, flag: row.flag }) : '');
    const playerCell = row.isPlaceholder
      ? `<span class="pending-player">—</span>`
      : `<button class="player-profile-button stats-player-button" type="button" data-player-name="${row.name}">${flag ? `<span class="flag">${flag}</span>` : ''}<span>${row.name}</span></button>`;
    const tierClass = getFinalRankingTierClass(row.ranking);
    const rowClass = [tierClass, row.isPlaceholder ? 'stats-final-placeholder' : ''].filter(Boolean).join(' ');
    return `<tr class="${rowClass}">
      <td class="stats-final-rank">${row.ranking || '—'}</td>
      <td class="stats-player">${playerCell}</td>
      <td class="stats-value">${row.bestTime || '—'}</td>
      <td class="stats-value">${row.worstTime || '—'}</td>
      <td class="stats-final-diff">${row.diffPb || '—'}</td>
      <td>${row.totalRuns || '—'}</td>
      <td>${row.finishedRuns || '—'}</td>
      <td>${row.wins || '—'}</td>
      <td>${row.losses || '—'}</td>
      <td>${row.winPct || '—'}</td>
    </tr>`;
  }).join('');

  container.innerHTML = `<div class="stats-table-wrap"><table class="stats-table stats-final-table"><thead>${header}</thead><tbody>${body}</tbody></table></div>`;
}

function renderTournamentWideStats(container, metric){
  if(!externalPlayerStats.size){
    container.innerHTML = `<div class="loading">${t('statsLoadError')}</div>`;
    return;
  }

  if(metric === 'win-rate'){
    const rows = sortWinRateRows([...externalPlayerStats.values()].map(stats => {
      const parsed = parseWinLoss(stats.winLoss);
      return {
        name: stats.name,
        flag: getStatsFlagMarkup(stats),
        value: stats.winLoss || '-',
        wins: parsed ? parsed.wins : null,
        losses: parsed ? parsed.losses : null,
        tournamentBestSeconds: parsePbSeconds(stats.tournamentBest),
        seconds: null
      };
    }).filter(row => row.value && row.value !== '-'));
    renderStatsRankingTable(container, rows, t('statsWinRate'));
    return;
  }

  const key = 'overallPb';
  const labelKey = 'statsOverallPb';
  const rows = sortStatsRows([...externalPlayerStats.values()].map(stats => {
    const raw = stats[key] || '-';
    return {
      name: stats.name,
      flag: getStatsFlagMarkup(stats),
      value: raw,
      seconds: parsePbSeconds(raw),
      isDeath: isDeathStatValue(raw)
    };
  }), false);
  renderStatsRankingTable(container, rows, t(labelKey));
}

function playersShareGroup(playerA, playerB){
  const a = normalizeParticipantName(playerA);
  const b = normalizeParticipantName(playerB);
  if(!a || !b || a === b) return false;
  return Object.values(FINAL_GROUPS).some(members => {
    const names = members.map(normalizeParticipantName);
    return names.includes(a) && names.includes(b);
  });
}

function pushStatCandidate(byPlayer, name, flag, raw){
  const textVal = String(raw || '').trim();
  if(!textVal || textVal === '-') return;
  const key = normalizeParticipantName(name);
  if(!key) return;
  let entry = byPlayer.get(key);
  if(!entry){
    entry = { name, flag: flag || '', values: [] };
    byPlayer.set(key, entry);
  }else if(!entry.flag && flag){
    entry.flag = flag;
  }
  if(!entry.values.includes(textVal)) entry.values.push(textVal);
}

function metricKindFromId(metricId){
  if(metricId === 'basement-pb' || metricId === 'worst-basement') return 'basement';
  if(metricId === 'train-crash-pb' || metricId === 'worst-train-crash') return 'trainCrash';
  if(metricId === 'tournament-best' || metricId === 'worst-tournament-best') return 'time';
  return null;
}

function extractDetailMetricForSide(game, side, kind){
  if(!game) return '';
  if(kind === 'time'){
    return side === 'A' ? (game.timeA || '') : (game.timeB || '');
  }
  const segments = Array.isArray(game.segments) ? game.segments : [];
  const labelMatch = kind === 'basement'
    ? /^basement$/i
    : /train\s*crash|^tc$/i;
  const seg = segments.find(s => labelMatch.test(String(s.label || '').trim()));
  if(!seg) return '';
  return side === 'A' ? (seg.valueA || '') : (seg.valueB || '');
}

/** Valores por jugador desde Match Details. pairFilter(a,b) → true para incluir el cruce. */
function collectMetricsFromMatchDetails(metricId, pairFilter){
  const byPlayer = new Map();
  const kind = metricKindFromId(metricId);
  if(!kind || !externalMatchDetails || typeof externalMatchDetails.values !== 'function') return byPlayer;

  for(const entry of externalMatchDetails.values()){
    const playerA = entry.playerA;
    const playerB = entry.playerB;
    if(!playerA || !playerB) continue;
    if(typeof pairFilter === 'function' && !pairFilter(playerA, playerB)) continue;

    const games = Array.isArray(entry.games) && entry.games.length
      ? entry.games
      : [{ timeA: entry.timeA, timeB: entry.timeB, segments: entry.segments || [] }];

    for(const game of games){
      pushStatCandidate(byPlayer, playerA, null, extractDetailMetricForSide(game, 'A', kind));
      pushStatCandidate(byPlayer, playerB, null, extractDetailMetricForSide(game, 'B', kind));
    }
  }
  return byPlayer;
}

function collectKnockoutSheetMetrics(metricId){
  const byPlayer = new Map();
  const kind = metricKindFromId(metricId);
  if(!kind) return byPlayer;

  for(const stageKey of ['ro16', 'qf', 'sf', 'final']){
    const stageMap = externalKnockoutStats[stageKey];
    if(!stageMap || typeof stageMap.values !== 'function') continue;
    for(const stats of stageMap.values()){
      const matches = stats.matches || {};
      for(let m = 1; m <= 5; m++){
        const match = matches[m] || matches[String(m)];
        if(!match) continue;
        if(kind === 'basement') pushStatCandidate(byPlayer, stats.name, stats.flag, match.basement);
        else if(kind === 'trainCrash') pushStatCandidate(byPlayer, stats.name, stats.flag, match.trainCrash);
        else if(kind === 'time') pushStatCandidate(byPlayer, stats.name, stats.flag, match.time);
      }
    }
  }
  return byPlayer;
}

function mergeStatCandidateMaps(...maps){
  const merged = new Map();
  for(const map of maps){
    if(!map) continue;
    for(const [key, entry] of map.entries()){
      for(const value of entry.values){
        pushStatCandidate(merged, entry.name, entry.flag, value);
      }
    }
  }
  return merged;
}

/** Solo fase de grupos: partidos entre jugadores del mismo grupo (Match Details). */
function collectGroupStageMetricCandidates(metricId){
  const fromDetails = collectMetricsFromMatchDetails(metricId, playersShareGroup);
  // Si no hay details aún, no usar STATS_SHEET "best" (puede incluir eliminatorias).
  // Solo rellenar jugadores sin ningún valor de details con la hoja, como último recurso.
  const kind = metricKindFromId(metricId);
  const wantWorst = String(metricId || '').startsWith('worst');
  for(const stats of externalPlayerStats.values()){
    const key = normalizeParticipantName(stats.name);
    if(fromDetails.has(key) && fromDetails.get(key).values.length) continue;
    let raw = '';
    if(kind === 'basement') raw = wantWorst ? stats.worstBasement : stats.basementPb;
    else if(kind === 'trainCrash') raw = wantWorst ? stats.worstTC : stats.trainCrash;
    else if(kind === 'time') raw = wantWorst ? stats.worstTB : stats.tournamentBest;
    pushStatCandidate(fromDetails, stats.name, stats.flag, raw);
  }
  return fromDetails;
}

/** Todo el torneo: hoja STATS_SHEET (best/worst globales del torneo).
 *  No usa Match Details — esa fuente queda solo para Fase de Grupos. */
function collectTournamentMetricCandidates(metricId){
  const fromSummary = new Map();
  const kind = metricKindFromId(metricId);
  const wantWorst = String(metricId || '').startsWith('worst');

  for(const stats of externalPlayerStats.values()){
    let raw = '';
    if(kind === 'basement') raw = wantWorst ? stats.worstBasement : stats.basementPb;
    else if(kind === 'trainCrash') raw = wantWorst ? stats.worstTC : stats.trainCrash;
    else if(kind === 'time') raw = wantWorst ? stats.worstTB : stats.tournamentBest;
    pushStatCandidate(fromSummary, stats.name, stats.flag, raw);
  }

  return fromSummary;
}

function pickTournamentValue(values, worstFirst){
  if(!values.length) return null;
  const rows = values.map(raw => {
    const death = isDeathStatValue(raw);
    return {
      value: raw,
      seconds: parsePbSeconds(raw),
      isDeath: death,
      deathRank: death ? getDeathLocationRank(raw) : null,
      name: ''
    };
  });
  sortStatsRows(rows, worstFirst);
  return rows[0]?.value || null;
}

function renderTournamentStageStats(container){
  const statDefinitions = {
    'basement-pb': { labelKey: 'statsBasementPb', worst: false },
    'train-crash-pb': { labelKey: 'statsTrainCrashPb', worst: false },
    'tournament-best': { labelKey: 'statsTournamentBest', worst: false },
    'worst-basement': { labelKey: 'statsWorstBasement', worst: true },
    'worst-train-crash': { labelKey: 'statsWorstTrainCrash', worst: true },
    'worst-tournament-best': { labelKey: 'statsWorstCompleteRun', worst: true }
  };
  const metricId = statsUiState.groupMetric;
  const definition = statDefinitions[metricId] || statDefinitions['basement-pb'];
  const byPlayer = collectTournamentMetricCandidates(metricId);

  if(!byPlayer.size){
    container.innerHTML = `<div class="loading">${t('statsComingSoon')}</div>`;
    return;
  }

  const rows = sortStatsRows([...byPlayer.values()].map(entry => {
    const picked = pickTournamentValue(entry.values, definition.worst);
    if(!picked) return null;
    const death = isDeathStatValue(picked);
    return {
      name: entry.name,
      flag: getStatsFlagMarkup({ name: entry.name, flag: entry.flag }),
      value: picked,
      seconds: parsePbSeconds(picked),
      isDeath: death,
      deathRank: death ? getDeathLocationRank(picked) : null
    };
  }).filter(Boolean), definition.worst);

  if(!rows.length){
    container.innerHTML = `<div class="loading">${t('noDataYet')}</div>`;
    return;
  }
  renderStatsRankingTable(container, rows, t(definition.labelKey));
}

function renderGroupStageStats(container){
  // Solo partidos de fase de grupos (mismo grupo en Match Details)
  const statDefinitions = {
    'basement-pb': { labelKey: 'statsBasementPb', worst: false },
    'train-crash-pb': { labelKey: 'statsTrainCrashPb', worst: false },
    'tournament-best': { labelKey: 'statsTournamentBest', worst: false },
    'worst-basement': { labelKey: 'statsWorstBasement', worst: true },
    'worst-train-crash': { labelKey: 'statsWorstTrainCrash', worst: true },
    'worst-tournament-best': { labelKey: 'statsWorstCompleteRun', worst: true }
  };
  const metricId = statsUiState.groupMetric;
  const definition = statDefinitions[metricId] || statDefinitions['basement-pb'];
  const byPlayer = collectGroupStageMetricCandidates(metricId);

  if(!byPlayer.size){
    container.innerHTML = `<div class="loading">${externalMatchDetails ? t('noDataYet') : t('loadingStats')}</div>`;
    return;
  }

  const rows = sortStatsRows([...byPlayer.values()].map(entry => {
    const picked = pickTournamentValue(entry.values, definition.worst);
    if(!picked) return null;
    const death = isDeathStatValue(picked);
    return {
      name: entry.name,
      flag: getStatsFlagMarkup({ name: entry.name, flag: entry.flag }),
      value: picked,
      seconds: parsePbSeconds(picked),
      isDeath: death,
      deathRank: death ? getDeathLocationRank(picked) : null
    };
  }).filter(Boolean), definition.worst);

  if(!rows.length){
    container.innerHTML = `<div class="loading">${t('noDataYet')}</div>`;
    return;
  }
  renderStatsRankingTable(container, rows, t(definition.labelKey));
}

function renderKnockoutStageStats(container, stageKey){
  const stageMap = externalKnockoutStats[stageKey] || new Map();
  if(!stageMap.size){
    container.innerHTML = `<div class="loading">${t('statsComingSoon')}</div>`;
    return;
  }
  const matchNum = statsUiState.knockoutMatch;
  const metric = statsUiState.knockoutMetric;
  const metricKey = metric === 'train-crash' ? 'trainCrash' : metric;
  const labelKey = metric === 'basement' ? 'statsBasement'
    : metric === 'train-crash' ? 'statsTrainCrash'
    : 'statsTime';

  const rows = sortStatsRows([...stageMap.values()].map(stats => {
    const matchData = stats.matches?.[matchNum] || {};
    const value = matchData[metricKey] || '';
    return {
      name: stats.name,
      flag: getStatsFlagMarkup(stats),
      value: value || '-',
      seconds: parsePbSeconds(value),
      isDeath: isDeathStatValue(value)
    };
  }).filter(row => row.value && row.value !== '-'), false);

  if(!rows.length){
    container.innerHTML = `<div class="loading">${t('noDataYet')}</div>`;
    return;
  }
  renderStatsRankingTable(container, rows, t(labelKey));
}

function compareDualPbField(a, b, field, dir){
  // field: 'best' | 'worst'
  // dir: 'asc' = mejor primero (tiempo más bajo; DIED al final)
  //      'desc' = peor primero (DIED primero; tiempo más alto)
  const valueKey = field === 'worst' ? 'worstValue' : 'bestValue';
  const secondsKey = field === 'worst' ? 'worstSeconds' : 'bestSeconds';
  const deathKey = field === 'worst' ? 'worstIsDeath' : 'bestIsDeath';
  const deathRankKey = field === 'worst' ? 'worstDeathRank' : 'bestDeathRank';

  const aDeath = Boolean(a[deathKey]);
  const bDeath = Boolean(b[deathKey]);
  const aSec = a[secondsKey];
  const bSec = b[secondsKey];
  const nameCmp = () => a.name.localeCompare(b.name);

  if(dir === 'desc'){
    // Peor primero
    if(aDeath && !bDeath) return -1;
    if(bDeath && !aDeath) return 1;
    if(aDeath && bDeath){
      const rankA = a[deathRankKey] ?? getDeathLocationRank(a[valueKey]);
      const rankB = b[deathRankKey] ?? getDeathLocationRank(b[valueKey]);
      if(rankA !== rankB) return rankA - rankB;
      return nameCmp();
    }
    if(aSec == null && bSec == null) return nameCmp();
    if(aSec == null) return 1;
    if(bSec == null) return -1;
    return bSec - aSec || nameCmp();
  }

  // Ascendente: mejor primero
  if(aDeath && !bDeath) return 1;
  if(bDeath && !aDeath) return -1;
  if(aDeath && bDeath){
    const rankA = a[deathRankKey] ?? getDeathLocationRank(a[valueKey]);
    const rankB = b[deathRankKey] ?? getDeathLocationRank(b[valueKey]);
    if(rankA !== rankB) return rankB - rankA;
    return nameCmp();
  }
  if(aSec == null && bSec == null) return nameCmp();
  if(aSec == null) return 1;
  if(bSec == null) return -1;
  return aSec - bSec || nameCmp();
}

function sortDualPbRows(rows, sortBy, sortDir){
  rows.sort((a, b) => compareDualPbField(a, b, sortBy, sortDir));
  return rows;
}

function renderDualPbStats(container, stage){
  // stage: basement-pb | traincrash-pb | tournament-pb
  // Datos desde STATS_SHEET (externalPlayerStats)
  const fieldMap = {
    'basement-pb': { best: 'basementPb', worst: 'worstBasement', titleKey: 'statsBasementPb' },
    'traincrash-pb': { best: 'trainCrash', worst: 'worstTC', titleKey: 'statsTrainCrashPb' },
    'tournament-pb': { best: 'tournamentBest', worst: 'worstTB', titleKey: 'statsTournamentPb' }
  };
  const fields = fieldMap[stage] || fieldMap['basement-pb'];

  if(!externalPlayerStats.size){
    container.innerHTML = `<div class="loading">${t('statsLoadError')}</div>`;
    return;
  }

  if(statsUiState.dualSortBy !== 'best' && statsUiState.dualSortBy !== 'worst'){
    statsUiState.dualSortBy = 'best';
  }
  if(statsUiState.dualSortDir !== 'asc' && statsUiState.dualSortDir !== 'desc'){
    statsUiState.dualSortDir = 'asc';
  }

  const rows = sortDualPbRows([...externalPlayerStats.values()].map(stats => {
    const bestRaw = stats[fields.best] || '-';
    const worstRaw = stats[fields.worst] || '-';
    const bestDeath = isDeathStatValue(bestRaw);
    const worstDeath = isDeathStatValue(worstRaw);
    return {
      name: stats.name,
      flag: getStatsFlagMarkup(stats),
      bestValue: bestRaw,
      bestSeconds: parsePbSeconds(bestRaw),
      bestIsDeath: bestDeath,
      bestDeathRank: bestDeath ? getDeathLocationRank(bestRaw) : null,
      worstValue: worstRaw,
      worstSeconds: parsePbSeconds(worstRaw),
      worstIsDeath: worstDeath,
      worstDeathRank: worstDeath ? getDeathLocationRank(worstRaw) : null
    };
  }).filter(row => (row.bestValue && row.bestValue !== '-') || (row.worstValue && row.worstValue !== '-')),
  statsUiState.dualSortBy,
  statsUiState.dualSortDir);

  if(!rows.length){
    container.innerHTML = `<div class="loading">${t('noDataYet')}</div>`;
    return;
  }

  const sortBy = statsUiState.dualSortBy;
  const sortDir = statsUiState.dualSortDir;
  const arrow = sortDir === 'asc' ? '▲' : '▼';

  const header = `
    <tr>
      <th>#</th>
      <th>${t('player')}</th>
      <th class="stats-sortable${sortBy === 'best' ? ' is-sorted' : ''}" data-sort-by="best">${t('statsBestPb')}${sortBy === 'best' ? ` ${arrow}` : ''}</th>
      <th class="stats-sortable${sortBy === 'worst' ? ' is-sorted' : ''}" data-sort-by="worst">${t('statsWorstPb')}${sortBy === 'worst' ? ` ${arrow}` : ''}</th>
    </tr>`;

  const body = rows.map((row, index) => {
    const bestMissing = row.bestSeconds == null && !row.bestIsDeath;
    const worstMissing = row.worstSeconds == null && !row.worstIsDeath;
    return `<tr class="${index === 0 ? 'stats-first' : ''} ${index === rows.length - 1 ? 'stats-last' : ''}">
      <td class="stats-rank">${index + 1}</td>
      <td class="stats-player"><button class="player-profile-button stats-player-button" type="button" data-player-name="${row.name}">${row.flag ? `<span class="flag">${row.flag}</span>` : ''}<span>${row.name}</span></button></td>
      <td class="stats-value${bestMissing ? ' stats-missing' : ''}${sortBy === 'best' ? ' stats-sorted-col' : ''}">${row.bestValue || '-'}</td>
      <td class="stats-value${worstMissing ? ' stats-missing' : ''}${sortBy === 'worst' ? ' stats-sorted-col' : ''}">${row.worstValue || '-'}</td>
    </tr>`;
  }).join('');

  container.innerHTML = `<div class="stats-table-wrap"><table class="stats-table stats-dual-table"><thead>${header}</thead><tbody>${body}</tbody></table></div>`;

  container.querySelectorAll('[data-sort-by]').forEach(el => {
    el.addEventListener('click', () => {
      const next = el.getAttribute('data-sort-by');
      if(statsUiState.dualSortBy === next){
        statsUiState.dualSortDir = statsUiState.dualSortDir === 'asc' ? 'desc' : 'asc';
      }else{
        statsUiState.dualSortBy = next;
        statsUiState.dualSortDir = next === 'worst' ? 'desc' : 'asc';
      }
      renderStatsPanel();
    });
  });
  container.querySelector('[data-sort-dir-toggle]')?.addEventListener('click', () => {
    statsUiState.dualSortDir = statsUiState.dualSortDir === 'asc' ? 'desc' : 'asc';
    renderStatsPanel();
  });
}

function buildStatsSubtabs(){
  const subtabs = document.getElementById('stats-subtabs');
  const matchTabs = document.getElementById('stats-match-tabs');
  if(!subtabs || !matchTabs) return;
  matchTabs.hidden = true;
  matchTabs.innerHTML = '';
  subtabs.innerHTML = '';
}

function renderStatsPanel(){
  const container = document.getElementById('stats-content');
  if(!container) return;

  document.querySelectorAll('.stats-stage-button').forEach(button => {
    if(button.dataset.bound) return;
    button.addEventListener('click', () => {
      statsUiState.stage = button.dataset.statsStage;
      if(statsUiState.stage === 'basement-pb' || statsUiState.stage === 'traincrash-pb' || statsUiState.stage === 'tournament-pb'){
        statsUiState.dualSortBy = 'best';
        statsUiState.dualSortDir = 'asc';
      }
      renderStatsPanel();
    });
    button.dataset.bound = 'true';
  });

  document.querySelectorAll('.stats-stage-button').forEach(button => {
    button.classList.toggle('active', button.dataset.statsStage === statsUiState.stage);
  });

  buildStatsSubtabs();

  const stage = statsUiState.stage;
  if(stage === 'overall' || stage === 'win-rate'){
    renderTournamentWideStats(container, stage);
  }else if(stage === 'tabla-final'){
    renderFinalTableStats(container);
  }else if(stage === 'basement-pb' || stage === 'traincrash-pb' || stage === 'tournament-pb'){
    renderDualPbStats(container, stage);
  }else{
    // Fases eliminadas: redirigir a overall
    statsUiState.stage = 'overall';
    renderTournamentWideStats(container, 'overall');
  }
}

function normalizeResultsData(rawResults){
  if(Array.isArray(rawResults)) return { matches: rawResults };

  if(rawResults && Array.isArray(rawResults.dates)){
    const dates = rawResults.dates.map((date, index) => {
      const number = Number(date.number || date.numero || index + 1);
      const stage = date.stage || null;
      const directMatches = Array.isArray(date.matches) ? date.matches : [];
      const groupMatches = Array.isArray(date.groups)
        ? date.groups.flatMap(group => (Array.isArray(group.matches) ? group.matches : [])
          .map(match => ({
            ...match,
            group: match.group || match.grupo || group.name || group.group,
            stage: match.stage || stage
          })))
        : [];
      // Si ya existen matches aplanados Y groups, no concatenar ambos (doble conteo al re-normalizar).
      // Preferir groups como fuente cuando está presente; si no, usar matches.
      const sourceMatches = groupMatches.length > 0 ? groupMatches : directMatches;
      const matches = sourceMatches.map(match => ({
        ...match,
        stage: match.stage || stage,
        fixtureDateNumber: number
      }));
      return {
        ...date,
        number,
        stage,
        label: date.label || `${t('dateLabel')} ${number} ${t('of')} ${rawResults.dates.length}`,
        matches
      };
    });

    return {
      ...rawResults,
      dates,
      matches: dates.flatMap(date => date.matches)
    };
  }

  return rawResults && Array.isArray(rawResults.matches)
    ? { ...rawResults, matches: rawResults.matches }
    : null;
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

  const targetWins = getKnockoutSeriesTarget(match.stage, match.group);
  const hasSeriesScore = match.seriesScoreA != null && match.seriesScoreB != null
    && String(match.seriesScoreA).trim() !== '' && String(match.seriesScoreB).trim() !== '';

  // En BO3/BO5, una ventaja de un mapa no concluye la serie.
  if(targetWins != null && hasSeriesScore){
    const sA = Number(match.seriesScoreA);
    const sB = Number(match.seriesScoreB);
    if(!Number.isFinite(sA) || !Number.isFinite(sB) || (sA < targetWins && sB < targetWins)) return null;
    const sameOrder = normalizeManualMatchName(match.playerA || match.jugadorA || match.a) === normalizeManualMatchName(playerA);
    if(sameOrder) return sA > sB ? playerA : playerB;
    return sA > sB ? playerB : playerA;
  }
  if(targetWins != null){
    if(!match.winner) return null;
    return normalizeManualMatchName(match.winner) === normalizeManualMatchName(playerA)
      ? playerA
      : normalizeManualMatchName(match.winner) === normalizeManualMatchName(playerB)
        ? playerB
        : null;
  }

  const rawTimeA = match.timeA ?? match.tiempoA ?? match.time_a ?? match.times?.[playerA] ?? match.result?.timeA ?? match.result?.[playerA];
  const rawTimeB = match.timeB ?? match.tiempoB ?? match.time_b ?? match.times?.[playerB] ?? match.result?.timeB ?? match.result?.[playerB];
  const timeA = parseManualTime(rawTimeA);
  const timeB = parseManualTime(rawTimeB);
  const isDeathA = /^(DEAD|DEATH|DIED)\b/i.test(String(rawTimeA ?? '').trim());
  const isDeathB = /^(DEAD|DEATH|DIED)\b/i.test(String(rawTimeB ?? '').trim());

  // Un tiempo registrado siempre supera a DEATH, aunque winner venga informado.
  if(isDeathA && !isDeathB && timeB != null) return playerB;
  if(isDeathB && !isDeathA && timeA != null) return playerA;

  if(match.winner){
    return match.winner === playerA || normalizeManualMatchName(match.winner) === normalizeManualMatchName(playerA)
      ? playerA
      : match.winner === playerB || normalizeManualMatchName(match.winner) === normalizeManualMatchName(playerB)
        ? playerB
        : null;
  }

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
    const isDeathA = String(timeARaw ?? '').trim().toUpperCase() === 'DEATH';
    const isDeathB = String(timeBRaw ?? '').trim().toUpperCase() === 'DEATH';
    if(timeA != null) {
      entryA.lastTime = timeA;
      entryA.bestTimeLabel = null;
      entryA.bestTime = entryA.bestTime == null ? timeA : Math.min(entryA.bestTime, timeA);
    }else if(isDeathA && entryA.bestTime == null){
      entryA.bestTimeLabel = 'DEATH';
    }
    if(timeB != null) {
      entryB.lastTime = timeB;
      entryB.bestTimeLabel = null;
      entryB.bestTime = entryB.bestTime == null ? timeB : Math.min(entryB.bestTime, timeB);
    }else if(isDeathB && entryB.bestTime == null){
      entryB.bestTimeLabel = 'DEATH';
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
  return uploadedResults || externalMatchSchedule || getStoredResults() || null;
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
        renderEliminatoriasPanel(lastLeaderboardSnapshot.runs, lastLeaderboardSnapshot.players);
        renderPrediccionesPanel(lastLeaderboardSnapshot.players);
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
        renderEliminatoriasPanel(lastLeaderboardSnapshot.runs, lastLeaderboardSnapshot.players);
        renderPrediccionesPanel(lastLeaderboardSnapshot.players);
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
    if(json && (Array.isArray(json.matches) || Array.isArray(json.dates) || Array.isArray(json))) {
      return normalizeResultsData(json);
    }
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

  return normalizeResultsData({ matches: rows.map(row => ({
    group: row.group || row.grupo || row.round,
    playerA: row.playera || row.player_a || row.a || row.teama || row.teama,
    playerB: row.playerb || row.player_b || row.b || row.teamb || row.teamb,
    timeA: row.timea || row.time_a || row.tiempoa || row.tiempo_a,
    timeB: row.timeb || row.time_b || row.tiempob || row.tiempo_b,
    winner: row.winner || row.ganador || row.result,
    date: row.date || row.fecha,
    time: row.time || row.horario || row.schedule
  })) });
}

function getPlayerName(run, playersData){
  const p = run.run.players[0];
  if(p.rel === "guest") return p.name;
  const found = playersData.find(pl => pl.id === p.id);
  return found ? found.names.international : "Unknown";
}

function countryCodeToFlagMarkup(countryCode){
  if(!countryCode) return null;

  const code = countryCode.toUpperCase();
  if(code.length !== 2 || !/^[A-Z]{2}$/.test(code)) return null;

  return `<img class="flag-image" src="https://flagcdn.com/24x18/${code.toLowerCase()}.png" alt="Bandera de ${code}" loading="lazy">`;
}

function countryFlag(playersData, playerId){
  const found = playersData.find(pl => pl.id === playerId);
  if(found && found.location && found.location.country){
    return countryCodeToFlagMarkup(found.location.country.code);
  }
  return null;
}

function participantCountryFlag(players, name){
  const profile = resolvePlayerByName(players, name);
  const profileFlag = profile ? countryFlag(players, profile.id) : null;
  if(profileFlag) return profileFlag;

  const countryCode = PLAYER_COUNTRY_FALLBACKS[normalizeParticipantName(name)];
  return countryCode ? countryCodeToFlagMarkup(countryCode) : null;
}

function formatDate(value){
  if(!value) return t('notAvailable');
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
    const rawValue = player[key];
    const value = typeof rawValue === 'string' ? rawValue.trim() : rawValue?.uri;
    if(value && String(value).trim() !== '') {
      channelMap.push({ label, href: String(value).trim(), rel: key });
    }
  });

  return channelMap;
}

async function getCategoryName(categoryId){
  if(!categoryId) return t('category');

  if(categoryCache.has(categoryId)){
    return categoryCache.get(categoryId);
  }
  if(categoryNameRequests.has(categoryId)){
    return categoryNameRequests.get(categoryId);
  }

  const request = (async () => {
    const url = 'https://www.speedrun.com/api/v1/categories/' + encodeURIComponent(categoryId);
    try{
      const json = await fetchJson(url);
      const name = json && json.data && json.data.name
        ? json.data.name
        : categoryId;
      categoryCache.set(categoryId, name);
      return name;
    }catch(err){
      categoryCache.set(categoryId, categoryId);
      return categoryId;
    }finally{
      categoryNameRequests.delete(categoryId);
    }
  })();
  categoryNameRequests.set(categoryId, request);
  return request;
}

async function getGameName(gameId){
  if(!gameId) return t('game');

  if(gameCache.has(gameId)){
    return gameCache.get(gameId);
  }
  if(gameNameRequests.has(gameId)){
    return gameNameRequests.get(gameId);
  }

  const request = (async () => {
    const url = 'https://www.speedrun.com/api/v1/games/' + encodeURIComponent(gameId);
    try{
      const json = await fetchJson(url);
      const name = json && json.data && json.data.names
        ? json.data.names.international || json.data.names.twitch
        : gameId;
      gameCache.set(gameId, name);
      return name;
    }catch(err){
      gameCache.set(gameId, gameId);
      return gameId;
    }finally{
      gameNameRequests.delete(gameId);
    }
  })();
  gameNameRequests.set(gameId, request);
  return request;
}

async function fetchPlayerPersonalBests(player){
  if(!player || !player.id || player.rel === 'guest') return [];

  if(playerPbCache.has(player.id)){
    return playerPbCache.get(player.id);
  }
  if(playerPbRequests.has(player.id)){
    return playerPbRequests.get(player.id);
  }

  const personalBestLink = Array.isArray(player.links)
    ? player.links.find(link => (link.rel || '').toLowerCase().includes('personal-bests'))
    : null;

  if(!personalBestLink || !personalBestLink.uri){
    playerPbCache.set(player.id, []);
    return [];
  }

  const request = (async () => {
    try{
      const json = await fetchJson(personalBestLink.uri);
      const pbs = Array.isArray(json.data)
        ? [...json.data].sort((a, b) => (a.place ?? Number.MAX_SAFE_INTEGER) - (b.place ?? Number.MAX_SAFE_INTEGER))
        : [];
      const resolvedPbs = [];

      for(const pb of pbs){
        const run = pb && pb.run ? pb.run : null;
        const gameId = run && run.game ? run.game : null;
        const gameName = gameId ? await getGameName(gameId) : t('game');
        const categoryId = run && run.category ? run.category : null;
        const categoryName = categoryId ? await getCategoryName(categoryId) : t('category');
        const primaryTime = run && run.times && run.times.primary_t != null
          ? formatTime(run.times.primary_t)
          : t('notAvailableShort');

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
    }finally{
      playerPbRequests.delete(player.id);
    }
  })();
  playerPbRequests.set(player.id, request);
  return request;
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
        const standing = standings.find(entry => normalizeManualMatchName(entry.name) === normalizeManualMatchName(name));
        return {
          name,
          flag: participantCountryFlag(players, name),
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
        player.slotLabel = [t('leader'), t('position2'), t('position3'), t('position4')][index] || t('position');
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
      : (playerProfile ? playerProfile.names?.international || t('player') : t('player'));

    const flag = participantCountryFlag(players, playerName);

    groups[groupIndex].players[slotIndex] = {
      name: playerName,
      flag,
      points: '?',
      slotLabel: [t('leader'), t('position2'), t('position3'), t('position4')][slotIndex] || t('position')
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
        return `<tr class="group-player placeholder"><td colspan="8">${[t('leader'), t('position2'), t('position3'), t('position4')][index]}: ${t('tbd')}</td></tr>`;
      }

      const qualifiedClass = index < 2 ? ' group-qualified' : '';
      return `<tr class="group-player${qualifiedClass}">
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
          <span>${t('group')} ${group.letter}</span>
          <span class="group-badge">${group.players.length} ${t('players')}</span>
        </div>
        <div class="group-status">${t('groupStageInProgress')}</div>
        <table class="group-table" aria-label="Tabla del ${t('group')} ${group.letter}">
          <colgroup><col class="group-col-position"><col class="group-col-player"><col span="4" class="group-col-stat"><col class="group-col-time"><col class="group-col-points"></colgroup>
          <thead><tr><th>#</th><th>${t('player')}</th><th title="${t('colMatches')}">P</th><th title="${t('colWins')}">W</th><th title="${t('colDraws')}">D</th><th title="${t('colLosses')}">L</th><th title="${t('colBestTime')}">TB</th><th title="${t('colPoints')}">PTS</th></tr></thead>
          <tbody>${playersHtml}</tbody>
        </table>
      </div>
    `;
  }).join('');

  const container = document.getElementById('grupos-content');
  container.innerHTML = groupsHtml
    ? `<div class="groups-grid">${groupsHtml}</div>`
    : `<div class="loading">${t('noDataYet')}</div>`;
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
  const container = document.getElementById('fixture-content');
  const previousOpenDate = container?.querySelector('.fixture-date[open]')?.dataset.fixtureDateKey || null;
  const allMatches = storedResults && Array.isArray(storedResults.matches) ? storedResults.matches : [];
  const calendarBuckets = new Map();

  if(storedResults && Array.isArray(storedResults.dates)){
    storedResults.dates.forEach((date, index) => {
      const number = Number(date.number || date.numero || index + 1);
      const stageKey = String(date.stage || '').toLowerCase();
      const isKnockoutDate = stageKey === 'r16' || stageKey === 'quarters' || stageKey === 'semifinals' || stageKey === 'thirdplace' || stageKey === 'fifthplace' || stageKey === 'final';
      // Un solo bloque por fase eliminatoria
      const key = isKnockoutDate ? `fixture-${stageKey}` : `fixture-${number}`;
      if(!calendarBuckets.has(key)){
        const knockoutLabel = stageKey === 'r16'
          ? t('roundOf16')
          : stageKey === 'quarters'
            ? t('quarterfinals')
            : stageKey === 'semifinals'
              ? t('semifinals')
              : stageKey === 'thirdplace'
                ? t('thirdPlace')
                : stageKey === 'fifthplace'
                  ? t('fifthPlace')
                : stageKey === 'final'
                  ? t('final')
                  : null;
        calendarBuckets.set(key, {
          label: knockoutLabel || date.label || `${t('dateLabel')} ${number} ${t('of')} ${storedResults.dates.length}`,
          matches: []
        });
      }
      (date.matches || []).forEach(record => {
        const group = resolveManualMatchKey(record) || (date.stage === 'r16' || record.stage === 'r16' ? 'R16' : null);
        const playerA = record.playerA || record.jugadorA || record.a || record.teamA || record.player_1;
        const playerB = record.playerB || record.jugadorB || record.b || record.teamB || record.player_2;
        if(!isValidSchedulePlayerName(playerA) || !isValidSchedulePlayerName(playerB)) return;
        if(!group && date.stage !== 'r16' && record.stage !== 'r16') return;
        calendarBuckets.get(key).matches.push({
          group: group || 'R16',
          stage: date.stage || record.stage || null,
          playerA, playerB,
          date: record.date || record.fecha || record.day || 'Fecha por definir',
          time: record.time || record.horario || 'Horario: por definir',
          dateNumber: number,
          seriesScoreA: record.seriesScoreA ?? null,
          seriesScoreB: record.seriesScoreB ?? null,
          games: Array.isArray(record.games) ? record.games : [],
          winner: record.winner || '',
          timeA: record.timeA,
          timeB: record.timeB
        });
      });
    });
  }else if(allMatches.length){
    allMatches.forEach((record) => {
      const group = resolveManualMatchKey(record) || (record.stage === 'r16' ? 'R16' : null);
      const playerA = record.playerA || record.jugadorA || record.a || record.teamA || record.player_1;
      const playerB = record.playerB || record.jugadorB || record.b || record.teamB || record.player_2;
      if(!playerA || !playerB) return;
      if(!group) return;

      const rawDate = record.date || record.fecha || record.day || 'Fecha por definir';
      const dateKey = normalizeDateKey(rawDate) || 'sin-fecha';
      if(!calendarBuckets.has(dateKey)) calendarBuckets.set(dateKey, { label: rawDate, matches: [] });
      calendarBuckets.get(dateKey).matches.push({
        group,
        stage: record.stage || null,
        playerA, playerB,
        date: rawDate,
        time: record.time || record.horario || 'Horario: por definir'
      });
    });
  }else{
    buildGroupFixture(null).forEach((group) => {
      group.rounds.forEach((round) => {
        const dateKey = normalizeDateKey(round.round) || 'sin-fecha';
        if(!calendarBuckets.has(dateKey)) calendarBuckets.set(dateKey, { label: round.round, matches: [] });
        round.matches.forEach((match) => calendarBuckets.get(dateKey).matches.push({ ...match, group: group.letter }));
      });
    });
  }
  // Eliminar partidos duplicados del Fixture
  for (const bucket of calendarBuckets.values()) {
    const uniqueMatches = new Map();

    bucket.matches.forEach(match => {
      const playerA = normalizeManualMatchName(
        match.playerA || ''
      );

      const playerB = normalizeManualMatchName(
        match.playerB || ''
      );

      const pair = [playerA, playerB].sort().join('|');

      const key = [
        match.group || '',
        match.stage || '',
        match.dateNumber || '',
        pair
      ].join('|');

      if (!uniqueMatches.has(key)) {
        uniqueMatches.set(key, match);
      }
    });

    bucket.matches = [...uniqueMatches.values()];
  }
  const orderedDates = Array.from(calendarBuckets.entries()).sort(([aKey], [bKey]) => {
    const rank = (key) => {
      if(key === 'sin-fecha') return 10000;
      if(key === 'fixture-r16') return 5000;
      if(key === 'fixture-quarters') return 5100;
      if(key === 'fixture-fifthplace') return 5150;
      if(key === 'fixture-semifinals') return 5200;
      if(key === 'fixture-thirdplace') return 5250;
      if(key === 'fixture-final') return 5300;
      if(key.startsWith('fixture-')){
        const n = Number(key.slice(8));
        return Number.isFinite(n) ? n : 9000;
      }
      return 8000;
    };
    const diff = rank(aKey) - rank(bKey);
    if(diff !== 0) return diff;
    return aKey.localeCompare(bKey);
  });



  const calendarHtml = orderedDates.map(([dateKey, bucket]) => {
    const matches = bucket.matches;
    const firstMatchSchedule = formatScheduledDateTime(matches[0]?.date, matches[0]?.time);
    const dateLabel = bucket.label || firstMatchSchedule?.dateLabel || (/^\d{4}-\d{2}-\d{2}$/.test(dateKey)
      ? dateKey.split('-').reverse().join('/')
      : (matches[0]?.date || 'Fecha por definir'));

    const matchesHtml = (() => {
      if (!matches.length) return `<div class="loading">${t('noMatchesLoaded')}</div>`;

      const enrichedMatches = matches.map(match => {
        const playerAFlag = participantCountryFlag(players, match.playerA);
        const playerBFlag = participantCountryFlag(players, match.playerB);

        const resultMatch = allMatches.find((record) => {
          const groupMatch = resolveManualMatchKey(record) || '';
          const recordA = record.playerA || record.jugadorA || record.a || record.teamA || record.player_1;
          const recordB = record.playerB || record.jugadorB || record.b || record.teamB || record.player_2;
          const sameDate = record.fixtureDateNumber == null || match.dateNumber == null
            || record.fixtureDateNumber === match.dateNumber;
          return groupMatch === match.group && sameDate &&
            ((normalizeManualMatchName(recordA) === normalizeManualMatchName(match.playerA) && normalizeManualMatchName(recordB) === normalizeManualMatchName(match.playerB)) ||
            (normalizeManualMatchName(recordA) === normalizeManualMatchName(match.playerB) && normalizeManualMatchName(recordB) === normalizeManualMatchName(match.playerA)));
        });

        const winner = resultMatch ? getMatchWinnerName(resultMatch, resultMatch.playerA || resultMatch.jugadorA || resultMatch.a || resultMatch.teamA || resultMatch.player_1, resultMatch.playerB || resultMatch.jugadorB || resultMatch.b || resultMatch.teamB || resultMatch.player_2) : null;
        const playerAWon = winner && normalizeManualMatchName(winner) === normalizeManualMatchName(match.playerA);
        const playerBWon = winner && normalizeManualMatchName(winner) === normalizeManualMatchName(match.playerB);
        const seriesA = resultMatch?.seriesScoreA;
        const seriesB = resultMatch?.seriesScoreB;
        const hasSeries = seriesA != null && seriesB != null && String(seriesA).trim() !== '' && String(seriesB).trim() !== '';
        let scoreA = resultMatch ? (resultMatch.timeA ?? resultMatch.tiempoA ?? resultMatch.time_a ?? resultMatch.times?.[match.playerA] ?? resultMatch.result?.timeA ?? resultMatch.result?.[match.playerA] ?? '-') : '-';
        let scoreB = resultMatch ? (resultMatch.timeB ?? resultMatch.tiempoB ?? resultMatch.time_b ?? resultMatch.times?.[match.playerB] ?? resultMatch.result?.timeB ?? resultMatch.result?.[match.playerB] ?? '-') : '-';
        // Si el resultado está del otro lado, alinear series/tiempos
        if(resultMatch && normalizeManualMatchName(resultMatch.playerA || resultMatch.jugadorA || resultMatch.a) === normalizeManualMatchName(match.playerB)){
          if(hasSeries){
            // series se alinean más abajo
          } else {
            const tmp = scoreA; scoreA = scoreB; scoreB = tmp;
          }
        }
        const displaySeriesA = hasSeries
          ? (normalizeManualMatchName(resultMatch.playerA || '') === normalizeManualMatchName(match.playerA) ? seriesA : seriesB)
          : null;
        const displaySeriesB = hasSeries
          ? (normalizeManualMatchName(resultMatch.playerA || '') === normalizeManualMatchName(match.playerA) ? seriesB : seriesA)
          : null;
        const formattedA = displaySeriesA != null ? String(displaySeriesA) : (scoreA === '-' ? '-' : formatManualTime(scoreA));
        const formattedB = displaySeriesB != null ? String(displaySeriesB) : (scoreB === '-' ? '-' : formatManualTime(scoreB));
        const scheduledDate = resultMatch && (resultMatch.date || resultMatch.fecha) ? (resultMatch.date || resultMatch.fecha) : match.date;
        const scheduledTime = resultMatch && (resultMatch.time || resultMatch.horario) ? (resultMatch.time || resultMatch.horario) : match.time;
        const schedule = formatScheduledDateTime(scheduledDate, scheduledTime);
        const liveSource = resultMatch || match;
        const liveButton = isFixtureMatchLiveCandidate(liveSource, schedule?.date)
          ? `<a class="fixture-live-button" href="${LIVE_STREAM_URL}" target="_blank" rel="noopener noreferrer" onclick="event.stopPropagation()">${t('live')}</a>`
          : '';

        const isFinished = Boolean(winner);
        const sortTime = schedule?.date instanceof Date && !isNaN(schedule.date) ? schedule.date.getTime() : Infinity;

        return {
          match, playerAFlag, playerBFlag, winner, playerAWon, playerBWon,
          formattedA, formattedB, scheduledDate, scheduledTime, schedule, liveButton,
          isFinished, sortTime
        };
      });

      // Orden: partidos no finalizados primero (por horario más cercano primero),
      // partidos ya concluídos al final.
      enrichedMatches.sort((a, b) => {
        if (a.isFinished !== b.isFinished) return a.isFinished ? 1 : -1;
        // El partido en vivo va primero aunque su horario programado ya haya pasado.
        if (a.liveButton && !b.liveButton) return -1;
        if (!a.liveButton && b.liveButton) return 1;
        // Si el scheduledTime de a es 60 minutos menor que la hora actual y no está finalizado, se considera reprogramado
        const now = Date.now();
        const aReprogrammed = a.sortTime < now - 60 * 60 * 1000 && !a.isFinished;
        const bReprogrammed = b.sortTime < now - 60 * 60 * 1000 && !b.isFinished;
        if (aReprogrammed && !bReprogrammed) return 1;
        if (!aReprogrammed && bReprogrammed) return -1;
        return a.sortTime - b.sortTime;
      });

      return enrichedMatches.map(({ match, playerAFlag, playerBFlag, winner, playerAWon, playerBWon, formattedA, formattedB, scheduledDate, scheduledTime, schedule, liveButton }) => {
        const escapedPlayerA = String(match.playerA).replace(/"/g, '&quot;');
        const escapedPlayerB = String(match.playerB).replace(/"/g, '&quot;');

        const stageKey = String(match.stage || '').toLowerCase();
        const groupKey = String(match.group || '').toUpperCase();
        const stageLabel = stageKey === 'fifthplace' || groupKey === 'FIFTHPLACE' || groupKey === 'FIFTH_PLACE'
          ? t('fifthPlace')
          : stageKey === 'thirdplace' || groupKey === 'THIRDPLACE' || groupKey === 'THIRD_PLACE'
          ? t('thirdPlace')
          : stageKey === 'final' || groupKey === 'FINAL' || groupKey === 'F'
          ? t('final')
          : stageKey === 'semifinals' || groupKey === 'SEMIFINALS' || groupKey === 'SF'
            ? t('semifinals')
            : stageKey === 'quarters' || groupKey === 'QUARTERS' || groupKey === 'QF'
              ? t('quarterfinals')
              : stageKey === 'r16' || groupKey === 'R16'
                ? t('roundOf16')
                : FINAL_GROUPS[match.group]
                  ? `${t('group')} ${match.group}`
                  : (match.group ? `${t('group')} ${match.group}` : t('roundOf16'));

        return `
          <div class="fixture-match fixture-match-clickable" role="button" tabindex="0" data-player-a="${escapedPlayerA}" data-player-b="${escapedPlayerB}" data-group="${match.group || ''}">
            <div class="fixture-match-group">${stageLabel}</div>
            <div class="fixture-teams">
              <div class="fixture-team-row ${playerAWon ? '' : winner ? 'loser' : ''}">
                <div class="fixture-team">
                  <span class="flag">${playerAFlag || '🏳️'}</span>
                  <span class="fixture-name">${match.playerA}</span>
                </div>
                <span class="fixture-score">${formattedA}</span>
              </div>
              <div class="fixture-team-row ${playerBWon ? '' : winner ? 'loser' : ''}">
                <div class="fixture-team">
                  <span class="flag">${playerBFlag || '🏳️'}</span>
                  <span class="fixture-name">${match.playerB}</span>
                </div>
                <span class="fixture-score">${formattedB}</span>
              </div>
            </div>
            <div class="fixture-meta">
              <div class="fixture-meta-row"><span class="fixture-meta-label">${t('date')}:</span> <span>${schedule?.dateLabel || scheduledDate}</span></div>
              <div class="fixture-meta-row"><span class="fixture-meta-label">${t('schedule')}:</span> <span>${schedule?.timeLabel || scheduledTime}</span></div>
              ${liveButton}
            </div>
          </div>
        `;
      }).join('');
    })();

      const hasPendingMatch = matches.some(match => {
        const resultMatch = allMatches.find((record) => {
          const groupMatch = resolveManualMatchKey(record) || '';
          const recordA = record.playerA || record.jugadorA || record.a || record.teamA || record.player_1;
          const recordB = record.playerB || record.jugadorB || record.b || record.teamB || record.player_2;
          const sameDate = record.fixtureDateNumber == null || match.dateNumber == null
            || record.fixtureDateNumber === match.dateNumber;
          return groupMatch === match.group && sameDate &&
            ((normalizeManualMatchName(recordA) === normalizeManualMatchName(match.playerA) && normalizeManualMatchName(recordB) === normalizeManualMatchName(match.playerB)) ||
            (normalizeManualMatchName(recordA) === normalizeManualMatchName(match.playerB) && normalizeManualMatchName(recordB) === normalizeManualMatchName(match.playerA)));
        });
        if(!resultMatch) return true; // sin resultado cargado → pendiente
        const winner = getMatchWinnerName(
          resultMatch,
          resultMatch.playerA || resultMatch.jugadorA || resultMatch.a || resultMatch.teamA || resultMatch.player_1,
          resultMatch.playerB || resultMatch.jugadorB || resultMatch.b || resultMatch.teamB || resultMatch.player_2
        );
        if(winner) return false;
        const timeA = resultMatch.timeA ?? resultMatch.tiempoA ?? resultMatch.time_a;
        const timeB = resultMatch.timeB ?? resultMatch.tiempoB ?? resultMatch.time_b;
        const hasTimeA = timeA != null && String(timeA).trim() !== '' && String(timeA).trim() !== '-';
        const hasTimeB = timeB != null && String(timeB).trim() !== '' && String(timeB).trim() !== '-';
        return !hasTimeA && !hasTimeB;
      });

      return `
        <details class="fixture-round fixture-date" data-fixture-date-key="${dateKey}" data-has-pending="${hasPendingMatch ? '1' : '0'}">
          <summary class="fixture-round-summary">
            <span class="fixture-label">${dateLabel}</span>
            <span class="fixture-badge">${matches.length} ${matches.length === 1 ? t('matchSingular') : t('matchPlural')}</span>
          </summary>
          <div class="fixture-round-body fixture-calendar-matches">${matchesHtml}</div>
        </details>
      `;
  }).join('');

  container.innerHTML = calendarHtml
    ? `<div class="fixture-dates">${calendarHtml}</div>`
    : `<div class="loading">${t('noDataYet')}</div>`;

  const dateDetailsList = [...container.querySelectorAll('.fixture-date')];
  const pendingDates = dateDetailsList.filter(el => el.dataset.hasPending === '1');
  // Solo abrir el que tenga partidos pendientes; si hay varios, preferir el que el usuario tenía abierto
  let openTarget = null;
  if(pendingDates.length){
    openTarget = pendingDates.find(el => el.dataset.fixtureDateKey === previousOpenDate) || pendingDates[0];
  }
  dateDetailsList.forEach(el => {
    el.open = openTarget != null && el === openTarget;
  });

  dateDetailsList.forEach(dateDetails => {
    dateDetails.addEventListener('toggle', () => {
      if(!dateDetails.open) return;
      dateDetailsList.forEach(otherDate => {
        if(otherDate !== dateDetails) otherDate.open = false;
      });
    });
  });
}

function renderFixturePanel(players = []){
  renderCalendarFixturePanel(players);
}
// --- Clasificación automática a octavos -------------------------------------

function getGroupMatchupsWithStatus(groupLetter){
  const rawResults = getLoadedResults();
  const matches = Array.isArray(rawResults?.matches) ? rawResults.matches : [];
  const byPair = new Map();

  matches.forEach(match => {
    if(resolveManualMatchKey(match) !== groupLetter) return;

    const playerA = match.playerA || match.jugadorA || match.a || match.teamA || match.player_1;
    const playerB = match.playerB || match.jugadorB || match.b || match.teamB || match.player_2;
    if(!playerA || !playerB) return;

    const rawA = match.timeA ?? match.tiempoA ?? match.time_a;
    const rawB = match.timeB ?? match.tiempoB ?? match.time_b;
    const timeA = parseManualTime(rawA);
    const timeB = parseManualTime(rawB);

    // Mismo criterio de "pendiente" que usa computeGroupStandings
    const isPending = (match.winner == null || String(match.winner).trim() === '') &&
      (rawA == null || String(rawA).trim() === '' || String(rawA).trim() === '-' || timeA == null) &&
      (rawB == null || String(rawB).trim() === '' || String(rawB).trim() === '-' || timeB == null);

    const key = [normalizeManualMatchName(playerA), normalizeManualMatchName(playerB)].sort().join('|');
    const previous = byPair.get(key);
    if(previous && !previous.isPending) return; // ya hay una versión jugada de ese cruce
    byPair.set(key, { playerA, playerB, isPending });
  });

  return [...byPair.values()];
}

// Devuelve [1º, 2º] de un escenario concreto, o null si el desempate es incierto.
// Devuelve [nombreRank1, nombreRank2] para un escenario puntual.
// Cualquiera de los dos puede venir null si ese puesto específico
// queda indefinido por un empate con jugadores que aún tienen partidos pendientes.
function resolveScenarioRanks(entries, pointsByKey, riskyTimeKeys){
  const byPoints = new Map();
  entries.forEach(entry => {
    const points = pointsByKey.get(entry.key) ?? 0;
    if(!byPoints.has(points)) byPoints.set(points, []);
    byPoints.get(points).push(entry);
  });

  const bucketsDesc = [...byPoints.entries()]
    .sort((a, b) => b[0] - a[0])
    .map(([, list]) => list);

  const ranks = [];

  for(const bucket of bucketsDesc){
    if(ranks.length >= 2) break;

    if(bucket.length === 1){
      ranks.push(bucket[0].name);
      continue;
    }

    // Empate en puntos entre varios jugadores.
    const anyRisky = bucket.some(entry => riskyTimeKeys.has(entry.key));
    if(anyRisky){
      const slotsNeeded = Math.min(bucket.length, 2 - ranks.length);
      for(let i = 0; i < slotsNeeded; i++) ranks.push(null);
      continue;
    }

    const sorted = [...bucket].sort((a, b) =>
      (a.bestTime ?? Number.POSITIVE_INFINITY) - (b.bestTime ?? Number.POSITIVE_INFINITY));
    const flatTie = sorted.some((entry, index) => index > 0 &&
      (entry.bestTime ?? Number.POSITIVE_INFINITY) === (sorted[index - 1].bestTime ?? Number.POSITIVE_INFINITY));

    if(flatTie){
      const slotsNeeded = Math.min(bucket.length, 2 - ranks.length);
      for(let i = 0; i < slotsNeeded; i++) ranks.push(null);
      continue;
    }

    sorted.forEach(entry => { if(ranks.length < 2) ranks.push(entry.name); });
  }

  while(ranks.length < 2) ranks.push(null);
  return ranks;
}

const MAX_PENDING_SCENARIOS_EXPONENT = 8;

function resolveGroupTopTwo(groupLetter){
  const standings = computeGroupStandings(getLoadedResults() || { matches: [] })[groupLetter];
  if(!standings) return { first: null, second: null };

  const entries = Object.values(standings).map(entry => ({
    key: normalizeManualMatchName(entry.name),
    name: entry.name,
    points: entry.points,
    bestTime: entry.bestTime
  }));
  if(!entries.length) return { first: null, second: null };

  const pending = getGroupMatchupsWithStatus(groupLetter).filter(match => match.isPending);
  if(pending.length > MAX_PENDING_SCENARIOS_EXPONENT) return { first: null, second: null };

  const riskyTimeKeys = new Set(pending.flatMap(match => [
    normalizeManualMatchName(match.playerA),
    normalizeManualMatchName(match.playerB)
  ]));

  const scenarios = Math.pow(3, pending.length);
  let first;   // undefined = sin fijar todavía, null = ambiguo, string = valor
  let second;

  for(let scenario = 0; scenario < scenarios; scenario++){
    const pointsByKey = new Map(entries.map(entry => [entry.key, entry.points]));
    let remainder = scenario;

    pending.forEach(match => {
      const outcome = remainder % 3;
      remainder = Math.floor(remainder / 3);
      const keyA = normalizeManualMatchName(match.playerA);
      const keyB = normalizeManualMatchName(match.playerB);
      if(!pointsByKey.has(keyA) || !pointsByKey.has(keyB)) return;
      if(outcome === 0) pointsByKey.set(keyA, pointsByKey.get(keyA) + 3);
      else if(outcome === 1) pointsByKey.set(keyB, pointsByKey.get(keyB) + 3);
      else {
        pointsByKey.set(keyA, pointsByKey.get(keyA) + 1);
        pointsByKey.set(keyB, pointsByKey.get(keyB) + 1);
      }
    });

    const [rank1, rank2] = resolveScenarioRanks(entries, pointsByKey, riskyTimeKeys);

    if(rank1 === null) first = null;
    else if(first === undefined) first = rank1;
    else if(first !== null && first !== rank1) first = null;

    if(rank2 === null) second = null;
    else if(second === undefined) second = rank2;
    else if(second !== null && second !== rank2) second = null;

    if(first === null && second === null) break; // ya no puede mejorar, cortamos antes
  }

  return {
    first: first && first !== null ? first : null,
    second: second && second !== null ? second : null
  };
}

function buildQualifiedParticipants(players){
  return Object.keys(FINAL_GROUPS).flatMap(letter => {
    const resolved = resolveGroupTopTwo(letter);

    return [0, 1].map(slot => {
      const label = `${slot === 0 ? '1º' : '2º'} ${t('group')} ${letter}`;
      const name = slot === 0 ? resolved.first : resolved.second;
      if(!name) return { label, name: t('tbd'), flag: null, details: t('drawPending') };

      return {
        label,
        name,
        flag: participantCountryFlag(players, name),
        details: t('qualified')
      };
    });
  });
}

function buildKnockoutBracket(runs, players){
  const storedResults = getLoadedResults();
  const knockoutResults = storedResults && storedResults.knockout;

  if(knockoutResults){
    const participant = (name, label = t('qualified')) => ({
      label,
      name,
      flag: participantCountryFlag(players, name),
      details: ''
    });
    const readRound = (roundName, expectedLength) => Array.from({ length: expectedLength }, (_, index) => {
      const match = Array.isArray(knockoutResults[roundName]) ? knockoutResults[roundName][index] : null;
      const playerA = match?.playerA || match?.a || t('tbd');
      const playerB = match?.playerB || match?.b || t('tbd');
      const winner = match?.winner || '';
      const scoreA = match?.seriesScoreA ?? match?.scoreA ?? null;
      const scoreB = match?.seriesScoreB ?? match?.scoreB ?? null;
      return Object.assign([
        participant(playerA, match?.labelA || t('qualified')),
        participant(playerB, match?.labelB || t('qualified'))
      ], {
        winnerIndex: winner === playerB ? 1 : winner === playerA ? 0 : null,
        scores: [scoreA, scoreB]
      });
    });

    const semifinals = readRound('semifinales', 2);
    const thirdPlaceMatch = knockoutResults.tercerPuesto || knockoutResults.thirdPlace || {};
    const thirdPlaceLosers = semifinals.map(match => (
      match.winnerIndex == null ? t('tbd') : match[match.winnerIndex === 0 ? 1 : 0].name
    ));
    const thirdPlacePlayerA = thirdPlaceMatch.playerA || thirdPlaceMatch.a;
    const thirdPlacePlayerB = thirdPlaceMatch.playerB || thirdPlaceMatch.b;
    const thirdPlaceA = !thirdPlacePlayerA || thirdPlacePlayerA === t('tbd') ? thirdPlaceLosers[0] : thirdPlacePlayerA;
    const thirdPlaceB = !thirdPlacePlayerB || thirdPlacePlayerB === t('tbd') ? thirdPlaceLosers[1] : thirdPlacePlayerB;
    const finalMatch = knockoutResults.final || {};
    return {
      octavos: readRound('octavos', 8),
      cuartos: readRound('cuartos', 4),
      semis: semifinals,
      final: Object.assign([
        participant(finalMatch.playerA || finalMatch.a || t('tbd')),
        participant(finalMatch.playerB || finalMatch.b || t('tbd'))
      ], {
        winnerIndex: finalMatch.winner === finalMatch.playerB ? 1 : finalMatch.winner ? 0 : null,
        scores: [
          finalMatch.seriesScoreA ?? finalMatch.scoreA ?? null,
          finalMatch.seriesScoreB ?? finalMatch.scoreB ?? null
        ]
      }),
      thirdPlace: Object.assign([
        participant(thirdPlaceA),
        participant(thirdPlaceB)
      ], {
        winnerIndex: thirdPlaceMatch.winner === thirdPlaceB ? 1 : thirdPlaceMatch.winner === thirdPlaceA ? 0 : null,
        scores: [
          thirdPlaceMatch.seriesScoreA ?? thirdPlaceMatch.scoreA ?? null,
          thirdPlaceMatch.seriesScoreB ?? thirdPlaceMatch.scoreB ?? null
        ]
      }),
      champion: participant(finalMatch.winner || t('tbd'), t('champion'))
    };
  }

  const qualifiedParticipants = buildQualifiedParticipants(players);

  const tbdSlot = () => ({ label: t('tbd'), name: t('tbd'), flag: null, details: t('drawPending') });

  const participantFromName = (name, label = t('qualified')) => {
    if(!name || name === t('tbd')) return tbdSlot();
    return {
      label,
      name,
      flag: participantCountryFlag(players, name),
      details: t('qualified')
    };
  };

  const findKnockoutMatch = (playerA, playerB, stageFilter = null) => {
    const matches = getLoadedResults()?.matches || [];
    const keyA = normalizeManualMatchName(playerA);
    const keyB = normalizeManualMatchName(playerB);
    if(!keyA || !keyB) return null;
    return matches.find(record => {
      const recordA = record.playerA || record.jugadorA || record.a || record.teamA || record.player_1;
      const recordB = record.playerB || record.jugadorB || record.b || record.teamB || record.player_2;
      const rA = normalizeManualMatchName(recordA);
      const rB = normalizeManualMatchName(recordB);
      const namesMatch = (rA === keyA && rB === keyB) || (rA === keyB && rB === keyA);
      if(!namesMatch) return false;

      if(!stageFilter) return true;

      const stage = String(record.stage || '').toLowerCase();
      const group = String(record.group || '');
      if(stageFilter === 'r16'){
        // Octavos: stage r16, grupo R16, o cualquier cruce que no sea fase de grupos A-H
        if(stage === 'r16' || group === 'R16' || /octavos|round\s*of\s*16/i.test(stage + group)) return true;
        if(FINAL_GROUPS[group]) return false;
        // Si no es un grupo A-H, aceptar (sheet de octavos)
        return true;
      }
      if(stageFilter === 'qf'){
        return stage === 'qf' || /cuartos|quarter/i.test(stage + group);
      }
      if(stageFilter === 'sf'){
        return stage === 'sf' || /semi/i.test(stage + group);
      }
      if(stageFilter === 'final'){
        return stage === 'final' || (/final/i.test(stage + group) && !/semi/i.test(stage + group));
      }
      if(stageFilter === 'thirdplace'){
        return /third[\s_-]*place|3rd[\s_-]*place|tercer[\s_-]*puesto/i.test(stage + group);
      }
      return stage.includes(stageFilter) || group.toLowerCase() === stageFilter;
    }) || null;
  };

  const resolveWinnerSlot = (slotA, slotB, stageFilter) => {
    if(!slotA || !slotB || slotA.name === t('tbd') || slotB.name === t('tbd')){
      return { winnerIndex: null, winner: null };
    }
    const match = findKnockoutMatch(slotA.name, slotB.name, stageFilter);
    if(!match) return { winnerIndex: null, winner: null };

    const hasSeriesScore = match.seriesScoreA != null && match.seriesScoreB != null
      && String(match.seriesScoreA).trim() !== '' && String(match.seriesScoreB).trim() !== '';
    const sameOrder = normalizeManualMatchName(match.playerA) === normalizeManualMatchName(slotA.name);
    const scores = hasSeriesScore
      ? sameOrder
        ? [match.seriesScoreA, match.seriesScoreB]
        : [match.seriesScoreB, match.seriesScoreA]
      : [null, null];
    // En eliminatorias, el resultado de un mapa no determina al ganador de la serie.
    let winnerName = null;
    const targetWins = getKnockoutSeriesTarget(stageFilter, match.stage || match.group);
    if(targetWins != null && hasSeriesScore){
      const sA = Number(match.seriesScoreA);
      const sB = Number(match.seriesScoreB);
      if(!Number.isFinite(sA) || !Number.isFinite(sB) || (sA < targetWins && sB < targetWins)){
        return { winnerIndex: null, winner: null, scores };
      }
      if(sameOrder) winnerName = sA > sB ? slotA.name : slotB.name;
      else winnerName = sA > sB ? slotB.name : slotA.name;
    }else if(match.winner){
      winnerName = normalizeManualMatchName(match.winner) === normalizeManualMatchName(slotA.name)
        ? slotA.name
        : normalizeManualMatchName(match.winner) === normalizeManualMatchName(slotB.name)
          ? slotB.name
          : null;
    }
    if(!winnerName) return { winnerIndex: null, winner: null, scores };

    const winnerIndex = normalizeManualMatchName(winnerName) === normalizeManualMatchName(slotA.name)
      ? 0
      : normalizeManualMatchName(winnerName) === normalizeManualMatchName(slotB.name)
        ? 1
        : null;
    if(winnerIndex == null) return { winnerIndex: null, winner: null, scores };
    return {
      winnerIndex,
      winner: winnerIndex === 0 ? slotA : slotB,
      scores
    };
  };

  const octavos = [
    [qualifiedParticipants[0], qualifiedParticipants[3]],
    [qualifiedParticipants[4], qualifiedParticipants[7]],
    [qualifiedParticipants[8], qualifiedParticipants[11]],
    [qualifiedParticipants[12], qualifiedParticipants[15]],
    [qualifiedParticipants[2], qualifiedParticipants[1]],
    [qualifiedParticipants[6], qualifiedParticipants[5]],
    [qualifiedParticipants[10], qualifiedParticipants[9]],
    [qualifiedParticipants[14], qualifiedParticipants[13]]
  ].map(pair => {
    const result = resolveWinnerSlot(pair[0], pair[1], 'r16');
    return Object.assign([pair[0], pair[1]], { winnerIndex: result.winnerIndex, winner: result.winner, scores: result.scores });
  });

  // Avance a cuartos: ganadores de octavos 0+1, 2+3, 4+5, 6+7
  const cuartos = [0, 1, 2, 3].map(i => {
    const left = octavos[i * 2]?.winner || tbdSlot();
    const right = octavos[i * 2 + 1]?.winner || tbdSlot();
    const slotA = left.name === t('tbd') ? tbdSlot() : participantFromName(left.name, left.label || t('qualified'));
    const slotB = right.name === t('tbd') ? tbdSlot() : participantFromName(right.name, right.label || t('qualified'));
    const result = resolveWinnerSlot(slotA, slotB, 'qf');
    return Object.assign([slotA, slotB], { winnerIndex: result.winnerIndex, winner: result.winner, scores: result.scores });
  });

  const semis = [0, 1].map(i => {
    const left = cuartos[i * 2]?.winner || tbdSlot();
    const right = cuartos[i * 2 + 1]?.winner || tbdSlot();
    const slotA = left.name === t('tbd') ? tbdSlot() : participantFromName(left.name, left.label || t('qualified'));
    const slotB = right.name === t('tbd') ? tbdSlot() : participantFromName(right.name, right.label || t('qualified'));
    const result = resolveWinnerSlot(slotA, slotB, 'sf');
    return Object.assign([slotA, slotB], { winnerIndex: result.winnerIndex, winner: result.winner, scores: result.scores });
  });

  const finalLeft = semis[0]?.winner || tbdSlot();
  const finalRight = semis[1]?.winner || tbdSlot();
  const finalA = finalLeft.name === t('tbd') ? tbdSlot() : participantFromName(finalLeft.name, finalLeft.label || t('qualified'));
  const finalB = finalRight.name === t('tbd') ? tbdSlot() : participantFromName(finalRight.name, finalRight.label || t('qualified'));
  const finalResult = resolveWinnerSlot(finalA, finalB, 'final');
  const final = Object.assign([finalA, finalB], {
    winnerIndex: finalResult.winnerIndex,
    winner: finalResult.winner,
    scores: finalResult.scores
  });

  const loserOf = match => match.winnerIndex == null
    ? tbdSlot()
    : match[match.winnerIndex === 0 ? 1 : 0];
  const thirdA = loserOf(semis[0]);
  const thirdB = loserOf(semis[1]);
  const thirdPlaceResult = resolveWinnerSlot(thirdA, thirdB, 'thirdplace');
  const thirdPlace = Object.assign([thirdA, thirdB], {
    winnerIndex: thirdPlaceResult.winnerIndex,
    winner: thirdPlaceResult.winner,
    scores: thirdPlaceResult.scores
  });

  const championSource = final.winner;
  const champion = championSource && championSource.name !== t('tbd')
    ? { ...participantFromName(championSource.name, t('champion')), label: t('champion'), details: '' }
    : { label: t('champion'), name: t('tbd'), flag: null, details: t('pendingSingle') };

  return { octavos, cuartos, semis, final, thirdPlace, champion };
}

function renderEliminatoriasPanel(runs, players){
  const bracket = buildKnockoutBracket(runs, players);
  const hasKnockoutResults = Boolean(getLoadedResults()?.knockout);
  const renderMatch = (match, index, winnerIndex = null, matchClass = '', medals = {}) => {
    const teamA = match[0] || { label: t('tbd'), name: t('tbd'), flag: null, details: t('drawPending') };
    const teamB = match[1] || { label: t('tbd'), name: t('tbd'), flag: null, details: t('drawPending') };
    const isWinnerA = winnerIndex === 0;
    const isWinnerB = winnerIndex === 1;
    const isLoserA = winnerIndex !== null && !isWinnerA;
    const isLoserB = winnerIndex !== null && !isWinnerB;
    const scoreText = score => score != null && /^\d+$/.test(String(score).trim())
      ? `<span class="knockout-team-score">${String(score).trim()}</span>`
      : '';
    const medalText = medal => medal
      ? `<span class="knockout-medal" title="${medal.label}" aria-label="${medal.label}">${medal.emoji}</span>`
      : '';
    const teamName = (team) => team.name === t('tbd')
      ? `<span class="team-name"><span class="team-flag">${team.flag || '🏳️'}</span> ${team.name}</span>`
      : `<button class="player-profile-button team-name" type="button" data-player-name="${team.name}"><span class="team-flag">${team.flag || '🏳️'}</span> ${team.name}</button>`;

    return `
      <div class="knockout-match ${matchClass}" data-match="${index}">
        <div class="team-slot ${isWinnerA ? 'winner' : ''} ${isLoserA ? 'loser' : ''}">
          <span class="team-label">${teamA.label}</span>
          <div class="knockout-team-line">${teamName(teamA)}${medalText(medals[0])}${scoreText(match.scores?.[0])}</div>
          <span class="team-detail">${teamA.details}</span>
        </div>
        <div class="team-slot ${isWinnerB ? 'winner' : ''} ${isLoserB ? 'loser' : ''}">
          <span class="team-label">${teamB.label}</span>
          <div class="knockout-team-line">${teamName(teamB)}${medalText(medals[1])}${scoreText(match.scores?.[1])}</div>
          <span class="team-detail">${teamB.details}</span>
        </div>
      </div>
    `;
  };

  const renderSide = (matches, side, roundTitle) => {
    const items = matches.map((match, index) => renderMatch(match, `${side}-${index}`, match.winnerIndex ?? null));
    const roundClass = roundTitle.toLowerCase().replace(/[^a-záéíóúüñ]+/g, '-');
    return `<div class="bracket-cluster ${side} round-${roundClass}"><div class="round-title">${roundTitle}</div>${items.join('')}</div>`;
  };

  const pendingMatch = [
    { label: t('tbd'), name: t('tbd'), flag: null, details: t('drawPending') },
    { label: t('tbd'), name: t('tbd'), flag: null, details: t('drawPending') }
  ];

  const bracketHtml = `
    <div class="bracket-wrap">
      ${renderSide(bracket.octavos.slice(0, 4), 'left', t('roundOf16'))}
      ${renderSide(bracket.cuartos.slice(0, 2), 'left', t('quarterfinals'))}
      ${renderSide(bracket.semis.slice(0, 1), 'left', t('semifinals'))}
      <div class="bracket-center">
        <div class="round-title">${t('final')}</div>
        <div class="champion-banner">
          <span class="champion-label">${t('champion')}</span>
          <span class="champion-trophy" aria-hidden="true">🏆</span>
          <span class="champion-name">${bracket.champion.flag || ''} ${bracket.champion.name}</span>
        </div>
        ${renderMatch(bracket.final, 'final', bracket.final.winnerIndex ?? null, 'final-match', {
          0: bracket.final.winnerIndex === 0 ? { emoji: '🥇', label: t('goldMedal') } : null,
          1: bracket.final.winnerIndex === 1 ? { emoji: '🥇', label: t('goldMedal') } : null,
          [bracket.final.winnerIndex === 0 ? 1 : 0]: bracket.final.winnerIndex == null ? null : { emoji: '🥈', label: t('silverMedal') }
        })}
        <div class="third-place-title">${t('thirdPlace')}</div>
        ${renderMatch(bracket.thirdPlace || pendingMatch, 'third-place', bracket.thirdPlace?.winnerIndex ?? null, 'third-place-match', {
          0: bracket.thirdPlace?.winnerIndex === 0 ? { emoji: '🥉', label: t('bronzeMedal') } : null,
          1: bracket.thirdPlace?.winnerIndex === 1 ? { emoji: '🥉', label: t('bronzeMedal') } : null
        })}
      </div>
      ${renderSide(bracket.semis.slice(1, 2), 'right', t('semifinals'))}
      ${renderSide(bracket.cuartos.slice(2, 4), 'right', t('quarterfinals'))}
      ${renderSide(bracket.octavos.slice(4, 8), 'right', t('roundOf16'))}
    </div>
  `;

  const container = document.getElementById('eliminatorias-content');
  if(container) container.innerHTML = bracketHtml;
}

// --- Predicciones (bracket interactivo) -------------------------------------

const PREDICTIONS_STORAGE_KEY = 'bc-predictions-v1';

function loadPredictionsState(){
  try{
    const raw = localStorage.getItem(PREDICTIONS_STORAGE_KEY);
    if(!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  }catch(err){
    return {};
  }
}

function savePredictionsState(state){
  try{
    localStorage.setItem(PREDICTIONS_STORAGE_KEY, JSON.stringify(state || {}));
  }catch(err){
    console.warn('No se pudieron guardar las predicciones.', err);
  }
}

function clearPredictionsState(){
  try{
    localStorage.removeItem(PREDICTIONS_STORAGE_KEY);
  }catch(err){}
}

/**
 * Build interactive prediction bracket from group stage results + user picks.
 * State shape: { [matchId]: 0 | 1 }  where 0 = team A wins, 1 = team B wins
 * Match IDs: o0..o7 (octavos), q0..q3 (cuartos), s0..s1 (semis), f (final), t (third)
 */
function buildPredictionBracket(players){
  const qualified = buildQualifiedParticipants(players);
  const state = loadPredictionsState();

  const participantFrom = (entry) => {
    if(!entry || !entry.name || entry.name === t('tbd')){
      return { label: entry?.label || t('tbd'), name: t('tbd'), flag: null, details: t('drawPending') };
    }
    return {
      label: entry.label || t('qualified'),
      name: entry.name,
      flag: entry.flag || null,
      details: entry.details || t('qualified')
    };
  };

  const tbd = () => ({ label: t('tbd'), name: t('tbd'), flag: null, details: t('drawPending') });

  // Octavos pairings (same order as eliminatorias)
  const octavosSeeds = [
    [qualified[0], qualified[3]],
    [qualified[4], qualified[7]],
    [qualified[8], qualified[11]],
    [qualified[12], qualified[15]],
    [qualified[2], qualified[1]],
    [qualified[6], qualified[5]],
    [qualified[10], qualified[9]],
    [qualified[14], qualified[13]]
  ];

  const octavos = octavosSeeds.map((pair, i) => {
    const match = Object.assign(
      [participantFrom(pair[0]), participantFrom(pair[1])],
      { matchId: `o${i}`, winnerIndex: state[`o${i}`] ?? null }
    );
    return match;
  });

  const winnerOf = (match) => {
    if(match.winnerIndex == null) return null;
    const team = match[match.winnerIndex];
    if(!team || team.name === t('tbd')) return null;
    return team;
  };

  // Cuartos: o0vs o1, o2 vs o3, o4 vs o5, o6 vs o7
  const cuartos = [0, 1, 2, 3].map(i => {
    const a = winnerOf(octavos[i * 2]) || tbd();
    const b = winnerOf(octavos[i * 2 + 1]) || tbd();
    // If a previously selected winner is no longer valid (upstream changed), clear it
    let winnerIndex = state[`q${i}`] ?? null;
    if(winnerIndex != null){
      const chosen = winnerIndex === 0 ? a : b;
      if(!chosen || chosen.name === t('tbd')) winnerIndex = null;
    }
    return Object.assign([a, b], { matchId: `q${i}`, winnerIndex });
  });

  // Semis: q0 vs q1, q2 vs q3
  const semis = [0, 1].map(i => {
    const a = winnerOf(cuartos[i * 2]) || tbd();
    const b = winnerOf(cuartos[i * 2 + 1]) || tbd();
    let winnerIndex = state[`s${i}`] ?? null;
    if(winnerIndex != null){
      const chosen = winnerIndex === 0 ? a : b;
      if(!chosen || chosen.name === t('tbd')) winnerIndex = null;
    }
    return Object.assign([a, b], { matchId: `s${i}`, winnerIndex });
  });

  // Final
  const finalA = winnerOf(semis[0]) || tbd();
  const finalB = winnerOf(semis[1]) || tbd();
  let finalWinner = state.f ?? null;
  if(finalWinner != null){
    const chosen = finalWinner === 0 ? finalA : finalB;
    if(!chosen || chosen.name === t('tbd')) finalWinner = null;
  }
  const final = Object.assign([finalA, finalB], { matchId: 'f', winnerIndex: finalWinner });

  // Third place: losers of semis
  const loserOf = (match) => {
    if(match.winnerIndex == null) return null;
    const team = match[match.winnerIndex === 0 ? 1 : 0];
    if(!team || team.name === t('tbd')) return null;
    return team;
  };
  const thirdA = loserOf(semis[0]) || tbd();
  const thirdB = loserOf(semis[1]) || tbd();
  let thirdWinner = state.t ?? null;
  if(thirdWinner != null){
    const chosen = thirdWinner === 0 ? thirdA : thirdB;
    if(!chosen || chosen.name === t('tbd')) thirdWinner = null;
  }
  const thirdPlace = Object.assign([thirdA, thirdB], { matchId: 't', winnerIndex: thirdWinner });

  const championTeam = winnerOf(final);
  const champion = championTeam
    ? { label: t('champion'), name: championTeam.name, flag: championTeam.flag, details: t('predictionsChampionPick') }
    : { label: t('champion'), name: t('tbd'), flag: null, details: t('pendingSingle') };

  return { octavos, cuartos, semis, final, thirdPlace, champion, state };
}

function setPredictionWinner(matchId, winnerIndex){
  const state = loadPredictionsState();
  const prev = state[matchId];

  if(prev === winnerIndex){
    // Toggle off
    delete state[matchId];
  }else{
    state[matchId] = winnerIndex;
  }

  // Clear dependent downstream picks when an upstream match changes
  const clearKeys = [];
  if(matchId.startsWith('o')){
    const oi = Number(matchId.slice(1));
    const qi = Math.floor(oi / 2);
    clearKeys.push(`q${qi}`, `s${Math.floor(qi / 2)}`, 'f', 't');
  }else if(matchId.startsWith('q')){
    const qi = Number(matchId.slice(1));
    clearKeys.push(`s${Math.floor(qi / 2)}`, 'f', 't');
  }else if(matchId.startsWith('s')){
    clearKeys.push('f', 't');
  }else if(matchId === 'f'){
    // final only affects champion banner
  }

  // Only clear if the selection actually changed (not toggle-off of same)
  if(prev !== winnerIndex){
    clearKeys.forEach(k => { delete state[k]; });
  }

  savePredictionsState(state);
  if(lastLeaderboardSnapshot){
    renderPrediccionesPanel(lastLeaderboardSnapshot.players);
  }
}

function renderPrediccionesPanel(players = []){
  const container = document.getElementById('predicciones-content');
  if(!container) return;

  const bracket = buildPredictionBracket(players);

  const renderMatch = (match, index, matchClass = '') => {
    const teamA = match[0] || { label: t('tbd'), name: t('tbd'), flag: null, details: t('drawPending') };
    const teamB = match[1] || { label: t('tbd'), name: t('tbd'), flag: null, details: t('drawPending') };
    const winnerIndex = match.winnerIndex ?? null;
    const isWinnerA = winnerIndex === 0;
    const isWinnerB = winnerIndex === 1;
    const isLoserA = winnerIndex !== null && !isWinnerA;
    const isLoserB = winnerIndex !== null && !isWinnerB;
    const canPickA = teamA.name !== t('tbd');
    const canPickB = teamB.name !== t('tbd');
    const matchId = match.matchId || index;

    const teamSlot = (team, sideIndex, isWinner, isLoser, canPick) => {
      const classes = [
        'team-slot',
        'prediction-slot',
        isWinner ? 'winner' : '',
        isLoser ? 'loser' : '',
        canPick ? 'pickable' : 'disabled'
      ].filter(Boolean).join(' ');
      return `
        <div class="${classes}" data-match-id="${matchId}" data-side="${sideIndex}" role="button" tabindex="${canPick ? 0 : -1}" aria-pressed="${isWinner ? 'true' : 'false'}">
          <span class="team-label">${team.label}</span>
          <span class="team-name"><span class="team-flag">${team.flag || '🏳️'}</span> ${team.name}</span>
          <span class="team-detail">${isWinner ? '✓' : (canPick ? t('predictionsPickWinner') : team.details)}</span>
        </div>`;
    };

    return `
      <div class="knockout-match prediction-match ${matchClass}" data-match="${matchId}">
        ${teamSlot(teamA, 0, isWinnerA, isLoserA, canPickA)}
        ${teamSlot(teamB, 1, isWinnerB, isLoserB, canPickB)}
      </div>
    `;
  };

  const renderSide = (matches, side, roundTitle) => {
    const items = matches.map((match, index) => renderMatch(match, `${side}-${index}`));
    const roundClass = roundTitle.toLowerCase().replace(/[^a-záéíóúüñ]+/g, '-');
    return `<div class="bracket-cluster ${side} round-${roundClass}"><div class="round-title">${roundTitle}</div>${items.join('')}</div>`;
  };

  const bracketHtml = `
    <div class="predictions-toolbar">
      <div class="predictions-toolbar-text">
        <strong>${t('predictionsTitle')}</strong>
        <span>${t('predictionsHint')}</span>
      </div>
      <div class="predictions-toolbar-actions">
        <button type="button" class="predictions-btn predictions-reset" id="predictions-reset-btn">${t('predictionsReset')}</button>
        <div class="predictions-share-wrap">
          <button type="button" class="predictions-btn predictions-share" id="predictions-share-btn" aria-haspopup="true" aria-expanded="false">${t('predictionsShare')}</button>
          <div class="predictions-share-menu" id="predictions-share-menu" hidden role="menu">
            <button type="button" class="predictions-share-item" data-share-action="native" role="menuitem">${t('predictionsShareNative')}</button>
            <button type="button" class="predictions-share-item" data-share-action="copy" role="menuitem">${t('predictionsCopy')}</button>
            <button type="button" class="predictions-share-item" data-share-action="download" role="menuitem">${t('predictionsDownload')}</button>
            <button type="button" class="predictions-share-item" data-share-action="x" role="menuitem">${t('predictionsShareX')}</button>
            <button type="button" class="predictions-share-item" data-share-action="whatsapp" role="menuitem">${t('predictionsShareWhatsApp')}</button>
            <button type="button" class="predictions-share-item" data-share-action="discord" role="menuitem">${t('predictionsShareDiscord')}</button>
          </div>
        </div>
      </div>
    </div>
    <div class="bracket-wrap predictions-bracket" id="predictions-bracket-capture">
      ${renderSide(bracket.octavos.slice(0, 4), 'left', t('roundOf16'))}
      ${renderSide(bracket.cuartos.slice(0, 2), 'left', t('quarterfinals'))}
      ${renderSide(bracket.semis.slice(0, 1), 'left', t('semifinals'))}
      <div class="bracket-center">
        <div class="round-title">${t('final')}</div>
        <div class="champion-banner">
          <span class="champion-trophy" aria-hidden="true">🏆</span>
          <span class="champion-label">${t('champion')}</span>
          <span class="champion-name">${bracket.champion.flag || ''} ${bracket.champion.name}</span>
        </div>
        ${renderMatch(bracket.final, 'final', 'final-match')}
        <div class="third-place-title">${t('thirdPlace')}</div>
        ${renderMatch(bracket.thirdPlace, 'third-place', 'third-place-match')}
      </div>
      ${renderSide(bracket.semis.slice(1, 2), 'right', t('semifinals'))}
      ${renderSide(bracket.cuartos.slice(2, 4), 'right', t('quarterfinals'))}
      ${renderSide(bracket.octavos.slice(4, 8), 'right', t('roundOf16'))}
    </div>
  `;

  container.innerHTML = bracketHtml;

  // Click / keyboard handlers for picking winners
  container.querySelectorAll('.prediction-slot.pickable').forEach(slot => {
    const activate = () => {
      const matchId = slot.dataset.matchId;
      const side = Number(slot.dataset.side);
      if(matchId == null || Number.isNaN(side)) return;
      setPredictionWinner(matchId, side);
    };
    slot.addEventListener('click', activate);
    slot.addEventListener('keydown', (e) => {
      if(e.key === 'Enter' || e.key === ' '){
        e.preventDefault();
        activate();
      }
    });
  });

  const resetBtn = document.getElementById('predictions-reset-btn');
  if(resetBtn){
    resetBtn.addEventListener('click', () => {
      clearPredictionsState();
      renderPrediccionesPanel(players);
    });
  }

  setupPredictionsShareMenu();
}

function setupPredictionsShareMenu(){
  const shareBtn = document.getElementById('predictions-share-btn');
  const menu = document.getElementById('predictions-share-menu');
  if(!shareBtn || !menu) return;

  const closeMenu = () => {
    menu.hidden = true;
    shareBtn.setAttribute('aria-expanded', 'false');
  };

  const openMenu = () => {
    menu.hidden = false;
    shareBtn.setAttribute('aria-expanded', 'true');
  };

  shareBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if(menu.hidden) openMenu();
    else closeMenu();
  });

  menu.querySelectorAll('[data-share-action]').forEach(item => {
    item.addEventListener('click', async (e) => {
      e.stopPropagation();
      const action = item.dataset.shareAction;
      closeMenu();
      await sharePredictionsBracket(shareBtn, action);
    });
  });

  // Close on outside click / Escape (once per render is fine; multiple listeners ok with once flag via abort)
  const onDocClick = (e) => {
    if(!menu.hidden && !menu.contains(e.target) && e.target !== shareBtn){
      closeMenu();
    }
  };
  const onKey = (e) => {
    if(e.key === 'Escape') closeMenu();
  };
  document.addEventListener('click', onDocClick);
  document.addEventListener('keydown', onKey);
}

async function ensureHtml2Canvas(){
  if(window.html2canvas) return window.html2canvas;
  await new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-html2canvas]');
    if(existing){
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('html2canvas load failed')));
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
    script.async = true;
    script.dataset.html2canvas = '1';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('html2canvas load failed'));
    document.head.appendChild(script);
  });
  if(!window.html2canvas) throw new Error('html2canvas unavailable');
  return window.html2canvas;
}

function getPredictionShareText(){
  const championEl = document.querySelector('#predictions-bracket-capture .champion-name');
  const championName = (championEl?.textContent || '').replace(/\s+/g, ' ').trim();
  const pageUrl = window.location.href.split('#')[0];
  const hasChampion = championName && !/tbd|por determinar/i.test(championName);

  if(currentLang === 'en'){
    if(hasChampion){
      return `My Basement World Cup 2026 prediction 🏆\nChampion: ${championName}\n${pageUrl}`;
    }
    return `My Basement World Cup 2026 prediction 🏆\n${pageUrl}`;
  }

  if(hasChampion){
    return `Mi predicción para la Basement World Cup 2026 🏆\nCampeón: ${championName}\n${pageUrl}`;
  }
  return `Mi predicción para la Basement World Cup 2026 🏆\n${pageUrl}`;
}

async function capturePredictionsImage(){
  const captureEl = document.getElementById('predictions-bracket-capture');
  if(!captureEl) throw new Error('No capture element');

  const html2canvas = await ensureHtml2Canvas();
  await new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));

  const canvas = await html2canvas(captureEl, {
    backgroundColor: '#12151a',
    scale: Math.min(2, window.devicePixelRatio || 1.5),
    useCORS: true,
    allowTaint: true,
    logging: false,
    scrollX: 0,
    scrollY: -window.scrollY
  });

  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  if(!blob) throw new Error('toBlob failed');

  const filename = `bwc-prediccion-${new Date().toISOString().slice(0, 10)}.png`;
  const file = new File([blob], filename, { type: 'image/png' });
  return { blob, file, filename, canvas };
}

async function copyImageBlobToClipboard(blob, text = null){
  if(navigator.clipboard && window.ClipboardItem){
    const payload = { [blob.type || 'image/png']: blob };
    // Algunos navegadores aceptan texto + imagen juntos (útil para Discord)
    if(text){
      payload['text/plain'] = new Blob([text], { type: 'text/plain' });
    }
    try{
      await navigator.clipboard.write([new ClipboardItem(payload)]);
      return true;
    }catch(err){
      // Fallback: solo imagen
      if(text){
        await navigator.clipboard.write([
          new ClipboardItem({ [blob.type || 'image/png']: blob })
        ]);
        return 'image-only';
      }
      throw err;
    }
  }
  if(text && navigator.clipboard?.writeText){
    await navigator.clipboard.writeText(text);
    return 'text-only';
  }
  return false;
}

function downloadBlob(blob, filename){
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.rel = 'noopener';
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

function openShareTextUrl(platform, text){
  const encoded = encodeURIComponent(text);
  const pageUrl = encodeURIComponent(window.location.href.split('#')[0]);
  let href = '';
  if(platform === 'x'){
    href = `https://twitter.com/intent/tweet?text=${encoded}`;
  }else if(platform === 'whatsapp'){
    href = `https://wa.me/?text=${encoded}`;
  }else if(platform === 'discord'){
    // Discord no tiene intent público de “compartir texto+imagen”.
    // Abrimos la app web; el mensaje e imagen van por el portapapeles.
    href = 'https://discord.com/app';
  }
  if(href) window.open(href, '_blank', 'noopener,noreferrer');
}

/**
 * action: 'native' | 'copy' | 'download' | 'x' | 'whatsapp' | 'discord'
 */
async function sharePredictionsBracket(button, action = 'native'){
  if(!button) return;
  const originalLabel = button.textContent;
  button.disabled = true;
  button.textContent = t('predictionsSharing');

  try{
    const { blob, file, filename } = await capturePredictionsImage();
    const shareText = getPredictionShareText();

    if(action === 'native'){
      if(navigator.canShare && navigator.canShare({ files: [file] })){
        try{
          await navigator.share({
            files: [file],
            title: t('predictionsTitle'),
            text: shareText
          });
          button.textContent = t('predictionsShareDone');
          setTimeout(() => { button.textContent = originalLabel; button.disabled = false; }, 1500);
          return;
        }catch(shareErr){
          if(shareErr && shareErr.name === 'AbortError'){
            button.textContent = originalLabel;
            button.disabled = false;
            return;
          }
        }
      }
      try{
        const ok = await copyImageBlobToClipboard(blob, shareText);
        if(ok){
          button.textContent = t('predictionsCopied');
          setTimeout(() => { button.textContent = originalLabel; button.disabled = false; }, 1800);
          return;
        }
      }catch(err){}
      downloadBlob(blob, filename);
      button.textContent = t('predictionsShareDone');
      setTimeout(() => { button.textContent = originalLabel; button.disabled = false; }, 1500);
      return;
    }

    if(action === 'copy'){
      try{
        const ok = await copyImageBlobToClipboard(blob, shareText);
        if(!ok) throw new Error('clipboard unsupported');
        button.textContent = t('predictionsCopied');
      }catch(err){
        downloadBlob(blob, filename);
        button.textContent = t('predictionsShareDone');
      }
      setTimeout(() => { button.textContent = originalLabel; button.disabled = false; }, 1800);
      return;
    }

    if(action === 'download'){
      downloadBlob(blob, filename);
      button.textContent = t('predictionsShareDone');
      setTimeout(() => { button.textContent = originalLabel; button.disabled = false; }, 1500);
      return;
    }

    // Discord: copiar mensaje predeterminado + imagen, abrir Discord
    if(action === 'discord'){
      let copied = false;
      try{
        const result = await copyImageBlobToClipboard(blob, shareText);
        copied = Boolean(result);
        // Si solo se copió la imagen, asegurar el texto también
        if(result === 'image-only' && navigator.clipboard?.writeText){
          // No pisar la imagen: algunos browsers solo guardan un tipo.
          // El usuario tendrá la imagen; el mensaje se muestra en el botón/hint.
        }
      }catch(err){
        copied = false;
      }
      if(!copied){
        downloadBlob(blob, filename);
        try{
          if(navigator.clipboard?.writeText) await navigator.clipboard.writeText(shareText);
        }catch(err){}
      }
      openShareTextUrl('discord', shareText);
      button.textContent = copied ? t('predictionsDiscordHint') : t('predictionsShareDone');
      // Hint is longer; restore after a bit more time
      setTimeout(() => { button.textContent = originalLabel; button.disabled = false; }, 3200);
      return;
    }

    // X / WhatsApp: copiar imagen si se puede + abrir compositor con mensaje
    if(action === 'x' || action === 'whatsapp'){
      let copied = false;
      try{
        copied = Boolean(await copyImageBlobToClipboard(blob, shareText));
      }catch(err){
        copied = false;
      }
      if(!copied) downloadBlob(blob, filename);
      openShareTextUrl(action, shareText);
      button.textContent = copied ? t('predictionsCopied') : t('predictionsShareDone');
      setTimeout(() => { button.textContent = originalLabel; button.disabled = false; }, 2000);
      return;
    }

    downloadBlob(blob, filename);
    button.textContent = t('predictionsShareDone');
    setTimeout(() => { button.textContent = originalLabel; button.disabled = false; }, 1500);
  }catch(err){
    console.warn('Share predictions failed', err);
    button.textContent = t('predictionsShareError');
    setTimeout(() => { button.textContent = originalLabel; button.disabled = false; }, 2200);
  }
}

function buildPlayerDetails(player, pbs, runUrl, datePb){
  if(!player){ return '';
  }

  const externalStats = externalPlayerStats.get(normalizeParticipantName(player.names?.international || ''));
  const channelList = playerChannels(player);
  const signupDate = formatDate(player.signup || player.signupDate || player.created || player.date);
  const channelHtml = channelList.length > 0
    ? `<li><strong>Canales:</strong> ${channelList.map((link, index) => {
        const href = link.href ? `href="${link.href}" target="_blank" rel="noopener noreferrer"` : '';
        const label = link.label || link.rel;
        return `<a class="detail-link" ${href}>${label}</a>${index < channelList.length - 1 ? ', ' : ''}`;
      }).join('')}</li>`
    : `<li><strong>${t('channels')}:</strong> ${t('notAvailablePlural')}</li>`;

  const firstPb = Array.isArray(pbs) && pbs.length > 0 ? pbs[0] : null;
  const pbList = Array.isArray(pbs) && pbs.length > 0
    ? pbs.slice(0, 3).map(pb => `<li>${pb.gameName || t('game')} — ${pb.categoryName || t('category')}: ${pb.primaryTime || t('notAvailableShort')}</li>`).join('')
    : `<li>${t('notAvailablePlural')}</li>`;

  const submitted = formatDate(datePb);

  const videoHtml = runUrl
    ? `<div class="detail-video-link"><a class="detail-link" href="${runUrl}" target="_blank" rel="noopener noreferrer">Ver video del PB</a></div>`
    : '';

  const statsHtml = externalStats
    ? `<li class="sheet-stats-item"><strong>Stats del torneo:</strong>
        <ul class="pb-sublist">
          <li>Overall PB: ${externalStats.overallPb || '-'}</li>
          <li>Qualifiers PB: ${externalStats.qualifiersPb || '-'}</li>
          <li>Basement PB: ${externalStats.basementPb || '-'}</li>
          <li>Train Crash: ${externalStats.trainCrash || '-'}</li>
          <li>Tournament Best: ${externalStats.tournamentBest || '-'}</li>
          <li>Win - Losses: ${externalStats.winLoss || '-'}</li>
          <li>Worst Basement: ${externalStats.worstBasement || '-'}</li>
          <li>Worst TC: ${externalStats.worstTC || '-'}</li>
          <li>Worst TB: ${externalStats.worstTB || '-'}</li>
        </ul>
      </li>`
    : '';

      
  
  return `<div class="player-detail">
    <div class="player-detail-title">${player.names?.international || t('player')}</div>
    <ul class="detail-stats">
      <li><strong>${t('signupDate')}:</strong> ${signupDate}</li>
      ${channelHtml}
      ${statsHtml}
      <li class="pb-item"><strong>Personal Bests:</strong>
        <ul class="pb-sublist">${pbList}</ul>
      </li>
      <li><strong>${t('pbUploadDate')}:</strong> ${submitted}</li>
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

function renderPlayerPersonalBests(pbs){
  if(!Array.isArray(pbs) || pbs.length === 0){
    return `<div class="player-modal-empty">${t('notAvailablePlural')}</div>`;
  }
  return `<ul class="pb-sublist">${pbs.slice(0, 3).map(pb =>
    `<li>${pb.gameName || t('game')} — ${pb.categoryName || t('category')}: ${pb.primaryTime || t('notAvailableShort')}</li>`
  ).join('')}</ul>`;
}

function openPlayerModal(playerName){
  const modal = document.getElementById('player-modal');
  const content = document.getElementById('player-modal-content');
  if(!modal || !content) return;
  modal.classList.remove('match-details-open');

  const players = lastLeaderboardSnapshot?.players || [];
  const profile = resolvePlayerByName(players, playerName);
  const summary = getGroupPlayerSummary(playerName);
  const flag = participantCountryFlag(players, playerName);
  const twitchChannel = profile ? playerChannels(profile).find(channel => channel.rel === 'twitch') : null;
  const externalStats = externalPlayerStats.get(normalizeParticipantName(profile?.names?.international || playerName));
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
      <div class="player-match-status">${isUpcoming(match) ? t('upcomingLabel') : (winnerText || t('finishedLabel'))}</div>
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
    <div class="player-modal-section-title">${t('standings')} · ${t('group')} ${summary.letter}</div>
    <div class="player-group-table-wrap"><table class="player-group-table"><thead><tr><th>#</th><th>${t('player')}</th><th>P</th><th>W</th><th>D</th><th>L</th><th>TB</th><th>PTS</th></tr></thead><tbody>
      ${summary.entries.map((groupEntry, index) => `<tr class="${normalizeManualMatchName(groupEntry.name) === normalizeManualMatchName(playerName) ? 'is-selected' : ''}"><td>${index + 1}</td><td>${groupEntry.name}</td><td>${groupEntry.matches}</td><td>${groupEntry.wins}</td><td>${groupEntry.draws}</td><td>${groupEntry.losses}</td><td>${groupEntry.bestTimeLabel || (groupEntry.bestTime != null ? formatTime(groupEntry.bestTime) : '-')}</td><td>${groupEntry.points}</td></tr>`).join('')}
    </tbody></table></div>
  </div>` : '';
  const externalStatsHtml = externalStats ? `<div class="player-modal-section">
    <div class="player-modal-section-title">Stats del torneo</div>
    <div class="player-modal-external-stats">
      <div><span>Overall PB</span><strong>${externalStats.overallPb || '-'}</strong></div>
      <div><span>Qualifiers PB</span><strong>${externalStats.qualifiersPb || '-'}</strong></div>
      <div><span>Basement PB</span><strong>${externalStats.basementPb || '-'}</strong></div>
      <div><span>Train Crash</span><strong>${externalStats.trainCrash || '-'}</strong></div>
      <div><span>Tournament Best</span><strong>${externalStats.tournamentBest || '-'}</strong></div>
      <div><span>Win - Losses</span><strong>${externalStats.winLoss || '-'}</strong></div>
      <div><span>Worst Basement</span><strong>${externalStats.worstBasement || '-'}</strong></div>
      <div><span>Worst TC</span><strong>${externalStats.worstTC || '-'}</strong></div>
      <div><span>Worst TB</span><strong>${externalStats.worstTB || '-'}</strong></div>
    </div>
  </div>` : '';

  content.innerHTML = `
    <div class="player-modal-kicker">${t('groupStage')}${summary ? ` · ${t('group')} ${summary.letter}` : ''}</div>
    <h2 id="player-modal-title">${flag ? `<span class="flag">${flag}</span> ` : ''}${playerName}</h2>
    ${twitchChannel ? `<a class="player-modal-twitch" href="${twitchChannel.href}" target="_blank" rel="noopener noreferrer"><span aria-hidden="true">TW</span> ${t('twitchChannel')}</a>` : ''}
    <div class="player-modal-position">${summary ? `<strong>${summary.rank}º</strong> ${t('of')} ${summary.total} ${t('inGroup')} ${summary.letter}` : t('positionPending')}</div>
    <div class="player-modal-stats">
      <div><span>P</span><strong>${entry.matches}</strong></div>
      <div><span>W</span><strong>${entry.wins}</strong></div>
      <div><span>D</span><strong>${entry.draws}</strong></div>
      <div><span>L</span><strong>${entry.losses}</strong></div>
      <div><span>TB</span><strong>${bestTime}</strong></div>
      <div><span>PTS</span><strong>${entry.points}</strong></div>
    </div>
    ${externalStatsHtml}
    ${profile && profile.rel !== 'guest' ? `<div class="player-modal-section">
      <div class="player-modal-section-title">${t('personalBests')}</div>
      <div id="player-modal-personal-bests">${t('loadingPersonalBests')}</div>
    </div>` : ''}
    ${groupTable}
    <div class="player-modal-section">
      <div class="player-modal-section-title">${t('matchesOfGroup')} ${summary?.letter || ''}</div>
      ${renderMatchSection(t('pastMatches'), pastMatches, t('noPastMatches'))}
      ${renderMatchSection(t('upcomingMatches'), upcomingMatches, t('noUpcomingMatches'))}
    </div>
    ${profile ? `<div class="player-modal-note">${t('groupStageOnlyNote')}</div>` : ''}
  `;
  modal.hidden = false;
  document.body.classList.add('modal-open');

  if(profile && profile.rel !== 'guest'){
    const personalBestsContainer = content.querySelector('#player-modal-personal-bests');
    fetchPlayerPersonalBests(profile).then(pbs => {
      if(personalBestsContainer?.isConnected){
        personalBestsContainer.innerHTML = renderPlayerPersonalBests(pbs);
      }
    });
  }
}

function closePlayerModal(){
  const modal = document.getElementById('player-modal');
  if(!modal) return;
  modal.hidden = true;
  modal.classList.remove('match-details-open');
  document.body.classList.remove('modal-open');
  pendingMatchDetailsModal = null;
}

function getMatchSeriesPageCount(stage, groupLetter){
  const key = String(stage || groupLetter || '').toLowerCase();
  if(/third[\s_-]*place|3rd[\s_-]*place|tercer[\s_-]*puesto/.test(key)) return 3;
  if(/(^|[\s_-])final([\s_-]|$)/.test(key)) return 5;
  if(key === 'r16' || key === 'qf' || key === 'sf' || key.includes('quarter') || key.includes('octavos') || key.includes('cuartos') || key.includes('semi') || key.includes('round of 16')) return 3;
  return 1;
}

function openMatchDetailsModal(playerA, playerB, groupLetter){
  const modal = document.getElementById('player-modal');
  const content = document.getElementById('player-modal-content');
  if(!modal || !content) return;
  modal.classList.add('match-details-open');

  const stillLoading = !externalMatchDetails && externalMatchDetailsLoad != null;
  if(stillLoading){
    pendingMatchDetailsModal = { playerA, playerB, groupLetter };
  }else{
    pendingMatchDetailsModal = null;
  }

  const details = getMatchDetailsForPlayers(playerA, playerB);
  const players = lastLeaderboardSnapshot?.players || [];
  const profileA = resolvePlayerByName(players, playerA);
  const profileB = resolvePlayerByName(players, playerB);
  const pictureA = getPlayerAvatarMarkup(profileA, true);
  const pictureB = getPlayerAvatarMarkup(profileB, true);

  let timeA = details?.timeA || '-';
  let timeB = details?.timeB || '-';
  let seriesScoreA = null;
  let seriesScoreB = null;
  let scheduleGames = [];
  let resultMatchStage = null;

  if(getLoadedResults()){
    const allMatches = getLoadedResults()?.matches || [];
    const resultMatch = allMatches.find(record => {
      const recordA = record.playerA || record.jugadorA || record.a || record.teamA || record.player_1;
      const recordB = record.playerB || record.jugadorB || record.b || record.teamB || record.player_2;
      return (normalizeManualMatchName(recordA) === normalizeManualMatchName(playerA) && normalizeManualMatchName(recordB) === normalizeManualMatchName(playerB)) ||
             (normalizeManualMatchName(recordA) === normalizeManualMatchName(playerB) && normalizeManualMatchName(recordB) === normalizeManualMatchName(playerA));
    });
    if(resultMatch){
      resultMatchStage = resultMatch.stage || null;
      const sameOrder = normalizeManualMatchName(resultMatch.playerA || resultMatch.jugadorA || resultMatch.a) === normalizeManualMatchName(playerA);
      if(resultMatch.seriesScoreA != null && resultMatch.seriesScoreB != null){
        seriesScoreA = sameOrder ? resultMatch.seriesScoreA : resultMatch.seriesScoreB;
        seriesScoreB = sameOrder ? resultMatch.seriesScoreB : resultMatch.seriesScoreA;
      }
      const rawA = resultMatch.timeA ?? resultMatch.tiempoA ?? resultMatch.time_a ?? '-';
      const rawB = resultMatch.timeB ?? resultMatch.tiempoB ?? resultMatch.time_b ?? '-';
      if((!details || timeA === '-' || timeB === '-')){
        if(sameOrder){
          if(timeA === '-') timeA = rawA;
          if(timeB === '-') timeB = rawB;
        }else{
          if(timeA === '-') timeA = rawB;
          if(timeB === '-') timeB = rawA;
        }
      }
      const games = Array.isArray(resultMatch.games) ? resultMatch.games : [];
      scheduleGames = games.map(game => sameOrder
        ? { timeA: game.timeA, timeB: game.timeB }
        : { timeA: game.timeB, timeB: game.timeA }
      );
    }
  }

  if(seriesScoreA != null && seriesScoreB != null){
    timeA = String(seriesScoreA);
    timeB = String(seriesScoreB);
  }

  // Detalles del sheet: puede traer varios mapas (Match 49/50/51...) del mismo cruce
  const detailsSameOrder = !details || normalizeManualMatchName(details.playerA) === normalizeManualMatchName(playerA);
  const mapDetailGame = (game) => {
    if(!game) return null;
    if(detailsSameOrder){
      return {
        matchLabel: game.matchLabel || null,
        timeA: game.timeA || '-',
        timeB: game.timeB || '-',
        timeABetter: Boolean(game.timeABetter),
        timeBBetter: Boolean(game.timeBBetter),
        segments: Array.isArray(game.segments) ? game.segments : []
      };
    }
    return {
      matchLabel: game.matchLabel || null,
      timeA: game.timeB || '-',
      timeB: game.timeA || '-',
      timeABetter: Boolean(game.timeBBetter),
      timeBBetter: Boolean(game.timeABetter),
      segments: (Array.isArray(game.segments) ? game.segments : []).map(seg => ({
        label: seg.label,
        valueA: seg.valueB,
        valueB: seg.valueA,
        betterA: Boolean(seg.betterB),
        betterB: Boolean(seg.betterA)
      }))
    };
  };

  let detailGames = [];
  if(details){
    if(Array.isArray(details.games) && details.games.length){
      detailGames = details.games.map(mapDetailGame).filter(Boolean);
    }else if(details.segments || details.timeA || details.timeB){
      detailGames = [mapDetailGame({
        matchLabel: null,
        timeA: details.timeA,
        timeB: details.timeB,
        timeABetter: details.timeABetter,
        timeBBetter: details.timeBBetter,
        segments: details.segments || []
      })].filter(Boolean);
    }
  }

  let segments = detailGames[0]?.segments || details?.segments || [];
  let timeABetter = Boolean(detailGames[0]?.timeABetter ?? details?.timeABetter);
  let timeBBetter = Boolean(detailGames[0]?.timeBBetter ?? details?.timeBBetter);

  if(seriesScoreA != null && seriesScoreB != null){
    timeA = String(seriesScoreA);
    timeB = String(seriesScoreB);
    const nA = Number(seriesScoreA);
    const nB = Number(seriesScoreB);
    timeABetter = Number.isFinite(nA) && Number.isFinite(nB) && nA > nB;
    timeBBetter = Number.isFinite(nA) && Number.isFinite(nB) && nB > nA;
  }

  const isKnockoutMatch = getKnockoutSeriesTarget(resultMatchStage, groupLetter) != null;

  const expectedPages = isKnockoutMatch
    ? getMatchSeriesPageCount(resultMatchStage || groupLetter, groupLetter)
    : 1;

  // Páginas = mapas del BO3/BO5. Prioridad: sheet de detalles (Match 49/50/51) > schedule > placeholders
  const gamePages = [];
  const pageCount = Math.max(
    expectedPages,
    detailGames.length,
    scheduleGames.length || (isKnockoutMatch ? 0 : 1),
    isKnockoutMatch ? expectedPages : 1
  );

  for(let i = 0; i < pageCount; i++){
    const detailGame = detailGames[i] || null;
    const scheduleGame = scheduleGames[i] || null;
    const pageSegments = detailGame?.segments || (pageCount === 1 ? segments : []);
    gamePages.push({
      index: i,
      matchLabel: detailGame?.matchLabel || null,
      timeA: detailGame?.timeA || scheduleGame?.timeA || (pageCount === 1 && !isKnockoutMatch ? timeA : '-'),
      timeB: detailGame?.timeB || scheduleGame?.timeB || (pageCount === 1 && !isKnockoutMatch ? timeB : '-'),
      timeABetter: Boolean(detailGame?.timeABetter),
      timeBBetter: Boolean(detailGame?.timeBBetter),
      segments: pageSegments
    });
  }

  // Grupos BO1 sin schedule multi-game: una página con segmentos del sheet
  if(!isKnockoutMatch && !scheduleGames.length && detailGames.length <= 1){
    gamePages.length = 0;
    const g = detailGames[0];
    gamePages.push({
      index: 0,
      matchLabel: g?.matchLabel || null,
      timeA: g?.timeA || timeA,
      timeB: g?.timeB || timeB,
      timeABetter: Boolean(g?.timeABetter),
      timeBBetter: Boolean(g?.timeBBetter),
      segments: g?.segments || segments
    });
  }

  const knockoutStageLabel = (() => {
    const stage = `${resultMatchStage || ''} ${groupLetter || ''}`.toLowerCase();
    if(/third[\s_-]*place|3rd[\s_-]*place|tercer[\s_-]*puesto/.test(stage)) return t('thirdPlace');
    if(/(^|\s)final(\s|$)/.test(stage)) return t('final');
    if(/semi|\bsf\b/.test(stage)) return t('semifinals');
    if(/quarter|cuartos|\bqf\b/.test(stage)) return t('quarterfinals');
    return t('roundOf16');
  })();
  const stageTitle = isKnockoutMatch
    ? knockoutStageLabel
    : (groupLetter && FINAL_GROUPS[groupLetter]
      ? `${t('group')} ${groupLetter}`
      : (groupLetter ? `${t('group')} ${groupLetter}` : t('groupStage')));

  const seriesLabel = seriesScoreA != null && seriesScoreB != null
    ? `${seriesScoreA} - ${seriesScoreB}`
    : null;

  const formatDisplayTime = (raw, { allowPlainNumber = false } = {}) => {
    const text = String(raw ?? '').trim();
    if(!text || text === '-') return '-';
    if(/^(DEAD|DEATH|DIED)\b/i.test(text)) return text.toUpperCase().startsWith('DEAD') ? 'DEAD' : 'DIED';
    if(allowPlainNumber && /^\d+$/.test(text)) return text;
    return formatManualTime(text);
  };

  const segmentRowClass = (seg) => {
    if(seg.betterA || seg.betterB){
      return {
        a: seg.betterA ? 'md-stat-better' : (seg.betterB ? 'md-stat-worse' : ''),
        b: seg.betterB ? 'md-stat-better' : (seg.betterA ? 'md-stat-worse' : '')
      };
    }
    if(seg.valueA === seg.valueB) return { a: 'md-stat-equal', b: 'md-stat-equal' };
    const valueA = seg.valueA;
    const valueB = seg.valueB;
    const secA = parseManualTime(valueA);
    const secB = parseManualTime(valueB);
    const deathA = /^(DEAD|DEATH|DIED)\b/i.test(String(valueA || ''));
    const deathB = /^(DEAD|DEATH|DIED)\b/i.test(String(valueB || ''));
    if(deathA && !deathB) return { a: 'md-stat-worse', b: 'md-stat-better' };
    if(deathB && !deathA) return { a: 'md-stat-better', b: 'md-stat-worse' };
    if(secA != null && secB != null){
      if(secA < secB) return { a: 'md-stat-better', b: 'md-stat-worse' };
      if(secB < secA) return { a: 'md-stat-worse', b: 'md-stat-better' };
    }
    return { a: '', b: '' };
  };

  const gameTimeBetter = (valueA, valueB) => {
    const deathA = /^(DEAD|DEATH|DIED)\b/i.test(String(valueA || ''));
    const deathB = /^(DEAD|DEATH|DIED)\b/i.test(String(valueB || ''));
    if(deathA && !deathB) return { a: false, b: true };
    if(deathB && !deathA) return { a: true, b: false };
    const secA = parseManualTime(valueA);
    const secB = parseManualTime(valueB);
    if(secA != null && secB != null){
      if(secA < secB) return { a: true, b: false };
      if(secB < secA) return { a: false, b: true };
    }
    return { a: false, b: false };
  };

  let currentPage = 0;

  const renderPage = () => {
    const page = gamePages[currentPage] || gamePages[0];
    const totalPages = gamePages.length;
    const pageTimeA = page?.timeA ?? '-';
    const pageTimeB = page?.timeB ?? '-';
    const inferredBetter = gameTimeBetter(pageTimeA, pageTimeB);
    const better = {
      a: page?.timeABetter || inferredBetter.a,
      b: page?.timeBBetter || inferredBetter.b
    };
    const formattedA = formatDisplayTime(pageTimeA);
    const formattedB = formatDisplayTime(pageTimeB);
    const hasResult = formattedA !== '-' || formattedB !== '-';
    const seriesTarget = getKnockoutSeriesTarget(resultMatchStage, groupLetter);
    const hasSeriesScore = seriesScoreA != null && seriesScoreB != null
      && String(seriesScoreA).trim() !== '' && String(seriesScoreB).trim() !== '';
    const seriesScoreAValue = Number(seriesScoreA);
    const seriesScoreBValue = Number(seriesScoreB);
    const seriesDecided = seriesTarget != null && hasSeriesScore
      && Number.isFinite(seriesScoreAValue) && Number.isFinite(seriesScoreBValue)
      && (seriesScoreAValue >= seriesTarget || seriesScoreBValue >= seriesTarget);
    const statusLabel = seriesTarget != null && hasSeriesScore && !seriesDecided
      ? (hasResult ? t('inProgressLabel') : t('upcomingLabel'))
      : (hasResult ? t('finishedLabel') : t('upcomingLabel'));
    const matchLabel = page?.matchLabel || null;

    const pageSegments = page?.segments || [];
    const segmentsHtml = pageSegments.length
      ? pageSegments.map(seg => {
          const va = seg.valueA || '-';
          const vb = seg.valueB || '-';
          const cls = segmentRowClass(seg);
          return `
            <div class="md-stat-row">
              <div class="md-stat-value ${cls.a}"><span>${va}</span></div>
              <div class="md-stat-label">${seg.label}</div>
              <div class="md-stat-value ${cls.b}"><span>${vb}</span></div>
            </div>`;
        }).join('')
      : stillLoading
        ? `<div class="md-empty md-loading">${t('loadingTabla')}</div>`
        : (totalPages > 1
          ? `<div class="md-empty">${hasResult ? '' : t('matchDetailsNoData')}</div>`
          : `<div class="md-empty">${t('matchDetailsNoData')}</div>`);

    const pagerHtml = totalPages > 1 ? `
      <div class="md-pager">
        <button type="button" class="md-pager-btn md-pager-prev" ${currentPage === 0 ? 'disabled' : ''} aria-label="Anterior">&#9664;</button>
        <span class="md-pager-indicator">${matchLabel || ((t('matchSingular') ? (t('matchSingular').charAt(0).toUpperCase() + t('matchSingular').slice(1)) : 'Match') + ' ' + (currentPage + 1))} · ${currentPage + 1}/${totalPages}</span>
        <button type="button" class="md-pager-btn md-pager-next" ${currentPage >= totalPages - 1 ? 'disabled' : ''} aria-label="Siguiente">&#9654;</button>
      </div>` : '';

    const seriesHtml = seriesLabel
      ? `<div class="md-series-score">${seriesLabel}${isKnockoutMatch ? ' · BO' + totalPages : ''}</div>`
      : '';

    content.innerHTML = `
    <style>
      .player-modal.match-details-open .player-modal-card {
        width: min(100%, 645px) !important;
        max-width: min(100%, 645px) !important;
      }
      .md-wrap { color: #e8e8e8; font-family: inherit; }
      .md-topbar {
        display: flex; justify-content: space-between; align-items: center;
        font-size: 0.78rem; letter-spacing: 0.02em; margin-bottom: 0.75rem;
        color: #c9a227;
      }
      .md-topbar .md-status { color: #9aa0a6; }
      .md-series-score {
        text-align: center; font-size: 0.85rem; font-weight: 700;
        color: var(--gold, #ffd166); margin-bottom: 0.65rem;
        letter-spacing: 0.04em;
      }
      .md-scoreboard {
        display: grid;
        grid-template-columns: 1fr auto 1fr;
        align-items: center;
        gap: 0.75rem;
        margin-bottom: 0.35rem;
      }
      .md-team {
        display: flex; flex-direction: column; align-items: center; gap: 0.45rem;
        text-align: center; min-width: 0;
      }
      .md-team-name {
        font-size: 0.95rem; font-weight: 600; line-height: 1.2;
        word-break: break-word;
      }
      .md-avatar {
        width: 42px; height: 42px; border-radius: 50%;
        display: inline-flex; align-items: center; justify-content: center;
        background: #1a1d24; overflow: hidden;
        box-shadow: 0 0 0 2px rgba(255,255,255,0.08);
      }
      .md-avatar img, .md-avatar .flag-image { width: 28px; height: auto; display: block; }
      .md-score {
        display: flex; align-items: center; justify-content: center; gap: 0.55rem;
        font-size: 1.85rem; font-weight: 700; font-variant-numeric: tabular-nums;
        letter-spacing: -0.02em; line-height: 1;
      }
      .md-score-num { min-width: 3.2ch; text-align: center; }
      .md-score-num.md-score-better { color: #7c9eff; text-shadow: 0 0 12px rgba(124, 158, 255, 0.35); }
      .md-score-sep { color: #6b7280; font-weight: 500; font-size: 1.4rem; }
      .md-subtitle {
        text-align: center; font-size: 0.8rem; color: #9aa0a6;
        margin: 0.15rem 0 0.85rem;
      }
      .md-pager {
        display: flex; align-items: center; justify-content: center; gap: 1rem;
        margin: 0.35rem 0 1rem;
      }
      .md-pager-btn {
        appearance: none; border: 1px solid rgba(255,255,255,0.15);
        background: #2a2f38; color: #e8e8e8; width: 2.2rem; height: 2.2rem;
        border-radius: 8px; cursor: pointer; font-size: 0.85rem;
        display: inline-flex; align-items: center; justify-content: center;
      }
      .md-pager-btn:hover:not(:disabled){ background: #3a3f4b; }
      .md-pager-btn:disabled{ opacity: 0.35; cursor: default; }
      .md-pager-indicator {
        font-size: 0.82rem; font-weight: 700; letter-spacing: 0.06em;
        text-transform: uppercase; color: #c4c7cc; min-width: 7rem; text-align: center;
      }
      .md-stats-title {
        text-align: center; font-size: 0.72rem; font-weight: 700;
        letter-spacing: 0.12em; text-transform: uppercase;
        color: #9aa0a6; margin: 0 0 0.85rem;
        display: flex; align-items: center; justify-content: center; gap: 0.6rem;
      }
      .md-stats-title::before, .md-stats-title::after {
        content: ''; flex: 1; height: 1px; background: rgba(255,255,255,0.08);
        max-width: 72px;
      }
      .md-stat-row {
        display: grid;
        grid-template-columns: minmax(4.5rem, 1fr) minmax(6rem, 1.4fr) minmax(4.5rem, 1fr);
        align-items: center;
        gap: 0.5rem;
        padding: 0.55rem 0;
        border-bottom: 1px solid rgba(255,255,255,0.06);
      }
      .md-stat-row:last-child { border-bottom: none; }
      .md-stat-label {
        text-align: center; font-size: 0.82rem; color: #c4c7cc;
        line-height: 1.25;
      }
      .md-stat-value { display: flex; justify-content: center; }
      .md-stat-value span {
        display: inline-flex; align-items: center; justify-content: center;
        min-width: 2.6rem; min-height: 2rem;
        padding: 0.28rem 0.55rem;
        border-radius: 999px;
        font-size: 0.78rem; font-weight: 700;
        background: #2a2f38; color: #f0f0f0;
        font-variant-numeric: tabular-nums;
        text-align: center; line-height: 1.15;
        max-width: 100%; word-break: break-word;
      }
      .md-stat-value.md-stat-better span {
        background: #30a230; color: #fff;
        box-shadow: 0 0 10px rgba(124, 158, 255, 0.35);
      }
      .md-stat-value.md-stat-worse span {
        background: #ed5050; color: #b0b4ba;
      }
      .md-stat-value.md-stat-equal span {
        background: #2a2f38; color: #ffffff;
      }
      .md-empty {
        text-align: center; color: #9aa0a6; padding: 1rem 0.5rem; font-size: 0.9rem;
        min-height: 1.2rem;
      }
      @media (max-width: 420px) {
        .md-score { font-size: 1.35rem; gap: 0.35rem; }
        .md-stat-row {
          grid-template-columns: minmax(3.5rem, 1fr) minmax(5rem, 1.3fr) minmax(3.5rem, 1fr);
        }
        .md-stat-value span { font-size: 0.7rem; padding: 0.22rem 0.4rem; }
      }
    </style>
    <div class="md-wrap">
      <div class="md-topbar">
        <span>${stageTitle}</span>
        <span class="md-status">${statusLabel}</span>
      </div>
      ${seriesHtml}
      ${pagerHtml}

      <div class="md-scoreboard">
        <div class="md-team">
          ${pictureA}
          <div class="md-team-name">${playerA}</div>
        </div>
        <div class="md-score" aria-label="${t('matchDetailsFinalTime')}">
          <span class="md-score-num ${better.a ? 'md-score-better' : ''}">${formattedA}</span>
          <span class="md-score-sep">-</span>
          <span class="md-score-num ${better.b ? 'md-score-better' : ''}">${formattedB}</span>
        </div>
        <div class="md-team">
          ${pictureB}
          <div class="md-team-name">${playerB}</div>
        </div>
      </div>

      <div class="md-subtitle">${totalPages > 1
        ? (matchLabel || `${t('matchSingular') ? t('matchSingular').charAt(0).toUpperCase() + t('matchSingular').slice(1) : 'Match'} ${currentPage + 1}`)
        : (isKnockoutMatch ? t('roundOf16') : `${t('groupStage')}${groupLetter ? ` · ${t('group')} ${groupLetter}` : ''}`)
      }</div>

      <div class="md-stats-title">${t('matchDetailsSegment')}</div>
      <div class="md-stats-list">
        ${segmentsHtml}
      </div>
    </div>
  `;

    content.querySelector('.md-pager-prev')?.addEventListener('click', () => {
      if(currentPage > 0){
        currentPage -= 1;
        renderPage();
      }
    });
    content.querySelector('.md-pager-next')?.addEventListener('click', () => {
      if(currentPage < totalPages - 1){
        currentPage += 1;
        renderPage();
      }
    });
  };

  renderPage();
  modal.hidden = false;
  document.body.classList.add('modal-open');

  [
    [playerA, profileA],
    [playerB, profileB]
  ].forEach(([playerName, profile]) => {
    if(profile) return;
    const profileKey = normalizeParticipantName(playerName);
    getHomePlayerProfile(playerName).then(loadedProfile => {
      const imageUrl = loadedProfile?.assets?.image?.uri;
      if(!imageUrl || !modal.classList.contains('match-details-open')) return;
      const image = content.querySelector(`.md-avatar[data-player-profile-key="${profileKey}"]`);
      if(image) image.src = imageUrl;
    });
  });
}


let fileViewerState = null;

function fadeOutAndStop(audio, duration = 800){
  if(audio._fadeInterval) clearInterval(audio._fadeInterval);
  const startVolume = audio.volume || 1;
  const steps = 20;
  let step = 0;
  audio._fadeInterval = setInterval(() => {
    step++;
    audio.volume = Math.max(0, startVolume * (1 - step / steps));
    if(step >= steps){
      clearInterval(audio._fadeInterval);
      audio._fadeInterval = null;
      audio.pause();
      audio.currentTime = 0;
      audio.volume = startVolume;
    }
  }, duration / steps);
}

// file:// no soporta Range requests para audio: Chromium aborta la carga de mp3/wav grandes.
// Se descarga como blob y se asigna como src para evitar ese bug.
function loadAudioAsBlob(src, audio){
  return fetch(src)
    .then(res => res.blob())
    .then(blob => { audio.src = URL.createObjectURL(blob); })
    .catch(() => { audio.src = src; });
}

function initFileViewer(){
  loadJdVisitCounter();
  const modal = document.getElementById('file-modal');
  if(!modal) return null;
  const pages = Array.from(modal.querySelectorAll('.page'));
  const arrowLeft = document.getElementById('fileArrowLeft');
  const arrowRight = document.getElementById('fileArrowRight');
  const indicator = document.getElementById('filePageIndicator');
  const exitPrompt = document.getElementById('fileExitPrompt');
  const pageSound = new Audio();
  const cancelSound = new Audio();
  const mainTheme = new Audio();
  mainTheme.loop = true;

  const ready = Promise.all([
    loadAudioAsBlob('exfile/page.mp3', pageSound),
    loadAudioAsBlob('exfile/cancel.wav', cancelSound),
    loadAudioAsBlob('exfile/main.mp3', mainTheme)
  ]);

  let current = 0;

  function render(){
    pages.forEach((page, index) => {
      page.classList.toggle('active', index === current);
      page.classList.toggle('prev', index < current);
    });
    indicator.textContent = `${current + 1} / ${pages.length}`;
    arrowLeft.classList.toggle('hidden', current === 0);
    arrowRight.classList.toggle('hidden', current === pages.length - 1);
    if(current === pages.length - 1) exitPrompt.focus({ preventScroll: true });
  }

  function playPageSound(){
    pageSound.currentTime = 0;
    pageSound.play().catch(() => {});
  }

  function goNext(){
    if(current < pages.length - 1){
      current++;
      playPageSound();
      render();
    }
  }

  function goPrev(){
    if(current > 0){
      current--;
      playPageSound();
      render();
    }
  }

  function reset(){
    current = 0;
    render();
  }

  function exit(){
    cancelSound.currentTime = 0;
    cancelSound.play().catch(() => {});
    closeFileModal();
  }

  function handleKeydown(event){
    if(modal.hidden) return;
    const onLastPage = current === pages.length - 1;
    if(event.key === 'ArrowRight'){
      if(onLastPage) exit(); else goNext();
    }else if(event.key === 'ArrowLeft'){
      goPrev();
    }else if(event.key === 'Enter' && onLastPage){
      exit();
    }
  }

  arrowRight.addEventListener('click', goNext);
  arrowLeft.addEventListener('click', goPrev);
  exitPrompt.addEventListener('click', exit);
  document.addEventListener('keydown', handleKeydown);

  render();

  return { reset, mainTheme, cancelSound, ready };
}

function openFileModal(){
  const modal = document.getElementById('file-modal');
  if(!modal) return;
  if(!fileViewerState) fileViewerState = initFileViewer();
  if(fileViewerState){
    fileViewerState.reset();
    fileViewerState.ready.then(() => {
      const audio = fileViewerState.mainTheme;
      if(audio._fadeInterval){
        clearInterval(audio._fadeInterval);
        audio._fadeInterval = null;
      }
      audio.volume = 1;
      audio.play().catch(() => {});
    });
  }
  modal.hidden = false;
  document.body.classList.add('modal-open');
}

function closeFileModal(){
  const modal = document.getElementById('file-modal');
  if(!modal) return;
  modal.hidden = true;
  document.body.classList.remove('modal-open');
  if(fileViewerState) fadeOutAndStop(fileViewerState.mainTheme);
}

document.addEventListener('click', (event) => {
  const matchCard = event.target.closest('.fixture-match-clickable');
  if(matchCard){
    // Don't open modal when clicking the live stream link
    if(event.target.closest('a.fixture-live-button')) return;
    openMatchDetailsModal(
      matchCard.dataset.playerA,
      matchCard.dataset.playerB,
      matchCard.dataset.group || ''
    );
    return;
  }

  const playerButton = event.target.closest('.player-profile-button');
  if(playerButton){
    openPlayerModal(playerButton.dataset.playerName);
    return;
  }

  if(event.target.closest('[data-close-player-modal]')) closePlayerModal();

  if(event.target.closest('[data-open-file-modal]')) openFileModal();
  if(event.target.closest('[data-close-file-modal]')) closeFileModal();
});

document.addEventListener('keydown', (event) => {
  if(event.key === 'Escape'){
    closePlayerModal();
    closeFileModal();
  }
  // Enter/Space on focused match card
  if((event.key === 'Enter' || event.key === ' ') && event.target.classList?.contains('fixture-match-clickable')){
    event.preventDefault();
    openMatchDetailsModal(
      event.target.dataset.playerA,
      event.target.dataset.playerB,
      event.target.dataset.group || ''
    );
  }
});

async function loadLeaderboard(){
  const statusEl = document.getElementById('status');
  try{
    const json = await fetchLeaderboardData();
    // Match details (colores/segmentos) se carga en background: no bloquea el arranque
    await Promise.all([externalStatsLoad, externalMatchScheduleLoad]);
    startLiveStatusPolling();
    const data = json.data;
    const players = data.players.data;
    const runs = Array.isArray(data.runs)
      ? [...data.runs].sort((a, b) => (a.place ?? Number.MAX_SAFE_INTEGER) - (b.place ?? Number.MAX_SAFE_INTEGER))
      : [];

    const container = document.getElementById('tabla-content');
    if(runs.length === 0){
      renderHomePanel(players);
      container.innerHTML = `<div class="loading">${t('noRunsYet')}</div>`;
      document.getElementById('grupos-content').innerHTML = `<div class="loading">${t('noDataForGroups')}</div>`;
      return;
    }

    lastLeaderboardSnapshot = { runs, players };
    renderHomePanel(players);
    renderStatsPanel();
    renderGroupsPanel(runs, players);
    renderFixturePanel(players);
    renderEliminatoriasPanel(runs, players);
    renderPrediccionesPanel(players);
    if(!externalMatchSchedule) await loadAutoResults();

    const qualifyingRows = buildQualifyingRows(runs, players);
    let html = `<table><thead><tr><th>#</th><th>${t('player')}</th><th>${t('time')}</th></tr></thead><tbody>`;
    const currentOrder = [];

    qualifyingRows.forEach(row => {
      const place = row.place;
      const name = row.name;
      const flag = participantCountryFlag(players, name);
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
          ` : `<span class="player-name${isPending ? ' pending-player' : ''}">${name}</span>${flag ? ` <span class="flag">${flag}</span>` : ''}`}
        </td>
        <td class="time ${isPending ? 'pending-value' : ''}">${time}</td>
      </tr>
      `;
    });

    html += '</tbody></table>';

    container.innerHTML = html;

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
  }catch(err){
    if(statusEl){
      statusEl.textContent = "error: " + err.message;
      statusEl.className = "status error";
    }
    document.getElementById('tabla-content').innerHTML =
      `<div class="loading">${t('leaderboardLoadError')}<br><small style="opacity:.7">` +
      err.message.replace(/</g,'&lt;') + '</small></div>';
    console.error(err);
  }
}

externalStatsLoad = loadAllExternalStats().then(renderStatsPanel);
externalMatchScheduleLoad = loadExternalMatchSchedule();
externalMatchDetailsLoad = loadExternalMatchDetails();
loadLeaderboard();
loadVisitCounter();

let aboutInputResetTimer = null;

function hideAboutCodeLegend(){
  const legendWrap = document.getElementById('about-code-legend-wrap');
  if(legendWrap) legendWrap.classList.remove('visible');
}

function resetAboutSecretInput(){
  clearTimeout(aboutInputResetTimer);
  aboutInputResetTimer = null;
  hideAboutCodeLegend();
  const input = document.getElementById('about-code-input');
  if(input){
    input.value = '';
    input.blur();
  }
}

function checkAboutSecretCode(code){
  if(code === '4312'){
    loadRpdRightVisitCounter();
    window.location.href = 'https://gabiale97.github.io/pharmacy_practice/';
  }
}

function setupAboutSecretInput(){
  const dot = document.getElementById('about-pulse-dot');
  const legendWrap = document.getElementById('about-code-legend-wrap');
  const input = document.getElementById('about-code-input');
  if(!dot || !legendWrap || !input) return;

  dot.addEventListener('click', () => {
    loadRpdVisitCounter();
    legendWrap.classList.add('visible');
    input.value = '';
    input.focus();
    clearTimeout(aboutInputResetTimer);
    aboutInputResetTimer = setTimeout(resetAboutSecretInput, 5000);
  });

  input.addEventListener('input', () => {
    clearTimeout(aboutInputResetTimer);
    aboutInputResetTimer = setTimeout(resetAboutSecretInput, 5000);

    const digits = input.value.replace(/\D/g, '').slice(0, 4);
    input.value = digits;
    if(digits.length === 4){
      checkAboutSecretCode(digits);
      resetAboutSecretInput();
    }
  });

  input.addEventListener('blur', hideAboutCodeLegend);
}

// Pestañas simples para cambiar secciones
let aboutPulseInterval = null;

function startAboutPulse(){
  const dot = document.getElementById('about-pulse-dot');
  if(!dot || aboutPulseInterval) return;
  const start = Date.now();
  aboutPulseInterval = setInterval(() => {
    const phase = ((Date.now() - start) % 90) / 90;
    const intensity = 0.3 + 0.7 * Math.abs(Math.sin(phase * Math.PI));
    dot.style.opacity = intensity.toFixed(3);
    dot.style.boxShadow = `0 0 ${6 + intensity * 12}px ${2 + intensity * 4}px rgba(255,59,59,${(intensity * 0.65).toFixed(3)})`;
  }, 10);
}

function stopAboutPulse(){
  if(!aboutPulseInterval) return;
  clearInterval(aboutPulseInterval);
  aboutPulseInterval = null;
}

function setupTabs(){
  const buttons = document.querySelectorAll('.tab-button');
  const panels = document.querySelectorAll('.tab-panel');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.target;
      buttons.forEach(b => b.classList.toggle('active', b === btn));
      panels.forEach(p => p.classList.toggle('active', p.id === target));
      if(target !== 'about') resetAboutSecretInput();
      if(target === 'about') startAboutPulse();
      else stopAboutPulse();
    });
  });
}
setupTabs();
setupAboutSecretInput();