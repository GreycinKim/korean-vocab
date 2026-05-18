import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { ChevronRight, ChevronDown } from 'lucide-react';
import type { Folder } from '../../types';
import { getFolderIcon } from '../../utils/icons';
import styles from './FolderItem.module.css';

interface FolderItemProps {
  folder: Folder;
  wordCount: number;
  selectedId: string;
  onSelect: (id: string) => void;
  childFolders?: Folder[];
}

export function FolderItem({
  folder,
  wordCount,
  selectedId,
  onSelect,
  childFolders = [],
}: FolderItemProps) {
  const selected = selectedId === folder.id;
  const [expanded, setExpanded] = useState(
    selected || childFolders.some((c) => c.id === selectedId),
  );
  const Icon = getFolderIcon(folder.icon);
  const hasChildren = childFolders.length > 0;

  const { setNodeRef, isOver } = useDroppable({
    id: `folder-${folder.id}`,
    data: { folderId: folder.id },
  });

  return (
    <div className={styles.folder}>
      <button
        ref={setNodeRef}
        type="button"
        className={`${styles.folderRow} ${selected ? styles.folderRowActive : ''} ${isOver ? styles.folderRowDropTarget : ''}`}
        onClick={() => onSelect(folder.id)}
      >
        {hasChildren ? (
          <span
            className={styles.chevron}
            onClick={(e) => {
              e.stopPropagation();
              setExpanded(!expanded);
            }}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.stopPropagation();
                setExpanded(!expanded);
              }
            }}
          >
            {expanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
          </span>
        ) : (
          <span className={styles.chevron} style={{ width: 16 }} />
        )}
        <span
          className={styles.iconWrap}
          style={{ background: `${folder.color}22`, color: folder.color }}
        >
          <Icon size={16} />
        </span>
        <span>{folder.name}</span>
        <span className={styles.badge}>{wordCount}</span>
      </button>
      {hasChildren && expanded && (
        <div className={styles.children}>
          {childFolders.map((child) => (
            <FolderItem
              key={child.id}
              folder={child}
              wordCount={child.wordIds.length}
              selectedId={selectedId}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}
