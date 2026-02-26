import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ArrowLeft, Save, X, Plus } from 'lucide-react';
import { useApp } from '../store/AppContext';
import type { ProjectItem } from '../types';

interface LocationState {
  editProject?: ProjectItem;
}


export default function ProjectCreate() {
  const navigate = useNavigate();
  const location = useLocation();
  const { addProject, updateProject, showToast } = useApp();
  const state = location.state as LocationState;
  const editProject = state?.editProject;
  const isEdit = !!editProject;

  const [formData, setFormData] = useState({
    title: editProject?.title || '',
    description: editProject?.description || '',
    status: editProject?.status || 'planning' as ProjectItem['status'],
    members: editProject?.members || [] as string[],
  });

  const [memberInput, setMemberInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.title.trim()) {
      newErrors.title = '请输入项目名称';
    }
    if (!formData.description.trim()) {
      newErrors.description = '请输入项目描述';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddMember = () => {
    if (memberInput.trim() && !formData.members.includes(memberInput.trim())) {
      setFormData({ ...formData, members: [...formData.members, memberInput.trim()] });
      setMemberInput('');
    }
  };

  const handleRemoveMember = (member: string) => {
    setFormData({ ...formData, members: formData.members.filter(m => m !== member) });
  };

  const handleSubmit = () => {
    if (!validate()) {
      return;
    }

    if (isEdit && editProject) {
      updateProject(editProject.id, formData);
      showToast('success', '项目已更新');
    } else {
      addProject(formData);
      showToast('success', '项目已创建');
    }
    navigate('/projects');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2 text-text-secondary hover:text-primary mb-4"
        >
          <ArrowLeft size={16} />
          返回项目列表
        </button>
        <h1 className="text-2xl font-semibold text-text-primary">
          {isEdit ? '编辑项目' : '新建项目'}
        </h1>
      </div>

      {/* Form */}
      <div className="flex-1 overflow-auto">
        <div className="bg-white rounded-card border border-border p-6 mb-6">
          <h2 className="text-lg font-semibold text-text-primary mb-4">基本信息</h2>

          <div className="space-y-4">
            {/* 项目名称 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                项目名称 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="请输入项目名称"
                className={`w-full px-4 py-2 border rounded-card text-sm focus:outline-none focus:ring-2 ${
                  errors.title
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-border focus:border-primary focus:ring-primary/20'
                }`}
              />
              {errors.title && (
                <p className="text-sm text-red-500 mt-1">{errors.title}</p>
              )}
            </div>

            {/* 项目描述 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                项目描述 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="请输入项目描述"
                rows={4}
                className={`w-full px-4 py-2 border rounded-card text-sm focus:outline-none focus:ring-2 resize-none ${
                  errors.description
                    ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
                    : 'border-border focus:border-primary focus:ring-primary/20'
                }`}
              />
              {errors.description && (
                <p className="text-sm text-red-500 mt-1">{errors.description}</p>
              )}
            </div>

            {/* 项目状态 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                项目状态
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as ProjectItem['status'] })}
                className="w-full px-4 py-2 border border-border rounded-card text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              >
                <option value="planning">规划中</option>
                <option value="in_progress">进行中</option>
                <option value="completed">已完成</option>
              </select>
            </div>

            {/* 项目成员 */}
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                项目成员（可选）
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={memberInput}
                  onChange={(e) => setMemberInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddMember()}
                  placeholder="格式：username(姓名)，例如：cancanli(李灿灿)"
                  className="flex-1 px-4 py-2 border border-border rounded-card text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                <button
                  type="button"
                  onClick={handleAddMember}
                  className="flex items-center gap-1 px-4 py-2 text-sm bg-primary text-white rounded-card hover:bg-primary-hover"
                >
                  <Plus size={16} />
                  添加
                </button>
              </div>
              {formData.members.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.members.map((member, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {member}
                      <button
                        type="button"
                        onClick={() => handleRemoveMember(member)}
                        className="hover:bg-primary/20 rounded-full p-0.5"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 提示信息 */}
        <div className="bg-blue-50 border border-blue-200 rounded-card p-4">
          <p className="text-sm text-blue-800">
            💡 提示：创建项目后，您可以在创建需求和UI设计时选择关联到此项目。
          </p>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
        <button
          onClick={() => navigate('/projects')}
          className="px-4 py-2 text-sm text-text-secondary border border-border rounded-card hover:border-primary hover:text-primary"
        >
          取消
        </button>
        <button
          onClick={handleSubmit}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-card hover:bg-primary-hover"
        >
          <Save size={16} />
          {isEdit ? '保存' : '创建'}
        </button>
      </div>
    </div>
  );
}

