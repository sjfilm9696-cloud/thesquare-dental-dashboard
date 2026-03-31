// ===== 홈 페이지 (전체 요약) =====
window.__pageRenderers.home = function(container) {
  // 최신 데이터 기준 인덱스 
  const lastIdx = ML.length - 1;
  const curMNText = MN[lastIdx].substring(0,4) + '년 ' + MN[lastIdx].substring(5) + '월';
  
  // 전년 동기 (12개월 전) 비교 계산
  let revCmpText = '데이터 부족', patCmpText = '데이터 부족', viewCmpText = '데이터 부족';
  let revCls = '', patCls = '', viewCls = '';
  
  if (lastIdx >= 12) {
    const prevIdx = lastIdx - 12;
    const revRatio = (revenue[lastIdx] / revenue[prevIdx]).toFixed(1);
    const patDiff = patients[lastIdx] - patients[prevIdx];
    const viewRatio = (views[lastIdx] / views[prevIdx]).toFixed(1);
    
    if (revRatio >= 1) { revCmpText = `▲ 작년 동월보다 약 ${revRatio}배`; revCls = 'up'; }
    else { revCmpText = `▼ 작년 동월보다 낮음`; revCls = 'down'; }
    
    if (patDiff > 0) { patCmpText = `▲ 작년 동월보다 ${patDiff}명 더 많음`; patCls = 'up'; }
    else if (patDiff === 0) { patCmpText = `- 작년 동월과 동일`; patCls = ''; }
    else { patCmpText = `▼ 작년 동월보다 ${Math.abs(patDiff)}명 적음`; patCls = 'down'; }
    
    if (viewRatio >= 1) { viewCmpText = `▲ 작년 동월보다 약 ${viewRatio}배`; viewCls = 'up'; }
    else { viewCmpText = `▼ 작년 동월보다 낮음`; viewCls = 'down'; }
  } else if (lastIdx > 0) {
    // 1년 전 데이터가 없으면 전월비교
    const prevIdx = lastIdx - 1;
    revCmpText = revenue[lastIdx] > revenue[prevIdx] ? '▲ 전월 대비 상승' : '▼ 전월 대비 하락';
    patCmpText = patients[lastIdx] > patients[prevIdx] ? '▲ 전월 대비 상승' : '▼ 전월 대비 하락';
    viewCmpText = views[lastIdx] > views[prevIdx] ? '▲ 전월 대비 상승' : '▼ 전월 대비 하락';
  }

  container.innerHTML = `
    <!-- KPI 카드 3장 -->
    <div class="kpi-grid">
      <div class="kpi-card clickable" onclick="navigateTo('revenue')">
        <div class="kpi-label">${curMNText} 매출</div>
        <div class="kpi-value" style="color:var(--revenue)">${fmtM(revenue[lastIdx])}원</div>
        <div class="kpi-change ${revCls}">${revCmpText}</div>
      </div>
      <div class="kpi-card clickable" onclick="navigateTo('patient')">
        <div class="kpi-label">${curMNText} 신규 환자</div>
        <div class="kpi-value" style="color:var(--patient)">${patients[lastIdx]}명</div>
        <div class="kpi-change ${patCls}">${patCmpText}</div>
      </div>
      <div class="kpi-card clickable" onclick="navigateTo('youtube')">
        <div class="kpi-label">${curMNText} 유튜브 조회수</div>
        <div class="kpi-value" style="color:var(--views)">${fmtV(views[lastIdx])}회</div>
        <div class="kpi-change ${viewCls}">${viewCmpText}</div>
      </div>
    </div>

    <!-- 데이터 산출 기준 -->
    <div class="data-basis">
      <strong>데이터 산출 기준</strong><br>
      매출·신규 환자: 병원 경영 데이터 기준 | 유튜브 조회수: 해당 월 일별 조회수 합산 | 기간: ${MN[0]} ~ ${MN[lastIdx]}
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
