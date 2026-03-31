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
          형식: <strong style="color:var(--g700)">월(YY.MM), 신환수, 매출(만원)</strong> (예: <strong>26.02, 10, 2957</strong>)<br>
          ※ 매출은 반드시 <strong>만원 단위</strong>로 입력해주세요 (예: 2957 = 2,957만원)<br>
          복수의 월 데이터를 여러 줄에 입력하거나 기존 월과 동일한 연월을 입력하여 덮어쓸 수 있습니다.
        </div>
        <textarea id="mg-rev-input" rows="5" style="width:100%;padding:14px;border:1px solid var(--g300);border-radius:8px;font-family:monospace;font-size:14px;resize:vertical" placeholder="예: 26.02, 10, 2957  (만원 단위로 입력 → 2,957만원)\n예: 26.03, 12, 1800"></textarea>
      </div>

      <div style="margin-bottom:32px; background:var(--g50); padding:24px; border-radius:12px; border:1px solid var(--g200);">
        <h4 style="font-size:16px;font-weight:700;margin-bottom:8px;color:var(--navy-900);">2️⃣ 유튜브 트래픽 데이터 추가 (선택)</h4>
        <div style="font-size:13px;color:var(--g500);margin-bottom:12px;line-height:1.6">
          형식: <strong style="color:var(--g700)">월(YY.MM), 월간 합산 조회수</strong> (예: <strong>26.02, 85000</strong>)<br>
          ※ 매출 데이터 입력 시 함께 입력하면 '매출×조회수 차트'에 반영됩니다.
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
    if (typeof window.ML === 'undefined') { alert('초기 데이터를 불러올 수 없습니다.'); return; }

    try {
      const newML = [...window.ML];
      const newMN = [...window.MN];
      const newPat = [...window.patients];
      const newRev = [...window.revenue];
      const newV = [...window.views];
      
      let added = 0;
      let logs = [];
      
      if(revText) {
        revText.split('\n').forEach(l => {
          const parts = l.split(',').map(s=>s.trim());
          if(parts.length >= 3) {
            const m = parts[0]; 
            const p = parseInt(parts[1], 10);
            const r = parseInt(parts[2], 10) * 10000;
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
                newV.push(0);
              }
              added++;
              logs.push('[' + m + ' 매출/신환] 환자:' + p + '명, 매출:' + r.toLocaleString() + '원 (' + parts[2] + '만원)');
            }
          }
        });
      }

      if(viewText) {
        viewText.split('\n').forEach(l => {
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
              logs.push('[' + m + ' 조회수] ' + v.toLocaleString() + '회');
            }
          }
        });
      }
      
      if (added === 0) {
        alert('올바른 형식의 데이터가 발견되지 않았습니다.');
        return;
      }

      const confirmMsg = '입력 확인 (총 ' + added + '건):\\n--------------------------------\\n' + logs.join('\\n') + '\\n--------------------------------\\n데이터를 전역 대시보드에 적용하시겠습니까?';

      if (!confirm(confirmMsg)) return;

      const toSave = { ML: newML, MN: newMN, patients: newPat, revenue: newRev, views: newV };
      localStorage.setItem('dashboardData_v6', JSON.stringify(toSave));
      
      alert(added + '행의 추가 데이터 구조가 병합/갱신되었습니다. 앱을 재기동합니다.');
      location.reload(); 
      
    } catch(e) {
      alert('오류 발생: 데이터 형식이 맞는지 다시 한 번 확인해주세요.');
      console.error(e);
    }
  };

  window.clearData = function() {
    if(confirm('로컬에 기록된 모든 변경사항을 삭제하고, 최초 시점으로 리셋하시겠습니까?')) {
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
