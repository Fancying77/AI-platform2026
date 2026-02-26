import type { GovernanceStatus } from '../../types';

interface GovernanceBadgeProps {
  status: GovernanceStatus;
}

const STATUS_LABELS: Record<GovernanceStatus, string> = {
  draft: '草稿',
  review: '评审中',
  frozen: '已冻结',
};

const STATUS_CLASSES: Record<GovernanceStatus, string> = {
  draft: 'bg-bg-gray text-text-secondary',
  review: 'bg-primary-light text-primary',
  frozen: 'bg-bg-gray text-text-primary border border-border',
};

export const GovernanceBadge = ({ status }: GovernanceBadgeProps) => {
  return (
    <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_CLASSES[status]}`}>
      {STATUS_LABELS[status]}
    </span>
  );
};
