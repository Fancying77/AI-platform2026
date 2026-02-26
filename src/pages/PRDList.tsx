import { useState, useCallback, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Filter,
  Edit,
  Eye,
  Download,
  Trash2,
  MoreVertical,
  Clock,
  CheckCircle,
  Plus,
  X,
  FolderKanban,
  Layers,
  Menu
} from 'lucide-react';
import { useApp } from '../store/AppContext';
import { useClickOutside } from '../hooks/useClickOutside';
import ConfirmDialog from '../components/ConfirmDialog';
import { ListSkeleton } from '../components/Skeleton';
import type { PRDItem } from '../types';

type PRDStatusFilter = 'all' | 'in_progress' | 'completed';
type ProjectFilter = 'all' | 'unassigned' | string;

export default function PRDList() {
  const navigate = useNavigate();
  const { prdList, projectList, deletePRD, updatePRD, showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<PRDStatusFilter>('all');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [viewingPRD, setViewingPRD] = useState<PRDItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; item: PRDItem | null }>({
    isOpen: false,
    item: null
  });
  const [showProjectModal, setShowProjectModal] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectFilter>('all');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const closeMenu = useCallback(() => setActiveMenu(null), []);
  const menuRef = useClickOutside<HTMLDivElement>(closeMenu);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenu(null);
        setViewingPRD(null);
        setMobileDrawerOpen(false);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  // 按项目分组统计
  const projectStats = useMemo(() => {
    const stats: Record<string, number> = {};
    prdList.forEach(prd => {
      const pid = prd.projectId || 'unassigned';
      stats[pid] = (stats[pid] || 0) + 1;
    });
    return stats;
  }, [prdList]);

  const projectsWithPRDs = useMemo(() => {
    return projectList.filter(p => projectStats[p.id] > 0);
  }, [projectList, projectStats]);

  // 根据选中项目 + 搜索 + 状态筛选
  const filteredList = useMemo(() => {
    return prdList.filter(item => {
      if (selectedProject === 'unassigned' && item.projectId) return false;
      if (selectedProject !== 'all' && selectedProject !== 'unassigned' && item.projectId !== selectedProject) return false;
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [prdList, selectedProject, searchQuery, statusFilter]);

  const selectedProjectName = useMemo(() => {
    if (selectedProject === 'all') return '全部需求';
    if (selectedProject === 'unassigned') return '未关联项目';
    return projectList.find(p => p.id === selectedProject)?.title || '';
  }, [selectedProject, projectList]);

  const handleDeleteClick = (item: PRDItem) => {
    setDeleteConfirm({ isOpen: true, item });
    setActiveMenu(null);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm.item) {
      deletePRD(deleteConfirm.item.id);
      showToast('success', '需求文档已删除');
    }
    setDeleteConfirm({ isOpen: false, item: null });
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ isOpen: false, item: null });
  };

  const handleExport = (item: PRDItem) => {
    const blob = new Blob([item.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.title}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', '需求文档已导出');
    setActiveMenu(null);
  };

  const handleView = (item: PRDItem) => {
    setViewingPRD(item);
    setActiveMenu(null);
  };

  const handleEdit = (item: PRDItem) => {
    navigate('/prd/create', { state: { editPRD: item } });
    setActiveMenu(null);
  };

  const handleLinkProject = (prdId: string, projectId: string) => {
    const project = projectList.find(p => p.id === projectId);
    updatePRD(prdId, { projectId });
    showToast('success', `已关联到项目「${project?.title}」`);
    setShowProjectModal(null);
  };

  const handleUnlinkProject = (prdId: string) => {
    updatePRD(prdId, { projectId: undefined });
    showToast('success', '已取消关联');
  };

  const getProjectById = (projectId?: string) => {
    if (!projectId) return null;
    return projectList.find(p => p.id === projectId);
  };

  const handleProjectSelect = (projectId: ProjectFilter) => {
    setSelectedProject(projectId);
    setMobileDrawerOpen(false);
  };

  // 渲染需求卡片
  const renderPRDCard = (item: PRDItem) => (
    <div
      key={item.id}
      className="bg-white rounded-card border border-border p-4 hover:shadow-md transition-shadow cursor-pointer"
      onClick={() => handleEdit(item)}
    >
      <div className="flex items-start justify-between mb-2">
        <h3
          className="font-medium text-sm text-text-primary line-clamp-1 cursor-pointer hover:text-primary"
          onClick={(e) => {
            e.stopPropagation();
            handleView(item);
          }}
        >
          {item.title}
        </h3>
        <div className="relative" ref={activeMenu === item.id ? menuRef : undefined} onClick={e => e.stopPropagation()}>
          <button
            onClick={() => setActiveMenu(activeMenu === item.id ? null : item.id)}
            className="p-1 text-text-tertiary hover:text-text-primary"
            aria-label="更多操作"
            aria-expanded={activeMenu === item.id}
            aria-haspopup="menu"
          >
            <MoreVertical size={14} aria-hidden="true" />
          </button>
          {activeMenu === item.id && (
            <div className="absolute right-0 top-7 bg-white border border-border rounded-card shadow-lg py-1 z-50 min-w-[110px]" role="menu">
              <button onClick={() => handleView(item)} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary hover:bg-bg-light" role="menuitem">
                <Eye size={14} aria-hidden="true" /> 查看
              </button>
              <button onClick={() => handleEdit(item)} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary hover:bg-bg-light" role="menuitem">
                <Edit size={14} aria-hidden="true" /> 编辑
              </button>
              <button onClick={() => handleExport(item)} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary hover:bg-bg-light" role="menuitem">
                <Download size={14} aria-hidden="true" /> 导出
              </button>
              <button onClick={() => handleDeleteClick(item)} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary hover:bg-bg-light" role="menuitem">
                <Trash2 size={14} aria-hidden="true" /> 删除
              </button>
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-text-secondary line-clamp-2 mb-2">{item.description}</p>

      {/* 元信息标签 */}
      {(item.requirementName || item.priority || item.source) && (
        <div className="flex flex-wrap items-center gap-1.5 mb-2">
          {item.requirementName && (
            <span className="text-xs px-1.5 py-0.5 bg-primary-light text-primary rounded">{item.requirementName}</span>
          )}
          {item.priority && (
            <span className="text-xs px-1.5 py-0.5 rounded font-medium bg-bg-gray text-text-secondary">{item.priority}</span>
          )}
          {item.source && (
            <span className="text-xs px-1.5 py-0.5 bg-bg-gray text-text-secondary rounded">{item.source}</span>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-xs mb-2">
        <div className="flex items-center gap-1 text-text-tertiary">
          <Clock size={11} aria-hidden="true" />
          <span>{item.updatedAt || item.createdAt}</span>
        </div>
        <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded text-xs bg-bg-gray text-text-secondary">
          {item.status === 'completed' ? (
            <><CheckCircle size={12} aria-hidden="true" /> 已完成</>
          ) : (
            <><Clock size={12} aria-hidden="true" /> 进行中</>
          )}
        </span>
      </div>

      {/* Project Ownership */}
      <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
        {item.projectId ? (
          <>
            <div className="flex items-center gap-1 text-xs">
              <button
                onClick={() => setShowProjectModal(item.id)}
                className="flex items-center gap-1 px-1.5 py-0.5 border border-border bg-bg-light text-text-secondary rounded hover:bg-bg-gray transition-colors text-xs"
              >
                <FolderKanban size={12} />
                <span className="line-clamp-1 max-w-[80px]">{getProjectById(item.projectId)?.title || '未知项目'}</span>
              </button>
            </div>
            <button
              onClick={() => handleUnlinkProject(item.id)}
              className="p-0.5 text-text-tertiary hover:text-text-primary transition-colors"
              title="取消关联"
            >
              <X size={12} />
            </button>
          </>
        ) : (
          <button
            onClick={() => setShowProjectModal(item.id)}
            className="flex items-center gap-1 px-1.5 py-0.5 text-xs border border-dashed border-border text-text-tertiary rounded hover:border-primary hover:text-primary transition-colors"
          >
            <FolderKanban size={12} />
            <span>关联项目</span>
          </button>
        )}
      </div>
    </div>
  );

  // 左侧项目列表
  const renderProjectSidebar = () => (
    <nav className="h-full flex flex-col" aria-label="项目筛选">
      <div className="px-3 py-2 border-b border-border">
        <h3 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
          <Layers size={15} className="text-primary" />
          项目筛选
        </h3>
      </div>
      <div className="flex-1 overflow-auto py-1">
        <button
          onClick={() => handleProjectSelect('all')}
          className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors ${
            selectedProject === 'all'
              ? 'bg-primary/10 text-primary font-medium border-r-2 border-primary'
              : 'text-text-secondary hover:bg-bg-light'
          }`}
        >
          <span className="flex items-center gap-2">
            <FolderKanban size={15} />
            全部需求
          </span>
          <span className="text-xs bg-bg-gray px-1.5 py-0.5 rounded-full">{prdList.length}</span>
        </button>

        {projectsWithPRDs.map(project => (
          <button
            key={project.id}
            onClick={() => handleProjectSelect(project.id)}
            className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors ${
              selectedProject === project.id
                ? 'bg-primary/10 text-primary font-medium border-r-2 border-primary'
                : 'text-text-secondary hover:bg-bg-light'
            }`}
          >
            <span className="flex items-center gap-2 min-w-0">
              <span className={`w-2 h-2 rounded-full flex-shrink-0 ${
                project.status === 'completed' ? 'bg-green-500' :
                project.status === 'in_progress' ? 'bg-blue-500' : 'bg-yellow-500'
              }`} />
              <span className="truncate">{project.title}</span>
            </span>
            <span className="text-xs bg-bg-gray px-1.5 py-0.5 rounded-full flex-shrink-0 ml-1">
              {projectStats[project.id] || 0}
            </span>
          </button>
        ))}

        <button
          onClick={() => handleProjectSelect('unassigned')}
          className={`w-full text-left px-3 py-2 text-sm flex items-center justify-between transition-colors ${
            selectedProject === 'unassigned'
              ? 'bg-primary/10 text-primary font-medium border-r-2 border-primary'
              : 'text-text-tertiary hover:bg-bg-light'
          }`}
        >
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-gray-300 flex-shrink-0" />
            未关联项目
          </span>
          <span className="text-xs bg-bg-gray px-1.5 py-0.5 rounded-full">
            {projectStats['unassigned'] || 0}
          </span>
        </button>
      </div>
    </nav>
  );

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧项目列表 - 桌面端 */}
        <div className="hidden lg:flex w-56 xl:w-64 flex-shrink-0 bg-white border-r border-border">
          {renderProjectSidebar()}
        </div>

        {/* 移动端抽屉遮罩 */}
        {mobileDrawerOpen && (
          <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setMobileDrawerOpen(false)} />
        )}

        {/* 移动端抽屉 */}
        <div className={`fixed inset-y-0 left-0 w-64 bg-white z-50 transform transition-transform lg:hidden ${
          mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex items-center justify-between px-3 py-2 border-b border-border">
            <h3 className="text-sm font-semibold text-text-primary">项目筛选</h3>
            <button onClick={() => setMobileDrawerOpen(false)} className="p-1 text-text-tertiary hover:text-text-primary">
              <X size={18} />
            </button>
          </div>
          {renderProjectSidebar()}
        </div>

        {/* 右侧卡片区域 */}
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-white flex-shrink-0">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setMobileDrawerOpen(true)}
                className="p-1.5 text-text-tertiary hover:text-text-primary lg:hidden"
                aria-label="打开项目筛选"
              >
                <Menu size={18} />
              </button>
              <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
                {selectedProjectName}
                <span className="text-sm font-normal text-text-tertiary">({filteredList.length})</span>
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative hidden sm:block">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary" aria-hidden="true" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索需求..."
                  aria-label="搜索需求文档"
                  className="pl-8 pr-3 py-1.5 w-48 border border-border rounded-card text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div className="flex items-center gap-1.5">
                <Filter size={14} className="text-text-tertiary" aria-hidden="true" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as PRDStatusFilter)}
                  aria-label="筛选状态"
                  className="px-2 py-1.5 border border-border rounded-card text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">全部状态</option>
                  <option value="in_progress">进行中</option>
                  <option value="completed">已完成</option>
                </select>
              </div>

              <button
                onClick={() => navigate('/prd/create')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary text-white rounded-card hover:bg-primary-hover"
              >
                <Plus size={14} aria-hidden="true" />
                <span className="hidden sm:inline">新建需求</span>
              </button>
            </div>
          </div>

          {/* Card Grid */}
          <div className="flex-1 overflow-auto p-4">
            {isLoading ? (
              <ListSkeleton count={6} type="prd" />
            ) : filteredList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-text-tertiary">
                {selectedProject !== 'all' ? (
                  <>
                    <FolderKanban size={48} className="mb-3 text-gray-300" />
                    <p className="mb-2">该项目下暂无需求</p>
                    <button
                      onClick={() => navigate('/prd/create')}
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      <Plus size={14} /> 点击添加需求
                    </button>
                  </>
                ) : (
                  <>
                    <FileText size={48} className="mb-3 text-gray-300" />
                    <p className="mb-2">暂无需求文档记录</p>
                    <button
                      onClick={() => navigate('/prd/create')}
                      className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-card hover:bg-primary-hover"
                    >
                      <Plus size={16} /> 创建第一个需求文档
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                {filteredList.map(item => renderPRDCard(item))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View PRD Modal */}
      {viewingPRD && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" role="dialog" aria-modal="true" aria-labelledby="view-prd-title">
          <div className="bg-white rounded-card w-[800px] max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 id="view-prd-title" className="text-lg font-semibold text-text-primary">{viewingPRD.title}</h2>
              <button onClick={() => setViewingPRD(null)} className="p-1 text-text-tertiary hover:text-text-primary" aria-label="关闭弹窗">
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <pre className="whitespace-pre-wrap text-sm text-text-secondary font-mono">{viewingPRD.content}</pre>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
              <button
                onClick={() => handleExport(viewingPRD)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary border border-border rounded-card hover:border-primary hover:text-primary"
              >
                <Download size={16} aria-hidden="true" /> 导出
              </button>
              <button
                onClick={() => { handleEdit(viewingPRD); setViewingPRD(null); }}
                className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white rounded-card hover:bg-primary-hover"
              >
                <Edit size={16} aria-hidden="true" /> 编辑
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* Project Selection Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-card w-[600px] max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 className="text-lg font-semibold text-text-primary">
                {prdList.find(p => p.id === showProjectModal)?.projectId ? '更改项目' : '选择项目'}
              </h2>
              <button onClick={() => setShowProjectModal(null)} className="p-1 text-text-tertiary hover:text-text-primary">
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              {projectList.length === 0 ? (
                <p className="text-center text-text-tertiary">暂无项目，请先创建项目</p>
              ) : (
                <div className="space-y-2">
                  {projectList.map(project => (
                    <button
                      key={project.id}
                      onClick={() => handleLinkProject(showProjectModal, project.id)}
                      className="w-full text-left p-4 border border-border rounded-card hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <FolderKanban size={16} className="text-primary" />
                        <h3 className="font-medium text-text-primary">{project.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          project.status === 'completed' ? 'bg-green-50 text-green-600' :
                          project.status === 'in_progress' ? 'bg-blue-50 text-blue-600' :
                          'bg-yellow-50 text-yellow-600'
                        }`}>
                          {project.status === 'completed' ? '已完成' :
                           project.status === 'in_progress' ? '进行中' : '规划中'}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary line-clamp-2">{project.description}</p>
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
}
