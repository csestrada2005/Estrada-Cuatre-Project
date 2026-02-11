import { WebContainer } from '@webcontainer/api';

class WebContainerService {
  private static instance: WebContainerService;
  private webContainerInstance: WebContainer | null = null;
  private bootPromise: Promise<void> | null = null;

  private constructor() {
    // Private constructor to enforce singleton
  }

  public static getInstance(): WebContainerService {
    if (!WebContainerService.instance) {
      WebContainerService.instance = new WebContainerService();
    }
    return WebContainerService.instance;
  }

  public async boot(): Promise<void> {
    if (this.webContainerInstance) {
      console.log('WebContainer already booted');
      return;
    }

    if (this.bootPromise) {
        return this.bootPromise;
    }

    this.bootPromise = (async () => {
        try {
          this.webContainerInstance = await WebContainer.boot();
          console.log('WebContainer Booted');
        } catch (error) {
          console.error('Failed to boot WebContainer:', error);
          this.bootPromise = null; // Reset promise on failure
          throw error;
        }
    })();

    return this.bootPromise;
  }

  public getContainer(): WebContainer | null {
    return this.webContainerInstance;
  }
}

export const webContainerService = WebContainerService.getInstance();
