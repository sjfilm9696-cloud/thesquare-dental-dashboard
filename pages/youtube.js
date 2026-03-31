// ===== 유튜브 성과 페이지 (v5 최종) =====
window.__pageRenderers.youtube = function(container) {
  const lastIdx = ML.length - 1;
  const curV = views[lastIdx];
  const prevV = lastIdx > 0 ? views[lastIdx - 1] : curV;
  const maxV = Math.max(...views);
  const maxVIdx = views.indexOf(maxV);
  const maxVText = MN[maxVIdx].substring(0,4) + '년 ' + MN[maxVIdx].substring(5) + '월';
  
  const mToMoDiff = curV - prevV;
  const mToMo = mToMoDiff > 0 ? '▲' : (mToMoDiff < 0 ? '▼' : '-');
  const mToMoText = mToMoDiff === 0 ? '동일' : `${fmtV(Math.abs(mToMoDiff))} ${mToMoDiff>0?'많음':'적음'} ${mToMo}`;
  let mToMoCls = mToMoDiff > 0 ? 'up' : (mToMoDiff < 0 ? 'down' : '');

  container.innerHTML = `
    <div class="kpi-grid four">
      <div class="kpi-card"><div class="kpi-label">이번달 조회수</div><div class="kpi-value" style="color:var(--views)">${fmtV(curV)}회</div></div>
      <div class="kpi-card"><div class="kpi-label">전월 대비</div><div class="kpi-value ${mToMoCls}">${mToMoText}</div></div>
      <div class="kpi-card"><div class="kpi-label">역대 최고 월간</div><div class="kpi-value">${fmtV(maxV)}회</div><div class="kpi-change" style="color:var(--g500)">${maxVText}</div></div>
      <div class="kpi-card"><div class="kpi-label">데이터 누적</div><div class="kpi-value" style="font-size:22px">${ML.length}개월</div></div>
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
      const isUp = d.cls === 'positive';
      const icon = isUp ? '📈' : '📉';
      tl.innerHTML += `<details style="background:var(--g50);border:1px solid var(--g200);border-radius:12px;margin-bottom:12px;overflow:hidden">
        <summary style="padding:16px 20px;font-weight:700;font-size:14px;cursor:pointer;list-style:none;display:flex;align-items:center;gap:8px">
          <span>${icon}</span> <span>${d.period} — ${d.title}</span><span style="margin-left:auto;color:var(--g500);font-size:12px;opacity:0.8">자세히 보기 ▼</span>
        </summary>
        <div style="padding:0 20px 16px 44px;font-size:13px;color:var(--g700);line-height:1.6">${d.body}</div>
      </details>`;
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

// === v6 인사이트 카드 (3단 구조) ===
function _renderInsights() {
  const el = document.getElementById('yt-insights');
  if (!el) return;

  let html = '';

  // 1. 쇼츠가 이 채널의 성장 엔진 (기존 배너를 카드로 또는 배너 유지하되 구조화)
  // 여기서는 배너가 이미 상단에 있으므로 하단의 상승 구간 3개, 하락 구간 2개를 V6 구조로 변경

  // 📈 상승 구간 1: 2025년 4월
  html += `<div class="insight-banner green-grad" style="margin-bottom:16px">
    <div class="banner-label">📈 상승: 2025년 4월 (쇼츠 시작 효과)</div>
    <div class="banner-headline">조회수가 약 2배로 상승한 전환점</div>
    <div style="background:rgba(0,0,0,.15);border-radius:12px;padding:20px;margin-bottom:12px">
      <div style="font-size:12px;font-weight:700;margin-bottom:6px;opacity:.9">📊 데이터로 확인된 사실</div>
      <div class="banner-body" style="font-size:13px;line-height:1.7;margin-bottom:12px">
        • 3월 조회수: 7.2만회 (미드폼 1편, 쇼츠 0편)<br>
        • 4월 조회수: 14.0만회 (미드폼 3편, 쇼츠 12편)<br>
        • 성과 기여: <span style="font-weight:600">"금이 간 치아"(2만), "초기충치"(1.6만) 등 쇼츠가 다수 히트</span>
      </div>
      <div style="font-size:12px;font-weight:700;margin-bottom:6px;opacity:.9">📈 수치 비교</div>
      <table style="width:100%;font-size:13px;border-collapse:collapse;margin-bottom:0">
        <tr style="border-bottom:1px solid rgba(255,255,255,.2)">
          <td style="padding:6px 0;width:30%">25년 3월</td><td style="padding:6px 0">쇼츠 0편</td><td style="text-align:right;padding:6px 0">7.2만회</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-weight:700">25년 4월</td><td style="padding:6px 0;font-weight:700">쇼츠 12편</td><td style="text-align:right;padding:6px 0;font-weight:700">14.0만회</td>
        </tr>
      </table>
    </div>
    <div style="font-size:12px;font-weight:700;margin-bottom:4px;opacity:.9">💡 해석</div>
    <div class="banner-body" style="font-size:13px">쇼츠 도입이 채널 시청층을 대폭 확대시켜 채널 조회수를 약 2배로 끌어올린 전환점이 된 것으로 보입니다. 미드폼 "치아 덜 깎는 치료"(3.1만)의 성공적인 견인 효과도 있었습니다.</div>
  </div>`;

  // 📈 상승 구간 2: 2025년 9월
  html += `<div class="insight-banner green-grad" style="margin-bottom:16px">
    <div class="banner-label">📈 상승: 2025년 9월 (역대 최고 월간)</div>
    <div class="banner-headline">꾸준한 업로드가 만들어낸 추천 점유율 상승</div>
    <div style="background:rgba(0,0,0,.15);border-radius:12px;padding:20px;margin-bottom:12px">
      <div style="font-size:12px;font-weight:700;margin-bottom:6px;opacity:.9">📊 데이터로 확인된 사실</div>
      <div class="banner-body" style="font-size:13px;line-height:1.7;margin-bottom:12px">
        • 업로드 수량: 미드폼 2편, 쇼츠 9편 (총 11편 꾸준히 유지)<br>
        • 신규 영상 최고치: "이걸 모르고 신경치료?" (6.3천회) - <strong>특별한 바이럴 폭발 영상 부재</strong><br>
        • 9월 합산 조회수: 15.5만회 (역대 1위)
      </div>
      <div style="font-size:12px;font-weight:700;margin-bottom:6px;opacity:.9">📈 수치 비교</div>
      <table style="width:100%;font-size:13px;border-collapse:collapse;margin-bottom:0">
        <tr style="border-bottom:1px solid rgba(255,255,255,.2)">
          <td style="padding:6px 0;width:30%">신규 영상 합산</td><td style="padding:6px 0">11편 누적 합산 평균 미만</td><td style="text-align:right;padding:6px 0">약 3만회</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-weight:700">전체 채널 조회수</td><td style="padding:6px 0;font-weight:700">기존 영상의 알고리즘 지속 노출</td><td style="text-align:right;padding:6px 0;font-weight:700">15.5만회</td>
        </tr>
      </table>
    </div>
    <div style="font-size:12px;font-weight:700;margin-bottom:4px;opacity:.9">💡 해석</div>
    <div class="banner-body" style="font-size:13px">단일 신규 영상의 인기가 아니더라도, <strong>꾸준한 업로드가 누적되면서 기존 영상들의 유튜브 알고리즘 추천 점수가 높아진 시기</strong>로 보입니다. 이 시기를 지나며 10월 치과 전체 매출(1,588만원) 최고치도 달성했습니다.</div>
  </div>`;

  // 📈 상승 구간 3: 2025년 12월
  html += `<div class="insight-banner green-grad" style="margin-bottom:16px">
    <div class="banner-label">📈 상승: 2025년 12월 (쇼츠 재개 효과)</div>
    <div class="banner-headline">쇼츠를 재개하자마자 바로 조회수가 반등했습니다</div>
    <div style="background:rgba(0,0,0,.15);border-radius:12px;padding:20px;margin-bottom:12px">
      <div style="font-size:12px;font-weight:700;margin-bottom:6px;opacity:.9">📊 데이터로 확인된 사실</div>
      <div class="banner-body" style="font-size:13px;line-height:1.7;margin-bottom:12px">
        • 11월: 쇼츠 0편, 합산 7.8만회<br>
        • 12월: 쇼츠 10편 재개, 합산 13.1만회 (전월 대비 1.6배 회복)<br>
        • 히트 요인: "99%는 모르는 피나는 이유"(9k), "잇몸약 대신 이걸"(7.5k) 등 <strong>잇몸 시리즈 쇼츠 연속 히트</strong>
      </div>
      <div style="font-size:12px;font-weight:700;margin-bottom:6px;opacity:.9">📈 수치 비교</div>
      <table style="width:100%;font-size:13px;border-collapse:collapse;margin-bottom:0">
        <tr style="border-bottom:1px solid rgba(255,255,255,.2)">
          <td style="padding:6px 0;width:30%">25년 11월</td><td style="padding:6px 0">하락 (쇼츠 중단)</td><td style="text-align:right;padding:6px 0">7.8만회</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-weight:700">25년 12월</td><td style="padding:6px 0;font-weight:700">반등 (잇몸 쇼츠 10편 편재)</td><td style="text-align:right;padding:6px 0;font-weight:700">13.1만회</td>
        </tr>
      </table>
    </div>
    <div style="font-size:12px;font-weight:700;margin-bottom:4px;opacity:.9">💡 해석</div>
    <div class="banner-body" style="font-size:13px">쇼츠 업로드가 줄어들 때 발생했던 알고리즘 노출 감소가, <strong>쇼츠를 재개함으로써 빠르게 회복된다는 명확한 패턴을 확인시켜준 사례</strong>로 보입니다.</div>
  </div>`;

  // 📉 하락 구간 1: 2025년 1~3월
  html += `<div class="insight-banner amber-grad" style="margin-bottom:16px">
    <div class="banner-label">📉 하락: 2025년 1~3월 (쇼츠 운영 전)</div>
    <div class="banner-headline">신규 업로드 공백이 조회수 정체를 만듭니다</div>
    <div style="background:rgba(0,0,0,.15);border-radius:12px;padding:20px;margin-bottom:12px">
      <div style="font-size:12px;font-weight:700;margin-bottom:6px;opacity:.9">📊 데이터로 확인된 사실</div>
      <div class="banner-body" style="font-size:13px;line-height:1.7;margin-bottom:12px">
        • 25년 1월~3월 업로드: 미드폼 2편, 쇼츠 0편 (2월 정규 업로드 미비)<br>
        • 해당 3개월 간 월 조회수 평균 7.7만회 (분석기간 내 최저 그룹)
      </div>
      <div style="font-size:12px;font-weight:700;margin-bottom:6px;opacity:.9">📈 수치 비교</div>
      <table style="width:100%;font-size:13px;border-collapse:collapse;margin-bottom:0">
        <tr>
          <td style="padding:6px 0;font-weight:700;width:30%">25년 1~3월</td><td style="padding:6px 0;font-weight:700">총 2편 업로드</td><td style="text-align:right;padding:6px 0;font-weight:700">평균 7.7만회</td>
        </tr>
      </table>
    </div>
    <div style="font-size:12px;font-weight:700;margin-bottom:4px;opacity:.9">💡 해석</div>
    <div class="banner-body" style="font-size:13px">기존 영상의 자연 검색 트래픽으로만 유지된 정체 구간으로 보입니다. <strong>업로드 빈도 부족과 쇼츠 미운영</strong>이 채널 성장을 막는 주된 요인일 가능성이 있습니다.</div>
  </div>`;

  // 📉 하락 구간 2: 2025년 10~11월
  html += `<div class="insight-banner amber-grad" style="margin-bottom:16px">
    <div class="banner-label">📉 하락: 2025년 10~11월 (쇼츠 감소 여파)</div>
    <div class="banner-headline">쇼츠를 줄이니 채널 전체 조회수가 곧바로 떨어졌습니다</div>
    <div style="background:rgba(0,0,0,.15);border-radius:12px;padding:20px;margin-bottom:12px">
      <div style="font-size:12px;font-weight:700;margin-bottom:6px;opacity:.9">📊 데이터로 확인된 사실</div>
      <div class="banner-body" style="font-size:13px;line-height:1.7;margin-bottom:12px">
        • 9월: 쇼츠 9편 (조회수 15.5만)<br>
        • 10월: 쇼츠 3편 (조회수 12.2만)<br>
        • 11월: 쇼츠 0편 (조회수 7.8만)
      </div>
      <div style="font-size:12px;font-weight:700;margin-bottom:6px;opacity:.9">📈 수치 비교</div>
      <table style="width:100%;font-size:13px;border-collapse:collapse;margin-bottom:0">
        <tr style="border-bottom:1px solid rgba(255,255,255,.2)">
          <td style="padding:6px 0;width:30%">25년 9월</td><td style="padding:6px 0">쇼츠 9편</td><td style="text-align:right;padding:6px 0">15.5만회</td>
        </tr>
        <tr style="border-bottom:1px solid rgba(255,255,255,.2)">
          <td style="padding:6px 0">25년 10월</td><td style="padding:6px 0">쇼츠 3편</td><td style="text-align:right;padding:6px 0">12.2만회</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-weight:700">25년 11월</td><td style="padding:6px 0;font-weight:700">쇼츠 0편</td><td style="text-align:right;padding:6px 0;font-weight:700">7.8만회</td>
        </tr>
      </table>
    </div>
    <div style="font-size:12px;font-weight:700;margin-bottom:4px;opacity:.9">💡 해석</div>
    <div class="banner-body" style="font-size:13px">10~11월에 <strong>쇼츠 업로드가 줄어들면서 조회수가 비례하여 하락</strong>했습니다. 미드폼을 꾸준히 올려도 (10월 4편, 11월 3편) 조회수 반등에는 부족했으며, <strong>채널의 트래픽을 위해서는 쇼츠의 지속 발행이 필수적</strong>이라는 점이 확인된 것으로 보입니다.</div>
  </div>`;

  // 📉 하락 구간 3: 2026년 2~3월
  html += `<div class="insight-banner amber-grad" style="margin-bottom:16px">
    <div class="banner-label">📉 정체: 2026년 2~3월</div>
    <div class="banner-headline">개인 스토리 중심의 쇼츠는 반응이 아쉽습니다</div>
    <div style="background:rgba(0,0,0,.15);border-radius:12px;padding:20px;margin-bottom:12px">
      <div style="font-size:12px;font-weight:700;margin-bottom:6px;opacity:.9">📊 데이터로 확인된 사실</div>
      <div class="banner-body" style="font-size:13px;line-height:1.7;margin-bottom:12px">
        • 2~3월 쇼츠 업로드 편수 감소 (월 4편 수준)<br>
        • "치대 조작 논란", "치과대표원장이 예상한 유망 직종" 등 개인 스토리 화제 중심의 콘텐츠 중심<br>
        • 월 평균 조회수 정체 (8.5만회, 8.3만회)
      </div>
      <div style="font-size:12px;font-weight:700;margin-bottom:6px;opacity:.9">📈 수치 비교</div>
      <table style="width:100%;font-size:13px;border-collapse:collapse;margin-bottom:0">
        <tr style="border-bottom:1px solid rgba(255,255,255,.2)">
          <td style="padding:6px 0;width:30%">치료 주의사항 등 (과거)</td><td style="padding:6px 0">잇몸 피날때, 뼈이식 등</td><td style="text-align:right;padding:6px 0">평균 3~9천회</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-weight:700">스토리 주제 (최근)</td><td style="padding:6px 0;font-weight:700">유망직종, 대학특징 중심</td><td style="text-align:right;padding:6px 0;font-weight:700">평균 1.5천회</td>
        </tr>
      </table>
    </div>
    <div style="font-size:12px;font-weight:700;margin-bottom:4px;opacity:.9">💡 해석</div>
    <div class="banner-body" style="font-size:13px">쇼츠 편수가 줄어든 요인과 함께, <strong>치료 정보성 주제에 비해 가벼운 개인 이야기 중심 주제의 조회수 반응이 다소 낮게</strong> 형성된 것으로 보입니다. 환자들이 궁금해하는 치료 주제 비중을 높일 필요가 있습니다.</div>
  </div>`;

  el.innerHTML = html;
}
