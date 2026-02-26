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
  Link2,
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
import type { UIDesignItem } from '../types';

type UIStatusFilter = 'all' | 'in_progress' | 'completed';
type ProjectFilter = 'all' | 'unassigned' | string;

export default function UIList() {
  const navigate = useNavigate();
  const { uiDesignList, projectList, deleteUIDesign, updateUIDesign, showToast } = useApp();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<UIStatusFilter>('all');
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [viewingDesign, setViewingDesign] = useState<UIDesignItem | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; item: UIDesignItem | null }>({
    isOpen: false,
    item: null
  });
  const [showProjectModal, setShowProjectModal] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectFilter>('all');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // 模拟加载状态
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  // 点击外部关闭菜单
  const closeMenu = useCallback(() => setActiveMenu(null), []);
  const menuRef = useClickOutside<HTMLDivElement>(closeMenu);

  // ESC 键关闭菜单和弹窗
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenu(null);
        setViewingDesign(null);
        setMobileDrawerOpen(false);
      }
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, []);

  // 按项目分组统计
  const projectStats = useMemo(() => {
    const stats: Record<string, number> = {};
    uiDesignList.forEach(ui => {
      const pid = ui.projectId || 'unassigned';
      stats[pid] = (stats[pid] || 0) + 1;
    });
    return stats;
  }, [uiDesignList]);

  // 有设计的项目列表
  const projectsWithDesigns = useMemo(() => {
    return projectList.filter(p => projectStats[p.id] > 0);
  }, [projectList, projectStats]);

  // 根据选中项目 + 搜索 + 状态筛选
  const filteredList = useMemo(() => {
    return uiDesignList.filter(item => {
      // 项目筛选
      if (selectedProject === 'unassigned' && item.projectId) return false;
      if (selectedProject !== 'all' && selectedProject !== 'unassigned' && item.projectId !== selectedProject) return false;
      // 搜索
      const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           item.description.toLowerCase().includes(searchQuery.toLowerCase());
      // 状态
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [uiDesignList, selectedProject, searchQuery, statusFilter]);

  // 获取当前选中项目的名称
  const selectedProjectName = useMemo(() => {
    if (selectedProject === 'all') return '全部项目';
    if (selectedProject === 'unassigned') return '未关联项目';
    return projectList.find(p => p.id === selectedProject)?.title || '';
  }, [selectedProject, projectList]);

  const handleDeleteClick = (item: UIDesignItem) => {
    setDeleteConfirm({ isOpen: true, item });
    setActiveMenu(null);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm.item) {
      deleteUIDesign(deleteConfirm.item.id);
      showToast('success', 'UI设计已删除');
    }
    setDeleteConfirm({ isOpen: false, item: null });
  };

  const handleDeleteCancel = () => {
    setDeleteConfirm({ isOpen: false, item: null });
  };

  const handleView = (item: UIDesignItem) => {
    setViewingDesign(item);
    setActiveMenu(null);
  };

  const handleEdit = (item: UIDesignItem) => {
    navigate('/ui/create', { state: { editDesign: item } });
    setActiveMenu(null);
  };

  const handleDownload = (item: UIDesignItem) => {
    showToast('success', `${item.title} 已开始下载`);
    setActiveMenu(null);
  };

  const handleLinkProject = (uiId: string, projectId: string) => {
    const project = projectList.find(p => p.id === projectId);
    updateUIDesign(uiId, { projectId });
    showToast('success', `已关联到项目「${project?.title}」`);
    setShowProjectModal(null);
  };

  const handleUnlinkProject = (uiId: string) => {
    updateUIDesign(uiId, { projectId: undefined });
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

  // 渲染设计卡片
  const renderDesignCard = (item: UIDesignItem) => (
    <div
      key={item.id}
      className="bg-white rounded-card border border-border hover:shadow-md transition-shadow"
    >
      {/* Thumbnail */}
      <div
        className="h-36 bg-bg-light flex items-center justify-center cursor-pointer overflow-hidden rounded-t-card"
        onClick={() => handleView(item)}
        role="button"
        tabIndex={0}
        aria-label={`查看 ${item.title}`}
        onKeyDown={(e) => e.key === 'Enter' && handleView(item)}
      >
        {item.thumbnail ? (
          <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full p-3 flex items-center justify-center">
            <div className="w-20 h-28 bg-white rounded-card shadow-sm overflow-hidden border border-border">
              <div className="h-6 bg-primary"></div>
              <div className="p-1.5 space-y-1">
                <div className="w-5 h-5 bg-gray-100 rounded-full mx-auto -mt-3 border-2 border-white"></div>
                <div className="h-1 bg-gray-100 rounded w-full mt-1"></div>
                <div className="h-1 bg-gray-100 rounded w-full"></div>
                <div className="h-3 bg-primary/20 rounded w-full mt-0.5"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <div className="flex items-start justify-between mb-1.5">
          <h3
            className="font-medium text-sm text-text-primary line-clamp-1 cursor-pointer hover:text-primary"
            onClick={() => handleView(item)}
          >
            {item.title}
          </h3>
          <div className="relative" ref={activeMenu === item.id ? menuRef : undefined}>
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
              <div
                className="absolute right-0 top-7 bg-white border border-border rounded-card shadow-lg py-1 z-50 min-w-[110px]"
                role="menu"
              >
                <button onClick={() => handleView(item)} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary hover:bg-bg-light" role="menuitem">
                  <Eye size={14} aria-hidden="true" /> 查看
                </button>
                <button onClick={() => handleEdit(item)} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary hover:bg-bg-light" role="menuitem">
                  <Edit size={14} aria-hidden="true" /> 编辑
                </button>
                <button onClick={() => handleDownload(item)} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-text-secondary hover:bg-bg-light" role="menuitem">
                  <Download size={14} aria-hidden="true" /> 下载
                </button>
                <button onClick={() => handleDeleteClick(item)} className="w-full flex items-center gap-2 px-3 py-1.5 text-sm text-red-500 hover:bg-red-50" role="menuitem">
                  <Trash2 size={14} aria-hidden="true" /> 删除
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-text-secondary line-clamp-2 mb-2">{item.description}</p>

        {/* PRD Link */}
        {item.prdTitle && (
          <div className="flex items-center gap-1 text-xs text-primary mb-2 cursor-pointer hover:underline">
            <Link2 size={11} aria-hidden="true" />
            <span className="line-clamp-1">{item.prdTitle}</span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs mb-2">
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 bg-bg-gray rounded-card text-text-tertiary text-[11px]">{item.tool}</span>
            <span className="text-text-tertiary flex items-center gap-0.5">
              <Clock size={11} aria-hidden="true" />
              {item.createdAt}
            </span>
          </div>
          <span className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[11px] ${
            item.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
          }`}>
            {item.status === 'completed' ? <CheckCircle size={11} aria-hidden="true" /> : <Clock size={11} aria-hidden="true" />}
          </span>
        </div>

        {/* Project Ownership */}
        <div className="flex items-center gap-1.5">
          {item.projectId ? (
            <>
              <div className="flex items-center gap-1 text-xs">
                <button
                  onClick={() => setShowProjectModal(item.id)}
                  className="flex items-center gap-1 px-1.5 py-0.5 border border-blue-200 bg-blue-50 text-blue-600 rounded hover:bg-blue-100 transition-colors text-[11px]"
                >
                  <FolderKanban size={11} />
                  <span className="line-clamp-1 max-w-[80px]">{getProjectById(item.projectId)?.title || '未知项目'}</span>
                </button>
              </div>
              <button
                onClick={() => handleUnlinkProject(item.id)}
                className="p-0.5 text-text-tertiary hover:text-red-500 transition-colors"
                title="取消关联"
              >
                <X size={11} />
              </button>
            </>
          ) : (
            <button
              onClick={() => setShowProjectModal(item.id)}
              className="flex items-center gap-1 px-1.5 py-0.5 text-[11px] border border-dashed border-gray-300 text-text-tertiary rounded hover:border-primary hover:text-primary transition-colors"
            >
              <FolderKanban size={11} />
              <span>关联项目</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );

  // 左侧项目列表渲染
  const renderProjectSidebar = () => (
    <nav className="h-full flex flex-col" aria-label="项目筛选">
      <div className="px-3 py-2 border-b border-border">
        <h3 className="text-sm font-semibold text-text-primary flex items-center gap-1.5">
          <Layers size={15} className="text-primary" />
          项目筛选
        </h3>
      </div>
      <div className="flex-1 overflow-auto py-1">
        {/* 全部项目 */}
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
            全部项目
          </span>
          <span className="text-xs bg-bg-gray px-1.5 py-0.5 rounded-full">{uiDesignList.length}</span>
        </button>

        {/* 各项目 */}
        {projectsWithDesigns.map(project => (
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

        {/* 未关联项目 */}
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
      {/* 主体区域：左右分栏 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 左侧项目列表 - 桌面端 */}
        <div className="hidden lg:flex w-56 xl:w-64 flex-shrink-0 bg-white border-r border-border">
          {renderProjectSidebar()}
        </div>

        {/* 移动端抽屉遮罩 */}
        {mobileDrawerOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setMobileDrawerOpen(false)}
          />
        )}

        {/* 移动端抽屉 */}
        <div className={`fixed inset-y-0 left-0 w-64 bg-white z-50 transform transition-transform lg:hidden ${
          mobileDrawerOpen ? 'translate-x-0' : '-translate-x-full'
        }`}>
          <div className="flex items-center justify-between px-3 py-3 border-b border-border">
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
              {/* 移动端菜单按钮 */}
              <button
                onClick={() => setMobileDrawerOpen(true)}
                className="p-1.5 text-text-tertiary hover:text-text-primary lg:hidden"
                aria-label="打开项目筛选"
              >
                <Menu size={18} />
              </button>

              {/* 当前项目标题 */}
              <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
                {selectedProjectName}
                <span className="text-sm font-normal text-text-tertiary">({filteredList.length})</span>
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {/* Search */}
              <div className="relative hidden sm:block">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-text-tertiary" aria-hidden="true" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索设计..."
                  aria-label="搜索UI设计"
                  className="pl-8 pr-3 py-1.5 w-48 border border-border rounded-card text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
              </div>

              {/* Filter */}
              <div className="flex items-center gap-1.5">
                <Filter size={14} className="text-text-tertiary" aria-hidden="true" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as UIStatusFilter)}
                  aria-label="筛选状态"
                  className="px-2 py-1.5 border border-border rounded-card text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                >
                  <option value="all">全部状态</option>
                  <option value="in_progress">进行中</option>
                  <option value="completed">已完成</option>
                </select>
              </div>

              {/* New Button */}
              <button
                onClick={() => navigate('/ui/create')}
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-primary text-white rounded-card hover:bg-primary-hover"
              >
                <Plus size={14} aria-hidden="true" />
                <span className="hidden sm:inline">新建设计</span>
              </button>
            </div>
          </div>

          {/* Card Grid */}
          <div className="flex-1 overflow-auto p-4">
            {isLoading ? (
              <ListSkeleton count={8} type="ui" />
            ) : filteredList.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-text-tertiary">
                {selectedProject !== 'all' ? (
                  <>
                    <FolderKanban size={48} className="mb-3 text-gray-300" />
                    <p className="mb-2">该项目下暂无设计</p>
                    <button
                      onClick={() => navigate('/ui/create')}
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      <Plus size={14} /> 点击添加设计
                    </button>
                  </>
                ) : (
                  <p>暂无UI设计记录</p>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4">
                {filteredList.map(item => renderDesignCard(item))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* View Design Modal */}
      {viewingDesign && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="view-design-title"
        >
          <div className="bg-white rounded-card w-[600px] max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border">
              <h2 id="view-design-title" className="text-lg font-semibold text-text-primary">{viewingDesign.title}</h2>
              <button
                onClick={() => setViewingDesign(null)}
                className="p-1 text-text-tertiary hover:text-text-primary"
                aria-label="关闭弹窗"
              >
                <X size={20} aria-hidden="true" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-6">
              <div className="bg-bg-light rounded-card flex items-center justify-center h-80 mb-4">
                {viewingDesign.thumbnail ? (
                  <img src={viewingDesign.thumbnail} alt={viewingDesign.title} className="max-h-full rounded-card" />
                ) : (
                  <div className="w-48 h-64 bg-white rounded-card shadow-sm overflow-hidden border border-border">
                    <div className="h-16 bg-primary relative">
                      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2">
                        <div className="w-12 h-12 bg-white rounded-full shadow flex items-center justify-center">
                          <div className="w-10 h-10 bg-primary rounded-full"></div>
                        </div>
                      </div>
                    </div>
                    <div className="pt-8 px-4 pb-4 space-y-3">
                      <div className="h-2 bg-gray-200 rounded w-20 mx-auto"></div>
                      <div className="h-8 bg-gray-100 rounded-card"></div>
                      <div className="h-8 bg-gray-100 rounded-card"></div>
                      <div className="h-8 bg-primary/80 rounded-card"></div>
                      <div className="flex justify-center gap-3 pt-2">
                        <div className="w-8 h-8 bg-green-100 rounded-full"></div>
                        <div className="w-8 h-8 bg-blue-100 rounded-full"></div>
                        <div className="w-8 h-8 bg-gray-100 rounded-full"></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                <div>
                  <span className="text-sm text-text-tertiary">描述：</span>
                  <p className="text-sm text-text-secondary">{viewingDesign.description}</p>
                </div>
                {viewingDesign.prdTitle && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-text-tertiary">关联PRD：</span>
                    <span className="text-sm text-primary">{viewingDesign.prdTitle}</span>
                  </div>
                )}
                <div className="flex items-center gap-4">
                  <span className="text-sm text-text-tertiary">工具：{viewingDesign.tool}</span>
                  <span className="text-sm text-text-tertiary">创建时间：{viewingDesign.createdAt}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-border">
              <button
                onClick={() => handleDownload(viewingDesign)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-text-secondary border border-border rounded-card hover:border-primary hover:text-primary"
              >
                <Download size={16} aria-hidden="true" /> 下载
              </button>
              <button
                onClick={() => { handleEdit(viewingDesign); setViewingDesign(null); }}
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
                {uiDesignList.find(u => u.id === showProjectModal)?.projectId ? '更改项目' : '选择项目'}
              </h2>
              <button
                onClick={() => setShowProjectModal(null)}
                className="p-1 text-text-tertiary hover:text-text-primary"
              >
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
