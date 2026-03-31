// ===== 매출 분석 페이지 =====
window.__pageRenderers.revenue = function(container) {
  const lastIdx = ML.length - 1;
  const curM = revenue[lastIdx];
  const prevM = lastIdx > 0 ? revenue[lastIdx - 1] : curM;
  const lastYM = lastIdx >= 12 ? revenue[lastIdx - 12] : null;
  const maxM = Math.max(...revenue);
  
  const mToMo = curM > prevM ? '▲' : (curM < prevM ? '▼' : '-');
  const mToMoText = curM === prevM ? '동일' : `약 ${(curM/prevM).toFixed(1)}배 ${mToMo}`;
  let mToMoCls = curM > prevM ? 'up' : 'down';
  
  let yToYText = '데이터 부족';
  let yToYCls = '';
  if (lastYM) {
    const yToY = curM > lastYM ? '▲' : (curM < lastYM ? '▼' : '-');
    yToYText = curM === lastYM ? '동일' : `약 ${(curM/lastYM).toFixed(1)}배 ${yToY}`;
    yToYCls = curM > lastYM ? 'up' : 'down';
  }
  
  const maxText = curM === maxM ? '기록 갱신 🏆' : '변동 기록 중';

  container.innerHTML = `
    <div class="kpi-grid four">
      <div class="kpi-card"><div class="kpi-label">이번달 매출</div><div class="kpi-value" style="color:var(--revenue)">${fmtM(curM)}원</div></div>
      <div class="kpi-card"><div class="kpi-label">전월 대비</div><div class="kpi-value ${mToMoCls}">${mToMoText}</div></div>
      <div class="kpi-card"><div class="kpi-label">작년 동기 대비</div><div class="kpi-value ${yToYCls}">${yToYText}</div></div>
      <div class="kpi-card"><div class="kpi-label">역대 최고 매출</div><div class="kpi-value" style="color:var(--coral);font-size:22px">${maxText}</div></div>
    </div>
    <div class="card"><h3>월별 매출 추이</h3><p class="card-desc">막대가 높을수록 매출이 좋은 달입니다</p><div class="chart-box"><canvas id="c-rev"></canvas></div></div>
    <div class="card"><h3>매출 × 유튜브 조회수 비교</h3><p class="card-desc">초록 막대(매출)와 파란 선(조회수)이 비슷한 시기에 오르내리는지 확인해보세요</p><div class="chart-box"><canvas id="c-rev-view"></canvas></div>
      <div class="footnote"><strong>읽는 법:</strong> 파란 선(유튜브)이 오른 뒤 1~2개월 후 초록 막대(매출)가 따라 오르는 패턴이 보이면, 유튜브 활동이 매출에 시간차를 두고 영향을 주고 있다는 의미입니다.</div>
    </div>
    <div class="card"><h3>매출 × 신규 환자 비교</h3><p class="card-desc">매출이 오른 달에 신규 환자도 같이 올랐나요?</p><div class="chart-box"><canvas id="c-rev-pat"></canvas></div>
      <div class="footnote">매출은 올랐는데 신규 환자는 변동이 없다면, 기존 환자분들의 추가 치료가 매출을 이끌었을 가능성이 있습니다.</div>
    </div>
    
    <!-- V6 3단 구조 인사이트: 조회수와 매출의 관계 -->
    <div class="insight-banner blue-grad" style="margin-bottom:24px">
      <div class="banner-label">💡 매출 인사이트</div>
      <div class="banner-headline">조회수가 높다고 바로 매출이 따라오는 것은 아닙니다</div>
      <div style="background:rgba(0,0,0,.15);border-radius:12px;padding:20px;margin-bottom:12px">
        <div style="font-size:12px;font-weight:700;margin-bottom:6px;opacity:.9">📊 데이터로 확인된 사실</div>
        <div class="banner-body" style="font-size:13px;line-height:1.7;margin-bottom:12px">
          • 2025년 4월: 조회수 14만회(2위) / 매출 237만원(최저)<br>
          • 2025년 6월: 조회수 12.3만회(안정) / 매출 1,492만원(상위권)<br>
          • 2026년 1월: 조회수 11.4만회 / 매출 2,957만원(역대 최고치)
        </div>
        <div style="font-size:12px;font-weight:700;margin-bottom:6px;opacity:.9">📈 수치 비교 (순위 불일치)</div>
        <table style="width:100%;font-size:13px;border-collapse:collapse;margin-bottom:0">
          <tr style="border-bottom:1px solid rgba(255,255,255,.2)">
             <th style="padding:6px 0;text-align:left">시점</th><th style="padding:6px 0;text-align:right">유튜브 조회수</th><th style="padding:6px 0;text-align:right">매출</th>
          </tr>
          <tr style="border-bottom:1px solid rgba(255,255,255,.2)">
             <td style="padding:6px 0">25년 4월</td><td style="padding:6px 0;text-align:right;color:#60a5fa">14.0만회 (▲높음)</td><td style="padding:6px 0;text-align:right;color:#f87171">237만원 (▼낮음)</td>
          </tr>
          <tr>
             <td style="padding:6px 0;font-weight:700">26년 1월</td><td style="padding:6px 0;text-align:right;font-weight:700">11.4만회 (안정적)</td><td style="padding:6px 0;text-align:right;color:#34d399;font-weight:700">2,957만원 (▲최고)</td>
          </tr>
        </table>
      </div>
      <div style="font-size:12px;font-weight:700;margin-bottom:4px;opacity:.9">💡 해석</div>
      <div class="banner-body" style="font-size:13px">조회수 숫자 자체보다는 <strong>'어떤 주제의 영상이 올라갔느냐'가 매출에 훨씬 더 큰 영향</strong>을 미치는 것으로 보입니다. 임플란트 비용, 신경치료 방법 등 환자분들이 치료를 결심하기 직전에 검색하는 주제 영상이 많은 시기에 매출이 높은 경향이 있습니다.</div>
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
