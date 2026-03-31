// ===== 라우터 — 사이드바 메뉴 클릭 시 페이지 전환 =====

// 페이지 제목 매핑
const PAGE_TITLES = {
  home: '전체 요약', revenue: '매출 분석', patient: '신규 환자',
  youtube: '유튜브 성과', instagram: '인스타그램', content: '콘텐츠 분석', strategy: '전략 제안',
  data: '상세 데이터', manage: '데이터 관리실'
};

// 페이지 렌더 함수 매핑 — 각 pages/*.js 에서 등록
// 형식: { home: renderHomePage, revenue: renderRevenuePage, ... }
const PAGE_RENDERERS = window.__pageRenderers || {};

// 현재 활성 페이지
let currentPage = 'home';

/**
 * 페이지 전환 — 콘텐츠 영역을 교체하고 차트를 초기화
 */
function navigateTo(pageId) {
  if (!PAGE_TITLES[pageId]) return;
  currentPage = pageId;

  // 사이드바 활성 상태 변경
  document.querySelectorAll('.nav-item').forEach(el => {
    el.classList.toggle('active', el.dataset.page === pageId);
  });

  // 페이지 제목 변경
  document.getElementById('pageTitle').textContent = PAGE_TITLES[pageId];

  // 콘텐츠 영역 교체
  const container = document.getElementById('pageContainer');
  container.style.animation = 'none';
  // reflow 트리거 후 애니메이션 재시작
  void container.offsetHeight;
  container.style.animation = 'fadeIn .35s ease';

  // 기존 차트 인스턴스 모두 파괴 (canvas DOM이 교체되므로 캐시 초기화 필수)
  Object.keys(_charts).forEach(key => {
    if (_charts[key]) {
      _charts[key].destroy();
      delete _charts[key];
    }
  });

  // 페이지 렌더링
  const renderer = PAGE_RENDERERS[pageId];
  if (renderer) {
    container.innerHTML = '';
    renderer(container);
  } else {
    container.innerHTML = `<div style="padding:60px;text-align:center;color:#6b7280">
      "${PAGE_TITLES[pageId]}" 페이지 준비 중...</div>`;
  }

  // 모바일 사이드바 닫기
  document.getElementById('sidebar').classList.remove('open');
  document.getElementById('sidebarOverlay').classList.remove('show');

  // 스크롤 상단으로
  window.scrollTo(0, 0);
}

// ===== 이벤트 바인딩 =====
document.addEventListener('DOMContentLoaded', () => {
  // 사이드바 메뉴 클릭
  document.querySelectorAll('.nav-item').forEach(el => {
    el.addEventListener('click', () => navigateTo(el.dataset.page));
  });

  // 모바일 햄버거 메뉴
  document.getElementById('hamburgerBtn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebarOverlay').classList.toggle('show');
  });
  document.getElementById('sidebarOverlay').addEventListener('click', () => {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebarOverlay').classList.remove('show');
  });

  // 기간 필터 버튼
  document.querySelectorAll('.period-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.period-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const months = parseInt(btn.dataset.months, 10);
      _applyPeriodFilter(months);
    });
  });

  // 초기 홈 페이지 렌더링
  navigateTo('home');
});

// 기간 필터 적용
var _originalData = null;
function _applyPeriodFilter(months) {
  // 원본 저장 (최초 1회)
  if (!_originalData) {
    _originalData = {
      ML: [...ML], MN: [...MN],
      revenue: [...revenue], patients: [...patients], views: [...views]
    };
  }

  if (months === 0) {
    // 전체 복원
    ML.length = 0; ML.push(..._originalData.ML);
    MN.length = 0; MN.push(..._originalData.MN);
    revenue.length = 0; revenue.push(..._originalData.revenue);
    patients.length = 0; patients.push(..._originalData.patients);
    views.length = 0; views.push(..._originalData.views);
  } else {
    const start = Math.max(0, _originalData.ML.length - months);
    ML.length = 0; ML.push(..._originalData.ML.slice(start));
    MN.length = 0; MN.push(..._originalData.MN.slice(start));
    revenue.length = 0; revenue.push(..._originalData.revenue.slice(start));
    patients.length = 0; patients.push(..._originalData.patients.slice(start));
    views.length = 0; views.push(..._originalData.views.slice(start));
  }

  // 현재 페이지 새로고침
  navigateTo(currentPage);
}
