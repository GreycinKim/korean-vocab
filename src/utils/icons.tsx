import {
  BookOpen,
  Bookmark,
  Clock,
  MessageCircle,
  Folder,
  Hand,
  Utensils,
  Users,
  type LucideIcon,
} from 'lucide-react';

const ICON_MAP: Record<string, LucideIcon> = {
  'book-open': BookOpen,
  bookmark: Bookmark,
  clock: Clock,
  'message-circle': MessageCircle,
  folder: Folder,
  'hand-wave': Hand,
  utensils: Utensils,
  users: Users,
};

export function getFolderIcon(name: string): LucideIcon {
  return ICON_MAP[name] ?? Folder;
}
