// ===== 매출 분석 페이지 =====
window.__pageRenderers.revenue = function(container) {
  container.innerHTML = `
    <div class="kpi-grid four">
      <div class="kpi-card"><div class="kpi-label">이번달 매출</div><div class="kpi-value" style="color:var(--revenue)">2,957만원</div></div>
      <div class="kpi-card"><div class="kpi-label">전월 대비</div><div class="kpi-value up">약 6.4배 ▲</div></div>
      <div class="kpi-card"><div class="kpi-label">작년 동기 대비</div><div class="kpi-value up">약 2.5배 ▲</div></div>
      <div class="kpi-card"><div class="kpi-label">역대 최고 매출</div><div class="kpi-value" style="color:var(--coral)">기록 갱신</div></div>
    </div>
    <div class="card"><h3>월별 매출 추이</h3><p class="card-desc">막대가 높을수록 매출이 좋은 달입니다</p><div class="chart-box"><canvas id="c-rev"></canvas></div></div>
    <div class="card"><h3>매출 × 유튜브 조회수 비교</h3><p class="card-desc">초록 막대(매출)와 파란 선(조회수)이 비슷한 시기에 오르내리는지 확인해보세요</p><div class="chart-box"><canvas id="c-rev-view"></canvas></div>
      <div class="footnote"><strong>읽는 법:</strong> 파란 선(유튜브)이 오른 뒤 1~2개월 후 초록 막대(매출)가 따라 오르는 패턴이 보이면, 유튜브 활동이 매출에 시간차를 두고 영향을 주고 있다는 의미입니다.</div>
    </div>
    <div class="card"><h3>매출 × 신규 환자 비교</h3><p class="card-desc">매출이 오른 달에 신규 환자도 같이 올랐나요?</p><div class="chart-box"><canvas id="c-rev-pat"></canvas></div>
      <div class="footnote">매출은 올랐는데 신규 환자는 변동이 없다면, 기존 환자분들의 추가 치료가 매출을 이끌었을 가능성이 있습니다.</div>
    </div>
    <div class="card" style="overflow-x:auto"><h3>월별 매출 상세</h3>
      <table class="data-table"><thead><tr><th>기간</th><th class="r">매출</th><th class="r">전월 대비</th><th class="r">신규 환자</th><th>비고</th></tr></thead><tbody id="t-rev"></tbody></table>
    </div>`;
  setTimeout(_initRevCharts, 50);
};

function _initRevCharts() {
  // 매출 추이 — 최고 매출 달만 진한 초록, 나머지 통일
  const maxRev = Math.max(...revenue);
  createChart('c-rev', { type:'bar', data:{labels:ML,datasets:[{label:'매출',data:revenue,backgroundColor:revenue.map(v=>v===maxRev?'#10b981':'#34d399'),borderRadius:6}]},
    options:{...CHART_OPTS,plugins:{...CHART_OPTS.plugins,tooltip:{...CHART_OPTS.plugins.tooltip,callbacks:{label:c=>'  매출: '+fmtM(c.raw)+'원'}}},scales:{x:{grid:{display:false}},y:{ticks:{callback:v=>fmtM(v)},grid:{color:'#f1f5f9'}}}}});

  // 매출 × 조회수 — 조회수 선: 파란색으로 변경 (시인성 개선)
  createChart('c-rev-view', { type:'bar', data:{labels:ML,datasets:[
    {type:'bar',label:'매출',data:revenue,backgroundColor:'#34d399',borderRadius:6,yAxisID:'y',order:2},
    {type:'line',label:'유튜브 조회수',data:views,borderColor:'#3b82f6',pointBackgroundColor:'#3b82f6',pointRadius:5,tension:.3,borderWidth:3,yAxisID:'y1',order:1}
  ]}, options:{...CHART_OPTS,interaction:{mode:'index',intersect:false},scales:dualScales('매출','#10b981',v=>fmtM(v),'조회수','#3b82f6',v=>fmtV(v))}});

  // 매출 × 신환
  createChart('c-rev-pat', { type:'bar', data:{labels:ML,datasets:[
    {type:'bar',label:'매출',data:revenue,backgroundColor:'#34d399',borderRadius:6,yAxisID:'y',order:2},
    {type:'line',label:'신규 환자',data:patients,borderColor:'#3b82f6',pointBackgroundColor:'#3b82f6',pointRadius:5,tension:.3,borderWidth:3,yAxisID:'y1',order:1}
  ]}, options:{...CHART_OPTS,interaction:{mode:'index',intersect:false},scales:dualScales('매출','#10b981',v=>fmtM(v),'신규 환자 (명)','#3b82f6',v=>v+'명')}});

  // 테이블
  const tb = document.getElementById('t-rev');
  if (tb && !tb.children.length) {
    MN.forEach((n,i) => {
      const cmp = i>0 ? easyCompare(revenue[i],revenue[i-1],'money') : '—';
      let note = '';
      if (revenue[i]===Math.max(...revenue)) note='🏆 역대 최고';
      else if (revenue[i]===Math.min(...revenue)) note='⚠️ 최저';
      const hl = i===12?' class="hl"':'';
      tb.innerHTML += `<tr${hl}><td style="font-weight:600">${n}</td><td class="r" style="font-weight:700">${fmtM(revenue[i])}원</td><td class="r">${cmp}</td><td class="r" style="font-weight:700">${patients[i]}명</td><td>${note}</td></tr>`;
    });
  }
}
