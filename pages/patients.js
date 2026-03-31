// ===== 신규 환자 페이지 =====
window.__pageRenderers.patient = function(container) {
  container.innerHTML = `
    <div class="kpi-grid four">
      <div class="kpi-card"><div class="kpi-label">이번달 신규 환자</div><div class="kpi-value" style="color:var(--patient)">8명</div></div>
      <div class="kpi-card"><div class="kpi-label">전월 대비</div><div class="kpi-value up">+3명 ▲</div></div>
      <div class="kpi-card"><div class="kpi-label">작년 동기 대비</div><div class="kpi-value down">4명 적음 ▼</div></div>
      <div class="kpi-card"><div class="kpi-label">연간 누적</div><div class="kpi-value">8명</div><div class="kpi-change" style="color:var(--g500)">2026년 1월</div></div>
    </div>
    <div class="card"><h3>월별 신규 환자 추이</h3><p class="card-desc">매달 몇 명의 신규 환자가 내원하셨는지를 보여줍니다</p><div class="chart-box"><canvas id="c-pat"></canvas></div></div>
    <div class="card"><h3>신규 환자 × 유튜브 조회수 비교</h3><p class="card-desc">유튜브 조회수가 오른 달에 신규 환자도 같이 늘었는지 확인해보세요</p><div class="chart-box"><canvas id="c-pat-view"></canvas></div>
      <div class="footnote">바로 연결되지 않더라도 1~2개월 뒤에 늘어나는 패턴이 있을 수 있습니다.</div></div>
    <div class="card"><h3>신규 환자 × 매출 비교</h3><p class="card-desc">신규 환자가 적은데 매출이 높다면?</p><div class="chart-box"><canvas id="c-pat-rev"></canvas></div>
      <div class="footnote">신규 환자가 적은데 매출이 높다면, 기존 환자분들이 고단가 치료를 결정하셨을 가능성이 있습니다.</div></div>
    <div class="insight-card">
      <div class="insight-label">인사이트</div>
      <p>2026년 1월: 신규 환자 8명(전년보다 4명 적음)인데 매출 2,957만원(역대 최고). <strong>기존 환자분의 추가 치료 결정이 매출을 이끈 것으로 보입니다.</strong></p>
    </div>`;
  setTimeout(_initPatCharts, 50);
};

function _initPatCharts() {
  createChart('c-pat', { type:'bar', data:{labels:ML,datasets:[{label:'신규 환자',data:patients,backgroundColor:patients.map(v=>v>=10?'#3b82f6':v>=7?'#93c5fd':'#dbeafe'),borderRadius:6}]},
    options:{...CHART_OPTS,scales:{x:{grid:{display:false}},y:{ticks:{callback:v=>v+'명'},grid:{color:'#f1f5f9'}}}}});

  createChart('c-pat-view', { type:'bar', data:{labels:ML,datasets:[
    {type:'bar',label:'신규 환자',data:patients,backgroundColor:'#93c5fd',borderRadius:6,yAxisID:'y',order:2},
    {type:'line',label:'유튜브 조회수',data:views,borderColor:'#f59e0b',pointBackgroundColor:'#f59e0b',pointRadius:5,tension:.3,borderWidth:3,yAxisID:'y1',order:1}
  ]}, options:{...CHART_OPTS,interaction:{mode:'index',intersect:false},scales:dualScales('신규 환자 (명)','#3b82f6',v=>v+'명','조회수','#f59e0b',v=>fmtV(v))}});

  createChart('c-pat-rev', { type:'bar', data:{labels:ML,datasets:[
    {type:'bar',label:'매출',data:revenue,backgroundColor:'#34d399',borderRadius:6,yAxisID:'y',order:2},
    {type:'line',label:'신규 환자',data:patients,borderColor:'#3b82f6',pointBackgroundColor:'#3b82f6',pointRadius:6,tension:.3,borderWidth:3,yAxisID:'y1',order:1}
  ]}, options:{...CHART_OPTS,interaction:{mode:'index',intersect:false},scales:dualScales('매출','#10b981',v=>fmtM(v),'신규 환자 (명)','#3b82f6',v=>v+'명')}});
}
