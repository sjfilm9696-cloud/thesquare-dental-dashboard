// ===== 홈 페이지 (전체 요약) =====
window.__pageRenderers.home = function(container) {
  container.innerHTML = `
    <!-- KPI 카드 3장 -->
    <div class="kpi-grid">
      <div class="kpi-card clickable" onclick="navigateTo('revenue')">
        <div class="kpi-label">2026년 1월 매출</div>
        <div class="kpi-value" style="color:var(--revenue)">2,957만원</div>
        <div class="kpi-change up">▲ 작년 1월보다 약 2.5배</div>
      </div>
      <div class="kpi-card clickable" onclick="navigateTo('patient')">
        <div class="kpi-label">2026년 1월 신규 환자</div>
        <div class="kpi-value" style="color:var(--patient)">8명</div>
        <div class="kpi-change down">▼ 작년 1월보다 4명 적음</div>
      </div>
      <div class="kpi-card clickable" onclick="navigateTo('youtube')">
        <div class="kpi-label">2026년 1월 유튜브 조회수</div>
        <div class="kpi-value" style="color:var(--views)">11.4만회</div>
        <div class="kpi-change up">▲ 작년 1월보다 약 1.6배</div>
      </div>
    </div>

    <!-- 데이터 산출 기준 -->
    <div class="data-basis">
      <strong>데이터 산출 기준</strong><br>
      매출·신규 환자: 병원 경영 데이터 기준 | 유튜브 조회수: 해당 월 일별 조회수 합산 | 비교: 작년 같은 달 기준
    </div>

    <!-- 핵심 인사이트 배너 -->
    <div class="insight-banner blue-grad">
      <div class="banner-label">KEY INSIGHT</div>
      <div class="banner-headline">매출은 역대 최고치를 기록했습니다</div>
      <div class="banner-body">
        2026년 1월 매출 2,957만원은 2025년 전체에서 가장 높았던 10월(1,588만원)의 약 2배 수준입니다.<br>
        신규 환자 수는 8명으로 다소 줄었지만, 매출이 크게 오른 것은 <strong>기존에 내원하셨던 환자분들의 추가 치료 결정</strong>이 늘어난 것으로 보입니다.
      </div>
    </div>

    <!-- 히트맵 -->
    <div class="card">
      <h3>월별 성과 한눈에 보기</h3>
      <p class="card-desc">세 줄을 위아래로 비교하면, 매출·조회수·신규 환자가 같은 시기에 함께 움직이는지 확인할 수 있습니다</p>
      <div class="hm-section">
        <div class="hm-label"><span class="dot green"></span> 어떤 달에 매출이 좋았나요?</div>
        <div class="heat-row" id="hm-rev"></div>
      </div>
      <div class="hm-section">
        <div class="hm-label"><span class="dot blue"></span> 어떤 달에 유튜브 성과가 좋았나요?</div>
        <div class="heat-row" id="hm-views"></div>
      </div>
      <div class="hm-section">
        <div class="hm-label"><span class="dot purple"></span> 어떤 달에 신규 환자가 많았나요?</div>
        <div class="heat-row" id="hm-pat"></div>
      </div>
    </div>
  `;

  // 히트맵 렌더링
  _renderHeatmap('hm-rev', revenue, 'money', '#10b981', '#ecfdf5');
  _renderHeatmap('hm-views', views, 'views', '#3b82f6', '#eff6ff');
  _renderHeatmapPat('hm-pat');
};

// 매출/조회수 히트맵 공통 — 상위 2개만 강조, 최저 1개만 약한 빨강
function _renderHeatmap(id, arr, type, hiColor, hiBg) {
  const el = document.getElementById(id);
  if (!el) return;
  // 상위 2개, 하위 1개만 강조 (나머지는 흰 배경)
  const sorted = [...arr].sort((a,b) => b-a);
  const top2Threshold = sorted[1]; // 2번째로 높은 값
  const minVal = Math.min(...arr);
  MN.forEach((n, i) => {
    const isTop = arr[i] >= top2Threshold;
    const isBottom = arr[i] === minVal;
    let bg = '', color = 'var(--g900)';
    if (isTop) { bg = `background:${hiColor};`; color = '#fff'; }
    else if (isBottom) { bg = 'background:#fef2f2;'; color = '#ef4444'; }
    let chg = '';
    if (i > 0) chg = easyCompare(arr[i], arr[i-1], type);
    el.innerHTML += `<div class="heat-cell" style="${bg}">
      <div class="hc-m" style="${isTop?'color:rgba(255,255,255,.7)':''}">${n.slice(5)}</div>
      <div class="hc-v" style="color:${color}">${type==='money'?fmtM(arr[i]):fmtV(arr[i])}</div>
      <div class="hc-c">${chg}</div></div>`;
  });
}

// 신규 환자 히트맵 — 상위 2개만 보라 강조
function _renderHeatmapPat(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const sorted = [...patients].sort((a,b) => b-a);
  const top2Threshold = sorted[1];
  MN.forEach((n, i) => {
    const isTop = patients[i] >= top2Threshold;
    let bg = '', color = 'var(--g900)';
    if (isTop) { bg = 'background:#7c3aed;'; color = '#fff'; }
    let chg = '';
    if (i > 0) { const d = patients[i] - patients[i-1]; chg = d > 0 ? `<span class="up">+${d}명</span>` : d < 0 ? `<span class="down">${d}명</span>` : ''; }
    el.innerHTML += `<div class="heat-cell" style="${bg}">
      <div class="hc-m" style="${isTop?'color:rgba(255,255,255,.7)':''}">${n.slice(5)}</div>
      <div class="hc-v" style="color:${color}">${patients[i]}명</div>
      <div class="hc-c">${chg}</div></div>`;
  });
}
