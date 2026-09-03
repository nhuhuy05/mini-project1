import React, { useEffect, useState } from 'react';
import { X, RefreshCw, CheckCircle, Clock, Trash2 } from 'lucide-react';
import { getAllSurveys, deleteSurvey } from '../services/db';
import { syncEngine } from '../services/sync';
import type { SurveyRecord } from '../types/survey';

interface SyncQueueModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSurveysChanged?: () => void;
}

export const SyncQueueModal: React.FC<SyncQueueModalProps> = ({
  isOpen,
  onClose,
  onSurveysChanged,
}) => {
  const [surveys, setSurveys] = useState<SurveyRecord[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);

  const fetchSurveys = async () => {
    const list = await getAllSurveys();
    setSurveys(list);
  };

  useEffect(() => {
    if (isOpen) {
      fetchSurveys();
    }
  }, [isOpen]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    await syncEngine.syncPending();
    await fetchSurveys();
    setIsSyncing(false);
    if (onSurveysChanged) onSurveysChanged();
  };

  const handleDelete = async (id: string) => {
    if (confirm('Bạn có chắc muốn xóa bản ghi khảo sát này khỏi bộ nhớ máy?')) {
      await deleteSurvey(id);
      await fetchSurveys();
      if (onSurveysChanged) onSurveysChanged();
    }
  };

  if (!isOpen) return null;

  const pendingList = surveys.filter((s) => s.status === 'PENDING_SYNC');
  const syncedList = surveys.filter((s) => s.status === 'SYNCED');

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
              Hàng đợi khảo sát Offline
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
              {pendingList.length} bản ghi chờ đồng bộ
            </p>
          </div>

          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <button
              type="button"
              className="btn btn-primary"
              style={{ padding: '6px 12px', fontSize: '12px' }}
              onClick={handleManualSync}
              disabled={isSyncing || pendingList.length === 0}
            >
              <RefreshCw size={14} className={isSyncing ? 'animate-spin' : ''} />
              <span>{isSyncing ? 'Đang gửi...' : 'Đồng bộ ngay'}</span>
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '6px 8px' }}
              onClick={onClose}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          {surveys.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)' }}>
              Chưa có bản ghi khảo sát nào trong bộ nhớ.
            </div>
          ) : (
            <>
              {/* Danh sách chờ đồng bộ */}
              {pendingList.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--warning)', marginBottom: '8px' }}>
                    Chờ đồng bộ ({pendingList.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {pendingList.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          padding: '12px',
                          borderRadius: 'var(--radius)',
                          border: '1px solid var(--warning)',
                          backgroundColor: 'var(--warning-bg)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-main)' }}>
                            {item.category} • Phòng {item.room}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                            <Clock size={12} />
                            <span>{new Date(item.createdAt).toLocaleTimeString()}</span>
                            <span>• {item.rating} sao</span>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--warning)' }}>
                            Pending
                          </span>
                          <button
                            type="button"
                            className="btn btn-secondary"
                            style={{ padding: '4px', border: 'none', color: 'var(--danger)' }}
                            onClick={() => handleDelete(item.id)}
                            title="Xóa bản ghi"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Danh sách đã đồng bộ */}
              {syncedList.length > 0 && (
                <div style={{ marginTop: '12px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, color: 'var(--success)', marginBottom: '8px' }}>
                    Đã đồng bộ thành công ({syncedList.length})
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {syncedList.map((item) => (
                      <div
                        key={item.id}
                        style={{
                          padding: '12px',
                          borderRadius: 'var(--radius)',
                          border: '1px solid var(--border)',
                          backgroundColor: 'var(--surface-subtle)',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ fontWeight: 600, fontSize: '13px', color: 'var(--text-main)' }}>
                            {item.category} • Phòng {item.room}
                          </div>
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                            <CheckCircle size={12} color="var(--success)" />
                            <span>Đã gửi lúc {item.syncedAt ? new Date(item.syncedAt).toLocaleTimeString() : ''}</span>
                          </div>
                        </div>

                        <span style={{ fontSize: '11px', fontWeight: 600, color: 'var(--success)' }}>
                          Synced
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
