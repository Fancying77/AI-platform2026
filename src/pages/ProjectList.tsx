import { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Edit,
  Trash2,
  MoreVertical,
  Clock,
  CheckCircle,
  Plus,
  FileText,
  Palette,
  FolderKanban,
  ChevronDown,
  ChevronRight,
  X,
  Link2,
  Users,
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { useClickOutside } from '../hooks/useClickOutside';
import ConfirmDialog from '../components/ConfirmDialog';
import { ListSkeleton } from '../components/Skeleton';
import type { ProjectItem } from '../types';

type ProjectStatusFilter = 'all' | 'planning' | 'in_progress' | 'completed';

export const ProjectList = () => {
  const navigate = useNavigate();
  const { projectList, prdList, uiDesignList, deleteProject, updatePRD, updateUIDesign, showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatusFilter>('all');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; item: ProjectItem | null }>({
    isOpen: false,
    item: null
  });
  const [showAddPRDModal, setShowAddPRDModal] = useState<string | null>(null);
  const [showAddUIModal, setShowAddUIModal] = useState<string | null>(null);

  // 模拟加载状态
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // 点击外部关闭菜单
  const closeMenu = useCallback(() => setActiveMenu(null), []);
  const menuRef = useClickOutside<HTMLDivElement>(closeMenu);

  // ESC 键关闭菜单
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenu(null);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  // 切换项目展开/折叠
  const toggleProject = (projectId: string) => {
    setExpandedProjects(prev => {
      const newSet = new Set(prev);
      if (newSet.has(projectId)) {
        newSet.delete(projectId);
      } else {
        newSet.add(projectId);
      }
      return newSet;
    });
  };

  const filteredList = projectList.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // 获取项目关联的需求和设计
  const getProjectPRDs = (projectId: string) => {
    return prdList.filter(prd => prd.projectId === projectId);
  };

  const getProjectUIDesigns = (projectId: string) => {
    return uiDesignList.filter(ui => ui.projectId === projectId);
  };

  // 统计数据（聚焦项目维度）
  const stats = {
    totalProjects: projectList.length,
    inProgress: projectList.filter(p => p.status === 'in_progress').length,
    completed: projectList.filter(p => p.status === 'completed').length,
    totalMembers: new Set(projectList.flatMap(p => p.members || [])).size,
  };

  const handleDeleteClick = (item: ProjectItem) => {
    setDeleteConfirm({ isOpen: true, item });
    setActiveMenu(null);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm.item) {
      deleteProject(deleteConfirm.item.id);
      showToast('success', '项目已删除');
    }
    setDeleteConfirm({ isOpen: false, item: null });
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ isOpen: false, item: null });
  };

  const handleEdit = (item: ProjectItem) => {
    navigate('/projects/create', { state: { editProject: item } });
    setActiveMenu(null);
  };

  const handleRemovePRD = (prdId: string) => {
    updatePRD(prdId, { projectId: undefined });
    showToast('success', '已取消关联');
  };

  const handleRemoveUI = (uiId: string) => {
    updateUIDesign(uiId, { projectId: undefined });
    showToast('success', '已取消关联');
  };

  const handleAddPRD = (projectId: string, prdId: string) => {
    updatePRD(prdId, { projectId });
    showToast('success', '关联成功');
    setShowAddPRDModal(null);
  };

  const handleAddUI = (projectId: string, uiId: string) => {
    updateUIDesign(uiId, { projectId });
    showToast('success', '关联成功');
    setShowAddUIModal(null);
  };

  const getAvailablePRDs = (projectId: string) => {
    return prdList.filter(prd => !prd.projectId || prd.projectId !== projectId);
  };

  const getAvailableUIDesigns = (projectId: string) => {
    return uiDesignList.filter(ui => !ui.projectId || ui.projectId !== projectId);
  };

  const getStatusColor = (status: 'planning' | 'in_progress' | 'completed') => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-600';
      case 'in_progress':
        return 'bg-blue-50 text-blue-600';
      case 'planning':
        return 'bg-yellow-50 text-yellow-600';
    }
  };

  const getStatusText = (status: 'planning' | 'in_progress' | 'completed') => {
    switch (status) {
      case 'completed':
        return '已完成';
      case 'in_progress':
        return '进行中';
      case 'planning':
        return '规划中';
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* 统计卡片 - 紧凑布局 */}
      <div className="grid grid-cols-4 gap-3 mb-4">
        <div className="bg-white rounded-card border border-border px-3 py-2.5 flex items-center gap-2.5">
          <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
            <FolderKanban size={16} className="text-primary" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-text-tertiary leading-tight">总项目数</p>
            <p className="text-lg font-semibold text-text-primary leading-tight">{stats.totalProjects}</p>
          </div>
        </div>
        <div className="bg-white rounded-card border border-border px-3 py-2.5 flex items-center gap-2.5">
          <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <Clock size={16} className="text-blue-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-text-tertiary leading-tight">进行中</p>
            <p className="text-lg font-semibold text-text-primary leading-tight">{stats.inProgress}</p>
          </div>
        </div>
        <div className="bg-white rounded-card border border-border px-3 py-2.5 flex items-center gap-2.5">
          <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <CheckCircle size={16} className="text-green-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-text-tertiary leading-tight">已完成</p>
            <p className="text-lg font-semibold text-text-primary leading-tight">{stats.completed}</p>
          </div>
        </div>
        <div className="bg-white rounded-card border border-border px-3 py-2.5 flex items-center gap-2.5">
          <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
            <Users size={16} className="text-purple-600" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-text-tertiary leading-tight">参与成员</p>
            <p className="text-lg font-semibold text-text-primary leading-tight">{stats.totalMembers}</p>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" aria-hidden="true" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索项目..."
              aria-label="搜索项目"
              className="pl-10 pr-4 py-2 w-64 border border-border rounded-card text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          {/* Filter */}
          <div className="flex items-center gap-2">
            <Filter size={16} className="text-text-tertiary" aria-hidden="true" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as ProjectStatusFilter)}
              aria-label="筛选状态"
              className="px-3 py-2 border border-border rounded-card text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            >
              <option value="all">全部状态</option>
              <option value="planning">规划中</option>
              <option value="in_progress">进行中</option>
              <option value="completed">已完成</option>
            </select>
          </div>
        </div>

        <div className="text-sm text-text-secondary">
          共 {filteredList.length} 个项目
        </div>

        {/* New Button */}
        <button
          onClick={() => navigate('/projects/create')}
          className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-card hover:bg-primary-hover"
        >
          <Plus size={16} aria-hidden="true" />
          新建项目
        </button>
      </div>

      {/* Tree List */}
      <div className="flex-1 overflow-auto">
        {isLoading ? (
          <ListSkeleton count={6} type="prd" />
        ) : filteredList.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-tertiary">
            <p>暂无项目记录</p>
          </div>
        ) : (
          <div className="bg-white rounded-card border border-border">
            {filteredList.map((project, index) => {
              const projectPRDs = getProjectPRDs(project.id);
              const projectUIDesigns = getProjectUIDesigns(project.id);
              const isExpanded = expandedProjects.has(project.id);

              return (
                <div key={project.id}>
                  {/* Project Row */}
                  <div className={`flex items-center gap-3 p-4 hover:bg-bg-light ${index !== 0 ? 'border-t border-border' : ''}`}>
                    {/* Expand/Collapse Button */}
                    <button
                      onClick={() => toggleProject(project.id)}
                      className="flex-shrink-0 p-1 hover:bg-gray-100 rounded"
                      aria-label={isExpanded ? '折叠' : '展开'}
                    >
                      {isExpanded ? (
                        <ChevronDown size={16} className="text-text-tertiary" />
                      ) : (
                        <ChevronRight size={16} className="text-text-tertiary" />
                      )}
                    </button>

                    {/* Project Icon */}
                    <FolderKanban size={18} className="flex-shrink-0 text-primary" />

                    {/* Project Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3
                          className="font-medium text-text-primary cursor-pointer hover:text-primary truncate"
                        onClick={() => navigate(`/projects/${project.id}`)}
                        >
                          {project.title}
                        </h3>
                        <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full ${getStatusColor(project.status)}`}>
                          {getStatusText(project.status)}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary truncate mt-1">{project.description}</p>
                      {project.members && project.members.length > 0 && (
                        <div className="flex items-center gap-1 mt-2">
                          <Users size={14} className="text-text-tertiary" />
                          <span className="text-xs text-text-tertiary">成员：</span>
                          <span className="text-xs text-text-primary">
                            {project.members.join(', ')}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-text-tertiary flex-shrink-0">
                      <div className="flex items-center gap-1">
                        <FileText size={14} />
                        <span>{projectPRDs.length}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Palette size={14} />
                        <span>{projectUIDesigns.length}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        <span>{project.updatedAt || project.createdAt}</span>
                      </div>
                    </div>

                    {/* Actions Menu */}
                    <div className="relative flex-shrink-0" ref={activeMenu === project.id ? menuRef : undefined}>
                      <button
                        onClick={() => setActiveMenu(activeMenu === project.id ? null : project.id)}
                        className="p-1 text-text-tertiary hover:text-text-primary"
                        aria-label="更多操作"
                        aria-expanded={activeMenu === project.id}
                        aria-haspopup="menu"
                      >
                        <MoreVertical size={16} aria-hidden="true" />
                      </button>
                      {activeMenu === project.id && (
                        <div
                          className="absolute right-0 top-8 bg-white border border-border rounded-card shadow-lg py-1 z-50 min-w-[120px]"
                          role="menu"
                        >
                          <button
                            onClick={() => handleEdit(project)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-text-secondary hover:bg-bg-light"
                            role="menuitem"
                          >
                            <Edit size={16} aria-hidden="true" />
                            编辑
                          </button>
                          <button
                            onClick={() => handleDeleteClick(project)}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50"
                            role="menuitem"
                          >
                            <Trash2 size={16} aria-hidden="true" />
                            删除
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Expanded Content: PRDs and UI Designs */}
                  {isExpanded && (
                    <div className="bg-bg-light border-t border-border p-4">
                      {/* PRDs Section */}
                      <div className="mb-4">
                        <div className="flex items-center justify-between mb-2 pl-10">
                          <div className="text-xs text-text-tertiary">需求文档 ({projectPRDs.length})</div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate('/prd/create', { state: { projectId: project.id } })}
                              className="flex items-center gap-1 px-2 py-1 text-xs bg-primary text-white rounded hover:bg-primary-hover"
                            >
                              <Plus size={12} />
                              新建需求
                            </button>
                            <button
                              onClick={() => setShowAddPRDModal(project.id)}
                              className="flex items-center gap-1 px-2 py-1 text-xs border border-primary text-primary rounded hover:bg-primary/5"
                            >
                              <Link2 size={12} />
                              关联需求
                            </button>
                          </div>
                        </div>
                        {projectPRDs.length > 0 ? (
                          <div className="space-y-1">
                            {projectPRDs.map(prd => (
                              <div
                                key={prd.id}
                                className="flex items-center gap-3 p-2 pl-10 bg-white rounded hover:shadow-sm"
                              >
                                <FileText size={16} className="flex-shrink-0 text-purple-600" />
                                <div
                                  className="flex-1 min-w-0 cursor-pointer"
                                  onClick={() => navigate(`/prd/${prd.id}`)}
                                >
                                  <p className="text-sm text-text-primary truncate">{prd.title}</p>
                                </div>
                                <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full ${getStatusColor(prd.status)}`}>
                                  {getStatusText(prd.status)}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemovePRD(prd.id);
                                  }}
                                  className="p-1 text-text-tertiary hover:text-red-500"
                                  title="取消关联"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-text-tertiary pl-10 py-2">暂无关联需求</div>
                        )}
                      </div>

                      {/* UI Designs Section */}
                      <div>
                        <div className="flex items-center justify-between mb-2 pl-10">
                          <div className="text-xs text-text-tertiary">UI设计 ({projectUIDesigns.length})</div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => navigate('/ui/create', { state: { projectId: project.id } })}
                              className="flex items-center gap-1 px-2 py-1 text-xs bg-primary text-white rounded hover:bg-primary-hover"
                            >
                              <Plus size={12} />
                              新建设计
                            </button>
                            <button
                              onClick={() => setShowAddUIModal(project.id)}
                              className="flex items-center gap-1 px-2 py-1 text-xs border border-primary text-primary rounded hover:bg-primary/5"
                            >
                              <Link2 size={12} />
                              关联设计
                            </button>
                          </div>
                        </div>
                        {projectUIDesigns.length > 0 ? (
                          <div className="space-y-1">
                            {projectUIDesigns.map(ui => (
                              <div
                                key={ui.id}
                                className="flex items-center gap-3 p-2 pl-10 bg-white rounded hover:shadow-sm"
                              >
                                <Palette size={16} className="flex-shrink-0 text-pink-600" />
                                <div
                                  className="flex-1 min-w-0 cursor-pointer"
                                  onClick={() => navigate(`/ui/${ui.id}`)}
                                >
                                  <p className="text-sm text-text-primary truncate">{ui.title}</p>
                                </div>
                                <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full ${getStatusColor(ui.status)}`}>
                                  {getStatusText(ui.status)}
                                </span>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveUI(ui.id);
                                  }}
                                  className="p-1 text-text-tertiary hover:text-red-500"
                                  title="取消关联"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className="text-sm text-text-tertiary pl-10 py-2">暂无关联设计</div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="确认删除"
        message={`确定要删除「${deleteConfirm.item?.title}」吗？此操作无法撤销。`}
        confirmText="删除"
        cancelText="取消"
        type="danger"
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* Add PRD Modal */}
      {showAddPRDModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-card w-[600px] max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-text-primary">选择需求</h2>
              <button
                onClick={() => setShowAddPRDModal(null)}
                className="p-1 text-text-tertiary hover:text-text-primary"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              {getAvailablePRDs(showAddPRDModal).length === 0 ? (
                <p className="text-center text-text-tertiary">暂无可关联的需求</p>
              ) : (
                <div className="space-y-2">
                  {getAvailablePRDs(showAddPRDModal).map(prd => (
                    <button
                      key={prd.id}
                      onClick={() => handleAddPRD(showAddPRDModal, prd.id)}
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
                onClick={() => setShowAddUIModal(null)}
                className="p-1 text-text-tertiary hover:text-text-primary"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              {getAvailableUIDesigns(showAddUIModal).length === 0 ? (
                <p className="text-center text-text-tertiary">暂无可关联的设计</p>
              ) : (
                <div className="space-y-2">
                  {getAvailableUIDesigns(showAddUIModal).map(ui => (
                    <button
                      key={ui.id}
                      onClick={() => handleAddUI(showAddUIModal, ui.id)}
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
