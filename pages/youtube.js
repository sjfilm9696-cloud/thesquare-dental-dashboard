// ===== 유튜브 성과 페이지 (v3 강화) =====
window.__pageRenderers.youtube = function(container) {
  container.innerHTML = `
    <div class="kpi-grid four">
      <div class="kpi-card"><div class="kpi-label">이번달 조회수</div><div class="kpi-value" style="color:var(--views)">11.4만회</div></div>
      <div class="kpi-card"><div class="kpi-label">전월 대비</div><div class="kpi-value down">1.8만 적음 ▼</div></div>
      <div class="kpi-card"><div class="kpi-label">역대 최고 월간</div><div class="kpi-value">15.5만회</div><div class="kpi-change" style="color:var(--g500)">2025년 9월</div></div>
      <div class="kpi-card"><div class="kpi-label">분석 기간</div><div class="kpi-value" style="font-size:22px">15개월</div></div>
    </div>

    <!-- 월별 조회수 차트 + 업로드 영상 연동 -->
    <div class="card">
      <h3>월별 조회수 추이</h3>
      <p class="card-desc">막대를 클릭하면 해당 월에 올린 영상 목록이 아래에 나타납니다</p>
      <div class="chart-box"><canvas id="c-yt-month"></canvas></div>
      <!-- 월 선택 드롭다운 -->
      <div style="margin-top:16px;display:flex;align-items:center;gap:10px">
        <label for="month-select" style="font-size:13px;font-weight:600;color:var(--g500)">월 선택:</label>
        <select id="month-select" style="padding:6px 12px;border:1px solid var(--g200);border-radius:8px;font-size:13px;font-family:inherit"></select>
      </div>
      <!-- 업로드 영상 리스트 -->
      <div id="upload-list" style="margin-top:16px"></div>
    </div>

    <!-- 상승/하락 구간 인사이트 (자동 생성) -->
    <div id="yt-insights"></div>

    <!-- 일별 조회수 -->
    <div class="card">
      <h3>일별 조회수 상세</h3>
      <p class="card-desc">2025.01~2026.03 전체 기간 일별 조회수입니다</p>
      <div class="chart-box lg"><canvas id="c-yt-daily"></canvas></div>
    </div>

    <!-- 변동 분석 타임라인 -->
    <div class="card">
      <h3>조회수가 떨어진 시기, 왜 그랬을까요?</h3>
      <p class="card-desc">유튜브 조회수는 항상 일정하지 않습니다. 아래는 주요 변동 시기와 원인 분석입니다.</p>
      <div class="timeline" id="yt-tl"></div>
    </div>

    <!-- TOP 5 -->
    <div class="card">
      <h3>조회수 TOP 5 영상</h3>
      <p class="card-desc">분석 기간 내 조회수 상위 영상입니다</p>
      <div class="top-list" id="yt-top5"></div>
    </div>`;
  setTimeout(_initYtPage, 50);
};

function _initYtPage() {
  // === 월별 조회수 차트 ===
  const chart = createChart('c-yt-month', {
    type:'bar',
    data:{labels:ML,datasets:[{label:'월간 조회수',data:views,backgroundColor:views.map(v=>v>=140000?'#f59e0b':'#fde68a'),borderRadius:6}]},
    options:{...CHART_OPTS,onClick:(e,els)=>{if(els.length)_showMonth(els[0].index);},
      scales:{x:{grid:{display:false}},y:{ticks:{callback:v=>fmtV(v)},grid:{color:'#f1f5f9'}}}}
  });

  // === 월 선택 드롭다운 ===
  const sel = document.getElementById('month-select');
  MN.forEach((n,i) => {
    const opt = document.createElement('option');
    opt.value = i; opt.textContent = n;
    sel.appendChild(opt);
  });
  sel.value = 12; // 2026.01 기본 선택
  sel.addEventListener('change', () => _showMonth(+sel.value));
  _showMonth(12); // 기본: 최신 달

  // === 인사이트 카드 자동 생성 ===
  _renderInsights();

  // === 일별 조회수 ===
  const sd=[],sv=[];for(let i=0;i<dailyViews.length;i+=2){sd.push(dailyDates[i]);sv.push(dailyViews[i]);}
  createChart('c-yt-daily', { type:'line',
    data:{labels:sd,datasets:[{label:'일별 조회수',data:sv,borderColor:'#1e40af',backgroundColor:'rgba(30,64,175,.08)',fill:true,tension:.2,pointRadius:0,borderWidth:2,pointHitRadius:10}]},
    options:{...CHART_OPTS,plugins:{...CHART_OPTS.plugins,legend:{display:false},tooltip:{...CHART_OPTS.plugins.tooltip,callbacks:{label:c=>'조회수: '+c.raw.toLocaleString()+'회'}}},scales:{x:{ticks:{maxTicksLimit:14,font:{size:11}},grid:{color:'#f1f5f9'}},y:{ticks:{callback:v=>v>=10000?(v/10000).toFixed(0)+'만':v.toLocaleString()},grid:{color:'#f1f5f9'}}}}});

  // === 타임라인 ===
  const tl=document.getElementById('yt-tl');
  if(tl&&!tl.children.length){
    tlData.forEach(d=>{
      const tags=d.tags.map(t=>`<span class="tl-tag ${t[0]}">${t[1]}</span>`).join('');
      tl.innerHTML+=`<div class="tl-item ${d.cls}"><div class="tl-period">${d.period}</div><div class="tl-title">${d.title}</div><div class="tl-body">${d.body}<br>${tags}</div></div>`;
    });
  }

  // === TOP 5 ===
  const t5=document.getElementById('yt-top5');
  if(t5&&!t5.children.length){
    topVideos.slice(0,5).forEach((v,i)=>{
      const rc=i===0?'rank-1':i===1?'rank-2':i===2?'rank-3':'rank-n';
      t5.innerHTML+=`<div class="top-item"><div class="rank-badge ${rc}">${i+1}</div><div class="top-title">${v.title}</div><div class="top-views">${v.views.toLocaleString()}</div></div>`;
    });
  }
}

// === 월별 업로드 영상 표시 ===
function _showMonth(idx) {
  const key = MN[idx];
  const ups = monthlyUploads[key] || [];
  const el = document.getElementById('upload-list');
  const sel = document.getElementById('month-select');
  if (sel) sel.value = idx;

  if (!ups.length) {
    el.innerHTML = `<div style="padding:24px;text-align:center;color:var(--g500);background:var(--g100);border-radius:12px;font-size:14px">이 달에는 업로드된 영상이 없습니다</div>`;
    return;
  }

  // 미드폼/쇼츠 분리 후 조회수 높은 순
  const mid = ups.filter(v=>v.type==='midform').sort((a,b)=>b.views-a.views);
  const shorts = ups.filter(v=>v.type==='shorts').sort((a,b)=>b.views-a.views);
  const totalViews = ups.reduce((s,v)=>s+v.views,0);

  const renderList = (arr) => arr.map(v =>
    `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--g200)">
      <span style="font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:70%">● ${v.title}</span>
      <span style="font-size:13px;font-weight:700;color:var(--views);font-family:'Inter',sans-serif;white-space:nowrap">${fmtV(v.views)}</span>
    </div>`
  ).join('');

  el.innerHTML = `
    <div style="background:var(--g50);border:1px solid var(--g200);border-radius:14px;padding:20px 24px">
      <div style="font-size:15px;font-weight:700;color:var(--navy-900);margin-bottom:4px">
        ${key.slice(2)} — ${ups.length}편 업로드, 조회수 합산 약 ${fmtV(totalViews)}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-top:14px">
        <div>
          <div style="font-size:12px;font-weight:700;color:var(--patient);margin-bottom:8px">미드폼 (${mid.length}편)</div>
          ${mid.length ? renderList(mid) : '<div style="font-size:13px;color:var(--g500)">없음</div>'}
        </div>
        <div>
          <div style="font-size:12px;font-weight:700;color:var(--coral);margin-bottom:8px">쇼츠 (${shorts.length}편)</div>
          ${shorts.length ? renderList(shorts) : '<div style="font-size:13px;color:var(--g500)">없음</div>'}
        </div>
      </div>
    </div>`;
}

// === 상승/하락 구간 인사이트 자동 생성 ===
function _renderInsights() {
  const el = document.getElementById('yt-insights');
  if (!el) return;

  // 조회수 정렬해서 상위/하위 구간 파악
  const avg = views.reduce((s,v)=>s+v,0) / views.length;
  let html = '';

  // 상승 구간 인사이트
  const highMonths = [[3,'2025년 4월',140268],[8,'2025년 9월',155199],[11,'2025년 12월',131168]];
  highMonths.forEach(([idx,label,v]) => {
    const ups = monthlyUploads[MN[idx]] || [];
    if (!ups.length && idx !== 7) return; // 8월은 기존 영상 트래픽
    const mid = ups.filter(x=>x.type==='midform').sort((a,b)=>b.views-a.views);
    const shorts = ups.filter(x=>x.type==='shorts').sort((a,b)=>b.views-a.views);
    const topVideo = [...ups].sort((a,b)=>b.views-a.views)[0];
    const rank = [...views].sort((a,b)=>b-a).indexOf(v) + 1;

    let body = `이 달에 ${ups.length}편을 업로드했습니다.`;
    if (mid.length && topVideo) {
      body += `<br>미드폼 ${mid.length}편 중 "${mid[0].title}"(${fmtV(mid[0].views)})이 가장 큰 기여를 했고,`;
    }
    if (shorts.length && shorts[0]) {
      body += `<br>쇼츠 "${shorts[0].title}"(${fmtV(shorts[0].views)})도 높은 반응을 얻었습니다.`;
    }
    if (topVideo) {
      const topic = topVideo.title.includes('임플란트') ? '임플란트 비용 관련 주제' :
                    topVideo.title.includes('백태') ? '구강관리 관련 주제' : '해당 주제';
      body += `<br>→ <strong>${topic}가 이 시기 조회수 상승의 핵심 요인이었습니다.</strong>`;
    }

    html += `<div class="insight-banner green-grad" style="margin-bottom:16px">
      <div class="banner-label">📈 조회수 상승 구간</div>
      <div class="banner-headline">${label} — 조회수 ${fmtV(v)}회 (역대 ${rank}위)</div>
      <div class="banner-body">${body}</div>
    </div>`;
  });

  // 하락 구간 인사이트
  html += `<div class="insight-banner amber-grad" style="margin-bottom:16px">
    <div class="banner-label">📉 조회수 하락 구간</div>
    <div class="banner-headline">2025년 1~3월 — 조회수 7만대 (최저 구간)</div>
    <div class="banner-body">이 기간 신규 업로드가 거의 없었습니다 (1월 1편, 2월 0편, 3월 1편).<br>기존 영상의 자연 검색 트래픽으로만 유지된 구간으로,<br><strong>업로드 공백이 조회수 하락의 주된 원인으로 보입니다.</strong></div>
  </div>`;

  html += `<div class="insight-banner amber-grad" style="margin-bottom:16px">
    <div class="banner-label">📉 조회수 하락 구간</div>
    <div class="banner-headline">2025년 11월 — 조회수 7.8만 (전월 대비 절반)</div>
    <div class="banner-body">이 달 업로드는 미드폼 3편뿐이었고, 쇼츠가 0편이었습니다.<br>10월 4편 → 11월 3편으로 업로드량이 줄면서<br><strong>알고리즘 추천이 감소한 것으로 보입니다.</strong></div>
  </div>`;

  el.innerHTML = html;
}
