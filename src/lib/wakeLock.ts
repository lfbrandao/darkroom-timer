// Wake lock utility to prevent screen from sleeping during timer operation
export class WakeLockManager {
  private wakeLock: WakeLockSentinel | null = null;

  constructor() {
    // Listen for visibility changes to handle wake lock appropriately
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', this.handleVisibilityChange.bind(this));
    }
  }

  /**
   * Request wake lock to keep screen awake
   */
  async requestWakeLock(): Promise<boolean> {
    if (!('wakeLock' in navigator)) {
      console.warn('Screen Wake Lock API not supported');
      return false;
    }

    try {
      this.wakeLock = await navigator.wakeLock.request('screen');
      console.log('Screen wake lock acquired');
      
      this.wakeLock.addEventListener('release', () => {
        console.log('Screen wake lock released');
      });

      return true;
    } catch (error) {
      console.error('Failed to acquire screen wake lock:', error);
      return false;
    }
  }

  /**
   * Release the wake lock
   */
  async releaseWakeLock(): Promise<void> {
    if (this.wakeLock) {
      try {
        await this.wakeLock.release();
        this.wakeLock = null;
        console.log('Screen wake lock manually released');
      } catch (error) {
        console.error('Failed to release screen wake lock:', error);
      }
    }
  }

  /**
   * Check if wake lock is currently active
   */
  get isActive(): boolean {
    return this.wakeLock !== null && !this.wakeLock.released;
  }

  /**
   * Handle visibility changes (when user switches tabs/apps)
   */
  private async handleVisibilityChange(): Promise<void> {
    if (this.wakeLock !== null && document.visibilityState === 'visible') {
      // Re-request wake lock when page becomes visible again
      this.requestWakeLock();
    }
  }
}

// Export singleton instance
export const wakeLockManager = new WakeLockManager();
