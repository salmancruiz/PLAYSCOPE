// PlayScope Core Application Logic - Pro Analyst Edition
let matchesData = [];
let currentLoadedMatch = null;
let currentLanguage = 'en';

// Multilingual Dictionary (English <-> Arabic)
const i18n = {
  en: {
    hero_pill: "PERFORMANCE LAB & MATCH INTELLIGENCE",
    hero_title: "Modern Football Performance Intelligence",
    hero_sub: "Interactive spatial shot maps, xT momentum modeling, and scouting debriefs engineered for professional clubs and performance analysts.",
    leadership: "ENGINEERED BY",
    contact_nav: "Get In Touch",
    explore_btn: "Launch Lab",
    back_home: "Back to Hub",
    back_fixtures: "Back to Fixtures",
    shot_explorer: "Spatial Shot Explorer",
    shot_sub: "Click any shot marker to inspect complete player and goal-mouth telemetry",
    all_shots: "All",
    goals_only: "Goals",
    on_target: "On Target",
    match_momentum: "Minute Momentum (xT Flow)",
    team_comparison: "Match Dominance Metrics",
    analyst_notes_title: "Tactical Debrief & Match Observations",
    player_intel: "Player Performance Intelligence",
    player_sub: "Individual match ratings, threat creation, duels & passing output",
    th_player: "Player",
    th_team: "Team",
    th_rating: "Rating",
    th_min: "Min",
    th_goals: "Goals",
    th_xg: "xG",
    th_passes: "Acc Passes",
    th_duels: "Duels Won",
    direct_inquiries: "Direct Contact & Recruitment",
    connect: "Official Portfolios",
    search_hint: "AVAILABLE FIXTURES & QUICK SEARCH",
    m_minute: "Minute",
    m_outcome: "Outcome",
    m_type: "Type",
    m_situation: "Situation",
    goal_placement: "Goal-Mouth Placement Frame"
  },
  ar: {
    hero_pill: "ذكاء كروي متقدم ونمذجة مباريات للجيل القادم",
    hero_title: "تحليلات دقيقة لأحداث كرة القدم الحديثة",
    hero_sub: "خرائط تسديد مكانية شاملة، نمذجة تدفق الزخم xT، ومقاييس استقطاب مبنية للأندية المحترفة والمدراء الرياضيين وكشافي الأداء.",
    leadership: "تطوير وهندسة",
    contact_nav: "تواصل معنا",
    explore_btn: "فتح منصة التحليل",
    back_home: "العودة للرئيسية",
    back_fixtures: "العودة لقائمة المباريات",
    shot_explorer: "مستكشف خريطة التسديدات المكانية",
    shot_sub: "اضغط على أي تسديدة لمشاهدة تفاصيل اللاعب وإحداثيات الشباك الدقيقة",
    all_shots: "الكل",
    goals_only: "الأهداف",
    on_target: "على المرمى",
    match_momentum: "زخم المباراة (تدفق xT دقيقة بدقيقة)",
    team_comparison: "مقاييس السيطرة وأداء الفريقين",
    analyst_notes_title: "التقرير الفني وملاحظات المحلل",
    player_intel: "سجل أداء وذكاء اللاعبين",
    player_sub: "تقييمات اللاعبين الفردية، صناعة الخطورة، والالتحامات والتمرير",
    th_player: "اللاعب",
    th_team: "الفريق",
    th_rating: "التقييم",
    th_min: "الدقائق",
    th_goals: "الأهداف",
    th_xg: "xG متوقع",
    th_passes: "تمرير ناجح",
    th_duels: "صراعات فائزة",
    direct_inquiries: "استفسارات الأندية المباشرة والتوظيف",
    connect: "الملفات المهنية الرسمية",
    search_hint: "المباريات المتاحة والبحث السريع",
    m_minute: "الدقيقة",
    m_outcome: "النتيجة",
    m_type: "النوع",
    m_situation: "الحالة",
    goal_placement: "إطار توجيه الكرة داخل المرمى"
  }
};

document.addEventListener("DOMContentLoaded", () => {
  initBackgroundCanvas();
  loadMatchesRegistry();
  initSearchAutocomplete();
});

// 1. Dynamic 3D Particle Canvas
function initBackgroundCanvas() {
  const canvas = document.getElementById("bgCanvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  let width, height, particles = [];

  function resize() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  }
  window.addEventListener("resize", resize);
  resize();

  for (let i = 0; i < 65; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      radius: Math.random() * 2 + 1
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = "rgba(0, 230, 118, 0.15)";
    ctx.strokeStyle = "rgba(0, 176, 255, 0.05)";

    for (let i = 0; i < particles.length; i++) {
      let p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();

      for (let j = i + 1; j < particles.length; j++) {
        let p2 = particles[j];
        let dist = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (dist < 130) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(render);
  }
  render();
}

// 2. Load Registry
function loadMatchesRegistry() {
  fetch("data/matches_list.json")
    .then(res => res.json())
    .then(data => {
      matchesData = data;
    })
    .catch(err => console.error("Could not load registry:", err));
}

// 3. View Router
function showView(viewId) {
  document.getElementById("landingView").style.display = viewId === "landing" ? "block" : "none";
  document.getElementById("leagueView").style.display = viewId === "league" ? "block" : "none";
  document.getElementById("matchLabView").style.display = viewId === "lab" ? "block" : "none";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// 4. Open League Fixtures
function openLeague(leagueKey) {
  showView("league");
  const switcher = document.getElementById("langSwitcher");
  switcher.style.display = leagueKey === "SPL" ? "flex" : "none";

  const titleEl = document.getElementById("leagueViewTitle");
  const subEl = document.getElementById("leagueViewSub");
  const gridEl = document.getElementById("leagueMatchGrid");

  const leagueTitles = {
    SPL: "Roshn Saudi League",
    ISL: "Indian Super League",
    OTHERS: "Global Fixtures & Tournaments"
  };

  titleEl.innerText = leagueTitles[leagueKey] || "Match Registry";
  gridEl.innerHTML = "";

  const filtered = matchesData.filter(m => m.league === leagueKey);
  if (filtered.length === 0) {
    gridEl.innerHTML = `<div style="grid-column: 1/-1; color: var(--text-muted); text-align: center; padding: 3rem;">No fixtures loaded yet for ${leagueKey}.</div>`;
    return;
  }

  filtered.forEach(m => {
    const card = document.createElement("div");
    card.className = "match-card";
    card.innerHTML = `
      <div style="font-size: 0.75rem; color: var(--accent-green); font-weight: 700; margin-bottom: 0.5rem;">${m.league} • ${m.date}</div>
      <div style="display: flex; align-items: center; gap: 0.8rem; margin-bottom: 0.8rem;">
        <img src="${m.homeLogo}" style="width: 32px; height: 32px; object-fit: contain;">
        <h4 style="font-size: 1.25rem; font-family: var(--font-display);">${m.title}</h4>
        <img src="${m.awayLogo}" style="width: 32px; height: 32px; object-fit: contain;">
      </div>
      <div style="font-size: 0.85rem; color: var(--text-muted);">Click to launch full pitch shot telemetry & team lineups ↗</div>
    `;
    card.onclick = () => loadMatchLab(m.file);
    gridEl.appendChild(card);
  });
}

function returnToLeague() {
  showView("league");
}

// 5. Fetch Match JSON & Render
function loadMatchLab(filePath) {
  fetch(filePath)
    .then(res => res.json())
    .then(data => {
      currentLoadedMatch = data;
      renderMatchIntelligence(data);
      showView("lab");
    })
    .catch(err => {
      alert("Error loading match file: " + filePath);
      console.error(err);
    });
}

// 6. Master Match Intelligence Renderer
function renderMatchIntelligence(data) {
  const homeTeam = data.general.homeTeam.name;
  const awayTeam = data.general.awayTeam.name;
  const scoreStr = data.header.status.scoreStr || "0 - 0";
  const homeLogo = data.header.teams[0]?.imageUrl || "";
  const awayLogo = data.header.teams[1]?.imageUrl || "";

  // Dynamic Scoreboard Banner
  document.getElementById("matchScoreboard").innerHTML = `
    <div class="team-box">
      <img src="${homeLogo}" alt="${homeTeam}">
      <span class="team-name">${homeTeam}</span>
    </div>
    <div class="score-display">${scoreStr}</div>
    <div class="team-box" style="flex-direction: row-reverse;">
      <img src="${awayLogo}" alt="${awayTeam}">
      <span class="team-name">${awayTeam}</span>
    </div>
  `;

  renderOverviewStrip(data);
  renderShotMap(data, "all");
  renderMomentum(data);
  renderStatsBars(data);
  renderAnalystDebrief(data);
  renderLineups(data);
  renderPlayerTable(data);
}

// 7. Quick Match Overview Strip
function renderOverviewStrip(data) {
  const container = document.getElementById("matchOverviewStrip");
  const statsList = data.content.stats?.Periods?.All?.stats[0]?.stats || [];

  let homeXG = "0.00", awayXG = "0.00";
  let homePoss = "50%", awayPoss = "50%";
  let totalShots = "—";

  statsList.forEach(s => {
    if (s.title === "Expected goals (xG)") {
      homeXG = s.stats[0] || "0.00";
      awayXG = s.stats[1] || "0.00";
    }
    if (s.title === "Ball possession") {
      homePoss = s.stats[0] || "50%";
      awayPoss = s.stats[1] || "50%";
    }
    if (s.title === "Total shots") {
      totalShots = `${s.stats[0]} - ${s.stats[1]}`;
    }
  });

  const potm = data.content.matchFacts?.playerOfTheMatch?.name || "Match Performer";

  container.innerHTML = `
    <div class="overview-chip">
      <span>xG Battle</span>
      <strong style="color: var(--accent-green);">${homeXG} <span style="font-size:0.9rem; color:var(--text-muted)">vs</span> ${awayXG}</strong>
    </div>
    <div class="overview-chip">
      <span>Ball Possession</span>
      <strong>${homePoss} - ${awayPoss}</strong>
    </div>
    <div class="overview-chip">
      <span>Total Shot Attempts</span>
      <strong>${totalShots}</strong>
    </div>
    <div class="overview-chip">
      <span>Player of Match</span>
      <strong style="color: var(--accent-gold); font-size: 1.1rem;">${potm}</strong>
    </div>
  `;
}

// 8. Advanced Spatial Shot Map with Pro Categories
function getAllShots(data) {
  let shots = [];
  if (data.content.shotmap?.shots) {
    shots.push(...data.content.shotmap.shots);
  }
  if (shots.length === 0 && data.content.matchFacts?.playerOfTheMatch?.shotmap) {
    shots.push(...data.content.matchFacts.playerOfTheMatch.shotmap);
  }

  const playerStats = data.content.playerStats || {};
  Object.values(playerStats).forEach(p => {
    if (p.shotmap && p.shotmap.length > 0) {
      p.shotmap.forEach(s => {
        if (!shots.some(existing => existing.id === s.id)) {
          shots.push(s);
        }
      });
    }
  });
  return shots;
}

function renderShotMap(data, filter) {
  const container = document.getElementById("shotPointsLayer");
  container.innerHTML = "";

  const allShots = getAllShots(data);

  allShots.forEach(shot => {
    const isGoal = shot.eventType === "Goal";
    const isTarget = shot.isOnTarget && !isGoal;
    const isBlocked = shot.eventType === "Block" || shot.blocked || shot.shotType === "Blocked";
    const isMiss = !shot.isOnTarget && !isGoal && !isBlocked;

    // Apply Filter Selection
    if (filter === "Goal" && !isGoal) return;
    if (filter === "target" && !isTarget && !isGoal) return;
    if (filter === "blocked" && !isBlocked) return;
    if (filter === "miss" && !isMiss) return;

    const marker = document.createElement("div");
    marker.className = "shot-marker";

    const leftPct = (shot.x / 105) * 100;
    const topPct = (shot.y / 68) * 100;
    const xG = shot.expectedGoals || 0.05;
    const size = Math.max(10, Math.min(26, xG * 35));

    marker.style.left = `${leftPct}%`;
    marker.style.top = `${topPct}%`;
    marker.style.width = `${size}px`;
    marker.style.height = `${size}px`;

    // Dynamic High-End Styling
    if (isGoal) {
      marker.classList.add("marker-goal");
    } else if (isTarget) {
      marker.classList.add("marker-target");
    } else if (isBlocked) {
      marker.classList.add("marker-blocked");
    } else {
      marker.classList.add("marker-miss");
    }

    marker.onclick = (e) => {
      e.stopPropagation();
      openShotDetailModal(shot, data);
    };

    container.appendChild(marker);
  });
}

function filterShots(type) {
  document.querySelectorAll(".filter-pill").forEach(b => b.classList.remove("active"));
  event.target.classList.add("active");
  if (currentLoadedMatch) {
    renderShotMap(currentLoadedMatch, type);
  }
}

// 9. Shot Detail Modal Telemetry
function openShotDetailModal(shot, matchData) {
  const modal = document.getElementById("shotDetailModal");
  const isHome = shot.teamId === matchData.general.homeTeam.id;
  const teamName = isHome ? matchData.general.homeTeam.name : matchData.general.awayTeam.name;

  document.getElementById("modalTeamBadge").innerText = teamName;
  document.getElementById("modalPlayerName").innerText = shot.playerName || "Player";
  document.getElementById("modalMinute").innerText = `${shot.min || '-'}'`;
  document.getElementById("modalOutcome").innerText = shot.eventType || "Shot";
  document.getElementById("modalXG").innerText = shot.expectedGoals ? Number(shot.expectedGoals).toFixed(2) : "0.00";
  document.getElementById("modalXGOT").innerText = shot.expectedGoalsOnTarget ? Number(shot.expectedGoalsOnTarget).toFixed(2) : "—";
  document.getElementById("modalType").innerText = shot.shotType || "Open Play";
  document.getElementById("modalSituation").innerText = shot.situation || "Regular Play";

  const targetDot = document.getElementById("goalTargetPoint");
  if (shot.onGoalShot && shot.onGoalShot.x !== undefined) {
    const targetX = (shot.onGoalShot.x / 2) * 100;
    const targetY = 100 - (shot.onGoalShot.y / 0.7) * 100;
    targetDot.style.left = `${Math.max(5, Math.min(95, targetX))}%`;
    targetDot.style.top = `${Math.max(5, Math.min(95, targetY))}%`;
    targetDot.style.display = "block";
  } else {
    targetDot.style.display = "none";
  }

  modal.style.display = "block";
}

function closeShotModal() {
  document.getElementById("shotDetailModal").style.display = "none";
}

document.addEventListener("click", (e) => {
  const modal = document.getElementById("shotDetailModal");
  if (modal && !modal.contains(e.target) && !e.target.classList.contains("shot-marker")) {
    modal.style.display = "none";
  }
});

// 10. Minute Momentum Chart
function renderMomentum(data) {
  const container = document.getElementById("momentumChart");
  const momentumSeries = data.content.matchFacts?.momentum?.main?.data || [];
  if (momentumSeries.length === 0) {
    container.innerHTML = `<span style="color: var(--text-muted); font-size: 0.85rem;">Momentum tracking feed unavailable for this fixture.</span>`;
    return;
  }

  let html = `<div style="display: flex; align-items: center; gap: 3px; height: 100px; width: 100%;">`;
  momentumSeries.forEach(m => {
    const val = m.value;
    const height = Math.min(50, Math.abs(val) / 2);
    const isHome = val >= 0;
    html += `
      <div style="flex: 1; display: flex; flex-direction: column; justify-content: center; height: 100%;" title="Min ${m.minute}: ${val}">
        <div style="height: 50%; display: flex; align-items: flex-end;">
          ${isHome ? `<div style="width: 100%; height: ${height}px; background: var(--accent-green); border-radius: 2px;"></div>` : ''}
        </div>
        <div style="height: 50%; display: flex; align-items: flex-start;">
          ${!isHome ? `<div style="width: 100%; height: ${height}px; background: #ff5252; border-radius: 2px;"></div>` : ''}
        </div>
      </div>
    `;
  });
  html += `</div>`;
  container.innerHTML = html;
}

// 11. Match Dominance Metrics
function renderStatsBars(data) {
  const container = document.getElementById("statsBarsContainer");
  const topStats = data.content.stats?.Periods?.All?.stats[0]?.stats || [];
  
  if (topStats.length === 0) {
    container.innerHTML = `<span style="color: var(--text-muted);">Match stats ledger unavailable.</span>`;
    return;
  }

  let html = "";
  topStats.slice(0, 6).forEach(stat => {
    const hVal = stat.rawStats[0]?.value || 0;
    const aVal = stat.rawStats[1]?.value || 0;
    const total = (hVal + aVal) || 1;
    const hPct = (hVal / total) * 100;
    const aPct = 100 - hPct;

    html += `
      <div class="stats-row">
        <div class="stats-labels">
          <span>${stat.stats[0]}</span>
          <span style="color: var(--text-muted);">${stat.title}</span>
          <span>${stat.stats[1]}</span>
        </div>
        <div class="bar-track">
          <div class="bar-fill-home" style="width: ${hPct}%;"></div>
          <div class="bar-fill-away" style="width: ${aPct}%;"></div>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

// 12. Automated Tactical Debrief by Salman P
function renderAnalystDebrief(data) {
  window.currentMatchData = data;

  const container = document.getElementById("analystNotesContent");
  if (!container) return;

  const homeTeam = data.general?.homeTeam?.name || "Home Team";
  const awayTeam = data.general?.awayTeam?.name || "Away Team";
  const scoreStr = data.header?.status?.scoreStr || "0 - 0";

  // Score numbers extract cheyyal
  const scores = scoreStr.split('-').map(s => parseInt(s.trim())) || [0, 0];
  const homeScore = !isNaN(scores[0]) ? scores[0] : 0;
  const awayScore = !isNaN(scores[1]) ? scores[1] : 0;
  const totalGoals = homeScore + awayScore;
  const goalDiff = Math.abs(homeScore - awayScore);
  const isDraw = homeScore === awayScore;
  const winner = homeScore > awayScore ? homeTeam : awayTeam;

  // Man of the Match safe name
  let potm = "Key Midfield Anchor";
  const rawPotm = data.content?.matchFacts?.playerOfTheMatch;
  if (rawPotm) {
    if (typeof rawPotm.name === "string") {
      potm = rawPotm.name;
    } else if (rawPotm.name && typeof rawPotm.name === "object") {
      potm = rawPotm.name.fullName || rawPotm.name.display || "Key Player";
    } else if (rawPotm.fullName) {
      potm = rawPotm.fullName;
    }
  }

  // 1. DYNAMIC MOMENTUM ANALYSIS
  let momentumEn = "";
  let momentumAr = "";

  if (isDraw) {
    momentumEn = `A tightly contested tactical stalemate. Both ${homeTeam} and ${awayTeam} neutralized central passing channels, trading high-tempo pressing phases without establishing prolonged territorial dominance.`;
    momentumAr = `تعادل تكتيكي متكافئ وشديد الحذر. أغلق كلا الفريقين ممرات التمرير في عمق الملعب وتبادلا الضغط العالي دون فرض سيطرة ميدانية مطلقة لأي طرف.`;
  } else if (goalDiff >= 2) {
    momentumEn = `Comprehensive game control established by <strong>${winner}</strong>. Dominant positional rotations and vertical passing sequences dismantled the opponent's defensive structure across both halves.`;
    momentumAr = `هيمنة تكتيكية شاملة فرضها فريق <strong>${winner}</strong>. تفككت الخطوط الدفاعية للخصم بفضل سرعة التدوير الهجومي والتمريرات الطولية المباشرة.`;
  } else {
    momentumEn = `A high-leverage battle decided by fine margins. <strong>${winner}</strong> capitalized on transition moments to sustain territorial pressure during decisive match phases.`;
    momentumAr = `صراع متقارب حُسم بتفاصيل دقيقة، حيث استغل <strong>${winner}</strong> لحظات التحول الهجومي السريع لفرض تفوقه في الأوقات الحاسمة.`;
  }

  // 2. DYNAMIC FINISHING & xG ANALYSIS
  let finishingEn = "";
  let finishingAr = "";

  if (totalGoals >= 4) {
    finishingEn = `An open, explosive encounter producing <strong>${scoreStr}</strong>. Both forward lines converted high-xG opportunities inside the box, capitalizing on stretched backlines and rapid counter-attacks.`;
    finishingAr = `مواجهة مفتوحة وسريعة أنتجت <strong>${scoreStr}</strong>، حيث أظهرت خطوط الهجوم كفاءة تهديفية استثنائية داخل منطقة الجزاء مع استغلال التباعد الدفاعي.`;
  } else if (totalGoals <= 1) {
    finishingEn = `A rigid, defense-first display resulting in <strong>${scoreStr}</strong>. Compact low blocks and resolute box defending severely suppressed baseline expected goals (xG).`;
    finishingAr = `مباراة دفاعية منضبطة أثمرت عن نتيجة <strong>${scoreStr}</strong>، حيث حد التكتل الدفاعي المنخفض من جودة الفرص وصعّب صناعة أهداف محققة (xG).`;
  } else {
    finishingEn = `A calculated final score of <strong>${scoreStr}</strong> highlighting efficient spatial shot conversion and measured attacking sustained in the penalty area.`;
    finishingAr = `نتيجة نهائية محسوبة <strong>${scoreStr}</strong> عكست استغلالاً متوازناً للمساحات وإنهاءً دقيقاً للفرص المتاحة أمام المرمى.`;
  }

  // 3. DYNAMIC SCOUTING IMPACT
  let scoutingEn = `Standout tactical influence directed through <strong>${potm}</strong>, controlling midfield turnovers, orchestrating chance generation, and anchoring structure.`;
  let scoutingAr = `تأثير تكتيكي ومحوري قاده اللاعب <strong>${potm}</strong>، بالتحكم في وتيرة اللعب، وتدوير الكرة في العمق، وقيادة التحولات بدقة عالية.`;

  // Language Check & Render
  const isArabic = (typeof currentLanguage !== 'undefined' && currentLanguage === 'ar');

  if (isArabic) {
    container.innerHTML = `
      <div class="debrief-box">
        <h4>⚡ الزخم وحالة المباراة</h4>
        <p>${momentumAr}</p>
      </div>
      <div class="debrief-box">
        <h4>🎯 كفاءة إنهاء الفرص والأهداف المتوقعة (xG)</h4>
        <p>${finishingAr}</p>
      </div>
      <div class="debrief-box">
        <h4>🛡️ التأثير التكتيكي البارز</h4>
        <p>${scoutingAr}</p>
      </div>
    `;
  } else {
    container.innerHTML = `
      <div class="debrief-box">
        <h4>⚡ Momentum & Game State</h4>
        <p>${momentumEn}</p>
      </div>
      <div class="debrief-box">
        <h4>🎯 Finishing Quality vs xG</h4>
        <p>${finishingEn}</p>
      </div>
      <div class="debrief-box">
        <h4>🛡️ Tactical Scouting Impact</h4>
        <p>${scoutingEn}</p>
      </div>
    `;
  }
}

window.updateDebriefText = function(data) {
  renderAnalystDebrief(data);
};

// Language maattumbol debrief auto-update aavaan
window.updateDebriefText = function(data) {
  renderAnalystDebrief(data);
};

// Language switch cheyyumbol debrief re-render aavaanulla connection
window.updateDebriefText = function(data) {
  renderAnalystDebrief(data);
};
// 13. Official Lineups, Player Photos, Formations & Subs (FotMob Style)
function renderLineups(data) {
  const container = document.getElementById("lineupsContainer");
  const badgesContainer = document.getElementById("formationBadges");
  if (!container) return;

  container.innerHTML = "";
  if (badgesContainer) badgesContainer.innerHTML = "";

  const lineupData = data.content?.lineup;
  if (!lineupData) {
    container.innerHTML = '<div style="grid-column: 1/-1; color: var(--text-muted); text-align: center; padding: 2rem;">Lineup telemetry not provided in this match file</div>';
    return;
  }

  // FotMob JSON lineup detection
  let teams = [];
  if (Array.isArray(lineupData.lineup) && lineupData.lineup.length >= 2) {
    teams = lineupData.lineup;
  } else if (lineupData.homeTeam && lineupData.awayTeam) {
    teams = [lineupData.homeTeam, lineupData.awayTeam];
  } else if (Array.isArray(lineupData.teams) && lineupData.teams.length >= 2) {
    teams = lineupData.teams;
  }

  if (teams.length < 2) {
    container.innerHTML = '<div style="grid-column: 1/-1; color: var(--text-muted); text-align: center; padding: 2rem;">Lineup telemetry not provided in this match file</div>';
    return;
  }

  // Home & Away Teams Grid
  teams.forEach((team, idx) => {
    const isHome = (idx === 0);
    const teamName = isHome ? (data.general?.homeTeam?.name || "Home") : (data.general?.awayTeam?.name || "Away");
    const formation = team.formation || "4-3-3";

    if (badgesContainer) {
      badgesContainer.innerHTML += `<span class="badge" style="margin-right: 8px;">${teamName}: ${formation}</span>`;
    }

    const starters = (team.players || team.starters || []).flat().slice(0, 11);
    const subs = (team.subs || team.bench || []).flat();

    const teamCol = document.createElement("div");
    teamCol.className = "lineup-team-card";
    teamCol.style.cssText = "background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 12px; padding: 16px;";

    // Header
    let teamHtml = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 8px;">
        <span style="font-weight: 700; color: #38bdf8; font-size: 15px;">${teamName}</span>
        <span style="font-size: 12px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 2px 8px; border-radius: 12px; font-weight: 600;">XI: ${formation}</span>
      </div>
      
      <!-- Starting XI -->
      <div style="display: flex; flex-direction: column; gap: 8px; margin-bottom: 18px;">
    `;

    // Starting XI with Real Photos & Ratings
    starters.forEach(p => {
      const pId = p.id || '';
      const pName = p.name?.fullName || p.name?.display || p.name || p.fullName || "Player";
      const pRating = p.rating?.num || (typeof p.rating === "number" ? p.rating : null);
      const photoUrl = pId ? `https://images.fotmob.com/image_resources/playerimages/${pId}.png` : '';

      teamHtml += `
        <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 8px; background: rgba(255,255,255,0.03); border-radius: 8px;">
          <div style="display: flex; align-items: center; gap: 10px;">
            <img src="${photoUrl}" onerror="this.onerror=null; this.src='https://images.fotmob.com/image_resources/playerimages/default.png';" 
                 style="width: 32px; height: 32px; border-radius: 50%; object-fit: cover; background: #1e293b; border: 1px solid rgba(255,255,255,0.1);" />
            <div>
              <div style="font-size: 13px; font-weight: 600; color: #f1f5f9;">${pName}</div>
              <div style="font-size: 11px; color: #94a3b8;">#${p.shirtNumber || ''}</div>
            </div>
          </div>
          ${pRating ? `<span style="background: rgba(0, 209, 138, 0.15); color: #00d18a; padding: 3px 7px; border-radius: 6px; font-weight: 700; font-size: 12px;">★ ${pRating}</span>` : ''}
        </div>
      `;
    });

    teamHtml += `</div>`;

    // Substitutes / Bench Section
    if (subs.length > 0) {
      teamHtml += `
        <div style="font-size: 12px; font-weight: 700; text-transform: uppercase; color: #94a3b8; margin-bottom: 8px; letter-spacing: 0.5px;">Substitutes (Bench)</div>
        <div style="display: flex; flex-wrap: wrap; gap: 6px;">
          ${subs.map(sub => {
            const sName = sub.name?.fullName || sub.name?.display || sub.name || sub.fullName || "Sub";
            return `
              <span style="font-size: 11px; background: rgba(255,255,255,0.04); color: #cbd5e1; padding: 3px 8px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05);">
                #${sub.shirtNumber || ''} ${sName}
              </span>
            `;
          }).join('')}
        </div>
      `;
    }

    teamCol.innerHTML = teamHtml;
    container.appendChild(teamCol);
  });
}

// 14. Player Performance Intelligence Table
function renderPlayerTable(data) {
  const tbody = document.getElementById("playerTableBody");
  tbody.innerHTML = "";
  const playerStats = data.content.playerStats || {};

  Object.values(playerStats).forEach(p => {
    if (!p.stats || p.stats.length === 0) return;
    const top = p.stats[0]?.stats || {};
    const rating = top["FotMob rating"]?.stat?.value || "-";
    const minutes = top["Minutes played"]?.stat?.value || "-";
    const goals = top["Goals"]?.stat?.value || 0;
    const xG = top["Expected goals (xG)"]?.stat?.value || 0;
    const passes = top["Accurate passes"]?.stat?.value || 0;
    const totalPasses = top["Accurate passes"]?.stat?.total || 0;
    const duels = p.stats[3]?.stats?.["Duels won"]?.stat?.value || 0;

    const row = document.createElement("tr");
    row.innerHTML = `
      <td><strong>${p.name}</strong></td>
      <td>${p.teamName}</td>
      <td><span style="color: ${rating >= 7.5 ? 'var(--accent-green)' : '#fff'}; font-weight: 700;">${rating}</span></td>
      <td>${minutes}</td>
      <td>${goals}</td>
      <td>${Number(xG).toFixed(2)}</td>
      <td>${passes}/${totalPasses}</td>
      <td>${duels}</td>
    `;
    tbody.appendChild(row);
  });
}

// 15. Smart Omnibox Search
function initSearchAutocomplete() {
  const input = document.getElementById("matchSearchInput");
  const box = document.getElementById("searchSuggestions");
  const itemsContainer = document.getElementById("suggestionItems");

  input.addEventListener("focus", () => showSuggestions(""));
  input.addEventListener("input", (e) => showSuggestions(e.target.value));

  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-container")) {
      box.style.display = "none";
    }
  });

  function showSuggestions(query) {
    itemsContainer.innerHTML = "";
    const filtered = matchesData.filter(m => m.title.toLowerCase().includes(query.toLowerCase()) || m.league.toLowerCase().includes(query.toLowerCase()));
    
    if (filtered.length === 0) {
      itemsContainer.innerHTML = `<div style="padding: 0.8rem 1rem; color: var(--text-muted); font-size: 0.85rem;">No matches found matching "${query}"</div>`;
    } else {
      filtered.forEach(m => {
        const item = document.createElement("div");
        item.className = "suggestion-item";
        item.innerHTML = `
          <div style="display: flex; align-items: center; gap: 0.8rem;">
            <img src="${m.homeLogo}" style="width: 24px; height: 24px; object-fit: contain;">
            <div>
              <strong>${m.title}</strong>
              <div style="font-size: 0.72rem; color: var(--text-muted);">${m.league} • ${m.date}</div>
            </div>
          </div>
          <span style="font-size: 0.75rem; color: var(--accent-green); font-weight: 700;">Open Lab ↗</span>
        `;
        item.onclick = () => {
          loadMatchLab(m.file);
          box.style.display = "none";
          input.value = "";
        };
        itemsContainer.appendChild(item);
      });
    }
    box.style.display = "block";
  }
}

// 16. Multilingual Toggle
function switchLanguage(lang) {
  currentLanguage = lang;
  
  // Button active toggle
  const btnEn = document.getElementById("btnEn");
  const btnAr = document.getElementById("btnAr");
  if (btnEn) btnEn.classList.toggle("active", lang === "en");
  if (btnAr) btnAr.classList.toggle("active", lang === "ar");

  // Screen thirinju pokathirikkan dir eppozhum ltr aayi vekkunnu (No layout flip)
  document.documentElement.setAttribute("dir", "ltr");
  document.body.classList.remove("rtl-mode");

  // Ella texts-um Arabic / English aayi maattaan
  document.querySelectorAll("[data-i18n]").forEach(el => {
    const key = el.getAttribute("data-i18n");
    if (typeof i18n !== 'undefined' && i18n[lang] && i18n[lang][key]) {
      el.innerText = i18n[lang][key];
    }
  });

  // Open aaya match undenkil debrief-inte language koodi maattaan
  if (window.currentMatchData && typeof updateDebriefText === 'function') {
    updateDebriefText(window.currentMatchData, lang);
  }
}