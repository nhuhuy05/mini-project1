import React from 'react';
import { Wifi, WifiOff, CloudUpload, ClipboardCheck } from 'lucide-react';
import type { NetworkState } from '../types/survey';

interface HeaderProps {
  network: NetworkState;
  pendingCount: number;
  isSyncing: boolean;
  onOpenQueue: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  network,
  pendingCount,
  isSyncing,
  onOpenQueue,
}) => {
  return (
    <header className="app-header">
      <div className="brand-section">
        <div className="brand-logo-badge">
          <ClipboardCheck size={22} />
        </div>
        <div>
          <h1 className="brand-title">VKU Field Survey</h1>
          <p className="brand-subtitle">Offline-First Facility Audit</p>
        </div>
      </div>

      <div className="header-actions">
        {/* Network Status Badge */}
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

        {/* Sync Queue Badge Button */}
        {pendingCount > 0 && (
          <button
            type="button"
            className="sync-badge-btn"
            onClick={onOpenQueue}
            title="Xem danh sách hàng đợi đồng bộ"
          >
            <CloudUpload size={14} className={isSyncing ? 'animate-spin' : ''} />
            <span className="sync-badge-count">{pendingCount}</span>
          </button>
        )}
      </div>
    </header>
  );
};
