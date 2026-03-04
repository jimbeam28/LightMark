/**
 * 主脚本 - 包含回到顶部和主题切换功能
 */

/**
 * 回到顶部按钮
 */
class BackToTop {
  constructor() {
    this.button = document.getElementById('backToTop');
    this.showThreshold = 300;

    this.init();
  }

  init() {
    if (!this.button) return;

    // 监听滚动
    window.addEventListener('scroll', () => {
      this.toggleVisibility();
    }, { passive: true });

    // 点击事件
    this.button.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });

    // 初始检查
    this.toggleVisibility();
  }

  toggleVisibility() {
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const shouldShow = scrollTop > this.showThreshold;

    if (shouldShow) {
      this.button.classList.add('visible');
    } else {
      this.button.classList.remove('visible');
    }
  }
}

/**
 * 主题切换
 */
class ThemeToggle {
  constructor() {
    this.currentTheme = this.loadTheme();
    this.init();
  }

  init() {
    // 应用保存的主题或系统偏好
    if (this.currentTheme) {
      document.documentElement.setAttribute('data-theme', this.currentTheme);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      document.documentElement.setAttribute('data-theme', 'dark');
    }

    // 监听系统主题变化
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      if (!this.loadTheme()) {
        document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
      }
    });
  }

  loadTheme() {
    try {
      return localStorage.getItem('doubleFolding_theme');
    } catch (e) {
      return null;
    }
  }

  saveTheme(theme) {
    try {
      localStorage.setItem('doubleFolding_theme', theme);
    } catch (e) {
      // 忽略存储错误
    }
  }
}

/**
 * 键盘快捷键
 */
class KeyboardShortcuts {
  constructor() {
    this.init();
  }

  init() {
    document.addEventListener('keydown', (e) => {
      // ESC 关闭移动端菜单
      if (e.key === 'Escape') {
        const sidebar = document.getElementById('leftSidebar');
        const overlay = document.getElementById('overlay');
        if (sidebar?.classList.contains('open')) {
          sidebar.classList.remove('open');
          overlay.classList.remove('active');
          document.body.style.overflow = '';
        }
      }
    });
  }
}

/**
 * 平滑滚动到锚点
 */
class SmoothScroll {
  constructor() {
    this.init();
  }

  init() {
    // 页面加载时检查是否有锚点
    if (window.location.hash) {
      const id = window.location.hash.slice(1);
      const element = document.getElementById(id);
      if (element) {
        setTimeout(() => {
          const offset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }, 100);
      }
    }
  }
}

// 初始化所有模块
document.addEventListener('DOMContentLoaded', () => {
  new BackToTop();
  new ThemeToggle();
  new KeyboardShortcuts();
  new SmoothScroll();
});
