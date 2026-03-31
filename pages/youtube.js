// ===== 유튜브 성과 페이지 (v5 최종) =====
window.__pageRenderers.youtube = function(container) {
  container.innerHTML = `
    <div class="kpi-grid four">
      <div class="kpi-card"><div class="kpi-label">이번달 조회수</div><div class="kpi-value" style="color:var(--views)">11.4만회</div></div>
      <div class="kpi-card"><div class="kpi-label">전월 대비</div><div class="kpi-value down">1.8만 적음 ▼</div></div>
      <div class="kpi-card"><div class="kpi-label">역대 최고 월간</div><div class="kpi-value">15.5만회</div><div class="kpi-change" style="color:var(--g500)">2025년 9월</div></div>
      <div class="kpi-card"><div class="kpi-label">분석 기간</div><div class="kpi-value" style="font-size:22px">15개월</div></div>
    </div>

    <!-- 핵심 발견 배너 -->
    <div class="insight-banner green-grad" style="margin-bottom:20px">
      <div class="banner-label">🔑 핵심 발견</div>
      <div class="banner-headline">쇼츠가 이 채널의 성장 엔진입니다</div>
      <div class="banner-body">
        <table style="width:100%;border-collapse:collapse;margin-top:8px;font-size:14px">
          <tr style="border-bottom:1px solid rgba(255,255,255,.3)"><th style="text-align:left;padding:6px 0">쇼츠 편수</th><th style="text-align:left;padding:6px 0">해당 월</th><th style="text-align:right;padding:6px 0">평균 조회수</th></tr>
          <tr style="border-bottom:1px solid rgba(255,255,255,.2)"><td style="padding:6px 0;font-weight:700">9~12편</td><td style="padding:6px 0">6,7,8,9,12월</td><td style="text-align:right;padding:6px 0;font-weight:700">12.8만</td></tr>
          <tr style="border-bottom:1px solid rgba(255,255,255,.2)"><td style="padding:6px 0">3~8편</td><td style="padding:6px 0">4,5,10월, 26.1~3월</td><td style="text-align:right;padding:6px 0">10.8만</td></tr>
          <tr><td style="padding:6px 0;color:rgba(255,255,255,.8)">0편</td><td style="padding:6px 0;color:rgba(255,255,255,.8)">1,2,3,11월</td><td style="text-align:right;padding:6px 0;color:rgba(255,255,255,.8)">7.8만</td></tr>
        </table>
        <div style="margin-top:8px">→ 쇼츠 9편 이상 올리는 달은 쇼츠 0편인 달의 약 <strong>1.6배</strong> 조회수</div>
      </div>
    </div>

    <!-- 월별 조회수 차트 + 업로드 영상 연동 -->
    <div class="card">
      <h3>월별 조회수 추이</h3>
      <p class="card-desc">막대를 클릭하면 해당 월에 올린 영상 목록이 아래에 나타납니다</p>
      <div class="chart-box"><canvas id="c-yt-month"></canvas></div>
      <div style="margin-top:16px;display:flex;align-items:center;gap:10px">
        <label for="month-select" style="font-size:13px;font-weight:600;color:var(--g500)">월 선택:</label>
        <select id="month-select" style="padding:6px 12px;border:1px solid var(--g200);border-radius:8px;font-size:13px;font-family:inherit"></select>
      </div>
      <div id="upload-list" style="margin-top:16px"></div>
    </div>

    <!-- 상승/하락 구간 인사이트 -->
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
  createChart('c-yt-month', {
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
  sel.value = 12;
  sel.addEventListener('change', () => _showMonth(+sel.value));
  _showMonth(12);

  // === 인사이트 카드 ===
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

// === 월별 업로드 영상 표시 (v5: midform/shorts 분리 구조) ===
function _showMonth(idx) {
  const key = MN[idx];
  const data = monthlyUploads[key];
  const el = document.getElementById('upload-list');
  const sel = document.getElementById('month-select');
  if (sel) sel.value = idx;

  // 데이터 없는 달 처리
  if (!data || (!data.midform.length && !data.shorts.length)) {
    const msg = data && data.summary ? data.summary : '이 달에는 업로드된 영상이 없습니다';
    el.innerHTML = `<div style="padding:24px;text-align:center;color:var(--g500);background:var(--g100);border-radius:12px;font-size:14px">${msg}</div>`;
    return;
  }

  const mid = [...data.midform].sort((a,b)=>b.views-a.views);
  const shorts = [...data.shorts].sort((a,b)=>b.views-a.views);
  const allVideos = [...data.midform, ...data.shorts];
  const totalViews = allVideos.reduce((s,v)=>s+v.views,0);

  const renderList = (arr, icon) => arr.map(v =>
    `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--g200)">
      <span style="font-size:13px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;max-width:70%">${icon} ${v.title}</span>
      <span style="font-size:13px;font-weight:700;color:var(--views);font-family:'Inter',sans-serif;white-space:nowrap">${fmtV(v.views)}</span>
    </div>`
  ).join('');

  el.innerHTML = `
    <div style="background:var(--g50);border:1px solid var(--g200);border-radius:14px;padding:20px 24px">
      <div style="font-size:15px;font-weight:700;color:var(--navy-900);margin-bottom:4px">
        📅 ${key.replace('.',' ')} — ${allVideos.length}편 업로드 (미드폼 ${mid.length}, 쇼츠 ${shorts.length}) | 합산 조회수 ${fmtV(totalViews)}
      </div>
      ${data.summary ? `<div style="font-size:12px;color:var(--g500);margin-bottom:12px">${data.summary}</div>` : ''}
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px">
        <div>
          <div style="font-size:12px;font-weight:700;color:var(--patient);margin-bottom:8px">📹 미드폼 (${mid.length}편)</div>
          ${mid.length ? renderList(mid, '📹') : '<div style="font-size:13px;color:var(--g500)">없음</div>'}
        </div>
        <div>
          <div style="font-size:12px;font-weight:700;color:var(--coral);margin-bottom:8px">⚡ 쇼츠 (${shorts.length}편)</div>
          ${shorts.length ? renderList(shorts, '⚡') : '<div style="font-size:13px;color:var(--g500)">없음</div>'}
        </div>
      </div>
    </div>`;
}

// === v5 인사이트 카드 (수정지시 B 섹션) ===
function _renderInsights() {
  const el = document.getElementById('yt-insights');
  if (!el) return;

  let html = '';

  // 📈 상승 구간 1: 2025년 4월
  html += `<div class="insight-banner green-grad" style="margin-bottom:16px">
    <div class="banner-label">📈 조회수 상승 구간</div>
    <div class="banner-headline">2025년 4월 — 14만회 (쇼츠 시작 효과)</div>
    <div class="banner-body">이 달에 처음으로 쇼츠를 본격 운영하기 시작했습니다 (쇼츠 12편 + 미드폼 3편 = 총 15편).<br>쇼츠 중 "금이 간 치아"(2만), "초기충치"(1.6만), "빠진 치아"(1.4만)가 높은 반응을 얻었고,<br>미드폼 "치아 덜 깎는 치료"(3.1만)도 기여했습니다.<br>→ <strong>쇼츠 도입이 채널 조회수를 약 2배로 끌어올린 전환점</strong>이었습니다.</div>
  </div>`;

  // 📈 상승 구간 2: 2025년 9월
  html += `<div class="insight-banner green-grad" style="margin-bottom:16px">
    <div class="banner-label">📈 조회수 상승 구간</div>
    <div class="banner-headline">2025년 9월 — 15.5만회 (역대 최고)</div>
    <div class="banner-body">미드폼 2편 + 쇼츠 9편으로 꾸준히 업로드했습니다.<br>이 달의 조회수는 신규 업로드 영상보다 <strong>기존 영상들의 알고리즘 추천이 활발했던 시기</strong>로 보입니다.<br>4월 이후 꾸준한 업로드가 쌓이면서 채널 전체의 추천 노출이 최고점에 도달한 것으로 해석됩니다.<br>→ 매출도 같은 시기~1개월 후(10월 1,588만원) 높았습니다.</div>
  </div>`;

  // 📈 상승 구간 3: 2025년 12월
  html += `<div class="insight-banner green-grad" style="margin-bottom:16px">
    <div class="banner-label">📈 조회수 상승 구간</div>
    <div class="banner-headline">2025년 12월 — 13.1만회 (쇼츠 재개 효과)</div>
    <div class="banner-body">11월에 쇼츠가 0편이었다가, 12월에 쇼츠 10편을 다시 업로드하면서 조회수가 회복되었습니다.<br>"99%는 모르는 치아에서 피가 나는 이유"(9,681), "잇몸약 대신 이걸"(7,514) 등 잇몸 시리즈 쇼츠가 연속 히트.<br>미드폼 "임플란트 후 이것 절대 하지 마세요!"(15,042)도 12월 최고 성과 영상.<br>→ <strong>쇼츠를 재개하면 조회수가 빠르게 회복된다는 것을 확인한 사례</strong>입니다.</div>
  </div>`;

  // 📉 하락 구간 1: 2025년 1~3월
  html += `<div class="insight-banner amber-grad" style="margin-bottom:16px">
    <div class="banner-label">📉 조회수 하락 구간</div>
    <div class="banner-headline">2025년 1~3월 — 7만대 (쇼츠 전 시기)</div>
    <div class="banner-body">미드폼만 간헐적으로 업로드(1~3월 합계 겨우 2편)하던 시기입니다.<br>2월은 아예 정식 업로드가 없었고, 기존 영상의 자연 검색 트래픽으로만 조회수가 유지되었습니다.<br>→ 업로드 빈도 부족 + <strong>쇼츠 미운영으로 채널 성장이 정체된 구간.</strong></div>
  </div>`;

  // 📉 하락 구간 2: 2025년 10~11월
  html += `<div class="insight-banner amber-grad" style="margin-bottom:16px">
    <div class="banner-label">📉 조회수 하락 구간</div>
    <div class="banner-headline">2025년 10~11월 — 12.2만→7.8만 (쇼츠 감소 영향)</div>
    <div class="banner-body">10월에 쇼츠가 9편→3편으로 줄었고, 11월에는 쇼츠가 0편이었습니다.<br>미드폼만 3편 올렸지만 조회수 반등에는 부족했습니다.<br><strong>데이터가 명확하게 보여주는 패턴: 쇼츠 0편인 달 = 조회수 최저.</strong><br>→ 쇼츠를 쉬면 안 됩니다.</div>
  </div>`;

  // 📉 하락 구간 3: 2026년 2~3월
  html += `<div class="insight-banner amber-grad" style="margin-bottom:16px">
    <div class="banner-label">📉 조회수 하락 구간</div>
    <div class="banner-headline">2026년 2~3월 — 8.5만대 정체</div>
    <div class="banner-body">미드폼 2~3편 + 쇼츠 4편으로 업로드는 했지만, 쇼츠 편수가 줄어들면서(피크 시 9~12편 → 현재 4편) 성장 동력이 약해졌습니다.<br>개인 스토리 주제("서울대생 특징", "유망 직종")의 반응이 치료 정보 주제보다 낮은 것도 영향.<br>→ <strong>쇼츠 편수를 월 8편 이상으로 늘리고, 치료 정보 주제 비중을 높이는 것을 권장드립니다.</strong></div>
  </div>`;

  el.innerHTML = html;
}
