/**
 * 右侧 TOC 高亮控制器
 */
class TocHighlighter {
  constructor() {
    this.tocNav = document.getElementById('tocNav');
    this.tocContainer = document.getElementById('tocContainer');
    this.rightSidebar = document.getElementById('rightSidebar');
    this.tocCloseBtn = document.getElementById('tocCloseBtn');
    this.tocShowBtn = document.getElementById('tocShowBtn');
    this.headings = [];
    this.activeLink = null;
    this.observer = null;
    this.isCollapsed = false;

    this.init();
  }

  init() {
    if (!this.tocNav) return;

    this.collectHeadings();
    this.bindEvents();
    this.setupIntersectionObserver();
  }

  collectHeadings() {
    // 收集文章中的所有标题
    const article = document.querySelector('.article-content');
    if (!article) return;

    this.headings = Array.from(article.querySelectorAll('h1[id], h2[id], h3[id], h4[id], h5[id], h6[id]'));
  }

  bindEvents() {
    // 点击 TOC 链接平滑滚动
    this.tocNav.addEventListener('click', (e) => {
      const link = e.target.closest('.toc-link');
      if (link) {
        e.preventDefault();
        const targetId = link.getAttribute('href').slice(1);
        this.scrollToHeading(targetId);
      }
    });

    // 滚动时更新高亮
    window.addEventListener('scroll', () => {
      this.updateActiveOnScroll();
    }, { passive: true });

    // 右侧导航栏展开/收起
    this.tocCloseBtn?.addEventListener('click', () => {
      this.collapseToc();
    });

    this.tocShowBtn?.addEventListener('click', () => {
      this.expandToc();
    });
  }

  collapseToc() {
    this.isCollapsed = true;
    if (this.rightSidebar) {
      this.rightSidebar.classList.add('collapsed');
    }
  }

  expandToc() {
    this.isCollapsed = false;
    if (this.rightSidebar) {
      this.rightSidebar.classList.remove('collapsed');
    }
  }

  setupIntersectionObserver() {
    if (!this.headings.length) return;

    // 使用 IntersectionObserver 监听标题进入视口
    const options = {
      root: null,
      rootMargin: '-10% 0px -70% 0px',
      threshold: 0
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.highlightTocItem(entry.target.id);
        }
      });
    }, options);

    this.headings.forEach(heading => {
      this.observer.observe(heading);
    });
  }

  scrollToHeading(id) {
    const heading = document.getElementById(id);
    if (!heading) return;

    // 计算偏移量（考虑可能的固定头部）
    const offset = 80;
    const elementPosition = heading.getBoundingClientRect().top;
    const offsetPosition = elementPosition + window.pageYOffset - offset;

    window.scrollTo({
      top: offsetPosition,
      behavior: 'smooth'
    });

    // 更新 URL 锚点
    history.pushState(null, null, `#${id}`);

    // 高亮当前项
    this.highlightTocItem(id);
  }

  highlightTocItem(id) {
    if (!this.tocNav) return;

    // 移除之前的高亮
    if (this.activeLink) {
      this.activeLink.classList.remove('active');
    }

    // 添加新的高亮
    const link = this.tocNav.querySelector(`a[href="#${id}"]`);
    if (link) {
      link.classList.add('active');
      this.activeLink = link;

      // 滚动 TOC 使高亮项可见
      this.scrollTocToVisible(link);
    }
  }

  scrollTocToVisible(link) {
    if (!this.tocContainer) return;

    const containerRect = this.tocContainer.getBoundingClientRect();
    const linkRect = link.getBoundingClientRect();

    // 检查链接是否在可视区域内
    if (linkRect.top < containerRect.top + 50) {
      // 链接在可视区域上方
      this.tocContainer.scrollTop -= (containerRect.top + 50 - linkRect.top);
    } else if (linkRect.bottom > containerRect.bottom - 20) {
      // 链接在可视区域下方
      this.tocContainer.scrollTop += (linkRect.bottom - containerRect.bottom + 20);
    }
  }

  updateActiveOnScroll() {
    // 备用方案：如果没有 IntersectionObserver，使用滚动位置计算
    if (this.observer || !this.headings.length) return;

    const scrollPosition = window.pageYOffset + 100;

    // 找到当前滚动位置对应的标题
    let currentHeading = null;
    for (const heading of this.headings) {
      if (heading.offsetTop <= scrollPosition) {
        currentHeading = heading;
      } else {
        break;
      }
    }

    if (currentHeading) {
      this.highlightTocItem(currentHeading.id);
    }
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  new TocHighlighter();
});
