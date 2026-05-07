import styled from 'styled-components';

export const DriverPageContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: ${({ theme }) => theme.colors.bgPrimary};
`;

export const TopBar = styled.div`
  height: 60px;
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
`;

export const TopBarLeft = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

export const TopBarIcon = styled.span`
  font-size: 1.5rem;
`;

export const TopBarName = styled.div`
  font-weight: 700;
  font-size: 0.95rem;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const TopBarId = styled.div`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const TopBarRight = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const FuelPill = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: ${({ theme }) => theme.colors.bgPrimary};
  padding: 6px 12px;
  border-radius: 20px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 0.8rem;
  font-weight: 600;

  span {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const FuelTrack = styled.div`
  width: 60px;
  height: 6px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 3px;
  overflow: hidden;
`;

export const FuelFill = styled.div`
  height: 100%;
  border-radius: 3px;
  transition: width 0.3s ease;
`;

export const StatusPill = styled.div`
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: rgba(255, 255, 255, 0.1);
  color: ${({ theme }) => theme.colors.textSecondary};

  &.waiting {
    background: rgba(245, 158, 11, 0.12);
    color: ${({ theme }) => theme.colors.accentAmber};
  }

  &.in_progress {
    background: rgba(59, 130, 246, 0.12);
    color: ${({ theme }) => theme.colors.accentBlue};
  }

  &.completed {
    background: rgba(16, 185, 129, 0.12);
    color: ${({ theme }) => theme.colors.accentGreen};
  }
`;

export const ContentArea = styled.div`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

export const Sidebar = styled.div`
  width: 320px;
  background: ${({ theme }) => theme.colors.bgSecondary};
  border-right: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  flex-direction: column;
  overflow-y: auto;
  padding: 24px;
`;

export const SidebarTitle = styled.h3`
  font-size: 0.85rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
`;

export const ShiftCard = styled.div`
  background: ${({ theme }) => theme.colors.bgPrimary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const ShiftRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const ShiftLabel = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const ShiftVal = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const ShiftBadge = styled.span`
  font-size: 0.7rem;
  font-weight: 700;
  padding: 2px 8px;
  background: rgba(16, 185, 129, 0.15);
  color: ${({ theme }) => theme.colors.accentGreen};
  border-radius: 12px;
`;

export const VehicleList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const VehicleItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: ${({ theme }) => theme.colors.bgPrimary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.md};
  transition: all 0.2s;

  &.active {
    border-color: ${({ theme }) => theme.colors.accentBlue};
    background: rgba(59, 130, 246, 0.05);
  }
`;

export const VehicleIcon = styled.span`
  font-size: 1.5rem;
  background: ${({ theme }) => theme.colors.bgSecondary};
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }) => theme.radii.sm};
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const VehicleName = styled.div`
  font-size: 0.85rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const VehicleTime = styled.div`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const MainPanel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 20px;
  gap: 20px;
  overflow-y: auto;
`;

export const MapWrapper = styled.div`
  position: relative;
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 400px;
`;

export const MapOverlayInfo = styled.div`
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(15, 17, 23, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 12px 20px;
  display: flex;
  align-items: center;
  gap: 20px;
  box-shadow: ${({ theme }) => theme.shadows.md};
  z-index: 1000;
`;

export const OverlayStat = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const OverlayVal = styled.span`
  font-size: 1.2rem;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
  line-height: 1.2;
`;

export const OverlayUnit = styled.span`
  font-size: 0.65rem;
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
`;

export const OverlayDivider = styled.div`
  width: 1px;
  height: 24px;
  background: ${({ theme }) => theme.colors.border};
`;

export const MapLegend = styled.div`
  position: absolute;
  bottom: 16px;
  left: 16px;
  display: flex;
  align-items: center;
  gap: 14px;
  background: rgba(15, 17, 23, 0.88);
  backdrop-filter: blur(10px);
  border: 1px solid ${({ theme }) => theme.colors.border};
  padding: 8px 16px;
  border-radius: ${({ theme }) => theme.radii.md};
  font-size: 0.75rem;
  color: ${({ theme }) => theme.colors.textMuted};
  z-index: 1000;
`;

export const LegendDot = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  vertical-align: middle;
  background: ${({ bg }) => bg};
`;

export const LegendLine = styled.span`
  display: inline-block;
  width: 18px;
  height: 3px;
  background: ${({ theme }) => theme.colors.accentCyan};
  border-radius: 2px;
  margin-right: 6px;
  vertical-align: middle;
`;

export const BottomPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const ScheduleStrip = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 24px;
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  flex-wrap: wrap;
`;

export const SchedulePoint = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

export const ScheduleDot = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-top: 4px;
  flex-shrink: 0;

  &.green {
    background: ${({ theme }) => theme.colors.accentGreen};
    box-shadow: 0 0 10px rgba(16, 185, 129, 0.4);
  }

  &.red {
    background: ${({ theme }) => theme.colors.accentRed};
    box-shadow: 0 0 10px rgba(239, 68, 68, 0.4);
  }
`;

export const ScheduleLabel = styled.div`
  font-size: 0.65rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textMuted};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const SchedulePlace = styled.div`
  font-size: 0.95rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const ScheduleTime = styled.div`
  font-size: 1.2rem;
  font-weight: 800;
  background: ${({ theme }) => theme.gradients.primary};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const UpdatedBadge = styled.span`
  font-size: 0.6rem;
  padding: 2px 8px;
  background: rgba(245, 158, 11, 0.15);
  color: ${({ theme }) => theme.colors.accentAmber};
  -webkit-text-fill-color: ${({ theme }) => theme.colors.accentAmber};
  border-radius: 12px;
  font-weight: 600;
`;

export const ScheduleArrow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  flex: 1;
  min-width: 100px;
  
  span {
    font-size: 0.75rem;
    color: ${({ theme }) => theme.colors.textMuted};
    white-space: nowrap;
  }
`;

export const ScheduleLine = styled.div`
  width: 100%;
  height: 2px;
  background: linear-gradient(to right, ${({ theme }) => theme.colors.accentGreen}, ${({ theme }) => theme.colors.accentCyan}, ${({ theme }) => theme.colors.accentRed});
  border-radius: 1px;
`;

export const ScheduleActions = styled.div`
  display: flex;
  gap: 12px;
  margin-left: auto;
`;

export const BtnStart = styled.button`
  padding: 10px 28px;
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  border-radius: ${({ theme }) => theme.radii.lg};
  font-size: 0.9rem;
  font-weight: 700;
  box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(16, 185, 129, 0.45);
  }

  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

export const BtnReached = styled.button`
  padding: 10px 28px;
  background: ${({ theme }) => theme.gradients.primary};
  color: white;
  border-radius: ${({ theme }) => theme.radii.lg};
  font-size: 0.9rem;
  font-weight: 700;
  box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3);

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(59, 130, 246, 0.45);
  }

  &:disabled { opacity: 0.6; cursor: not-allowed; }
`;

export const BtnReroute = styled.button`
  padding: 10px 18px;
  background: ${({ theme }) => theme.colors.bgHover};
  color: ${({ theme }) => theme.colors.accentAmber};
  border: 1px solid rgba(245, 158, 11, 0.3);
  border-radius: ${({ theme }) => theme.radii.lg};
  font-size: 0.85rem;
  font-weight: 700;

  &:hover:not(:disabled) {
    background: rgba(245, 158, 11, 0.1);
    border-color: ${({ theme }) => theme.colors.accentAmber};
  }

  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

export const CompletedPill = styled.span`
  padding: 10px 24px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: ${({ theme }) => theme.radii.lg};
  color: ${({ theme }) => theme.colors.accentGreen};
  font-weight: 700;
  font-size: 0.9rem;
`;

export const NoAssignment = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.95rem;
  padding: 8px 0;
  width: 100%;
`;

export const DetailsRow = styled.div`
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 16px;
`;

export const Card = styled.div`
  background: ${({ theme }) => theme.colors.bgCard};
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: ${({ theme }) => theme.radii.lg};
  padding: 20px;
`;

export const CardTitle = styled.div`
  font-size: 0.85rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

export const ConditionsBadge = styled.span`
  font-size: 0.75rem;
  font-weight: 500;
  text-transform: none;
  color: ${({ theme }) => theme.colors.textMuted};
  padding: 4px 12px;
  background: rgba(245, 158, 11, 0.08);
  border-radius: 12px;
  letter-spacing: 0;
`;

export const StepsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0;
  max-height: 280px;
  overflow-y: auto;
`;

export const Step = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 12px;
  border-left: 2px solid ${({ theme }) => theme.colors.border};
  transition: all 0.2s;

  &.cur {
    border-left-color: ${({ theme }) => theme.colors.accentCyan};
    background: rgba(6, 182, 212, 0.05);
    border-radius: 0 ${({ theme }) => theme.radii.sm} ${({ theme }) => theme.radii.sm} 0;
  }

  &.dest {
    border-left-color: ${({ theme }) => theme.colors.accentRed};
  }
`;

export const StepNum = styled.div`
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.bgSecondary};
  border: 1px solid ${({ theme }) => theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textMuted};
  flex-shrink: 0;

  .cur & {
    background: rgba(6, 182, 212, 0.12);
    border-color: ${({ theme }) => theme.colors.accentCyan};
    color: ${({ theme }) => theme.colors.accentCyan};
  }

  .dest & {
    background: rgba(239, 68, 68, 0.12);
    border-color: ${({ theme }) => theme.colors.accentRed};
  }
`;

export const StepText = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

export const StepInstr = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const StepDist = styled.span`
  font-size: 0.7rem;
  color: ${({ theme }) => theme.colors.textMuted};
`;

export const EmptyMsg = styled.div`
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 0.85rem;
  text-align: center;
  padding: 20px 0;
  font-style: italic;
`;

export const ParcelsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
`;

export const ParcelItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: ${({ theme }) => theme.radii.sm};

  .badge {
    font-size: 0.65rem;
    padding: 3px 8px;
    border-radius: 12px;
    font-weight: 700;
    text-transform: uppercase;
    
    &.pending { background: rgba(59, 130, 246, 0.15); color: ${({ theme }) => theme.colors.accentBlue}; }
    &.assigned, &.in_transit { background: rgba(245, 158, 11, 0.15); color: ${({ theme }) => theme.colors.accentAmber}; }
    &.delivered { background: rgba(16, 185, 129, 0.15); color: ${({ theme }) => theme.colors.accentGreen}; }
  }
`;

export const ParcelId = styled.span`
  font-family: monospace;
  color: ${({ theme }) => theme.colors.accentPurple};
  font-weight: 600;
  font-size: 0.85rem;
`;

export const ParcelRoute = styled.span`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const AlertsCompactList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const AlertCompactItem = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 12px;
  background: rgba(239, 68, 68, 0.08);
  border-left: 3px solid ${({ theme }) => theme.colors.accentRed};
  border-radius: 0 ${({ theme }) => theme.radii.sm} ${({ theme }) => theme.radii.sm} 0;
  font-size: 0.8rem;
  color: ${({ theme }) => theme.colors.textSecondary};

  .time {
    color: ${({ theme }) => theme.colors.textMuted};
    font-size: 0.7rem;
  }
`;
