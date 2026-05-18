import { FolderOpen, BookMarked, GraduationCap, Home } from 'lucide-react';
import type { Page } from '../../types';
import styles from './Sidebar.module.css';

const NAV: { id: Page; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Study', icon: Home },
  { id: 'structure', label: 'Structure Lab', icon: GraduationCap },
  { id: 'library', label: 'Library', icon: FolderOpen },
];

interface SidebarProps {
  page: Page;
  onNavigate: (page: Page) => void;
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ page, onNavigate, open, onClose }: SidebarProps) {
  return (
    <>
      {open && (
        <div className={styles.overlay} onClick={onClose} aria-hidden />
      )}
      <aside
        className={`${styles.sidebar} ${open ? styles.sidebarOpen : ''}`}
        aria-label="Main navigation"
      >
        <div className={styles.logo}>
          <BookMarked className={styles.logoIcon} size={24} />
          <span>한국어 Vocab</span>
        </div>
        <nav className={styles.nav}>
          {NAV.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={`${styles.navItem} ${page === id ? styles.navItemActive : ''}`}
              onClick={() => {
                onNavigate(id);
                onClose();
              }}
            >
              <Icon size={20} />
              {label}
            </button>
          ))}
        </nav>
      </aside>
    </>
  );
}
