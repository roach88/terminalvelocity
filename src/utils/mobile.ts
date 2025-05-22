// Mobile-specific utilities and enhancements

export class MobileAdapter {
  private static isMobile = false;
  private static isTablet = false;
  private static touchStartY = 0;
  private static lastTouchEnd = 0;

  static init() {
    this.detectDevice();
    this.setupTouchHandlers();
    this.preventZoom();
  }

  private static detectDevice() {
    const userAgent = navigator.userAgent || navigator.vendor;
    const width = window.innerWidth;
    
    // Mobile detection
    this.isMobile = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent) || width < 768;
    this.isTablet = /ipad|android(?!.*mobile)/i.test(userAgent) || (width >= 768 && width < 1024);
    
    // Add CSS classes for styling
    document.body.classList.toggle('is-mobile', this.isMobile);
    document.body.classList.toggle('is-tablet', this.isTablet);
  }

  private static setupTouchHandlers() {
    if (!this.isMobile && !this.isTablet) return;

    // Prevent double-tap zoom
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - this.lastTouchEnd <= 300) {
        e.preventDefault();
      }
      this.lastTouchEnd = now;
    }, { passive: false });

    // Handle swipe gestures for navigation
    document.addEventListener('touchstart', (e) => {
      this.touchStartY = e.touches[0].clientY;
    }, { passive: true });

    document.addEventListener('touchend', (e) => {
      if (!e.changedTouches.length) return;
      
      const touchEndY = e.changedTouches[0].clientY;
      const deltaY = this.touchStartY - touchEndY;
      
      // Swipe up to scroll to bottom
      if (deltaY > 50) {
        this.scrollToBottom();
      }
      // Swipe down to scroll to top
      else if (deltaY < -50) {
        this.scrollToTop();
      }
    }, { passive: true });
  }

  private static preventZoom() {
    // Prevent pinch zoom
    document.addEventListener('touchmove', (e) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    }, { passive: false });

    // Prevent keyboard zoom on iOS
    if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
      const meta = document.createElement('meta');
      meta.name = 'viewport';
      meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
      document.head.appendChild(meta);
    }
  }

  static scrollToBottom() {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    });
  }

  static scrollToTop() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }

  // Virtual keyboard handling
  static handleVirtualKeyboard() {
    if (!this.isMobile) return;

    let initialViewportHeight = window.innerHeight;

    window.addEventListener('resize', () => {
      const currentHeight = window.innerHeight;
      const heightDiff = initialViewportHeight - currentHeight;
      
      // Virtual keyboard is likely open if height decreased significantly
      if (heightDiff > 150) {
        document.body.classList.add('keyboard-open');
        // Ensure input stays visible
        setTimeout(() => {
          const input = document.getElementById('command-input');
          if (input) {
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      } else {
        document.body.classList.remove('keyboard-open');
      }
    });
  }

  // Touch-friendly command suggestions
  static createTouchCommandBar(commands: string[]): HTMLElement {
    const commandBar = document.createElement('div');
    commandBar.className = 'touch-command-bar';
    commandBar.style.cssText = `
      display: flex;
      gap: 8px;
      padding: 8px;
      overflow-x: auto;
      background: rgba(0, 0, 0, 0.1);
      border-radius: 4px;
      margin: 8px 0;
    `;

    commands.forEach(cmd => {
      const button = document.createElement('button');
      button.textContent = cmd;
      button.className = 'touch-command-btn';
      button.style.cssText = `
        padding: 8px 12px;
        border: 1px solid rgba(255, 255, 255, 0.3);
        background: rgba(255, 255, 255, 0.1);
        color: inherit;
        border-radius: 4px;
        white-space: nowrap;
        font-family: inherit;
        font-size: 14px;
        cursor: pointer;
        touch-action: manipulation;
      `;
      
      button.addEventListener('click', () => {
        const input = document.getElementById('command-input') as HTMLInputElement;
        if (input) {
          input.value = cmd;
          input.focus();
          // Trigger input event
          input.dispatchEvent(new Event('input', { bubbles: true }));
        }
      });

      commandBar.appendChild(button);
    });

    return commandBar;
  }

  // Haptic feedback for supported devices
  static hapticFeedback(type: 'light' | 'medium' | 'heavy' = 'light') {
    if ('vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      navigator.vibrate(patterns[type]);
    }
  }

  static get isMobileDevice() {
    return this.isMobile;
  }

  static get isTabletDevice() {
    return this.isTablet;
  }
}