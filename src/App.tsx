import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './store/AppContext';
import { HeaderSlotProvider } from './store/HeaderSlotContext';
import MainLayout from './layouts/MainLayout';
import { Dashboard } from './pages/Dashboard';
import PRDList from './pages/PRDList';
import { PRDCreate } from './pages/PRDCreate';
import UIList from './pages/UIList';
import { UICreate } from './pages/UICreate';
import { ProjectList } from './pages/ProjectList';
import ProjectCreate from './pages/ProjectCreate';
import { ProjectDetail } from './pages/ProjectDetail';
import AINewsList from './pages/AINewsList';
import AINewsDetail from './pages/AINewsDetail';
import AINewsFavorites from './pages/AINewsFavorites';

export const App = () => {
  return (
    <AppProvider>
      <HeaderSlotProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="projects" element={<ProjectList />} />
            <Route path="projects/create" element={<ProjectCreate />} />
            <Route path="projects/:id" element={<ProjectDetail />} />
            <Route path="prd" element={<PRDList />} />
            <Route path="prd/create" element={<PRDCreate />} />
            <Route path="ui" element={<UIList />} />
            <Route path="ui/create" element={<UICreate />} />
            <Route path="ai-news" element={<AINewsList />} />
            <Route path="ai-news/:id" element={<AINewsDetail />} />
            <Route path="ai-news/favorites" element={<AINewsFavorites />} />
          </Route>
        </Routes>
      </BrowserRouter>
      </HeaderSlotProvider>
    </AppProvider>
  );
};
