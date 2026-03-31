// ===== 데이터 관리 페이지 (v7.1: CSV/엑셀 업로드 지원) =====
window.__pageRenderers.manage = function(container) {
  var saved = localStorage.getItem('dashboardData_v6');
  var currentMsg = saved ? formatDate(new Date()) : '없음 (원본 data.js 기본 데이터 사용 중)';

  // 월 선택 옵션 생성
  var lastML = ML[ML.length - 1];
  var parts = lastML.split('.');
  var lastY = parseInt(parts[0], 10), lastM = parseInt(parts[1], 10);
  var nextM = lastM >= 12 ? 1 : lastM + 1;
  var nextY = lastM >= 12 ? lastY + 1 : lastY;
  var nextML = String(nextY).padStart(2, '0') + '.' + String(nextM).padStart(2, '0');
  var allMonths = ML.slice();
  if (allMonths.indexOf(nextML) === -1) allMonths.push(nextML);

  container.innerHTML = '\
    <div class="card">\
      <h3>데이터 관리실</h3>\
      <p class="card-desc">파일을 업로드하거나 직접 입력하여 대시보드 데이터를 업데이트합니다.</p>\
\
      <!-- 파일 업로드 영역 -->\
      <div id="upload-zone" style="border:2px dashed var(--g300);border-radius:16px;padding:40px 24px;text-align:center;margin-bottom:24px;cursor:pointer;transition:all .2s;background:var(--g50)">\
        <div style="font-size:40px;margin-bottom:12px">📁</div>\
        <div style="font-size:16px;font-weight:700;color:var(--navy-900);margin-bottom:8px">파일을 여기에 드래그하거나 클릭하세요</div>\
        <div style="font-size:13px;color:var(--g500);line-height:1.8">\
          지원 형식:<br>\
          <strong>유튜브 스튜디오 CSV</strong> — 총계.csv (일별 조회수) / 표 데이터.csv (영상별 성과)<br>\
          <strong>병원 매출 엑셀</strong> — .xlsx (기간, 신환수, 매출)\
        </div>\
        <input type="file" id="file-input" accept=".csv,.xlsx,.xls" multiple style="display:none">\
      </div>\
\
      <!-- 파일 처리 결과 미리보기 -->\
      <div id="file-preview" style="display:none;margin-bottom:24px"></div>\
\
      <!-- 구분선 -->\
      <div style="height:1px;background:var(--g200);margin:32px 0"></div>\
\
      <!-- 수동 입력 폼 -->\
      <div style="background:var(--g50);padding:24px;border-radius:12px;border:1px solid var(--g200);margin-bottom:24px">\
        <h4 style="font-size:15px;font-weight:700;margin-bottom:16px;color:var(--navy-900)">수동 입력</h4>\
        <div class="form-row">\
          <div class="form-group">\
            <label class="form-label">월 선택</label>\
            <select id="mg-month" class="form-input">' +
              allMonths.map(function(m) { return '<option value="' + m + '"' + (m === nextML ? ' selected' : '') + '>20' + m + '</option>'; }).join('') +
            '</select>\
          </div>\
          <div class="form-group">\
            <label class="form-label">신규 환자 (명)</label>\
            <input id="mg-pat" type="number" class="form-input" placeholder="예: 8" min="0">\
          </div>\
          <div class="form-group">\
            <label class="form-label">매출 (만원)</label>\
            <input id="mg-rev" type="number" class="form-input" placeholder="예: 2957" min="0">\
          </div>\
          <div class="form-group">\
            <label class="form-label">유튜브 조회수</label>\
            <input id="mg-view" type="number" class="form-input" placeholder="예: 113581" min="0">\
          </div>\
        </div>\
        <div id="mg-preview" style="margin-top:16px;display:none;padding:14px;background:#fff;border-radius:8px;border:1px solid var(--g200);font-size:13px;color:var(--g700)"></div>\
        <div style="margin-top:16px;display:flex;gap:12px">\
          <button onclick="_previewData()" class="btn-dl" style="background:var(--navy-500)">미리보기</button>\
          <button onclick="_applyFormData()" class="btn-dl" style="background:var(--revenue);font-size:14px;padding:10px 24px;">대시보드에 적용</button>\
        </div>\
      </div>\
\
      <!-- 현재 상태 -->\
      <div style="background:#fff;padding:20px;border-radius:8px;font-size:13px;color:var(--g700);margin-bottom:16px;border:1px solid var(--g200)">\
        <h4 style="font-size:14px;font-weight:700;margin-bottom:12px">현재 데이터 상태</h4>\
        <div style="margin-bottom:6px">마지막 업데이트: <strong id="mg-last-update" style="color:var(--navy-500)">' + currentMsg + '</strong></div>\
        <div style="margin-bottom:6px">적용 중인 기간: <strong style="color:var(--g900)">' + ML[0] + ' ~ ' + ML[ML.length-1] + ' (총 ' + ML.length + '개월)</strong></div>\
        <div>최신 매출: <strong style="color:var(--revenue)">' + fmtM(revenue[revenue.length-1]) + '원</strong> | 최신 환자: <strong style="color:var(--patient)">' + patients[patients.length-1] + '명</strong> | 최신 조회수: <strong style="color:var(--views)">' + fmtV(views[views.length-1]) + '회</strong></div>\
      </div>\
      <button onclick="clearData()" class="btn-dl" style="background:var(--g500);color:#fff">로컬 데이터 초기화 (원본 복구)</button>\
    </div>';

  // ===== 파일 업로드 이벤트 =====
  var zone = document.getElementById('upload-zone');
  var fileInput = document.getElementById('file-input');

  zone.addEventListener('click', function() { fileInput.click(); });
  zone.addEventListener('dragover', function(e) {
    e.preventDefault();
    zone.style.borderColor = 'var(--navy-500)';
    zone.style.background = 'var(--navy-50)';
  });
  zone.addEventListener('dragleave', function() {
    zone.style.borderColor = 'var(--g300)';
    zone.style.background = 'var(--g50)';
  });
  zone.addEventListener('drop', function(e) {
    e.preventDefault();
    zone.style.borderColor = 'var(--g300)';
    zone.style.background = 'var(--g50)';
    _handleFiles(e.dataTransfer.files);
  });
  fileInput.addEventListener('change', function() {
    if (fileInput.files.length) _handleFiles(fileInput.files);
  });

  // ===== 파일 처리 =====
  window._handleFiles = function(files) {
    var results = [];
    var processed = 0;

    for (var i = 0; i < files.length; i++) {
      (function(file) {
        var reader = new FileReader();
        var isExcel = /\.xlsx?$/i.test(file.name);

        reader.onload = function(e) {
          try {
            if (isExcel) {
              var result = _parseExcel(e.target.result, file.name);
              results.push(result);
            } else {
              var text = e.target.result;
              var result = _parseCSV(text, file.name);
              results.push(result);
            }
          } catch(err) {
            results.push({ type: 'error', name: file.name, message: err.message });
          }

          processed++;
          if (processed === files.length) {
            _showFilePreview(results);
          }
        };

        if (isExcel) reader.readAsArrayBuffer(file);
        else reader.readAsText(file);
      })(files[i]);
    }
  };

  // ===== CSV 파싱 =====
  window._parseCSV = function(text, fileName) {
    var lines = text.trim().split('\n');
    var header = lines[0];

    // 총계.csv: "날짜,조회수"
    if (header.indexOf('날짜') >= 0 && header.indexOf('조회수') >= 0 && header.indexOf('콘텐츠') < 0) {
      return _parseDailyViewsCSV(lines, fileName);
    }

    // 표 데이터.csv: "콘텐츠,동영상 제목,..."
    if (header.indexOf('콘텐츠') >= 0 && header.indexOf('동영상 제목') >= 0 && header.indexOf('날짜') < 0) {
      return _parseVideoTableCSV(lines, fileName);
    }

    // 차트 데이터.csv: "날짜,콘텐츠,동영상 제목,..."
    if (header.indexOf('날짜') >= 0 && header.indexOf('콘텐츠') >= 0) {
      return { type: 'info', name: fileName, message: '차트 데이터.csv는 참고용입니다. 총계.csv와 표 데이터.csv를 업로드하세요.' };
    }

    return { type: 'error', name: fileName, message: '인식할 수 없는 CSV 형식입니다. 유튜브 스튜디오에서 내보낸 파일인지 확인해주세요.' };
  };

  // 총계.csv → 일별 조회수 → 월별 합산
  window._parseDailyViewsCSV = function(lines, fileName) {
    var monthlyMap = {};
    var dailyData = [];
    var count = 0;

    for (var i = 1; i < lines.length; i++) {
      var cols = lines[i].split(',');
      if (cols.length < 2) continue;
      var date = cols[0].trim();
      var v = parseInt(cols[1].trim(), 10);
      if (!date || isNaN(v)) continue;

      // 날짜: "2025-01-01" → "25.01"
      var dp = date.split('-');
      if (dp.length < 3) continue;
      var ym = dp[0].substring(2) + '.' + dp[1];

      if (!monthlyMap[ym]) monthlyMap[ym] = 0;
      monthlyMap[ym] += v;
      dailyData.push(v);
      count++;
    }

    var months = Object.keys(monthlyMap).sort();
    return {
      type: 'daily_views',
      name: fileName,
      message: count + '일 데이터 → ' + months.length + '개월 합산 완료',
      monthlyViews: monthlyMap,
      months: months,
      dailyData: dailyData,
      count: count
    };
  };

  // 표 데이터.csv → 영상별 성과
  window._parseVideoTableCSV = function(lines, fileName) {
    var videos = [];
    // 첫 줄: 헤더, 둘째 줄: 합계 (건너뜀)
    for (var i = 2; i < lines.length; i++) {
      // CSV with quoted fields
      var cols = _parseCSVLine(lines[i]);
      if (cols.length < 6) continue;

      var title = cols[1].trim();
      var publishDate = cols[2].trim();
      var duration = parseInt(cols[3], 10) || 0;
      var viewCount = parseInt(cols[4], 10) || 0;
      var watchHours = parseFloat(cols[5]) || 0;

      if (!title || title === '합계') continue;

      videos.push({
        title: title,
        views: viewCount,
        hours: watchHours,
        duration: duration,
        publishDate: publishDate
      });
    }

    return {
      type: 'video_table',
      name: fileName,
      message: videos.length + '개 영상 데이터 파싱 완료',
      videos: videos,
      count: videos.length
    };
  };

  // CSV 줄 파싱 (쉼표 안 따옴표 처리)
  window._parseCSVLine = function(line) {
    var result = [];
    var current = '';
    var inQuotes = false;
    for (var i = 0; i < line.length; i++) {
      var c = line[i];
      if (c === '"') { inQuotes = !inQuotes; }
      else if (c === ',' && !inQuotes) { result.push(current); current = ''; }
      else { current += c; }
    }
    result.push(current);
    return result;
  };

  // ===== 엑셀 파싱 =====
  window._parseExcel = function(data, fileName) {
    var wb = XLSX.read(data, { type: 'array' });
    var ws = wb.Sheets[wb.SheetNames[0]];
    var rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

    if (rows.length < 2) return { type: 'error', name: fileName, message: '데이터가 비어있습니다.' };

    // 헤더 확인: "기간, 신환수, 매출"
    var header = rows[0];
    var hasRevenue = false;
    for (var h = 0; h < header.length; h++) {
      if (header[h] && String(header[h]).indexOf('매출') >= 0) hasRevenue = true;
    }

    if (!hasRevenue) return { type: 'error', name: fileName, message: '매출 컬럼을 찾을 수 없습니다. (기간, 신환수, 매출) 형식이어야 합니다.' };

    var entries = [];
    for (var r = 1; r < rows.length; r++) {
      var row = rows[r];
      if (!row[0]) continue;

      // "2025년 1월" → "25.01"
      var period = String(row[0]);
      var match = period.match(/(\d{4})년?\s*(\d{1,2})월?/);
      if (!match) continue;

      var ym = match[1].substring(2) + '.' + String(parseInt(match[2], 10)).padStart(2, '0');
      var pat = parseInt(row[1], 10) || 0;
      var rev = parseInt(row[2], 10) || 0;

      entries.push({ month: ym, patients: pat, revenue: rev });
    }

    return {
      type: 'excel_revenue',
      name: fileName,
      message: entries.length + '개월 매출/신환 데이터 파싱 완료',
      entries: entries,
      count: entries.length
    };
  };

  // ===== 미리보기 표시 =====
  window._showFilePreview = function(results) {
    var el = document.getElementById('file-preview');
    var html = '';

    for (var r = 0; r < results.length; r++) {
      var res = results[r];
      var icon = res.type === 'error' ? '❌' : res.type === 'info' ? 'ℹ️' : '✅';
      var color = res.type === 'error' ? 'var(--danger)' : res.type === 'info' ? 'var(--warning)' : 'var(--success)';

      html += '<div style="background:#fff;border:1px solid var(--g200);border-radius:12px;padding:20px;margin-bottom:12px;border-left:4px solid ' + color + '">';
      html += '<div style="font-size:14px;font-weight:700;margin-bottom:8px">' + icon + ' ' + res.name + '</div>';
      html += '<div style="font-size:13px;color:var(--g700);margin-bottom:12px">' + res.message + '</div>';

      // 상세 미리보기
      if (res.type === 'daily_views') {
        html += '<div style="font-size:12px;color:var(--g500);margin-bottom:8px">월별 조회수 합산 결과:</div>';
        html += '<table class="data-table" style="font-size:12px"><thead><tr><th>월</th><th class="r">조회수</th></tr></thead><tbody>';
        for (var m = 0; m < res.months.length; m++) {
          html += '<tr><td>20' + res.months[m] + '</td><td class="r" style="font-weight:700;color:var(--views)">' + res.monthlyViews[res.months[m]].toLocaleString() + '</td></tr>';
        }
        html += '</tbody></table>';
        html += '<button onclick="_applyDailyViews()" class="btn-dl" style="background:var(--revenue);margin-top:12px">조회수 데이터 적용</button>';

        // 글로벌에 저장
        window._pendingDailyViews = res;
      }

      if (res.type === 'video_table') {
        html += '<div style="font-size:12px;color:var(--g500);margin-bottom:8px">상위 5개 영상:</div>';
        html += '<table class="data-table" style="font-size:12px"><thead><tr><th>영상</th><th class="r">조회수</th><th class="r">시청시간</th></tr></thead><tbody>';
        var top5 = res.videos.slice(0, 5);
        for (var v = 0; v < top5.length; v++) {
          html += '<tr><td style="max-width:250px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">' + top5[v].title + '</td><td class="r" style="font-weight:700">' + top5[v].views.toLocaleString() + '</td><td class="r">' + Math.round(top5[v].hours) + 'h</td></tr>';
        }
        html += '</tbody></table>';
        html += '<div style="font-size:11px;color:var(--g500);margin-top:8px">영상 데이터는 현재 대시보드 코드에 직접 반영이 필요합니다 (참고용으로 표시)</div>';
      }

      if (res.type === 'excel_revenue') {
        html += '<div style="font-size:12px;color:var(--g500);margin-bottom:8px">매출/신환 데이터:</div>';
        html += '<table class="data-table" style="font-size:12px"><thead><tr><th>월</th><th class="r">신환</th><th class="r">매출</th></tr></thead><tbody>';
        for (var e = 0; e < res.entries.length; e++) {
          var ent = res.entries[e];
          html += '<tr><td>20' + ent.month + '</td><td class="r" style="font-weight:700">' + ent.patients + '명</td><td class="r" style="font-weight:700;color:var(--revenue)">' + fmtM(ent.revenue) + '원</td></tr>';
        }
        html += '</tbody></table>';
        html += '<button onclick="_applyExcelRevenue()" class="btn-dl" style="background:var(--revenue);margin-top:12px">매출/신환 데이터 적용</button>';

        window._pendingExcelRevenue = res;
      }

      html += '</div>';
    }

    el.innerHTML = html;
    el.style.display = 'block';
  };

  // ===== 총계.csv 적용 (조회수) =====
  window._applyDailyViews = function() {
    var res = window._pendingDailyViews;
    if (!res) { alert('적용할 데이터가 없습니다.'); return; }

    var newML = window.ML.slice();
    var newMN = window.MN.slice();
    var newPat = window.patients.slice();
    var newRev = window.revenue.slice();
    var newV = window.views.slice();
    var added = 0;

    var months = res.months;
    for (var m = 0; m < months.length; m++) {
      var ym = months[m];
      var viewCount = res.monthlyViews[ym];
      var idx = newML.indexOf(ym);
      if (idx > -1) {
        newV[idx] = viewCount;
      } else {
        newML.push(ym);
        newMN.push('20' + ym);
        newPat.push(0);
        newRev.push(0);
        newV.push(viewCount);
      }
      added++;
    }

    if (!confirm(added + '개월 조회수 데이터를 적용합니다.\n\n' +
      months.map(function(ym) { return '20' + ym + ': ' + res.monthlyViews[ym].toLocaleString() + '회'; }).join('\n') +
      '\n\n진행하시겠습니까?')) return;

    localStorage.setItem('dashboardData_v6', JSON.stringify({
      ML: newML, MN: newMN, patients: newPat, revenue: newRev, views: newV
    }));
    alert('조회수 데이터가 적용되었습니다. 새로고침합니다.');
    location.reload();
  };

  // ===== 엑셀 매출 적용 =====
  window._applyExcelRevenue = function() {
    var res = window._pendingExcelRevenue;
    if (!res) { alert('적용할 데이터가 없습니다.'); return; }

    var newML = window.ML.slice();
    var newMN = window.MN.slice();
    var newPat = window.patients.slice();
    var newRev = window.revenue.slice();
    var newV = window.views.slice();
    var added = 0;

    for (var e = 0; e < res.entries.length; e++) {
      var ent = res.entries[e];
      var idx = newML.indexOf(ent.month);
      if (idx > -1) {
        newPat[idx] = ent.patients;
        newRev[idx] = ent.revenue;
      } else {
        newML.push(ent.month);
        newMN.push('20' + ent.month);
        newPat.push(ent.patients);
        newRev.push(ent.revenue);
        newV.push(0);
      }
      added++;
    }

    if (!confirm(added + '개월 매출/신환 데이터를 적용합니다.\n\n' +
      res.entries.map(function(e) { return '20' + e.month + ': ' + e.patients + '명 / ' + fmtM(e.revenue) + '원'; }).join('\n') +
      '\n\n진행하시겠습니까?')) return;

    localStorage.setItem('dashboardData_v6', JSON.stringify({
      ML: newML, MN: newMN, patients: newPat, revenue: newRev, views: newV
    }));
    alert('매출/신환 데이터가 적용되었습니다. 새로고침합니다.');
    location.reload();
  };

  // ===== 수동 입력 미리보기 =====
  window._previewData = function() {
    var month = document.getElementById('mg-month').value;
    var pat = document.getElementById('mg-pat').value;
    var rev = document.getElementById('mg-rev').value;
    var view = document.getElementById('mg-view').value;
    var el = document.getElementById('mg-preview');

    if (!pat && !rev && !view) { el.style.display = 'none'; return; }

    var html = '<strong>입력 확인:</strong><br>';
    html += '기간: <strong>20' + month + '</strong><br>';
    if (pat) html += '신규 환자: <strong>' + pat + '명</strong><br>';
    if (rev) html += '매출: <strong>' + parseInt(rev).toLocaleString() + '만원</strong><br>';
    if (view) html += '유튜브 조회수: <strong>' + parseInt(view).toLocaleString() + '회</strong>';
    el.innerHTML = html;
    el.style.display = 'block';
  };

  // ===== 수동 입력 적용 =====
  window._applyFormData = function() {
    var month = document.getElementById('mg-month').value;
    var pat = document.getElementById('mg-pat').value;
    var rev = document.getElementById('mg-rev').value;
    var view = document.getElementById('mg-view').value;

    if (!pat && !rev && !view) { alert('최소 하나의 값을 입력해주세요.'); return; }

    var newML = window.ML.slice();
    var newMN = window.MN.slice();
    var newPat = window.patients.slice();
    var newRev = window.revenue.slice();
    var newV = window.views.slice();

    var idx = newML.indexOf(month);
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

    var confirmMsg = '20' + month + ' 데이터를 적용합니다:\n' +
      (pat ? '- 신규 환자: ' + pat + '명\n' : '') +
      (rev ? '- 매출: ' + parseInt(rev).toLocaleString() + '만원\n' : '') +
      (view ? '- 조회수: ' + parseInt(view).toLocaleString() + '회\n' : '') +
      '\n대시보드에 적용하시겠습니까?';

    if (!confirm(confirmMsg)) return;

    localStorage.setItem('dashboardData_v6', JSON.stringify({
      ML: newML, MN: newMN, patients: newPat, revenue: newRev, views: newV
    }));
    alert('데이터가 적용되었습니다.');
    location.reload();
  };

  // ===== 초기화 =====
  window.clearData = function() {
    if (confirm('모든 변경사항을 삭제하고 원본으로 복구하시겠습니까?')) {
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
