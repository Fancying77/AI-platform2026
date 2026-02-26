import { useEffect, useState } from 'react';

interface ChangeRequestDialogProps {
  isOpen: boolean;
  entityLabel: string;
  onCancel: () => void;
  onSubmit: (payload: { reason: string; impact: string; relatedTasks: string[] }) => void;
}

export const ChangeRequestDialog = ({ isOpen, entityLabel, onCancel, onSubmit }: ChangeRequestDialogProps) => {
  const [reason, setReason] = useState('');
  const [impact, setImpact] = useState('');
  const [relatedTasks, setRelatedTasks] = useState('');

  useEffect(() => {
    if (isOpen) {
      const resetTimer = setTimeout(() => {
        setReason('');
        setImpact('');
        setRelatedTasks('');
      }, 0);
      return () => clearTimeout(resetTimer);
    }
    return undefined;
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    const tasks = relatedTasks
      .split(',')
      .map(task => task.trim())
      .filter(Boolean);
    onSubmit({
      reason: reason.trim(),
      impact: impact.trim(),
      relatedTasks: tasks,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-card w-[520px] max-w-[90vw] p-6 border border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-text-primary">提交变更单</h2>
          <span className="text-xs text-text-tertiary">对象：{entityLabel}</span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-primary mb-1.5">
              变更原因
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="简要说明本次变更的原因"
              className="w-full min-h-[72px] px-3 py-2 text-sm border border-border rounded-card focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-primary mb-1.5">
              影响范围
            </label>
            <textarea
              value={impact}
              onChange={(e) => setImpact(e.target.value)}
              placeholder="涉及的模块、页面或交付物"
              className="w-full min-h-[72px] px-3 py-2 text-sm border border-border rounded-card focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-text-primary mb-1.5">
              关联任务
            </label>
            <input
              value={relatedTasks}
              onChange={(e) => setRelatedTasks(e.target.value)}
              placeholder="多个任务用逗号分隔，如 TAPD-123, UI-45"
              className="w-full px-3 py-2 text-sm border border-border rounded-card focus:outline-none focus:border-primary"
            />
          </div>

          <div className="text-xs text-text-tertiary">
            审批状态：自动通过（MVP）
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm text-text-secondary hover:text-text-primary"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={!reason.trim() || !impact.trim()}
            className="px-5 py-2 text-sm bg-primary text-white rounded-card hover:bg-primary-hover disabled:opacity-60 disabled:cursor-not-allowed"
          >
            提交并生成版本
          </button>
        </div>
      </div>
    </div>
  );
};
