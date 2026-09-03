import { getPendingSurveys, updateSurveyStatus } from './db';
import { networkService } from './network';
import type { SurveyRecord } from '../types/survey';

export type SyncEventCallback = (isSyncing: boolean, pendingCount: number) => void;

class SyncEngine {
  private isSyncing = false;
  private listeners: SyncEventCallback[] = [];

  constructor() {
    // Tự động kích hoạt đồng bộ khi có mạng trở lại
    networkService.subscribe((state) => {
      if (state.connected) {
        this.syncPending();
      }
    });
  }

  subscribe(callback: SyncEventCallback): () => void {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notify(isSyncing: boolean, count: number) {
    for (const listener of this.listeners) {
      try {
        listener(isSyncing, count);
      } catch (e) {
        console.error('Error notifying sync listener:', e);
      }
    }
  }

  /**
   * Giả lập gửi phiếu khảo sát lên Mock Server / Backend API
   */
  private async dispatchSurveyToServer(survey: SurveyRecord): Promise<boolean> {
    // Độ trễ mạng thực tế 600ms
    await new Promise((resolve) => setTimeout(resolve, 600));

    console.log(`[SyncEngine] 🚀 Dispatched survey ID: ${survey.id} (${survey.category} - Room ${survey.room}) to server.`);
    // Giả lập thành công 100% khi có mạng
    return true;
  }

  /**
   * Đồng bộ tuần tự các bản ghi đang ở trạng thái PENDING_SYNC
   */
  async syncPending(): Promise<{ total: number; success: number }> {
    if (this.isSyncing) return { total: 0, success: 0 };
    if (!networkService.getCurrentState().connected) {
      return { total: 0, success: 0 };
    }

    this.isSyncing = true;
    let successCount = 0;
    let pendingList: SurveyRecord[] = [];

    try {
      pendingList = await getPendingSurveys();
      this.notify(true, pendingList.length);

      for (const survey of pendingList) {
        try {
          const ok = await this.dispatchSurveyToServer(survey);
          if (ok) {
            await updateSurveyStatus(survey.id, 'SYNCED', new Date().toISOString());
            successCount++;
          } else {
            await updateSurveyStatus(survey.id, 'FAILED');
          }
        } catch (err) {
          console.error(`[SyncEngine] Failed to sync survey ${survey.id}:`, err);
          await updateSurveyStatus(survey.id, 'FAILED');
        }
      }
    } finally {
      this.isSyncing = false;
      const remaining = await getPendingSurveys();
      this.notify(false, remaining.length);
    }

    return { total: pendingList.length, success: successCount };
  }
}

export const syncEngine = new SyncEngine();
