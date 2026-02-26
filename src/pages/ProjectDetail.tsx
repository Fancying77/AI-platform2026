import { useEffect, useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Edit,
  FileText,
  Palette,
  Clock,
  CheckCircle,
  Link2,
  X,
  Plus,
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { GovernanceBadge } from '../components/versioning/GovernanceBadge';
import { VersionHistory } from '../components/versioning/VersionHistory';
import { getCurrentVersionNumber, getDaysBetween, getProgressWidthClass } from '../utils/versioning';
import { addVisitRecord } from '../utils/visitHistory';
import type { ProjectItem, PRDItem, UIDesignItem } from '../types';

export const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    projectList,
    prdList,
    uiDesignList,
    updatePRD,
    updateUIDesign,
    setPRDGovernanceStatus,
    setUIDesignGovernanceStatus,
    showToast,
  } = useApp();
  const [activeTab, setActiveTab] = useState<'prd' | 'ui'>('prd');
  const [showAddPRDModal, setShowAddPRDModal] = useState(false);
  const [showAddUIModal, setShowAddUIModal] = useState(false);

  const project = useMemo(() => projectList.find(p => p.id === id) || null, [id, projectList]);

  useEffect(() => {
    if (!project && projectList.length > 0) {
      showToast('error', '项目不存在');
      navigate('/projects');
    } else if (project) {
      // 记录访问历史
      addVisitRecord({
        id: project.id,
        type: 'project',
        title: project.title,
        path: `/projects/${project.id}`,
      });
    }
  }, [project, projectList.length, navigate, showToast]);

  if (!project) {
    return null;
  }

  const relatedPRDs = prdList.filter(prd => prd.projectId === project.id);
  const relatedUIDesigns = uiDesignList.filter(ui => ui.projectId === project.id);

  // 计算完成率
  const prdCompletionRate = relatedPRDs.length > 0
    ? Math.round((relatedPRDs.filter(p => p.status === 'completed').length / relatedPRDs.length) * 100)
    : 0;
  const uiCompletionRate = relatedUIDesigns.length > 0
    ? Math.round((relatedUIDesigns.filter(u => u.status === 'completed').length / relatedUIDesigns.length) * 100)
    : 0;

  const prdChangeCount = relatedPRDs.reduce((acc, prd) => acc + Math.max(0, prd.versions.length - 1), 0);
  const uiRedoCount = relatedUIDesigns.reduce((acc, ui) => acc + Math.max(0, ui.versions.length - 1), 0);
  const frozenPRDChanges = relatedPRDs.reduce((acc, prd) => {
    if (!prd.frozenAt) return acc;
    const frozenAt = prd.frozenAt;
    const changesAfterFreeze = prd.versions.filter(version => version.createdAt > frozenAt).length;
    return acc + changesAfterFreeze;
  }, 0);
  const totalPRDChanges = relatedPRDs.reduce((acc, prd) => acc + Math.max(0, prd.versions.length - 1), 0);
  const freezeChangeRatio = totalPRDChanges > 0 ? Math.round((frozenPRDChanges / totalPRDChanges) * 100) : 0;
  const latestActivityDates = [
    project.updatedAt,
    ...relatedPRDs.map(prd => prd.versions[prd.versions.length - 1]?.createdAt),
    ...relatedUIDesigns.map(ui => ui.versions[ui.versions.length - 1]?.createdAt),
  ].filter(Boolean) as string[];
  const latestActivity = latestActivityDates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] || project.createdAt;
  const landingCycleDays = getDaysBetween(project.createdAt, latestActivity);

  const getStatusColor = (status: ProjectItem['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-600';
      case 'in_progress':
        return 'bg-blue-50 text-blue-600';
      case 'planning':
        return 'bg-yellow-50 text-yellow-600';
    }
  };

  const getStatusText = (status: ProjectItem['status']) => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'in_progress':
        return '进行中';
      case 'planning':
        return '规划中';
    }
  };

  const handleRemovePRD = (prdId: string) => {
    updatePRD(prdId, { projectId: undefined });
    showToast('success', '已取消关联');
  };

  const handleRemoveUI = (uiId: string) => {
    updateUIDesign(uiId, { projectId: undefined });
    showToast('success', '已取消关联');
  };

  const handleAddPRD = (prdId: string) => {
    updatePRD(prdId, { projectId: project.id });
    showToast('success', '关联成功');
    setShowAddPRDModal(false);
  };

  const handleAddUI = (uiId: string) => {
    updateUIDesign(uiId, { projectId: project.id });
    showToast('success', '关联成功');
    setShowAddUIModal(false);
  };

  const handleTogglePRDFreeze = (prd: PRDItem) => {
    const nextStatus = prd.governanceStatus === 'frozen' ? 'draft' : 'frozen';
    setPRDGovernanceStatus(prd.id, nextStatus);
    showToast('success', nextStatus === 'frozen' ? '需求文档 已冻结' : '需求文档 已解冻');
  };

  const handleToggleUIFreeze = (ui: UIDesignItem) => {
    const nextStatus = ui.governanceStatus === 'frozen' ? 'draft' : 'frozen';
    setUIDesignGovernanceStatus(ui.id, nextStatus);
    showToast('success', nextStatus === 'frozen' ? 'UI 设计已冻结' : 'UI 设计已解冻');
  };

  const availablePRDs = prdList.filter(prd => !prd.projectId || prd.projectId !== project.id);
  const availableUIDesigns = uiDesignList.filter(ui => !ui.projectId || ui.projectId !== project.id);

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

        <div className="bg-white rounded-card border border-border p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-text-primary mb-2">{project.title}</h1>
              <p className="text-text-secondary">{project.description}</p>
            </div>
            <button
              onClick={() => navigate('/projects/create', { state: { editProject: project } })}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-card hover:bg-primary-hover"
            >
              <Edit size={16} />
              编辑项目
            </button>
          </div>

          <div className="flex items-center gap-6 text-sm">
            <span className={`flex items-center gap-1 px-3 py-1 rounded-full ${getStatusColor(project.status)}`}>
              {project.status === 'completed' && <CheckCircle size={14} />}
              {project.status === 'in_progress' && <Clock size={14} />}
              {getStatusText(project.status)}
            </span>
            <span className="text-text-tertiary">
              创建时间: {project.createdAt}
            </span>
            {project.updatedAt && (
              <span className="text-text-tertiary">
                更新时间: {project.updatedAt}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-card border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-tertiary">需求完成率</span>
            <span className="text-sm font-medium text-text-primary">{prdCompletionRate}%</span>
          </div>
          <div className="w-full bg-bg-gray rounded-full h-2">
            <div
              className={`bg-primary h-2 rounded-full transition-all ${getProgressWidthClass(prdCompletionRate)}`}
            />
          </div>
          <p className="text-xs text-text-tertiary mt-2">
            {relatedPRDs.filter(p => p.status === 'completed').length} / {relatedPRDs.length} 已完成
          </p>
        </div>
        <div className="bg-white rounded-card border border-border p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-tertiary">设计完成率</span>
            <span className="text-sm font-medium text-text-primary">{uiCompletionRate}%</span>
          </div>
          <div className="w-full bg-bg-gray rounded-full h-2">
            <div
              className={`bg-primary h-2 rounded-full transition-all ${getProgressWidthClass(uiCompletionRate)}`}
            />
          </div>
          <p className="text-xs text-text-tertiary mt-2">
            {relatedUIDesigns.filter(u => u.status === 'completed').length} / {relatedUIDesigns.length} 已完成
          </p>
        </div>
      </div>

      {/* Governance Overview */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-card border border-border p-4">
          <div className="text-xs text-text-tertiary mb-2">需求文档 变更次数</div>
          <div className="text-lg font-semibold text-text-primary">{prdChangeCount}</div>
        </div>
        <div className="bg-white rounded-card border border-border p-4">
          <div className="text-xs text-text-tertiary mb-2">冻结后变更比例</div>
          <div className="text-lg font-semibold text-text-primary">{freezeChangeRatio}%</div>
        </div>
        <div className="bg-white rounded-card border border-border p-4">
          <div className="text-xs text-text-tertiary mb-2">UI 重做次数</div>
          <div className="text-lg font-semibold text-text-primary">{uiRedoCount}</div>
        </div>
        <div className="bg-white rounded-card border border-border p-4">
          <div className="text-xs text-text-tertiary mb-2">落地周期</div>
          <div className="text-lg font-semibold text-text-primary">{landingCycleDays} 天</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-4 mb-4 border-b border-border">
        <button
          onClick={() => setActiveTab('prd')}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            activeTab === 'prd'
              ? 'text-primary'
              : 'text-text-tertiary hover:text-text-primary'
          }`}
        >
          <div className="flex items-center gap-2">
            <FileText size={16} />
            关联需求 ({relatedPRDs.length})
          </div>
          {activeTab === 'prd' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('ui')}
          className={`px-4 py-2 text-sm font-medium transition-colors relative ${
            activeTab === 'ui'
              ? 'text-primary'
              : 'text-text-tertiary hover:text-text-primary'
          }`}
        >
          <div className="flex items-center gap-2">
            <Palette size={16} />
            关联设计 ({relatedUIDesigns.length})
          </div>
          {activeTab === 'ui' && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'prd' && (
          <div>
            <div className="flex justify-end gap-3 mb-4">
              <button
                onClick={() => navigate('/prd/create', { state: { projectId: project.id } })}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-card hover:bg-primary-hover"
              >
                <Plus size={16} />
                新建需求
              </button>
              <button
                onClick={() => setShowAddPRDModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm border border-primary text-primary rounded-card hover:bg-primary/5"
              >
                <Link2 size={16} />
                关联需求
              </button>
            </div>
            {relatedPRDs.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-text-tertiary">
                <p>暂无关联需求</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedPRDs.map(prd => (
                  <div
                    key={prd.id}
                    className="bg-white rounded-card border border-border p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3
                        className="font-medium text-text-primary line-clamp-1 cursor-pointer hover:text-primary flex-1"
                        onClick={() => navigate('/prd/create', { state: { editPRD: prd } })}
                      >
                        {prd.title}
                      </h3>
                      <button
                        onClick={() => handleRemovePRD(prd.id)}
                        className="p-1 text-text-tertiary hover:text-red-500"
                        title="取消关联"
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-text-tertiary">v{getCurrentVersionNumber(prd.versions, prd.currentVersionId)}</span>
                        <GovernanceBadge status={prd.governanceStatus} />
                        <span className="text-text-tertiary">变更 {Math.max(0, prd.versions.length - 1)} 次</span>
                      </div>
                      <button
                        onClick={() => handleTogglePRDFreeze(prd)}
                        className="text-xs text-primary hover:text-primary-hover"
                      >
                        {prd.governanceStatus === 'frozen' ? '解冻' : '冻结'}
                      </button>
                    </div>
                    <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                      {prd.description}
                    </p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-text-tertiary">{prd.createdAt}</span>
                      <span
                        className={`px-2 py-1 rounded-full ${
                          prd.status === 'completed'
                            ? 'bg-green-50 text-green-600'
                            : 'bg-yellow-50 text-yellow-600'
                        }`}
                      >
                        {prd.status === 'completed' ? '已完成' : '进行中'}
                      </span>
                    </div>
                    <VersionHistory
                      title={prd.title}
                      type="prd"
                      currentVersionId={prd.currentVersionId}
                      versions={prd.versions}
                      changeRequests={prd.changeRequests}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'ui' && (
          <div>
            <div className="flex justify-end gap-3 mb-4">
              <button
                onClick={() => navigate('/ui/create', { state: { projectId: project.id } })}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-card hover:bg-primary-hover"
              >
                <Plus size={16} />
                新建设计
              </button>
              <button
                onClick={() => setShowAddUIModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm border border-primary text-primary rounded-card hover:bg-primary/5"
              >
                <Link2 size={16} />
                关联设计
              </button>
            </div>
            {relatedUIDesigns.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-text-tertiary">
                <p>暂无关联设计</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {relatedUIDesigns.map(ui => (
                  <div
                    key={ui.id}
                    className="bg-white rounded-card border border-border hover:shadow-md transition-shadow"
                  >
                    <div
                      className="h-32 bg-bg-light flex items-center justify-center cursor-pointer overflow-hidden rounded-t-card"
                      onClick={() => navigate('/ui/create', { state: { editDesign: ui } })}
                    >
                      {ui.thumbnail ? (
                        <img src={ui.thumbnail} alt={ui.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full p-3 flex items-center justify-center">
                          <div className="w-20 h-24 bg-white rounded-card shadow-sm overflow-hidden border border-border">
                            <div className="h-6 bg-primary"></div>
                            <div className="p-2 space-y-1">
                              <div className="w-4 h-4 bg-gray-100 rounded-full mx-auto -mt-3 border-2 border-white"></div>
                              <div className="h-1 bg-gray-100 rounded w-full mt-1"></div>
                              <div className="h-1 bg-gray-100 rounded w-full"></div>
                              <div className="h-3 bg-primary/20 rounded w-full mt-1"></div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3
                          className="font-medium text-text-primary line-clamp-1 cursor-pointer hover:text-primary flex-1"
                          onClick={() => navigate('/ui/create', { state: { editDesign: ui } })}
                        >
                          {ui.title}
                        </h3>
                        <button
                          onClick={() => handleRemoveUI(ui.id)}
                          className="p-1 text-text-tertiary hover:text-red-500"
                          title="取消关联"
                        >
                          <X size={14} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-text-tertiary">v{getCurrentVersionNumber(ui.versions, ui.currentVersionId)}</span>
                          <GovernanceBadge status={ui.governanceStatus} />
                          <span className="text-text-tertiary">变更 {Math.max(0, ui.versions.length - 1)} 次</span>
                        </div>
                        <button
                          onClick={() => handleToggleUIFreeze(ui)}
                          className="text-xs text-primary hover:text-primary-hover"
                        >
                          {ui.governanceStatus === 'frozen' ? '解冻' : '冻结'}
                        </button>
                      </div>
                      <p className="text-sm text-text-secondary line-clamp-2 mb-3">
                        {ui.description}
                      </p>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-tertiary">{ui.tool}</span>
                        <span
                          className={`px-2 py-1 rounded-full ${
                            ui.status === 'completed'
                              ? 'bg-green-50 text-green-600'
                              : 'bg-yellow-50 text-yellow-600'
                          }`}
                        >
                          {ui.status === 'completed' ? '已完成' : '进行中'}
                        </span>
                      </div>
                      <VersionHistory
                        title={ui.title}
                        type="ui"
                        currentVersionId={ui.currentVersionId}
                        versions={ui.versions}
                        changeRequests={ui.changeRequests}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add PRD Modal */}
      {showAddPRDModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-card w-[600px] max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-text-primary">选择需求</h2>
              <button
                onClick={() => setShowAddPRDModal(false)}
                className="p-1 text-text-tertiary hover:text-text-primary"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              {availablePRDs.length === 0 ? (
                <p className="text-center text-text-tertiary">暂无可关联的需求</p>
              ) : (
                <div className="space-y-2">
                  {availablePRDs.map(prd => (
                    <button
                      key={prd.id}
                      onClick={() => handleAddPRD(prd.id)}
                      className="w-full text-left p-4 border border-border rounded-card hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      <h3 className="font-medium text-text-primary mb-1">{prd.title}</h3>
                      <p className="text-sm text-text-secondary line-clamp-2">{prd.description}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add UI Modal */}
      {showAddUIModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-card w-[600px] max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-text-primary">选择设计</h2>
              <button
                onClick={() => setShowAddUIModal(false)}
                className="p-1 text-text-tertiary hover:text-text-primary"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              {availableUIDesigns.length === 0 ? (
                <p className="text-center text-text-tertiary">暂无可关联的设计</p>
              ) : (
                <div className="space-y-2">
                  {availableUIDesigns.map(ui => (
                    <button
                      key={ui.id}
                      onClick={() => handleAddUI(ui.id)}
                      className="w-full text-left p-4 border border-border rounded-card hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      <h3 className="font-medium text-text-primary mb-1">{ui.title}</h3>
                      <p className="text-sm text-text-secondary line-clamp-2">{ui.description}</p>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
