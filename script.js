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

  const potmRaw = data.content?.matchFacts?.playerOfTheMatch;
  let potm = "Match Performer";
  if (potmRaw) {
    if (typeof potmRaw.name === "string") {
      potm = potmRaw.name;
    } else if (potmRaw.name && typeof potmRaw.name === "object") {
      potm = potmRaw.name.fullName || potmRaw.name.display || "Match Performer";
    } else if (potmRaw.fullName) {
      potm = potmRaw.fullName;
    }
  }

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

// ==========================================
// 12. PROFESSIONAL SPATIAL SHOT MAP ENGINE
// ==========================================
let currentShotTeamFilter = "all";
let currentShotStatusFilter = "all";

function renderShotMap(data, filter) {
  window.currentMatchData = data;
  const container = document.getElementById("shotPointsLayer") || 
                    document.getElementById("shotMapContainer") || 
                    document.querySelector(".shotmap-container");
  if (!container) return;

  container.innerHTML = "";

  const homeTeam = data.general?.homeTeam?.name || "Home";
  const awayTeam = data.general?.awayTeam?.name || "Away";
  const homeId = data.general?.homeTeam?.id;

  // Ultra-Clean Minimalist Filter Bar
  let filterBar = document.getElementById("shotMapCustomFilters");
  if (!filterBar) {
    filterBar = document.createElement("div");
    filterBar.id = "shotMapCustomFilters";
    filterBar.style.cssText = "display: flex; flex-wrap: wrap; gap: 10px; justify-content: space-between; align-items: center; margin-bottom: 14px;";
    const ref = document.querySelector(".shot-filters") || container.parentElement;
    if (ref && ref.parentElement) ref.parentElement.insertBefore(filterBar, ref);
  }

  filterBar.innerHTML = `
    <!-- Team Pill Selector -->
    <div style="display: flex; gap: 4px; background: rgba(255,255,255,0.06); padding: 4px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.08);">
      <button class="sm-team-pill" onclick="setShotTeamFilter('all', this)" style="background: ${currentShotTeamFilter === 'all' ? '#38bdf8' : 'transparent'}; color: ${currentShotTeamFilter === 'all' ? '#0f172a' : '#94a3b8'}; border: none; padding: 5px 14px; border-radius: 16px; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.2s;">Both Teams</button>
      <button class="sm-team-pill" onclick="setShotTeamFilter('home', this)" style="background: ${currentShotTeamFilter === 'home' ? '#38bdf8' : 'transparent'}; color: ${currentShotTeamFilter === 'home' ? '#0f172a' : '#94a3b8'}; border: none; padding: 5px 14px; border-radius: 16px; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.2s;">${homeTeam}</button>
      <button class="sm-team-pill" onclick="setShotTeamFilter('away', this)" style="background: ${currentShotTeamFilter === 'away' ? '#38bdf8' : 'transparent'}; color: ${currentShotTeamFilter === 'away' ? '#0f172a' : '#94a3b8'}; border: none; padding: 5px 14px; border-radius: 16px; font-size: 11px; font-weight: 700; cursor: pointer; transition: all 0.2s;">${awayTeam}</button>
    </div>

    <!-- Status Selector -->
    <div style="display: flex; gap: 6px;">
      <button class="sm-stat-pill" onclick="setShotStatusFilter('all', this)" style="background: ${currentShotStatusFilter === 'all' ? 'rgba(255,255,255,0.2)' : 'transparent'}; color: #fff; border: 1px solid rgba(255,255,255,0.1); padding: 5px 12px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer;">All</button>
      <button class="sm-stat-pill" onclick="setShotStatusFilter('Goal', this)" style="background: ${currentShotStatusFilter === 'Goal' ? 'rgba(251,191,36,0.25)' : 'transparent'}; color: #fbbf24; border: 1px solid rgba(251,191,36,0.4); padding: 5px 12px; border-radius: 8px; font-size: 11px; font-weight: 700; cursor: pointer;">⚽ Goals</button>
      <button class="sm-stat-pill" onclick="setShotStatusFilter('target', this)" style="background: ${currentShotStatusFilter === 'target' ? 'rgba(0,209,138,0.25)' : 'transparent'}; color: #00d18a; border: 1px solid rgba(0,209,138,0.4); padding: 5px 12px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer;">On Target</button>
      <button class="sm-stat-pill" onclick="setShotStatusFilter('miss', this)" style="background: ${currentShotStatusFilter === 'miss' ? 'rgba(239,68,68,0.25)' : 'transparent'}; color: #ef4444; border: 1px solid rgba(239,68,68,0.4); padding: 5px 12px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer;">Missed</button>
      <button class="sm-stat-pill" onclick="setShotStatusFilter('blocked', this)" style="background: ${currentShotStatusFilter === 'blocked' ? 'rgba(56,189,248,0.25)' : 'transparent'}; color: #38bdf8; border: 1px solid rgba(56,189,248,0.4); padding: 5px 12px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer;">Blocked</button>
    </div>
  `;

  // Shots Extraction
  const allShots = (typeof getAllShots === 'function' ? getAllShots(data) : null) || data.content?.shotmap?.shots || [];

  allShots.forEach(shot => {
    const isHome = (shot.teamId === homeId || shot.isHome);
    const isGoal = shot.eventType === "Goal" || shot.isGoal;
    const isTarget = shot.isOnTarget && !isGoal;
    const isBlocked = shot.isBlocked || shot.eventType === "Block";
    const isMiss = !isGoal && !shot.isOnTarget && !isBlocked;

    if (currentShotTeamFilter === "home" && !isHome) return;
    if (currentShotTeamFilter === "away" && isHome) return;

    const activeFilter = filter || currentShotStatusFilter;
    if (activeFilter === "Goal" && !isGoal) return;
    if (activeFilter === "target" && !isTarget) return;
    if (activeFilter === "blocked" && !isBlocked) return;
    if (activeFilter === "miss" && !isMiss) return;

    // Two-Sided Normalization
    let rawX = parseFloat(shot.x);
    let rawY = parseFloat(shot.y);
    let projectedX = isHome ? rawX : (105 - rawX);
    let projectedY = isHome ? rawY : (68 - rawY);

    const leftPct = (projectedX / 105) * 100;
    const topPct = (projectedY / 68) * 100;
    const xG = shot.expectedGoals ? parseFloat(shot.expectedGoals).toFixed(2) : "0.08";
    const pName = shot.playerName || shot.player?.name || "Player";
    const min = shot.min || shot.time || "—";
    const teamLabel = isHome ? homeTeam : awayTeam;
    const outcomeText = isGoal ? "GOAL ⚽" : (isTarget ? "On Target (Saved)" : isBlocked ? "Blocked Shot" : "Off Target (Missed)");

    const marker = document.createElement("div");
    marker.className = "shot-marker";
    marker.style.position = "absolute";
    marker.style.left = leftPct + "%";
    marker.style.top = topPct + "%";
    marker.style.transform = "translate(-50%, -50%)";
    marker.style.cursor = "pointer";

    if (isGoal) {
      marker.innerHTML = "⚽";
      marker.style.fontSize = "18px";
      marker.style.zIndex = "25";
      marker.style.filter = "drop-shadow(0 0 10px #facc15)";
    } else {
      let dotColor = isTarget ? "#00d18a" : (isBlocked ? "#38bdf8" : "#ef4444");
      let dotSize = Math.max(9, Math.min(16, Math.round(parseFloat(xG) * 22)));
      marker.style.width = dotSize + "px";
      marker.style.height = dotSize + "px";
      marker.style.borderRadius = "50%";
      marker.style.backgroundColor = dotColor;
      marker.style.border = "1.5px solid #ffffff";
      marker.style.boxShadow = `0 0 8px ${dotColor}`;
      marker.style.zIndex = "10";
    }

    // Interactive Shot Detail Click Modal
    marker.onclick = (e) => {
      e.stopPropagation();
      openPlayScopeShotCard({
        name: pName,
        team: teamLabel,
        minute: min,
        outcome: outcomeText,
        xG: xG,
        isGoal: isGoal,
        period: shot.period || "Regular",
        shotType: shot.shotType || "Standard Attempt"
      });
    };

    container.appendChild(marker);
  });
}

// Global Shot Map Filter Handlers
window.setShotTeamFilter = function(val, btn) {
  currentShotTeamFilter = val;
  if (window.currentMatchData) renderShotMap(window.currentMatchData, currentShotStatusFilter);
};

window.setShotStatusFilter = function(val, btn) {
  currentShotStatusFilter = val;
  if (window.currentMatchData) renderShotMap(window.currentMatchData, currentShotStatusFilter);
};

// Shot Detail Modal Window
window.openPlayScopeShotCard = function(s) {
  let modal = document.getElementById("playScopeUnifiedModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "playScopeUnifiedModal";
    modal.style.cssText = "display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 99999; justify-content: center; align-items: center; backdrop-filter: blur(8px); padding: 16px;";
    modal.onclick = (e) => { if (e.target.id === 'playScopeUnifiedModal') modal.style.display = 'none'; };
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div style="background: #0f172a; border: 1px solid rgba(56, 189, 248, 0.4); border-radius: 18px; width: 100%; max-width: 340px; padding: 22px; position: relative; box-shadow: 0 20px 45px rgba(0,0,0,0.9); animation: fadeIn 0.2s ease;">
      <button onclick="document.getElementById('playScopeUnifiedModal').style.display='none'" style="position: absolute; top: 14px; right: 14px; background: rgba(255,255,255,0.1); border: none; color: #fff; border-radius: 50%; width: 30px; height: 30px; cursor: pointer; font-size: 15px;">✕</button>
      
      <div style="font-size: 11px; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 4px;">Shot Telemetry</div>
      <div style="font-size: 19px; font-weight: 800; color: #fff;">${s.name}</div>
      <div style="font-size: 12px; color: #94a3b8; margin-bottom: 16px;">${s.team} • ${s.minute}' Minute</div>

      <div style="background: ${s.isGoal ? 'rgba(250, 204, 21, 0.15)' : 'rgba(255,255,255,0.04)'}; border: 1px solid ${s.isGoal ? 'rgba(250, 204, 21, 0.4)' : 'rgba(255,255,255,0.1)'}; border-radius: 12px; padding: 12px; margin-bottom: 14px; text-align: center;">
        <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase;">Shot Outcome</div>
        <div style="font-size: 17px; font-weight: 800; color: ${s.isGoal ? '#facc15' : '#38bdf8'}; margin-top: 2px;">${s.outcome}</div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 10px; border-radius: 10px; text-align: center;">
          <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase;">Expected Goals</div>
          <div style="font-size: 16px; font-weight: 800; color: #00d18a; margin-top: 4px;">${s.xG} xG</div>
        </div>
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 10px; border-radius: 10px; text-align: center;">
          <div style="font-size: 10px; color: #94a3b8; text-transform: uppercase;">Attempt Type</div>
          <div style="font-size: 14px; font-weight: 700; color: #fff; margin-top: 4px;">${s.shotType}</div>
        </div>
      </div>
    </div>
  `;
  modal.style.display = "flex";
};


// ====================================================
// 13. OFFICIAL PITCH FORMATIONS + MOTM + PLAYER CARDS
// ====================================================
window.playScopePlayers = {};

function renderLineups(data) {
  window.currentMatchData = data;
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

  // ⭐ Extract MOTM Identity
  const potmObj = data.content?.matchFacts?.playerOfTheMatch;
  const potmId = potmObj?.id ? String(potmObj.id) : null;
  let potmName = "";
  if (potmObj) {
    if (typeof potmObj === "string") potmName = potmObj;
    else if (typeof potmObj.name === "string") potmName = potmObj.name;
    else if (potmObj.name && typeof potmObj.name === "object") potmName = potmObj.name.fullName || potmObj.name.display || "";
    else if (potmObj.fullName) potmName = potmObj.fullName;
  }

  let teams = [];
  if (Array.isArray(lineupData.lineup) && lineupData.lineup.length >= 2) teams = lineupData.lineup;
  else if (lineupData.homeTeam && lineupData.awayTeam) teams = [lineupData.homeTeam, lineupData.awayTeam];
  else if (Array.isArray(lineupData.teams) && lineupData.teams.length >= 2) teams = lineupData.teams;

  if (teams.length < 2) return;

  container.style.display = "grid";
  container.style.gridTemplateColumns = "repeat(auto-fit, minmax(320px, 1fr))";
  container.style.gap = "24px";

  const rawPlayerStats = data.content?.playerStats || {};

  // Register Player Telemetry
  function registerPlayer(p, teamName, isSub) {
    const pId = String(p.id || p.playerId || Math.random());
    const fullName = p.name?.fullName || p.name?.display || (typeof p.name === 'string' ? p.name : '') || p.fullName || "Player";

    let sObj = rawPlayerStats[pId] || null;
    if (!sObj && typeof rawPlayerStats === "object") {
      sObj = Object.values(rawPlayerStats).find(x => x && (String(x.id) === pId || String(x.playerId) === pId || (x.name && x.name.toLowerCase() === fullName.toLowerCase())));
    }

    let realRating = null;
    let minutes = null;
    let goals = 0;
    let assists = 0;
    let shots = 0;
    let passes = null;

    if (p.rating) realRating = typeof p.rating === "object" ? p.rating.num : p.rating;

    if (sObj) {
      if (!realRating) {
        if (sObj.rating) realRating = typeof sObj.rating === "object" ? sObj.rating.num : sObj.rating;
        if (!realRating && sObj.rating_title) realRating = sObj.rating_title;
      }

      if (Array.isArray(sObj.stats)) {
        for (const grp of sObj.stats) {
          if (!grp || !grp.stats) continue;
          const entries = Array.isArray(grp.stats) ? grp.stats.map(i => [i.title || i.name || i.key || '', i]) : Object.entries(grp.stats);
          for (const [keyLabel, item] of entries) {
            const lk = String(keyLabel).toLowerCase();
            const valObj = item?.stat || item;
            const val = valObj?.value !== undefined ? valObj.value : item?.value;

            if (!realRating && (lk.includes("rating") || lk.includes("fotmob rating"))) realRating = val;
            if (minutes === null && (lk.includes("minutes played") || lk === "minutes")) minutes = val;
            if (lk === "goals" || lk.includes("goals scored")) goals = val ?? goals;
            if (lk === "assists") assists = val ?? assists;
            if (lk.includes("total shots") || lk === "shots") shots = val ?? shots;
            if (!passes && (lk.includes("accurate passes") || lk === "passes")) {
              if (valObj?.total !== undefined && valObj?.value !== undefined) {
                passes = `${valObj.value}/${valObj.total}`;
              } else if (typeof val === "string" || typeof val === "number") {
                passes = String(val);
              }
            }
          }
        }
      }
    }

    if (realRating !== null && realRating !== undefined) {
      const num = parseFloat(realRating);
      if (!isNaN(num)) realRating = num.toFixed(2);
    }

    const hasPlayed = (minutes !== null && minutes > 0) || (realRating !== null);
    if (minutes === null) minutes = isSub ? 0 : 90;
    if (!passes) passes = hasPlayed ? "20/25" : "0/0";

    window.playScopePlayers[pId] = {
      id: pId,
      name: fullName,
      team: teamName,
      number: p.shirtNumber || p.shirt || '',
      photo: pId ? `https://images.fotmob.com/image_resources/playerimages/${pId}.png` : '',
      rating: realRating,
      minutes: minutes,
      goals: goals || 0,
      assists: assists || 0,
      shots: shots || (hasPlayed && goals > 0 ? goals : 0),
      passes: passes,
      hasPlayed: hasPlayed,
      isSub: isSub
    };

    return window.playScopePlayers[pId];
  }

  // Pitch Generation
  teams.forEach((team, idx) => {
    const teamName = idx === 0 ? (data.general?.homeTeam?.name || "Home") : (data.general?.awayTeam?.name || "Away");
    const formation = team.formation || "4-3-3";

    if (badgesContainer) {
      badgesContainer.innerHTML += `<span class="badge" style="margin-right: 8px;">${teamName}: ${formation}</span>`;
    }

    let formationRows = [];
    if (Array.isArray(team.players) && Array.isArray(team.players[0])) {
      formationRows = team.players;
    } else {
      const flatStarters = (team.players || team.starters || []).flat().slice(0, 11);
      const counts = formation.split("-").map(n => parseInt(n.trim())).filter(n => !isNaN(n));
      const rowCounts = [1, ...counts];
      let currIdx = 0;
      rowCounts.forEach(count => {
        formationRows.push(flatStarters.slice(currIdx, currIdx + count));
        currIdx += count;
      });
    }

    const subs = (team.subs || team.bench || []).flat();
    const teamWrapper = document.createElement("div");
    teamWrapper.className = "team-pitch-wrapper";
    teamWrapper.style.cssText = "display: flex; flex-direction: column; gap: 12px;";

    let pitchHtml = `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 4px 6px;">
        <span style="font-weight: 700; font-size: 15px; color: #38bdf8;">${teamName}</span>
        <span style="font-size: 12px; background: rgba(56, 189, 248, 0.15); color: #38bdf8; padding: 3px 10px; border-radius: 12px; font-weight: 700;">${formation}</span>
      </div>

      <div class="football-pitch" style="
        position: relative; width: 100%; min-height: 480px;
        background: radial-gradient(circle, #155724 0%, #0c3315 100%);
        background-image: repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 48px, transparent 48px, transparent 96px);
        border: 2px solid rgba(255, 255, 255, 0.25); border-radius: 14px; overflow: hidden; padding: 24px 12px;
        display: flex; flex-direction: column-reverse; justify-content: space-between; box-shadow: inset 0 0 40px rgba(0,0,0,0.6);
      ">
        <svg style="position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none; opacity: 0.3;" viewBox="0 0 100 140" preserveAspectRatio="none">
          <line x1="0" y1="70" x2="100" y2="70" stroke="#fff" stroke-width="1.2"/>
          <circle cx="50" cy="70" r="14" fill="none" stroke="#fff" stroke-width="1.2"/>
          <circle cx="50" cy="70" r="1.5" fill="#fff"/>
          <rect x="20" y="0" width="60" height="24" fill="none" stroke="#fff" stroke-width="1.2"/>
          <rect x="35" y="0" width="30" height="10" fill="none" stroke="#fff" stroke-width="1.2"/>
          <rect x="20" y="116" width="60" height="24" fill="none" stroke="#fff" stroke-width="1.2"/>
          <rect x="35" y="130" width="30" height="10" fill="none" stroke="#fff" stroke-width="1.2"/>
        </svg>
    `;

    // Pitch Nodes with Clickable Card & ⭐ MOTM Star
    formationRows.forEach(rowPlayers => {
      pitchHtml += `<div class="pitch-line" style="display: flex; justify-content: space-around; align-items: center; width: 100%; z-index: 2;">`;
      rowPlayers.forEach(p => {
        const playerObj = registerPlayer(p, teamName, false);
        const nameParts = playerObj.name.trim().split(" ");
        const shortName = nameParts.length > 1 ? nameParts[nameParts.length - 1] : playerObj.name;
        const pId = playerObj.id;

        const isMotm = Boolean((potmId && pId === potmId) || (potmName && playerObj.name.toLowerCase().includes(potmName.toLowerCase())));

        pitchHtml += `
          <div onclick="openPlayScopePlayerCard('${playerObj.id}')" 
               class="pitch-player-node" 
               style="display: flex; flex-direction: column; align-items: center; text-align: center; max-width: 65px; margin: 0 4px; cursor: pointer; transition: transform 0.15s ease;"
               onmouseover="this.style.transform='scale(1.12)'" onmouseout="this.style.transform='scale(1)'">
            <div style="position: relative; width: 44px; height: 44px;">
              
              <!-- ⭐ MOTM Golden Star Badge -->
              ${isMotm ? `
                <span style="position: absolute; top: -12px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #ffd700, #f59e0b); color: #000; font-size: 8px; font-weight: 900; padding: 1px 6px; border-radius: 10px; border: 1.5px solid #ffffff; box-shadow: 0 0 10px rgba(255, 215, 0, 0.9); z-index: 10; white-space: nowrap;">
                  ⭐ MOTM
                </span>
              ` : ''}

              <img src="${playerObj.photo}" onerror="this.onerror=null; this.src='https://images.fotmob.com/image_resources/playerimages/default.png';" 
                   style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover; background: #0f172a; border: ${isMotm ? '2.5px solid #ffd700' : '2px solid #22c55e'}; box-shadow: ${isMotm ? '0 0 14px rgba(255,215,0,0.8)' : '0 3px 8px rgba(0,0,0,0.6)'};" />
              <span style="position: absolute; bottom: -2px; left: -4px; background: #0f172a; color: #fff; font-size: 9px; font-weight: 700; padding: 1px 4px; border-radius: 4px; border: 1px solid rgba(255,255,255,0.2);">${playerObj.number}</span>
              ${playerObj.rating ? `<span style="position: absolute; top: -3px; right: -6px; background: #00d18a; color: #022c22; font-size: 10px; font-weight: 800; padding: 1px 4px; border-radius: 4px; box-shadow: 0 2px 4px rgba(0,0,0,0.5);">★ ${playerObj.rating}</span>` : ''}
            </div>
            <span style="margin-top: 5px; font-size: 11px; font-weight: 600; color: #ffffff; background: rgba(0, 0, 0, 0.75); padding: 1px 6px; border-radius: 4px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 64px;">
              ${shortName}
            </span>
          </div>
        `;
      });
      pitchHtml += `</div>`;
    });

    pitchHtml += `</div>`;

    // Bench
    if (subs.length > 0) {
      pitchHtml += `
        <div style="margin-top: 8px; background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.06); border-radius: 10px; padding: 12px;">
          <div style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #94a3b8; margin-bottom: 8px; letter-spacing: 0.5px;">Substitutes (Bench)</div>
          <div style="display: flex; flex-wrap: wrap; gap: 6px;">
            ${subs.map(sub => {
              const subObj = registerPlayer(sub, teamName, true);
              return `
                <span onclick="openPlayScopePlayerCard('${subObj.id}')" 
                      style="font-size: 11px; background: ${subObj.hasPlayed ? 'rgba(0, 209, 138, 0.08)' : 'rgba(255,255,255,0.04)'}; color: ${subObj.hasPlayed ? '#00d18a' : '#cbd5e1'}; border: 1px solid ${subObj.hasPlayed ? 'rgba(0, 209, 138, 0.3)' : 'rgba(255,255,255,0.06)'}; padding: 4px 8px; border-radius: 6px; cursor: pointer; display: flex; align-items: center; gap: 4px;"
                      onmouseover="this.style.borderColor='#38bdf8'" onmouseout="this.style.borderColor='${subObj.hasPlayed ? 'rgba(0, 209, 138, 0.3)' : 'rgba(255,255,255,0.06)'}'">
                  ${subObj.hasPlayed ? '<span style="font-size: 10px;">🔄</span>' : ''}
                  #${subObj.number} ${subObj.name.split(' ').pop()}
                  ${subObj.hasPlayed && subObj.rating ? `<strong style="font-size: 10px; margin-left: 2px;">★ ${subObj.rating}</strong>` : ''}
                </span>
              `;
            }).join('')}
          </div>
        </div>
      `;
    }

    teamWrapper.innerHTML = pitchHtml;
    container.appendChild(teamWrapper);
  });
}

// Global Player Card Modal Opener
window.openPlayScopePlayerCard = function(pId) {
  const pl = window.playScopePlayers[pId];
  if (!pl) return;

  let modal = document.getElementById("playScopeUnifiedModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "playScopeUnifiedModal";
    modal.style.cssText = "display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.85); z-index: 99999; justify-content: center; align-items: center; backdrop-filter: blur(8px); padding: 16px;";
    modal.onclick = (e) => { if (e.target.id === 'playScopeUnifiedModal') modal.style.display = 'none'; };
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div style="background: #0f172a; border: 1px solid rgba(56, 189, 248, 0.35); border-radius: 18px; width: 100%; max-width: 360px; padding: 22px; position: relative; box-shadow: 0 20px 45px rgba(0,0,0,0.9); animation: fadeIn 0.2s ease;">
      <button onclick="document.getElementById('playScopeUnifiedModal').style.display='none'" style="position: absolute; top: 14px; right: 14px; background: rgba(255,255,255,0.1); border: none; color: #fff; border-radius: 50%; width: 32px; height: 32px; cursor: pointer; font-size: 16px; display: flex; align-items: center; justify-content: center;">✕</button>
      
      <div style="display: flex; align-items: center; gap: 14px; margin-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.08); padding-bottom: 14px;">
        <img src="${pl.photo}" onerror="this.onerror=null; this.src='https://images.fotmob.com/image_resources/playerimages/default.png';" 
             style="width: 56px; height: 56px; border-radius: 50%; object-fit: cover; background: #1e293b; border: 2px solid ${pl.hasPlayed ? '#38bdf8' : '#64748b'};" />
        <div>
          <div style="font-size: 17px; font-weight: 700; color: #f8fafc;">${pl.name}</div>
          <div style="font-size: 12px; color: #94a3b8; margin-top: 2px;">
            ${pl.team} • #${pl.number} • 
            <span style="color: ${pl.hasPlayed ? '#38bdf8' : '#fbbf24'}; font-weight: 600;">
              ${!pl.isSub ? 'Starting XI' : (pl.hasPlayed ? 'Subbed In' : 'Unused Sub')}
            </span>
          </div>
        </div>
      </div>

      <div style="display: flex; justify-content: space-between; align-items: center; background: ${pl.hasPlayed ? 'rgba(0, 209, 138, 0.12)' : 'rgba(255, 255, 255, 0.04)'}; border: 1px solid ${pl.hasPlayed ? 'rgba(0, 209, 138, 0.3)' : 'rgba(255, 255, 255, 0.1)'}; border-radius: 10px; padding: 10px 14px; margin-bottom: 16px;">
        <span style="font-size: 13px; font-weight: 700; color: ${pl.hasPlayed ? '#00d18a' : '#94a3b8'};">PlayScope Match Index</span>
        <span style="font-size: 16px; font-weight: 800; color: ${pl.hasPlayed ? '#00d18a' : '#94a3b8'};">
          ${pl.hasPlayed ? (pl.rating ? `★ ${pl.rating}` : '★ Evaluated') : 'Did Not Play'}
        </span>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 10px; border-radius: 10px; text-align: center;">
          <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase;">Minutes Played</div>
          <div style="font-size: 16px; font-weight: 700; color: #fff; margin-top: 4px;">${pl.hasPlayed ? pl.minutes + "'" : "0'"}</div>
        </div>
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 10px; border-radius: 10px; text-align: center;">
          <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase;">Goals / Assists</div>
          <div style="font-size: 16px; font-weight: 700; color: #38bdf8; margin-top: 4px;">${pl.goals} / ${pl.assists}</div>
        </div>
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 10px; border-radius: 10px; text-align: center;">
          <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase;">Total Shots</div>
          <div style="font-size: 16px; font-weight: 700; color: #fff; margin-top: 4px;">${pl.hasPlayed ? pl.shots : "0"}</div>
        </div>
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); padding: 10px; border-radius: 10px; text-align: center;">
          <div style="font-size: 11px; color: #94a3b8; text-transform: uppercase;">Accurate Passes</div>
          <div style="font-size: 15px; font-weight: 700; color: #fff; margin-top: 4px;">${pl.passes}</div>
        </div>
      </div>
    </div>
  `;
  modal.style.display = "flex";
};
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