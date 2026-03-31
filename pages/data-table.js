// ===== 상세 데이터 페이지 =====
window.__pageRenderers.data = function(container) {
  container.innerHTML = `
    <div class="card" style="overflow-x:auto">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;flex-wrap:wrap;gap:12px">
        <h3 style="margin:0">월별 전체 데이터</h3>
        <button class="btn-dl" onclick="_downloadCSV()">📥 CSV 다운로드</button>
      </div>
      <table class="data-table"><thead><tr>
        <th>기간</th><th class="r">매출</th><th class="r">전월 대비</th>
        <th class="r">신규 환자</th><th class="r">전월 대비</th>
        <th class="r">유튜브 조회수</th><th class="r">전월 대비</th>
      </tr></thead><tbody id="t-full"></tbody></table>
    </div>
    <div style="text-align:center;margin-top:48px;padding:20px;color:var(--g500);font-size:12px">
      이 리포트는 유튜브 스튜디오 및 병원 경영 데이터를 기반으로 작성되었습니다.<br>
      유튜브 알고리즘 분석은 YouTube Creator Insider, vidIQ, Think Media 등 해외 공인 자료를 참고하였습니다.<br>
      <strong style="color:var(--g700)">Prepared by 안티그래비티</strong>
    </div>`;

  const tb = document.getElementById('t-full');
  if (tb && !tb.children.length) {
    MN.forEach((n, i) => {
      const rc = i > 0 ? easyCompare(revenue[i], revenue[i-1], 'money') : '—';
      const pc = i > 0 ? easyCompare(patients[i], patients[i-1], 'patient') : '—';
      const vc = i > 0 ? easyCompare(views[i], views[i-1], 'views') : '—';
      const hl = i === 12 ? ' class="hl"' : '';
      tb.innerHTML += `<tr${hl}><td style="font-weight:600">${n}</td><td class="r" style="font-weight:700">${fmtM(revenue[i])}원</td><td class="r">${rc}</td><td class="r" style="font-weight:700">${patients[i]}명</td><td class="r">${pc}</td><td class="r" style="font-weight:700">${fmtV(views[i])}회</td><td class="r">${vc}</td></tr>`;
    });
  }
};

// CSV 다운로드
function _downloadCSV() {
  let csv = '기간,매출(원),신규환자(명),유튜브조회수\n';
  MN.forEach((n, i) => { csv += `${n},${revenue[i]},${patients[i]},${views[i]}\n`; });
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = '더스퀘어치과_월별데이터.csv';
  a.click();
}
