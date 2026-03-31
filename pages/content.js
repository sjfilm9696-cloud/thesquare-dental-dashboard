// ===== 콘텐츠 분석 페이지 =====
window.__pageRenderers.content = function(container) {
  container.innerHTML = `
    <div class="insight-banner green-grad">
      <div class="banner-label">FINDING</div>
      <div class="banner-headline">조회수가 높다고 매출이 따라오는 것은 아닙니다</div>
      <div class="banner-body">2025년 4월, 조회수가 14만회로 가장 높았지만 매출은 237만원으로 가장 낮았습니다.<br>반면 6월은 조회수 12만회에 매출 1,492만원이었습니다.<br><strong>영상의 주제와 시청자의 치료 의향</strong>이 매출 전환에 더 큰 영향을 미칩니다.</div>
    </div>
    <div class="topic-grid" id="topic-cards"></div>
    <div class="card"><h3>주제별 성과 비교</h3><p class="card-desc">조회수(파란색)가 높다고 총 시청시간(초록색)이 높은 것은 아닙니다</p><div class="chart-box"><canvas id="c-topic"></canvas></div></div>
    <div class="card" style="overflow-x:auto"><h3>영상별 성과 (상위 10개)</h3>
      <table class="data-table"><thead><tr><th>순위</th><th>영상 제목</th><th class="r">조회수</th><th class="r">평균 시청</th><th>주제 분류</th></tr></thead><tbody id="t-video"></tbody></table>
    </div>`;
  setTimeout(_initContentPage, 50);
};

function _initContentPage() {
  // 주제별 카드
  const tc = document.getElementById('topic-cards');
  if (tc && !tc.children.length) {
    topicData.forEach(t => {
      tc.innerHTML += `<div class="topic-card ${t.cls}"><div class="topic-head"><div class="topic-name">${t.name}</div><span class="topic-badge" style="background:${t.bg};color:${t.bc}">${t.badge}</span></div><div class="topic-stats"><div class="topic-stat">영상 수<strong>${t.n}편</strong></div><div class="topic-stat">총 조회수<strong>${fmtV(t.v)}</strong></div><div class="topic-stat">평균 시청<strong>${fmtWatch(t.h, t.v)}</strong></div></div><div class="topic-desc">${t.desc}</div></div>`;
    });
  }

  // 주제별 비교 차트
  createChart('c-topic', { type:'bar',
    data:{labels:['임플란트','치아 치료','구강관리 정보','생활습관·예방'],datasets:[
      {label:'총 조회수',data:[246336,136787,260343,96575],backgroundColor:'rgba(30,64,175,.2)',borderColor:'#1e40af',borderWidth:2,borderRadius:6,yAxisID:'y'},
      {label:'시청시간 (시간)',data:[8915,10644,2939,6121],backgroundColor:'rgba(16,185,129,.2)',borderColor:'#10b981',borderWidth:2,borderRadius:6,yAxisID:'y1'}
    ]}, options:{...CHART_OPTS,scales:dualScales('조회수','#1e40af',v=>fmtV(v),'시청시간(h)','#10b981',v=>v.toLocaleString())}});

  // 영상 테이블
  const vt = document.getElementById('t-video');
  if (vt && !vt.children.length) {
    topVideos.forEach((v,i) => {
      vt.innerHTML += `<tr><td style="text-align:center;font-weight:700">${i+1}</td><td>${v.title}</td><td class="r" style="font-weight:700;color:var(--views)">${v.views.toLocaleString()}</td><td class="r">${fmtWatch(v.hours, v.views)}</td><td>${v.topic}</td></tr>`;
    });
  }
}
