// ===== 인스타그램 페이지 =====
window.__pageRenderers.instagram = function(container) {
  container.innerHTML = `
    <div class="kpi-grid four">
      <div class="kpi-card"><div class="kpi-label">이번달 릴스 게시</div><div class="kpi-value" style="color:var(--coral)">5개</div></div>
      <div class="kpi-card"><div class="kpi-label">평균 조회수</div><div class="kpi-value">약 2,500회</div></div>
      <div class="kpi-card"><div class="kpi-label">최고 조회수 릴스</div><div class="kpi-value" style="font-size:20px">3.1만회</div><div class="kpi-change" style="color:var(--g500)">엑스레이 논란</div></div>
      <div class="kpi-card"><div class="kpi-label">운영 시작</div><div class="kpi-value" style="font-size:22px">2025.12~</div></div>
    </div>
    <div class="card"><h3>월별 릴스 평균 조회수 추이</h3><p class="card-desc">인스타그램 릴스의 월별 성과 변화입니다</p><div class="chart-box sm"><canvas id="c-insta"></canvas></div></div>
    <div class="card"><h3>릴스 조회수 × 유튜브 조회수 비교</h3><p class="card-desc">유튜브와 인스타그램에서 반응이 좋은 주제가 같은지 확인해보세요</p><div class="chart-box sm"><canvas id="c-insta-yt"></canvas></div></div>
    <div class="card"><h3>릴스 조회수 TOP 5</h3><div class="top-list" id="insta-top5"></div></div>
    <div class="card"><h3>콘텐츠 패턴 분석</h3>
      <div class="pattern-box good"><h4>✅ 잘 되는 패턴</h4><ul>
        <li><strong>사회 이슈 반응형</strong> — 시의성 있는 논란에 전문가 의견 → 3.1만 조회</li>
        <li><strong>경고/주의 어조</strong> — "절대 하지 마세요" → 평균 6,000 이상</li>
        <li><strong>생활 밀착형 구강관리</strong> — 욕실 필수템 등 → 평균 4,000~1.1만</li>
        <li><strong>가격/비용 정보</strong> — 임플란트 가격 → 3,400 수준</li>
      </ul></div>
      <div class="pattern-box neutral"><h4>⚠️ 저조한 패턴</h4><ul><li>원장님 개인 스토리, 동기부여/커리어 콘텐츠 → 대부분 1,000 미만</li></ul></div>
    </div>
    <div class="insight-card">
      <div class="insight-label">유튜브 ↔ 인스타 교차 분석</div>
      <ul style="margin:0;padding-left:18px;line-height:2">
        <li><strong>둘 다 잘 되는 주제:</strong> 치료 주의사항 (신경치료, 치아 깎기)</li>
        <li><strong>인스타에서만 잘 되는 주제:</strong> 사회 이슈 반응형 (짧은 호흡에 적합)</li>
        <li><strong>유튜브에서만 잘 되는 주제:</strong> 임플란트 비용 상세 설명 (긴 호흡 필요)</li>
      </ul>
    </div>`;
  setTimeout(_initInstaCharts, 50);
};

function _initInstaCharts() {
  createChart('c-insta', { type:'bar',
    data:{labels:instaMonths,datasets:[{label:'평균 조회수',data:instaAvg,backgroundColor:['#fde68a','#fb923c','#f97316','#fdba74'],borderRadius:8}]},
    options:{...CHART_OPTS,scales:{x:{grid:{display:false}},y:{ticks:{callback:v=>v.toLocaleString()},grid:{color:'#f1f5f9'}}}}});

  createChart('c-insta-yt', { type:'bar',
    data:{labels:instaMonths,datasets:[
      {label:'유튜브 조회수',data:instaYt,backgroundColor:'rgba(245,158,11,.3)',borderColor:'#f59e0b',borderWidth:2,borderRadius:6},
      {label:'인스타 평균 조회수',data:instaAvg,backgroundColor:'rgba(255,107,107,.3)',borderColor:'#ff6b6b',borderWidth:2,borderRadius:6}
    ]}, options:{...CHART_OPTS,scales:{x:{grid:{display:false}},y:{ticks:{callback:v=>v>=10000?fmtV(v):v.toLocaleString()},grid:{color:'#f1f5f9'}}}}});

  // TOP 5
  const el=document.getElementById('insta-top5');
  if(el&&!el.children.length){
    instaTop5.forEach((v,i)=>{
      const rc=i===0?'rank-1':i===1?'rank-2':i===2?'rank-3':'rank-n';
      el.innerHTML+=`<div class="top-item"><div class="rank-badge ${rc}">${i+1}</div><div class="top-title">${v.title}</div><div class="top-views">${v.views.toLocaleString()}</div></div>`;
    });
  }
}
