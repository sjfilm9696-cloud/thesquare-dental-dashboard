// ===== 홈 페이지 (전체 요약) — v7: ROI + 자동인사이트 + 예측 + 알림뱃지 =====
window.__pageRenderers.home = function(container) {
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
    const prevIdx = lastIdx - 1;
    revCmpText = revenue[lastIdx] > revenue[prevIdx] ? '▲ 전월 대비 상승' : '▼ 전월 대비 하락';
    patCmpText = patients[lastIdx] > patients[prevIdx] ? '▲ 전월 대비 상승' : '▼ 전월 대비 하락';
    viewCmpText = views[lastIdx] > views[prevIdx] ? '▲ 전월 대비 상승' : '▼ 전월 대비 하락';
  }

  // ROI 계산
  const avgRevPerPat = avgRevenuePerPatient(3);
  const totalRev = yearlyTotal();
  const totalPat = patients.reduce((a, b) => a + b, 0);

  // 최근 월 업로드 정보
  const lastUpload = uploadSummary[uploadSummary.length - 1];
  const viewsPerVideo = lastUpload && lastUpload.total > 0 ? Math.round(views[lastIdx] / lastUpload.total) : 0;

  // 예측값
  const predRev = predict3MA(revenue);
  const predView = predict3MA(views);
  const predPat = predict3MA(patients);

  // 자동 인사이트
  const insight = generateAutoInsight();

  // 변동 알림
  const alerts = getAlertBadges();

  container.innerHTML = `
    <!-- KPI 카드 3장 + 알림뱃지 -->
    <div class="kpi-grid">
      <div class="kpi-card clickable" onclick="navigateTo('revenue')">
        ${alerts.rev ? `<div class="alert-badge alert-${alerts.rev}">${alerts.rev === 'up' ? '↑' : '↓'}</div>` : ''}
        <div class="kpi-label">${curMNText} 매출</div>
        <div class="kpi-value" style="color:var(--revenue)">${fmtM(revenue[lastIdx])}원</div>
        <div class="kpi-change ${revCls}">${revCmpText}</div>
      </div>
      <div class="kpi-card clickable" onclick="navigateTo('patient')">
        ${alerts.pat ? `<div class="alert-badge alert-${alerts.pat}">${alerts.pat === 'up' ? '↑' : '↓'}</div>` : ''}
        <div class="kpi-label">${curMNText} 신규 환자</div>
        <div class="kpi-value" style="color:var(--patient)">${patients[lastIdx]}명</div>
        <div class="kpi-change ${patCls}">${patCmpText}</div>
      </div>
      <div class="kpi-card clickable" onclick="navigateTo('youtube')">
        ${alerts.view ? `<div class="alert-badge alert-${alerts.view}">${alerts.view === 'up' ? '↑' : '↓'}</div>` : ''}
        <div class="kpi-label">${curMNText} 유튜브 조회수</div>
        <div class="kpi-value" style="color:var(--views)">${fmtV(views[lastIdx])}회</div>
        <div class="kpi-change ${viewCls}">${viewCmpText}</div>
      </div>
    </div>

    <!-- ROI 카드 4장 (신규) -->
    <div class="roi-grid">
      <div class="roi-card">
        <div class="roi-label">환자당 평균 매출</div>
        <div class="roi-value">${fmtM(avgRevPerPat)}원</div>
        <div class="roi-sub">최근 3개월 기준</div>
      </div>
      <div class="roi-card">
        <div class="roi-label">영상당 평균 조회수</div>
        <div class="roi-value">${fmtV(viewsPerVideo)}회</div>
        <div class="roi-sub">${curMNText} 기준</div>
      </div>
      <div class="roi-card">
        <div class="roi-label">누적 총 매출</div>
        <div class="roi-value">${(totalRev / 100000000).toFixed(1)}억원</div>
        <div class="roi-sub">${MN[0]} ~ ${MN[lastIdx]}</div>
      </div>
      <div class="roi-card">
        <div class="roi-label">총 신규 환자</div>
        <div class="roi-value">${totalPat}명</div>
        <div class="roi-sub">월 평균 ${Math.round(totalPat / ML.length)}명</div>
      </div>
    </div>

    <!-- 다음 달 예측 -->
    ${predRev ? `
    <div class="card" style="margin-bottom:20px">
      <h3>📈 다음 달 예측 (3개월 이동평균)</h3>
      <p class="card-desc">최근 3개월 평균치를 기반으로 한 다음 달 추정값입니다. 참고 수치이며 실제와 다를 수 있습니다.</p>
      <div class="kpi-grid" style="margin-bottom:0">
        <div class="kpi-card" style="border:2px dashed var(--g300)">
          <div class="kpi-label">예측 매출</div>
          <div class="kpi-value" style="color:var(--g500);font-size:26px">${fmtM(predRev)}원</div>
        </div>
        <div class="kpi-card" style="border:2px dashed var(--g300)">
          <div class="kpi-label">예측 신규 환자</div>
          <div class="kpi-value" style="color:var(--g500);font-size:26px">${predPat}명</div>
        </div>
        <div class="kpi-card" style="border:2px dashed var(--g300)">
          <div class="kpi-label">예측 조회수</div>
          <div class="kpi-value" style="color:var(--g500);font-size:26px">${fmtV(predView)}회</div>
        </div>
      </div>
    </div>` : ''}

    <!-- 데이터 산출 기준 -->
    <div class="data-basis">
      <strong>데이터 산출 기준</strong><br>
      매출·신규 환자: 병원 경영 데이터 기준 | 유튜브 조회수: 해당 월 일별 조회수 합산 | 기간: ${MN[0]} ~ ${MN[lastIdx]}
    </div>

    <!-- 핵심 인사이트 배너 (자동 생성) -->
    <div class="insight-banner ${insight.type}">
      <div class="banner-label">KEY INSIGHT</div>
      <div class="banner-headline">${insight.headline}</div>
      <div class="banner-body">${insight.body}</div>
    </div>

    <!-- 히트맵 -->
    <div class="card">
      <h3>월별 성과 한눈에 보기</h3>
      <p class="card-desc">세 줄을 위아래로 비교하면, 매출·조회수·신규 환자가 같은 시기에 함께 움직이는지 확인할 수 있습니다</p>
      <div class="hm-section heatmap-desktop">
        <div class="hm-label"><span class="dot green"></span> 어떤 달에 매출이 좋았나요?</div>
        <div class="heat-row" id="hm-rev"></div>
      </div>
      <div class="hm-section heatmap-desktop">
        <div class="hm-label"><span class="dot blue"></span> 어떤 달에 유튜브 성과가 좋았나요?</div>
        <div class="heat-row" id="hm-views"></div>
      </div>
      <div class="hm-section heatmap-desktop">
        <div class="hm-label"><span class="dot purple"></span> 어떤 달에 신규 환자가 많았나요?</div>
        <div class="heat-row" id="hm-pat"></div>
      </div>
      <div class="heatmap-mobile" id="hm-mobile"></div>
    </div>
  `;

  // 히트맵 렌더링
  _renderHeatmap('hm-rev', revenue, 'money', '#10b981', '#ecfdf5');
  _renderHeatmap('hm-views', views, 'views', '#3b82f6', '#eff6ff');
  _renderHeatmapPat('hm-pat');
  _renderHeatmapMobile();
};

function _renderHeatmapMobile() {
  const el = document.getElementById('hm-mobile');
  if (!el) return;

  const qData = {};
  MN.forEach((n, i) => {
    const year = n.split('.')[0];
    const month = parseInt(n.split('.')[1], 10);
    const q = Math.ceil(month / 3);
    const key = '20' + year + ' ' + q + '분기';
    if(!qData[key]) qData[key] = { r:0, v:0, count:0, mStart: month, mEnd: month };
    qData[key].r += revenue[i];
    qData[key].v += views[i];
    qData[key].count++;
    qData[key].mEnd = month;
  });

  let html = '';
  for (const k in qData) {
    const d = qData[k];
    const rAvg = Math.round(d.r / d.count);
    const vAvg = Math.round(d.v / d.count);
    html += '<div style="background:#fff;border:1px solid var(--g200);border-radius:12px;padding:16px;">' +
      '<div style="font-weight:700;font-size:14px;color:var(--navy-900);margin-bottom:12px;border-bottom:1px solid var(--g100);padding-bottom:8px">' +
        k + ' (' + d.mStart + '~' + d.mEnd + '월)' +
      '</div>' +
      '<div style="display:flex;justify-content:space-between;margin-bottom:6px;font-size:13px">' +
        '<span style="color:var(--g500)">평균 매출</span>' +
        '<span style="font-weight:700;color:var(--revenue)">' + fmtM(rAvg) + '원</span>' +
      '</div>' +
      '<div style="display:flex;justify-content:space-between;font-size:13px">' +
        '<span style="color:var(--g500)">평균 조회수</span>' +
        '<span style="font-weight:700;color:var(--views)">' + fmtV(vAvg) + '회</span>' +
      '</div>' +
    '</div>';
  }
  el.innerHTML = html;
}

// 매출/조회수 히트맵 공통
function _renderHeatmap(id, arr, type, hiColor, hiBg) {
  const el = document.getElementById(id);
  if (!el) return;
  const sorted = [...arr].sort((a,b) => b-a);
  const top2Threshold = sorted[1];
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

// 신규 환자 히트맵
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
