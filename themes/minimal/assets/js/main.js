/**
 * LightMark Default Theme - Main Entry
 * 功能：主题切换、移动端菜单
 */

class ThemeManager {
  constructor() {
    this.toggleBtn = document.querySelector('.theme-toggle');
    this.currentTheme = localStorage.getItem('theme');

    this.init();
  }

  init() {
    // 应用保存的主题或系统偏好
    if (this.currentTheme) {
      document.documentElement.setAttribute('data-theme', this.currentTheme);
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    // 绑定切换事件
    this.toggleBtn?.addEventListener('click', () => this.toggle());

    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!localStorage.getItem('theme')) {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    });
  }

  toggle() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  }
}

class MobileMenu {
  constructor() {
    this.toggleBtn = document.querySelector('.mobile-menu-toggle');
    this.sidebar = document.querySelector('.sidebar');
    this.overlay = document.querySelector('.mobile-overlay');

    this.init();
  }

  init() {
    if (!this.toggleBtn || !this.sidebar) return;

    this.toggleBtn.addEventListener('click', () => this.toggle());
    this.overlay?.addEventListener('click', () => this.close());

    // 点击导航链接后自动关闭
    this.sidebar.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => this.close());
    });
  }

  toggle() {
    const isOpen = this.sidebar.classList.toggle('open');
    this.overlay.hidden = !isOpen;
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  close() {
    this.sidebar.classList.remove('open');
    this.overlay.hidden = true;
    document.body.style.overflow = '';
  }
}

class BackToTop {
  constructor() {
    this.btn = document.querySelector('.back-to-top');
    this.threshold = 300; // 滚动超过300px显示按钮

    this.init();
  }

  init() {
    if (!this.btn) return;

    // 点击事件
    this.btn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    // 滚动事件
    window.addEventListener('scroll', () => this.handleScroll(), { passive: true });

    // 初始检查
    this.handleScroll();
  }

  handleScroll() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    if (scrollTop > this.threshold) {
      this.btn.hidden = false;
    } else {
      this.btn.hidden = true;
    }
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  new ThemeManager();
  new MobileMenu();
  new BackToTop();
});
