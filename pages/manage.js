// ===== 데이터 관리 페이지 (v6 추가) =====
window.__pageRenderers.manage = function(container) {
  let saved = localStorage.getItem('dashboardData_v6');
  let currentMsg = saved ? formatDate(new Date()) : '없음 (원본 data.js 기본 데이터 사용 중)';

  container.innerHTML = `
    <div class="card">
      <h3>🔧 데이터 관리실 (로컬 저장소)</h3>
      <p class="card-desc">업데이트된 실적 데이터를 입력하면 브라우저에 저장되어 대시보드 전체 UI(차트, 히트맵, 테이블)에 실시간으로 즉시 반영됩니다.</p>
      
      <div style="margin-bottom:32px; background:var(--g50); padding:24px; border-radius:12px; border:1px solid var(--g200);">
        <h4 style="font-size:16px;font-weight:700;margin-bottom:8px;color:var(--navy-900);">1️⃣ 매출 / 신규 환자 데이터 추가</h4>
        <div style="font-size:13px;color:var(--g500);margin-bottom:12px;line-height:1.6">
          형식: <strong style="color:var(--g700)">월(YY.MM), 신환수, 매출</strong> (예: <strong>26.02, 10, 15000000</strong>)<br>
          복수의 월 데이터를 여러 줄에 입력하거나 기존 월과 동일한 연월을 입력하여 덮어쓸 수 있습니다.
        </div>
        <textarea id="mg-rev-input" rows="5" style="width:100%;padding:14px;border:1px solid var(--g300);border-radius:8px;font-family:monospace;font-size:14px;resize:vertical" placeholder="예: 26.02, 10, 15000000&#10;예: 26.03, 12, 18000000"></textarea>
      </div>

      <div style="margin-bottom:32px; background:var(--g50); padding:24px; border-radius:12px; border:1px solid var(--g200);">
        <h4 style="font-size:16px;font-weight:700;margin-bottom:8px;color:var(--navy-900);">2️⃣ 유튜브 트래픽 데이터 추가 (선택)</h4>
        <div style="font-size:13px;color:var(--g500);margin-bottom:12px;line-height:1.6">
          형식: <strong style="color:var(--g700)">월(YY.MM), 월간 합산 조회수</strong> (예: <strong>26.02, 85000</strong>)<br>
          ※ 매출 데이터 입력 시 함께 입력하면 '매출×조회수' 차트에 반영됩니다.
        </div>
        <textarea id="mg-view-input" rows="3" style="width:100%;padding:14px;border:1px solid var(--g300);border-radius:8px;font-family:monospace;font-size:14px;resize:vertical" placeholder="예: 26.02, 85000"></textarea>
      </div>

      <div style="margin-bottom:24px">
        <h4 style="font-size:15px;font-weight:700;margin-bottom:12px">📊 현재 업로드 현황 및 반영 관리</h4>
        <div style="background:#fff;padding:20px;border-radius:8px;font-size:13px;color:var(--g700);margin-bottom:16px;border:1px solid var(--g200)">
          <div style="margin-bottom:6px">• 마지막 업데이트 시점: <strong id="mg-last-update" style="color:var(--navy-500)">${currentMsg}</strong></div>
          <div>• 적용 중인 데이터 기간: <strong style="color:var(--g900)">${window.ML ? window.ML[0] : '알수없음'} ~ ${window.ML ? window.ML[window.ML.length-1] : '알수없음'} (총 ${window.ML ? window.ML.length : 0}개월)</strong></div>
        </div>
        
        <div style="display:flex;gap:12px">
          <button onclick="applyData()" class="btn-dl" style="background:var(--revenue);font-size:14px;padding:12px 24px;">🔄 대시보드 전역 업데이트 적용</button>
          <button onclick="clearData()" class="btn-dl" style="background:var(--g500);color:#fff">🗑 로컬 데이터 초기화 및 원본 복구</button>
        </div>
      </div>
    </div>
  `;

  window.applyData = function() {
    const revText = document.getElementById('mg-rev-input').value.trim();
    const viewText = document.getElementById('mg-view-input').value.trim();
    
    if (!revText && !viewText) { alert('입력된 신규 데이터가 없습니다.'); return; }
    
    // 원본 데이터가 존재하지 않으면 진행 불가
    if (typeof window.ML === 'undefined') { alert('초기 데이터를 불러올 수 없습니다.'); return; }

    try {
      const newML = [...window.ML];
      const newMN = [...window.MN];
      const newPat = [...window.patients];
      const newRev = [...window.revenue];
      const newV = [...window.views];
      
      let added = 0;
      
      // 1. 매출/신환 파싱
      if(revText) {
        revText.split('\\n').forEach(l => {
          const parts = l.split(',').map(s=>s.trim());
          if(parts.length >= 3) {
            const m = parts[0]; // e.g. 26.02
            const p = parseInt(parts[1], 10);
            const r = parseInt(parts[2], 10);
            if (m && !isNaN(p) && !isNaN(r)) {
              let idx = newML.indexOf(m);
              if (idx > -1) {
                newPat[idx] = p;
                newRev[idx] = r;
              } else {
                newML.push(m);
                newMN.push('20' + m.replace('.', '.')); 
                newPat.push(p);
                newRev.push(r);
                newV.push(0); // View는 기본 0처리
              }
              added++;
            }
          }
        });
      }

      // 2. 조회수 파싱
      if(viewText) {
        viewText.split('\\n').forEach(l => {
          const parts = l.split(',').map(s=>s.trim());
          if(parts.length >= 2) {
            const m = parts[0];
            const v = parseInt(parts[1], 10);
            if (m && !isNaN(v)) {
              let idx = newML.indexOf(m);
              if (idx > -1) {
                newV[idx] = v;
              } else {
                newML.push(m);
                newMN.push('20' + m);
                newPat.push(0);
                newRev.push(0);
                newV.push(v);
              }
              added++;
            }
          }
        });
      }
      
      // 재정렬 (날짜순 정렬 시 안정적) - 포맷 보장 시
      // (단순 append라 가정)

      const toSave = { ML: newML, MN: newMN, patients: newPat, revenue: newRev, views: newV };
      localStorage.setItem('dashboardData_v6', JSON.stringify(toSave));
      
      alert(added + '행의 추가 데이터 구조가 병합/갱신되었습니다. 앱을 재기동합니다.');
      location.reload(); // 즉시 새로고침으로 적용
      
    } catch(e) {
      alert('오류 발생: 데이터 형식이 맞는지 다시 한 번 확인해주세요.');
      console.error(e);
    }
  };

  window.clearData = function() {
    if(confirm('로컬에 기록된 모든 변경사항을 삭제하고, 코드(data.js) 최초 시점으로 리셋하시겠습니까?')) {
      localStorage.removeItem('dashboardData_v6');
      location.reload();
    }
  };
};

function formatDate(d) {
  return d.getFullYear() + '.' + String(d.getMonth()+1).padStart(2,'0') + '.' + 
    String(d.getDate()).padStart(2,'0') + ' ' + 
    String(d.getHours()).padStart(2,'0') + ':' + 
    String(d.getMinutes()).padStart(2,'0');
}
