import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { SurveyFormData, SurveyRecord, SyncStatus } from '../types/survey';

interface VKUSurveyDB extends DBSchema {
  drafts: {
    key: string;
    value: {
      data: SurveyFormData;
      step: number;
      savedAt: string;
    };
  };
  surveys: {
    key: string;
    value: SurveyRecord;
    indexes: {
      'by-status': SyncStatus;
      'by-created': string;
    };
  };
}

const DB_NAME = 'vku_field_survey_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<VKUSurveyDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<VKUSurveyDB>> {
  if (!dbPromise) {
    dbPromise = openDB<VKUSurveyDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Store lưu bản nháp đang nhập dở
        if (!db.objectStoreNames.contains('drafts')) {
          db.createObjectStore('drafts');
        }

        // Store lưu danh sách các phiếu khảo sát (Pending sync & Synced)
        if (!db.objectStoreNames.contains('surveys')) {
          const surveyStore = db.createObjectStore('surveys', { keyPath: 'id' });
          surveyStore.createIndex('by-status', 'status');
          surveyStore.createIndex('by-created', 'createdAt');
        }
      },
    });
  }
  return dbPromise;
}

// ==================== QUẢN LÝ BẢN NHÁP (DRAFT PERSISTENCE) ====================

const CURRENT_DRAFT_KEY = 'active_draft';

export async function saveDraft(data: SurveyFormData, step: number): Promise<void> {
  const db = await getDB();
  await db.put('drafts', {
    data,
    step,
    savedAt: new Date().toISOString(),
  }, CURRENT_DRAFT_KEY);
}

export async function loadDraft(): Promise<{ data: SurveyFormData; step: number; savedAt: string } | null> {
  const db = await getDB();
  const draft = await db.get('drafts', CURRENT_DRAFT_KEY);
  return draft || null;
}

export async function clearDraft(): Promise<void> {
  const db = await getDB();
  await db.delete('drafts', CURRENT_DRAFT_KEY);
}

// ==================== QUẢN LÝ KHẢO SÁT & HÀNG ĐỢI ĐỒNG BỘ ====================

export async function saveSurvey(record: SurveyRecord): Promise<void> {
  const db = await getDB();
  await db.put('surveys', record);
}

export async function getAllSurveys(): Promise<SurveyRecord[]> {
  const db = await getDB();
  const surveys = await db.getAll('surveys');
  // Sắp xếp mới nhất lên đầu
  return surveys.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

export async function getPendingSurveys(): Promise<SurveyRecord[]> {
  const db = await getDB();
  return db.getAllFromIndex('surveys', 'by-status', 'PENDING_SYNC');
}

export async function updateSurveyStatus(id: string, status: SyncStatus, syncedAt?: string): Promise<void> {
  const db = await getDB();
  const record = await db.get('surveys', id);
  if (record) {
    record.status = status;
    if (syncedAt) {
      record.syncedAt = syncedAt;
    }
    record.updatedAt = new Date().toISOString();
    await db.put('surveys', record);
  }
}

export async function deleteSurvey(id: string): Promise<void> {
  const db = await getDB();
  await db.delete('surveys', id);
}
