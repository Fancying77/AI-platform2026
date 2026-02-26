import type { ChangeRequest, PRDVersion, UIDesignVersion } from '../../types';
import { formatDiffSummary, getLatestTwoVersions, getPRDDiffSummary, getUIDiffSummary } from '../../utils/versioning';

interface VersionHistoryProps {
  title: string;
  type: 'prd' | 'ui';
  currentVersionId: string;
  versions: PRDVersion[] | UIDesignVersion[];
  changeRequests: ChangeRequest[];
}

const getApprovalLabel = (status?: ChangeRequest['approvalStatus']): string => {
  if (!status) return '未记录';
  if (status === 'approved') return '已通过';
  if (status === 'rejected') return '已拒绝';
  return '待审批';
};

export const VersionHistory = ({ title, type, currentVersionId, versions, changeRequests }: VersionHistoryProps) => {
  if (type === 'prd') {
    const { previous, current } = getLatestTwoVersions(versions as PRDVersion[], currentVersionId);
    if (!current) return null;
    const diffSummary = formatDiffSummary(getPRDDiffSummary(previous, current));
    const currentChange = changeRequests.find(request => request.id === current.changeRequestId);
    return (
      <div className="mt-3 border-t border-border pt-3">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-text-tertiary">版本记录</span>
          <span className="text-xs text-text-tertiary">当前：v{current.version}</span>
        </div>
        <div className="space-y-2">
          <div className="bg-bg-light rounded-card p-3 border border-border">
            <div className="flex items-center justify-between text-xs mb-1">
              <span className="text-text-secondary">{title}</span>
              <span className="text-text-tertiary">{current.createdAt}</span>
            </div>
            <div className="text-xs text-text-tertiary">
              变更：{current.summary || '常规更新'} · 审批：{getApprovalLabel(currentChange?.approvalStatus)}
            </div>
            <div className="text-xs text-text-secondary mt-1">
              差异：{diffSummary}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const { previous, current } = getLatestTwoVersions(versions as UIDesignVersion[], currentVersionId);
  if (!current) return null;
  const diffSummary = formatDiffSummary(getUIDiffSummary(previous, current));
  const currentChange = changeRequests.find(request => request.id === current.changeRequestId);
  return (
    <div className="mt-3 border-t border-border pt-3">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-text-tertiary">版本记录</span>
        <span className="text-xs text-text-tertiary">当前：v{current.version}</span>
      </div>
      <div className="space-y-2">
        <div className="bg-bg-light rounded-card p-3 border border-border">
          <div className="flex items-center justify-between text-xs mb-1">
            <span className="text-text-secondary">{title}</span>
            <span className="text-text-tertiary">{current.createdAt}</span>
          </div>
          <div className="text-xs text-text-tertiary">
            变更：{current.summary || '常规更新'} · 审批：{getApprovalLabel(currentChange?.approvalStatus)}
          </div>
          <div className="text-xs text-text-secondary mt-1">
            差异：{diffSummary}
          </div>
        </div>
      </div>
    </div>
  );
};
