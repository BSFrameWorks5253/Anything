import React, { useEffect, useState } from 'react';
import './OneTapProductionWidget.css';

interface ProductionSummary {
  updatedAt?: number;
  activeSafar?: string;
  city?: string;
  totalDays?: number;
  completedDays?: number;
  percent?: number;
  isSafarDone?: boolean;
  currentPath?: string;
  currentDrive?: string;
  isOneTapRunning?: boolean;
  counts?: {
    editingPending: number;
    inProgress: number;
    review: number;
    uploadPending: number;
    uploaded: number;
    submitted: number;
    totalTasks: number;
  };
}

export const OneTapProductionWidget: React.FC = () => {
  const [summary, setSummary] = useState<ProductionSummary | null>(null);

  const loadData = async () => {
    try {
      let res: any = null;
      if ((window as any).electron?.ipcRenderer?.invoke) {
        res = await (window as any).electron.ipcRenderer.invoke('onetap:get-tracker-summary');
      } else if (window.electronAPI?.oneTapGetTrackerSummary) {
        res = await window.electronAPI.oneTapGetTrackerSummary();
      }
      if (res && (res.counts || res.activeSafar)) {
        setSummary(res);
      }
    } catch {}
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // 10s silent background poll
    return () => clearInterval(interval);
  }, []);

  const openOneTap = (page = 'tracker') => {
    if ((window as any).electron?.ipcRenderer?.invoke) {
      (window as any).electron.ipcRenderer.invoke('onetap:open-page', page);
    } else if (window.electronAPI?.oneTapOpenPage) {
      window.electronAPI.oneTapOpenPage(page);
    }
  };

  if (!summary || !summary.activeSafar) {
    return null; // Gracefully omit if no Safar has been tracked yet
  }

  return (
    <div className="onetap-glass-card select-none">
      <div className="onetap-card-header">
        <div className="onetap-title-cluster">
          <span className="onetap-badge">ONE TAP</span>
          <span className="onetap-safar-title">🕌 {summary.activeSafar}</span>
          {summary.city && <span className="onetap-city-tag">{summary.city}</span>}
        </div>
        <div className="onetap-header-meta">
          <span className={`onetap-live-dot ${summary.isOneTapRunning ? 'active' : 'idle'}`}>
            {summary.isOneTapRunning ? 'Live' : 'Cached'}
          </span>
          <button className="onetap-jump-btn" onClick={() => openOneTap('tracker')} title="Open in One Tap">
            Open Tracker ↗
          </button>
        </div>
      </div>

      <div className="onetap-progress-track">
        <div 
          className="onetap-progress-fill" 
          style={{ width: `${Math.min(100, Math.max(0, summary.percent || 0))}%` }} 
        />
      </div>

      <div className="onetap-stages-row">
        <div className="onetap-stage-box pending" onClick={() => openOneTap('tracker')} title="View Pending in One Tap">
          <span className="stage-value">{summary.counts?.editingPending || 0}</span>
          <span className="stage-name">Pending</span>
        </div>
        <div className="onetap-stage-box in-progress" onClick={() => openOneTap('tracker')} title="View In Progress in One Tap">
          <span className="stage-value">{summary.counts?.inProgress || 0}</span>
          <span className="stage-name">In Progress</span>
        </div>
        <div className="onetap-stage-box review" onClick={() => openOneTap('adder')} title="View Final Review in One Tap">
          <span className="stage-value">{summary.counts?.review || 0}</span>
          <span className="stage-name">In Final</span>
        </div>
        <div className="onetap-stage-box uploaded" onClick={() => openOneTap('tracker')} title="View Uploaded Tasks in One Tap">
          <span className="stage-value">{(summary.counts?.uploaded || 0) + (summary.counts?.submitted || 0)}</span>
          <span className="stage-name">Uploaded</span>
        </div>
      </div>
    </div>
  );
};

