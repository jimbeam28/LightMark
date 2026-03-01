/**
 * TOC 高亮与平滑滚动
 */

class TocController {
  constructor() {
    this.tocContainer = document.querySelector('.toc-nav');
    this.tocSidebar = document.querySelector('.toc-sidebar');
    this.articleBody = document.querySelector('.article-body');
    this.tocLinks = [];
    this.headings = [];
    this.activeLink = null;
    this.observer = null;
    this.isManualScrolling = false;

    this.init();
  }

  init() {
    if (!this.tocContainer || !this.articleBody) return;

    this.tocLinks = Array.from(this.tocContainer.querySelectorAll('.toc-link'));
    this.headings = Array.from(this.articleBody.querySelectorAll('h2, h3, h4'));

    if (!this.headings.length || !this.tocLinks.length) {
      // 如果没有标题或链接，隐藏 TOC
      if (this.tocSidebar) {
        this.tocSidebar.style.display = 'none';
      }
      return;
    }

    // 确保 TOC 可见
    if (this.tocSidebar) {
      this.tocSidebar.style.display = '';
    }

    // 使用 IntersectionObserver 监听标题
    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      {
        rootMargin: '-100px 0px -70% 0px',
        threshold: 0
      }
    );

    this.headings.forEach(heading => this.observer.observe(heading));

    // 点击 TOC 平滑滚动
    this.tocLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();

        const targetId = link.getAttribute('href').slice(1);
        const target = document.getElementById(targetId);
        if (target) {
          this.isManualScrolling = true;

          const headerOffset = 100;
          const elementPosition = target.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });

          // 更新 URL hash 但不触发默认行为
          history.pushState(null, null, `#${targetId}`);

          // 手动激活链接
          this.activateLink(targetId);

          // 重置标志
          setTimeout(() => {
            this.isManualScrolling = false;
          }, 100);
        }
      });
    });

    // 延迟处理 hash，避免页面加载时的跳动
    if (window.location.hash) {
      setTimeout(() => this.handleHash(), 300);
    }
  }

  handleIntersection(entries) {
    if (this.isManualScrolling) return;

    // 找到当前在视口中的标题
    const visibleHeadings = entries
      .filter(entry => entry.isIntersecting)
      .map(entry => entry.target);

    if (visibleHeadings.length > 0) {
      // 取第一个可见的标题
      this.activateLink(visibleHeadings[0].id);
    }
  }

  activateLink(id) {
    if (this.activeLink) {
      this.activeLink.classList.remove('active');
    }

    const link = this.tocLinks.find(l => l.getAttribute('href') === `#${id}`);
    if (link) {
      link.classList.add('active');
      this.activeLink = link;

      // 只滚动 TOC 容器内的链接，不滚动整个页面
      const tocContainer = this.tocContainer;
      if (tocContainer && tocContainer.scrollHeight > tocContainer.clientHeight) {
        const linkTop = link.offsetTop;
        const containerHeight = tocContainer.clientHeight;
        const currentScroll = tocContainer.scrollTop;

        // 如果链接不在可视区域内，滚动 TOC 容器
        if (linkTop < currentScroll || linkTop > currentScroll + containerHeight - 30) {
          tocContainer.scrollTo({
            top: linkTop - containerHeight / 2,
            behavior: 'smooth'
          });
        }
      }
    }
  }

  handleHash() {
    const hash = window.location.hash.slice(1);
    if (hash) {
      const target = document.getElementById(hash);
      if (target) {
        this.isManualScrolling = true;

        const headerOffset = 100;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'auto' // 使用 auto 避免平滑滚动造成的延迟
        });

        this.activateLink(hash);

        setTimeout(() => {
          this.isManualScrolling = false;
        }, 100);
      }
    }
  }

  destroy() {
    if (this.observer) {
      this.observer.disconnect();
    }
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  // 延迟初始化，确保页面完全加载
  setTimeout(() => {
    new TocController();
  }, 100);
});
