// ===== 차트 유틸리티 — Chart.js 공통 설정 및 헬퍼 =====

// 이미 생성된 차트를 저장 (재생성 방지)
const _charts = {};

/**
 * 차트 생성 헬퍼 — 같은 ID로 두 번 생성하지 않음
 */
function createChart(canvasId, config) {
  if (_charts[canvasId]) return _charts[canvasId];
  const el = document.getElementById(canvasId);
  if (!el) return null;
  _charts[canvasId] = new Chart(el, config);
  return _charts[canvasId];
}

// 공통 차트 옵션
const CHART_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: { font: { size: 12, weight: '600', family: "'Pretendard Variable',sans-serif" }, usePointStyle: true, padding: 16 }
    },
    tooltip: {
      backgroundColor: '#172554',
      titleFont: { size: 12, weight: '700' },
      bodyFont: { size: 13 },
      padding: 14,
      cornerRadius: 10
    }
  }
};

// 듀얼 축 차트 공통 스케일
function dualScales(leftLabel, leftColor, leftFmt, rightLabel, rightColor, rightFmt) {
  return {
    x: { grid: { display: false } },
    y: {
      position: 'left',
      title: { display: true, text: leftLabel, color: leftColor, font: { size: 11, weight: '700' } },
      ticks: { color: leftColor, callback: leftFmt },
      grid: { color: '#f1f5f9' }
    },
    y1: {
      position: 'right',
      title: { display: true, text: rightLabel, color: rightColor, font: { size: 11, weight: '700' } },
      ticks: { color: rightColor, callback: rightFmt },
      grid: { drawOnChartArea: false }
    }
  };
}
