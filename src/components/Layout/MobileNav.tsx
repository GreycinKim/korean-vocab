import { GraduationCap, Home, FolderOpen } from 'lucide-react';
import type { Page } from '../../types';
import styles from './MobileNav.module.css';

const TABS: { id: Page; label: string; icon: typeof Home }[] = [
  { id: 'home', label: 'Study', icon: Home },
  { id: 'structure', label: 'Structure', icon: GraduationCap },
  { id: 'library', label: 'Library', icon: FolderOpen },
];

interface MobileNavProps {
  page: Page;
  onNavigate: (page: Page) => void;
}

export function MobileNav({ page, onNavigate }: MobileNavProps) {
  const activePage = page === 'flashcards' ? 'home' : page;

  return (
    <nav className={styles.nav} aria-label="Mobile navigation">
      {TABS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          type="button"
          className={`${styles.tab} ${activePage === id ? styles.tabActive : ''}`}
          onClick={() => onNavigate(id)}
          aria-current={activePage === id ? 'page' : undefined}
        >
          <Icon size={22} strokeWidth={page === id ? 2.25 : 2} />
          <span>{label}</span>
        </button>
      ))}
    </nav>
  );
}
