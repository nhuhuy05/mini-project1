import { Network, type ConnectionStatus } from '@capacitor/network';
import type { NetworkState } from '../types/survey';

export type NetworkChangeCallback = (state: NetworkState) => void;

class NetworkService {
  private listeners: NetworkChangeCallback[] = [];
  private currentState: NetworkState = {
    connected: typeof navigator !== 'undefined' ? navigator.onLine : true,
    connectionType: 'unknown',
  };
  private isInitialized = false;

  async init(): Promise<NetworkState> {
    if (this.isInitialized) return this.currentState;

    try {
      const status: ConnectionStatus = await Network.getStatus();
      this.currentState = {
        connected: status.connected,
        connectionType: status.connectionType,
      };

      await Network.addListener('networkStatusChange', (status: ConnectionStatus) => {
        this.currentState = {
          connected: status.connected,
          connectionType: status.connectionType,
        };
        this.notifyListeners();
      });
    } catch {
      // Fallback cho trình duyệt thông thường nếu Capacitor Network không khả dụng
      this.currentState = {
        connected: navigator.onLine,
        connectionType: navigator.onLine ? 'wifi' : 'none',
      };

      window.addEventListener('online', () => {
        this.currentState = { connected: true, connectionType: 'wifi' };
        this.notifyListeners();
      });

      window.addEventListener('offline', () => {
        this.currentState = { connected: false, connectionType: 'none' };
        this.notifyListeners();
      });
    }

    this.isInitialized = true;
    return this.currentState;
  }

  getCurrentState(): NetworkState {
    return this.currentState;
  }

  subscribe(callback: NetworkChangeCallback): () => void {
    this.listeners.push(callback);
    // Gọi ngay lập tức với trạng thái hiện tại
    callback(this.currentState);

    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notifyListeners() {
    for (const listener of this.listeners) {
      try {
        listener(this.currentState);
      } catch (e) {
        console.error('Error notifying network listener:', e);
      }
    }
  }
}

export const networkService = new NetworkService();
