// ===== 데이터 관리 페이지 (v7: 폼 UI 개선) =====
window.__pageRenderers.manage = function(container) {
  let saved = localStorage.getItem('dashboardData_v6');
  let currentMsg = saved ? formatDate(new Date()) : '없음 (원본 data.js 기본 데이터 사용 중)';

  // 월 선택 옵션 생성 (다음 달까지)
  const lastML = ML[ML.length - 1];
  const [lastY, lastM] = lastML.split('.').map(Number);
  const nextM = lastM >= 12 ? 1 : lastM + 1;
  const nextY = lastM >= 12 ? lastY + 1 : lastY;
  const nextML = String(nextY).padStart(2, '0') + '.' + String(nextM).padStart(2, '0');

  const allMonths = [...ML];
  if (!allMonths.includes(nextML)) allMonths.push(nextML);

  container.innerHTML = `
    <div class="card">
      <h3>데이터 관리실</h3>
      <p class="card-desc">새로운 월 데이터를 입력하면 대시보드 전체에 즉시 반영됩니다.</p>

      <!-- 폼 UI (신규) -->
      <div style="background:var(--g50);padding:24px;border-radius:12px;border:1px solid var(--g200);margin-bottom:24px">
        <h4 style="font-size:15px;font-weight:700;margin-bottom:16px;color:var(--navy-900)">데이터 입력</h4>
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">월 선택</label>
            <select id="mg-month" class="form-input">
              ${allMonths.map(m => `<option value="${m}" ${m === nextML ? 'selected' : ''}>${'20' + m}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">신규 환자 (명)</label>
            <input id="mg-pat" type="number" class="form-input" placeholder="예: 8" min="0">
          </div>
          <div class="form-group">
            <label class="form-label">매출 (만원)</label>
            <input id="mg-rev" type="number" class="form-input" placeholder="예: 2957" min="0">
          </div>
          <div class="form-group">
            <label class="form-label">유튜브 조회수</label>
            <input id="mg-view" type="number" class="form-input" placeholder="예: 113581" min="0">
          </div>
        </div>
        <div id="mg-preview" style="margin-top:16px;display:none;padding:14px;background:#fff;border-radius:8px;border:1px solid var(--g200);font-size:13px;color:var(--g700)"></div>
        <div style="margin-top:16px;display:flex;gap:12px">
          <button onclick="_previewData()" class="btn-dl" style="background:var(--navy-500)">미리보기</button>
          <button onclick="_applyFormData()" class="btn-dl" style="background:var(--revenue);font-size:14px;padding:10px 24px;">대시보드에 적용</button>
        </div>
      </div>

      <!-- 기존 텍스트 입력 (고급) -->
      <details style="margin-bottom:24px">
        <summary style="cursor:pointer;font-size:14px;font-weight:600;color:var(--g500);padding:12px 0">
          고급: 여러 줄 한번에 입력 ▼
        </summary>
        <div style="padding-top:16px">
          <div style="margin-bottom:20px;background:var(--g50);padding:20px;border-radius:12px;border:1px solid var(--g200)">
            <h4 style="font-size:14px;font-weight:700;margin-bottom:8px">매출 / 신규 환자</h4>
            <div style="font-size:12px;color:var(--g500);margin-bottom:8px">형식: <strong>YY.MM, 신환수, 매출(만원)</strong></div>
            <textarea id="mg-rev-input" rows="4" style="width:100%;padding:12px;border:1px solid var(--g300);border-radius:8px;font-family:monospace;font-size:13px;resize:vertical" placeholder="26.02, 10, 2957&#10;26.03, 12, 1800"></textarea>
          </div>
          <div style="margin-bottom:20px;background:var(--g50);padding:20px;border-radius:12px;border:1px solid var(--g200)">
            <h4 style="font-size:14px;font-weight:700;margin-bottom:8px">유튜브 조회수</h4>
            <div style="font-size:12px;color:var(--g500);margin-bottom:8px">형식: <strong>YY.MM, 월간 합산 조회수</strong></div>
            <textarea id="mg-view-input" rows="3" style="width:100%;padding:12px;border:1px solid var(--g300);border-radius:8px;font-family:monospace;font-size:13px;resize:vertical" placeholder="26.02, 85000"></textarea>
          </div>
          <button onclick="applyData()" class="btn-dl" style="background:var(--revenue)">텍스트 데이터 적용</button>
        </div>
      </details>

      <!-- 현재 상태 -->
      <div style="background:#fff;padding:20px;border-radius:8px;font-size:13px;color:var(--g700);margin-bottom:16px;border:1px solid var(--g200)">
        <h4 style="font-size:14px;font-weight:700;margin-bottom:12px">현재 데이터 상태</h4>
        <div style="margin-bottom:6px">마지막 업데이트: <strong id="mg-last-update" style="color:var(--navy-500)">${currentMsg}</strong></div>
        <div style="margin-bottom:6px">적용 중인 기간: <strong style="color:var(--g900)">${ML[0]} ~ ${ML[ML.length-1]} (총 ${ML.length}개월)</strong></div>
        <div>최신 매출: <strong style="color:var(--revenue)">${fmtM(revenue[revenue.length-1])}원</strong> | 최신 환자: <strong style="color:var(--patient)">${patients[patients.length-1]}명</strong> | 최신 조회수: <strong style="color:var(--views)">${fmtV(views[views.length-1])}회</strong></div>
      </div>

      <button onclick="clearData()" class="btn-dl" style="background:var(--g500);color:#fff">로컬 데이터 초기화 (원본 복구)</button>
    </div>
  `;

  // 폼 미리보기
  window._previewData = function() {
    const month = document.getElementById('mg-month').value;
    const pat = document.getElementById('mg-pat').value;
    const rev = document.getElementById('mg-rev').value;
    const view = document.getElementById('mg-view').value;
    const el = document.getElementById('mg-preview');

    if (!pat && !rev && !view) {
      el.style.display = 'none';
      return;
    }

    let html = '<strong>입력 확인:</strong><br>';
    html += `기간: <strong>20${month}</strong><br>`;
    if (pat) html += `신규 환자: <strong>${pat}명</strong><br>`;
    if (rev) html += `매출: <strong>${parseInt(rev).toLocaleString()}만원 (${(parseInt(rev)*10000).toLocaleString()}원)</strong><br>`;
    if (view) html += `유튜브 조회수: <strong>${parseInt(view).toLocaleString()}회</strong>`;

    el.innerHTML = html;
    el.style.display = 'block';
  };

  // 폼 데이터 적용
  window._applyFormData = function() {
    const month = document.getElementById('mg-month').value;
    const pat = document.getElementById('mg-pat').value;
    const rev = document.getElementById('mg-rev').value;
    const view = document.getElementById('mg-view').value;

    if (!pat && !rev && !view) {
      alert('최소 하나의 값을 입력해주세요.');
      return;
    }

    const newML = [...window.ML];
    const newMN = [...window.MN];
    const newPat = [...window.patients];
    const newRev = [...window.revenue];
    const newV = [...window.views];

    let idx = newML.indexOf(month);
    if (idx === -1) {
      newML.push(month);
      newMN.push('20' + month);
      newPat.push(0);
      newRev.push(0);
      newV.push(0);
      idx = newML.length - 1;
    }

    if (pat) newPat[idx] = parseInt(pat, 10);
    if (rev) newRev[idx] = parseInt(rev, 10) * 10000;
    if (view) newV[idx] = parseInt(view, 10);

    const confirmMsg = `20${month} 데이터를 적용합니다:\n` +
      (pat ? `- 신규 환자: ${pat}명\n` : '') +
      (rev ? `- 매출: ${parseInt(rev).toLocaleString()}만원\n` : '') +
      (view ? `- 조회수: ${parseInt(view).toLocaleString()}회\n` : '') +
      '\n대시보드에 적용하시겠습니까?';

    if (!confirm(confirmMsg)) return;

    const toSave = { ML: newML, MN: newMN, patients: newPat, revenue: newRev, views: newV };
    localStorage.setItem('dashboardData_v6', JSON.stringify(toSave));
    alert('데이터가 적용되었습니다. 페이지를 새로고침합니다.');
    location.reload();
  };

  // 기존 텍스트 방식 (유지)
  window.applyData = function() {
    const revText = document.getElementById('mg-rev-input').value.trim();
    const viewText = document.getElementById('mg-view-input').value.trim();

    if (!revText && !viewText) { alert('입력된 데이터가 없습니다.'); return; }

    try {
      const newML = [...window.ML];
      const newMN = [...window.MN];
      const newPat = [...window.patients];
      const newRev = [...window.revenue];
      const newV = [...window.views];
      let added = 0, logs = [];

      if(revText) {
        revText.split('\n').forEach(l => {
          const parts = l.split(',').map(s=>s.trim());
          if(parts.length >= 3) {
            const m = parts[0], p = parseInt(parts[1], 10), r = parseInt(parts[2], 10) * 10000;
            if (m && !isNaN(p) && !isNaN(r)) {
              let idx = newML.indexOf(m);
              if (idx > -1) { newPat[idx] = p; newRev[idx] = r; }
              else { newML.push(m); newMN.push('20' + m); newPat.push(p); newRev.push(r); newV.push(0); }
              added++;
              logs.push('[' + m + '] 환자:' + p + '명, 매출:' + r.toLocaleString() + '원');
            }
          }
        });
      }

      if(viewText) {
        viewText.split('\n').forEach(l => {
          const parts = l.split(',').map(s=>s.trim());
          if(parts.length >= 2) {
            const m = parts[0], v = parseInt(parts[1], 10);
            if (m && !isNaN(v)) {
              let idx = newML.indexOf(m);
              if (idx > -1) { newV[idx] = v; }
              else { newML.push(m); newMN.push('20' + m); newPat.push(0); newRev.push(0); newV.push(v); }
              added++;
              logs.push('[' + m + ' 조회수] ' + v.toLocaleString() + '회');
            }
          }
        });
      }

      if (added === 0) { alert('올바른 형식의 데이터를 찾을 수 없습니다.'); return; }

      if (!confirm('총 ' + added + '건 적용:\n' + logs.join('\n') + '\n\n진행하시겠습니까?')) return;

      localStorage.setItem('dashboardData_v6', JSON.stringify({ ML: newML, MN: newMN, patients: newPat, revenue: newRev, views: newV }));
      alert('적용 완료. 새로고침합니다.');
      location.reload();
    } catch(e) {
      alert('오류: 데이터 형식을 확인해주세요.');
      console.error(e);
    }
  };

  window.clearData = function() {
    if(confirm('모든 변경사항을 삭제하고 원본으로 복구하시겠습니까?')) {
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
