import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Toast from '../components/Toast';

export default function MainLayout() {
  const location = useLocation();
  const isCreatePage = location.pathname.endsWith('/create');

  return (
    <div className="flex h-screen bg-bg-light">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className={`flex-1 overflow-auto ${isCreatePage ? 'p-0' : 'p-6'}`}>
          <Outlet />
        </main>
      </div>
      <Toast />
    </div>
  );
}
