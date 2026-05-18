import { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { loadFromStorage, usePersistence } from '../../hooks/usePersistence';
import { usePageFromRoute, pathForPage } from '../../hooks/usePageFromRoute';
import { useVocabStore } from '../../store/vocabStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useStudySettingsStore } from '../../store/studySettingsStore';
import type { Page } from '../../types';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { ToastContainer } from '../Toast/Toast';
import layout from './Layout.module.css';

export function AppLayout() {
  const page = usePageFromRoute();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const initialize = useVocabStore((s) => s.initialize);
  const loadSettings = useSettingsStore((s) => s.loadSettings);
  const loadStudySettings = useStudySettingsStore((s) => s.load);

  useEffect(() => {
    loadFromStorage();
    initialize();
    loadSettings();
    loadStudySettings();
  }, [initialize, loadSettings, loadStudySettings]);

  usePersistence();

  const handleNavigate = (next: Page) => {
    navigate(pathForPage(next));
  };

  return (
    <div className={layout.app}>
      <Sidebar
        page={page}
        onNavigate={handleNavigate}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />
      <div className={layout.main}>
        <Header page={page} onMenuClick={() => setSidebarOpen(true)} />
        <main className={layout.content}>
          <Outlet />
        </main>
      </div>
      <MobileNav page={page} onNavigate={handleNavigate} />
      <ToastContainer />
    </div>
  );
}
