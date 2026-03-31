// ===== 전략 제안 페이지 =====
window.__pageRenderers.strategy = function(container) {
  container.innerHTML = `
    <div class="insight-banner purple-grad">
      <div class="banner-label">STRATEGY</div>
      <div class="banner-headline">데이터 기반 다음 분기 콘텐츠 방향을 제안드립니다</div>
      <div class="banner-body">위 분석 결과를 종합하여, 매출과 신규 환자 유입을 높이기 위한 실행 방향입니다.</div>
    </div>
    <div class="action-list" id="strategy-list"></div>
    <div class="card" style="margin-top:24px">
      <h3>월별 체크리스트</h3>
      <p class="card-desc">매달 아래 항목을 점검해보세요</p>
      <ul style="padding-left:20px;font-size:14px;line-height:2.2;color:var(--g700)">
        <li>이번 달 업로드 영상 수: <strong>목표 4편 이상</strong></li>
        <li>조회수 추이가 전월 대비 유지 또는 상승하고 있는지</li>
        <li>임플란트 관련 영상이 최소 1편 이상 포함되었는지</li>
        <li>인스타그램 릴스 게시: <strong>주 1~2회</strong></li>
        <li>다음 달 추천 콘텐츠 주제 검토</li>
      </ul>
    </div>`;

  const sl = document.getElementById('strategy-list');
  if (sl && !sl.children.length) {
    strategies.forEach((s, i) => {
      sl.innerHTML += `<div class="action-item"><div class="action-num">${i+1}</div><div class="action-text">${s.text}<span class="action-ref">${s.ref}</span></div></div>`;
    });
  }
};
