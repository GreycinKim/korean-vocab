import { Menu } from 'lucide-react';
import { SyncPanel } from '../Sync/SyncPanel';
import type { Page } from '../../types';
import styles from './Header.module.css';

const TITLES: Record<Page, string> = {
  home: 'Study',
  structure: 'Structure Lab',
  flashcards: 'Studying',
  library: 'Vocabulary Library',
};

interface HeaderProps {
  page: Page;
  onMenuClick: () => void;
}

export function Header({ page, onMenuClick }: HeaderProps) {
  return (
    <header className={styles.header}>
      <button
        type="button"
        className={styles.menuBtn}
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <Menu size={24} />
      </button>
      <h1 className={styles.title}>{TITLES[page]}</h1>
      <SyncPanel />
    </header>
  );
}
