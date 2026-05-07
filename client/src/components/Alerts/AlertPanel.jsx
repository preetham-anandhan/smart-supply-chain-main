import React from 'react';
import styled from 'styled-components';
import { Badge } from '../SharedStyles';

const AlertPanelContainer = styled.div`
  max-height: 300px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const AlertItem = styled.div`
  padding: 14px 16px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderLight};
  display: flex;
  align-items: flex-start;
  gap: 12px;
  transition: background 0.2s;

  &:hover {
    background: rgba(255, 255, 255, 0.02);
  }

  &.critical {
    border-left: 3px solid ${({ theme }) => theme.colors.accentRed};
    background: rgba(239, 68, 68, 0.05);
  }

  &.warning {
    border-left: 3px solid ${({ theme }) => theme.colors.accentAmber};
  }

  &:last-child {
    border-bottom: none;
  }
`;

const AlertMessage = styled.div`
  font-size: 0.85rem;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.textPrimary};
  line-height: 1.4;
  margin-bottom: 4px;
`;

const AlertTime = styled.div`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;

function AlertPanel({ alerts = [] }) {
  if (alerts.length === 0) {
    return (
      <div style={{ padding: 20, textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
        ✅ No active alerts
      </div>
    );
  }

  return (
    <AlertPanelContainer>
      {alerts.map((alert, i) => {
        const severity = alert.severity || alert.type || 'info';
        const cssClass =
          severity === 'critical' || severity === 'high' ? 'critical' :
          severity === 'medium' || severity === 'disruption' || severity === 'delay' ? 'warning' : '';

        return (
          <AlertItem key={alert.id || i} className={cssClass}>
            <div style={{ flex: 1 }}>
              <AlertMessage>{alert.message}</AlertMessage>
              <AlertTime>
                {alert.created_at
                  ? new Date(alert.created_at).toLocaleTimeString()
                  : alert.timestamp
                  ? new Date(alert.timestamp).toLocaleTimeString()
                  : 'Just now'}
              </AlertTime>
            </div>
            {alert.severity && (
              <Badge
                type={severity === 'critical' || severity === 'high' ? 'high' : severity === 'medium' ? 'pending' : 'standard'}
              >
                {severity}
              </Badge>
            )}
          </AlertItem>
        );
      })}
    </AlertPanelContainer>
  );
}

export default AlertPanel;
