import React from 'react';
import { Wifi, WifiOff, ClipboardList, CloudUpload } from 'lucide-react';
import type { NetworkState } from '../types/survey';

interface HeaderProps {
  network: NetworkState;
  pendingCount: number;
  totalCount: number;
  isSyncing: boolean;
  onOpenQueue: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  network,
  pendingCount,
  totalCount,
  isSyncing,
  onOpenQueue,
}) => {
  return (
    <header className="app-header">
      <div className="brand-section">
        <div className="brand-logo-badge">
          <ClipboardList size={22} />
        </div>
        <div>
          <h1 className="brand-title">VKU Field Survey</h1>
          <p className="brand-subtitle">Offline-First Facility Audit</p>
        </div>
      </div>

      <div className="header-actions">
        {/* Trạng thái kết nối mạng */}
        <div className={`status-badge ${network.connected ? 'online' : 'offline'}`}>
          <span className="status-dot" />
          {network.connected ? (
            <>
              <Wifi size={13} />
              <span>Online</span>
            </>
          ) : (
            <>
              <WifiOff size={13} />
              <span>Offline</span>
            </>
          )}
        </div>

        {/* Nút Xem Danh sách phiếu đã nộp */}
        <button
          type="button"
          className="history-header-btn"
          onClick={onOpenQueue}
          title="Xem danh sách các phiếu khảo sát đã nộp"
        >
          {pendingCount > 0 ? (
            <CloudUpload size={15} className={isSyncing ? 'animate-spin text-warning' : 'text-warning'} />
          ) : (
            <ClipboardList size={15} />
          )}
          <span>Đã nộp ({totalCount})</span>
          {pendingCount > 0 && (
            <span className="sync-badge-count">{pendingCount}</span>
          )}
        </button>
      </div>
    </header>
  );
};
