import { useLocation } from 'react-router-dom';
import type { Page } from '../types';

export function usePageFromRoute(): Page {
  const { pathname } = useLocation();
  if (pathname.startsWith('/flashcards')) return 'flashcards';
  if (pathname.startsWith('/library')) return 'library';
  if (pathname.startsWith('/structure')) return 'structure';
  if (pathname === '/') return 'home';
  return 'home';
}

export function pathForPage(page: Page, folderId?: string): string {
  switch (page) {
    case 'flashcards':
    case 'home':
      return '/';
    case 'library':
      return folderId ? `/library/${folderId}` : '/library/church-vocab';
    case 'structure':
      return '/structure';
    default:
      return '/';
  }
}
