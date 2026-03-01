/**
 * 侧边栏管理（主要用于移动端）
 */

class SidebarManager {
  constructor() {
    this.sidebar = document.querySelector('.series-sidebar');
    this.overlay = document.querySelector('.mobile-overlay');
    this.isOpen = false;

    this.init();
  }

  init() {
    if (!this.sidebar) return;

    // 点击导航链接后关闭侧边栏
    this.sidebar.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => this.close());
    });

    // ESC 键关闭
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
  }

  open() {
    this.sidebar.classList.add('open');
    if (this.overlay) this.overlay.hidden = false;
    document.body.style.overflow = 'hidden';
    this.isOpen = true;

    // 聚焦到侧边栏第一个链接
    const firstLink = this.sidebar.querySelector('a');
    if (firstLink) {
      setTimeout(() => firstLink.focus(), 100);
    }
  }

  close() {
    this.sidebar.classList.remove('open');
    if (this.overlay) this.overlay.hidden = true;
    document.body.style.overflow = '';
    this.isOpen = false;
  }

  toggle() {
    if (this.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }
}

// 导出供 main.js 使用
window.SidebarManager = SidebarManager;

// 同时也初始化一个实例供页面使用
document.addEventListener('DOMContentLoaded', () => {
  window.sidebarManager = new SidebarManager();
});
