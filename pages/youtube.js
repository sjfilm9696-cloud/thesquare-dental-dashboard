// ===== 유튜브 성과 페이지 =====
window.__pageRenderers.youtube = function(container) {
  container.innerHTML = `
    <div class="kpi-grid four">
      <div class="kpi-card"><div class="kpi-label">이번달 조회수</div><div class="kpi-value" style="color:var(--views)">11.4만회</div></div>
      <div class="kpi-card"><div class="kpi-label">전월 대비</div><div class="kpi-value down">1.8만 적음 ▼</div></div>
      <div class="kpi-card"><div class="kpi-label">역대 최고 월간</div><div class="kpi-value">15.5만회</div><div class="kpi-change" style="color:var(--g500)">2025년 9월</div></div>
      <div class="kpi-card"><div class="kpi-label">분석 기간</div><div class="kpi-value" style="font-size:22px">15개월</div></div>
    </div>
    <div class="card"><h3>월별 조회수 추이</h3><p class="card-desc">유튜브 채널의 월간 조회수 변화입니다</p><div class="chart-box"><canvas id="c-yt-month"></canvas></div></div>
    <div class="card"><h3>일별 조회수 상세</h3><p class="card-desc">2025.01~2026.03 전체 기간 일별 조회수입니다</p><div class="chart-box lg"><canvas id="c-yt-daily"></canvas></div></div>
    <div class="card"><h3>조회수가 떨어진 시기, 왜 그랬을까요?</h3><p class="card-desc">유튜브 조회수는 항상 일정하지 않습니다. 아래는 주요 변동 시기와 원인 분석입니다.</p><div class="timeline" id="yt-tl"></div></div>
    <div class="card"><h3>조회수 TOP 5 영상</h3><p class="card-desc">분석 기간 내 조회수 상위 영상입니다</p><div class="top-list" id="yt-top5"></div></div>`;
  setTimeout(_initYtCharts, 50);
};

function _initYtCharts() {
  // 월별 조회수
  createChart('c-yt-month', { type:'line', data:{labels:ML,datasets:[{label:'월간 조회수',data:views,borderColor:'#f59e0b',backgroundColor:'rgba(245,158,11,.1)',fill:true,pointRadius:6,pointBackgroundColor:'#f59e0b',tension:.3,borderWidth:3}]},
    options:{...CHART_OPTS,scales:{x:{grid:{display:false}},y:{ticks:{callback:v=>fmtV(v)},grid:{color:'#f1f5f9'}}}}});

  // 일별 조회수 (2일 단위 샘플링)
  const sd=[],sv=[];for(let i=0;i<dailyViews.length;i+=2){sd.push(dailyDates[i]);sv.push(dailyViews[i]);}
  createChart('c-yt-daily', { type:'line', data:{labels:sd,datasets:[{label:'일별 조회수',data:sv,borderColor:'#1e40af',backgroundColor:'rgba(30,64,175,.08)',fill:true,tension:.2,pointRadius:0,borderWidth:2,pointHitRadius:10}]},
    options:{...CHART_OPTS,plugins:{...CHART_OPTS.plugins,legend:{display:false},tooltip:{...CHART_OPTS.plugins.tooltip,callbacks:{label:c=>'조회수: '+c.raw.toLocaleString()+'회'}}},scales:{x:{ticks:{maxTicksLimit:14,font:{size:11}},grid:{color:'#f1f5f9'}},y:{ticks:{callback:v=>v>=10000?(v/10000).toFixed(0)+'만':v.toLocaleString()},grid:{color:'#f1f5f9'}}}}});

  // 타임라인
  const tl=document.getElementById('yt-tl');
  if(tl&&!tl.children.length){
    tlData.forEach(d=>{
      const tags=d.tags.map(t=>`<span class="tl-tag ${t[0]}">${t[1]}</span>`).join('');
      tl.innerHTML+=`<div class="tl-item ${d.cls}"><div class="tl-period">${d.period}</div><div class="tl-title">${d.title}</div><div class="tl-body">${d.body}<br>${tags}</div></div>`;
    });
  }

  // TOP 5
  const t5=document.getElementById('yt-top5');
  if(t5&&!t5.children.length){
    topVideos.slice(0,5).forEach((v,i)=>{
      const rc=i===0?'rank-1':i===1?'rank-2':i===2?'rank-3':'rank-n';
      t5.innerHTML+=`<div class="top-item"><div class="rank-badge ${rc}">${i+1}</div><div class="top-title">${v.title}</div><div class="top-views">${v.views.toLocaleString()}</div></div>`;
    });
  }
}
