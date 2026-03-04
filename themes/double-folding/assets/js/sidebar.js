/**
 * 左侧系列导航控制器
 */
class SeriesNav {
  constructor() {
    this.sidebar = document.getElementById('leftSidebar');
    this.nav = document.getElementById('seriesNav');
    this.collapseBtn = document.getElementById('collapseBtn');
    this.closeBtn = document.getElementById('closeBtn');
    this.sidebarToggle = document.getElementById('sidebarToggle');
    this.mobileMenuBtn = document.getElementById('mobileMenuBtn');
    this.overlay = document.getElementById('overlay');

    // 状态：侧边栏是否关闭（完全隐藏）
    this.isClosed = this.loadClosedState();
    // 状态：文章列表是否全部收起
    this.isArticlesCollapsed = false;

    this.init();
  }

  init() {
    this.bindEvents();
    this.applyClosedState();
    this.highlightCurrentArticle();
  }

  bindEvents() {
    // "−" 按钮：收起所有文章列表
    this.collapseBtn?.addEventListener('click', () => {
      this.collapseAllArticles();
    });

    // "<" 按钮：关闭侧边栏
    this.closeBtn?.addEventListener('click', () => {
      this.closeSidebar();
    });

    // ">" 按钮：展开侧边栏
    this.sidebarToggle?.addEventListener('click', () => {
      this.openSidebar();
    });

    // 系列展开/收起
    this.nav?.addEventListener('click', (e) => {
      const header = e.target.closest('.series-header');
      if (header) {
        const seriesName = header.dataset.series;
        this.toggleSeries(seriesName);
      }
    });

    // 点击文章链接前保存滚动位置
    this.nav?.addEventListener('click', (e) => {
      const articleLink = e.target.closest('.article-link');
      if (articleLink) {
        this.saveScrollPosition();
      }
    });

    // 移动端菜单
    this.mobileMenuBtn?.addEventListener('click', () => {
      this.openMobileMenu();
    });

    // 遮罩层点击
    this.overlay?.addEventListener('click', () => {
      this.closeMobileMenu();
    });

    // 窗口大小变化时重置
    window.addEventListener('resize', () => {
      if (window.innerWidth > 1023) {
        this.closeMobileMenu();
      }
    });
  }

  // 收起所有文章列表（点击 "−" 按钮）
  collapseAllArticles() {
    this.isArticlesCollapsed = true;

    // 收起所有系列的文章列表
    this.nav.querySelectorAll('.series-item').forEach(item => {
      item.classList.remove('expanded');
      const toggle = item.querySelector('.series-toggle');
      if (toggle) toggle.textContent = '▶';
      const articles = item.querySelector('.series-articles');
      if (articles) articles.style.display = 'none';
    });
  }

  // 展开所有文章列表（恢复默认）
  expandAllArticles() {
    this.isArticlesCollapsed = false;

    // 展开所有系列的文章列表
    this.nav.querySelectorAll('.series-item').forEach(item => {
      item.classList.add('expanded');
      const toggle = item.querySelector('.series-toggle');
      if (toggle) toggle.textContent = '▼';
      const articles = item.querySelector('.series-articles');
      if (articles) articles.style.display = 'block';
    });

    // 更新按钮图标为 "−"
    if (this.collapseBtn) {
      this.collapseBtn.querySelector('.action-icon').textContent = '−';
      this.collapseBtn.title = '收起文章列表';
    }
  }

  // 关闭侧边栏（点击 "<" 按钮）
  closeSidebar() {
    this.isClosed = true;
    this.applyClosedState();
    this.saveClosedState();
    // 显示展开按钮
    if (this.sidebarToggle) {
      this.sidebarToggle.style.display = 'flex';
    }
  }

  // 展开侧边栏（点击 ">" 按钮）
  openSidebar() {
    this.isClosed = false;
    this.applyClosedState();
    this.saveClosedState();
    // 隐藏展开按钮
    if (this.sidebarToggle) {
      this.sidebarToggle.style.display = 'none';
    }
  }

  applyClosedState() {
    if (this.isClosed) {
      this.sidebar.classList.add('closed');
      if (this.sidebarToggle) {
        this.sidebarToggle.style.display = 'flex';
      }
    } else {
      this.sidebar.classList.remove('closed');
      if (this.sidebarToggle) {
        this.sidebarToggle.style.display = 'none';
      }
    }
  }

  toggleSeries(seriesName) {
    const seriesItem = this.nav.querySelector(`[data-series="${seriesName}"]`);
    if (!seriesItem) return;

    const isExpanded = seriesItem.classList.contains('expanded');

    // 如果是移动端，先关闭菜单
    if (window.innerWidth <= 1023) {
      this.closeMobileMenu();
    }

    // 如果点击的是已展开的系列，收起它
    if (isExpanded) {
      seriesItem.classList.remove('expanded');
      const toggle = seriesItem.querySelector('.series-toggle');
      if (toggle) toggle.textContent = '▶';
      const articles = seriesItem.querySelector('.series-articles');
      if (articles) articles.style.display = 'none';
      return;
    }

    // 收起所有系列
    this.nav.querySelectorAll('.series-item').forEach(item => {
      item.classList.remove('expanded');
      const toggle = item.querySelector('.series-toggle');
      if (toggle) toggle.textContent = '▶';
      const articles = item.querySelector('.series-articles');
      if (articles) articles.style.display = 'none';
    });

    // 展开点击的系列
    seriesItem.classList.add('expanded');
    const toggle = seriesItem.querySelector('.series-toggle');
    if (toggle) toggle.textContent = '▼';
    const articles = seriesItem.querySelector('.series-articles');
    if (articles) articles.style.display = 'block';

    // 如果处于全部收起状态，恢复
    if (this.isArticlesCollapsed) {
      this.isArticlesCollapsed = false;
    }
  }

  openMobileMenu() {
    this.sidebar.classList.add('open');
    this.overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  closeMobileMenu() {
    this.sidebar.classList.remove('open');
    this.overlay.classList.remove('active');
    document.body.style.overflow = '';
  }

  // 保存滚动位置
  saveScrollPosition() {
    try {
      sessionStorage.setItem('doubleFolding_sidebarScroll', this.nav.scrollTop);
    } catch (e) {
      // 忽略存储错误
    }
  }

  // 恢复滚动位置
  restoreScrollPosition() {
    try {
      const savedScroll = sessionStorage.getItem('doubleFolding_sidebarScroll');
      if (savedScroll !== null) {
        this.nav.scrollTop = parseInt(savedScroll, 10);
        sessionStorage.removeItem('doubleFolding_sidebarScroll');
        return true;
      }
    } catch (e) {
      // 忽略存储错误
    }
    return false;
  }

  highlightCurrentArticle() {
    // 获取当前页面信息
    const path = window.location.pathname;
    const match = path.match(/series\/([^/]+)\/([^/]+)\.html/);

    if (match) {
      const [, seriesName, articleSlug] = match;

      // 展开当前系列
      const seriesItem = this.nav.querySelector(`[data-series="${seriesName}"]`);
      if (seriesItem) {
        seriesItem.classList.add('expanded');
        const toggle = seriesItem.querySelector('.series-toggle');
        if (toggle) toggle.textContent = '▼';
        const articles = seriesItem.querySelector('.series-articles');
        if (articles) articles.style.display = 'block';

        // 高亮当前文章
        const articleLink = seriesItem.querySelector(`[data-article="${articleSlug}"]`);
        if (articleLink) {
          articleLink.classList.add('active');
          // 先尝试恢复滚动位置，如果没有保存的位置再滚动到当前文章
          setTimeout(() => {
            if (!this.restoreScrollPosition()) {
              articleLink.scrollIntoView({ behavior: 'instant', block: 'nearest' });
            }
          }, 0);
        } else {
          // 没有文章链接时也尝试恢复滚动位置
          setTimeout(() => this.restoreScrollPosition(), 0);
        }
      }
    }
  }

  loadClosedState() {
    // 默认不关闭侧边栏
    return false;
  }

  saveClosedState() {
    try {
      localStorage.setItem('doubleFolding_sidebarClosed', this.isClosed);
    } catch (e) {
      // 忽略存储错误
    }
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  new SeriesNav();
});
