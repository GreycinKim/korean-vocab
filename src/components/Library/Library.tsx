import { useRef, useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { useNavigate, useParams } from 'react-router-dom';
import { Plus, FolderPlus, Upload, Download, Search } from 'lucide-react';
import { useVocabStore } from '../../store/vocabStore';
import { useToastStore } from '../../store/toastStore';
import type { VocabWord } from '../../types';
import { FolderItem } from './FolderItem';
import { WordRow } from './WordRow';
import { AddWordModal } from './AddWordModal';
import styles from './Library.module.css';

const DEFAULT_FOLDER = 'church-vocab';

export function Library() {
  const { folderId: folderIdParam } = useParams<{ folderId: string }>();
  const navigate = useNavigate();

  const folders = useVocabStore((s) => s.folders);
  const getWordsByFolder = useVocabStore((s) => s.getWordsByFolder);
  const searchWords = useVocabStore((s) => s.searchWords);
  const deleteWord = useVocabStore((s) => s.deleteWord);
  const addFolder = useVocabStore((s) => s.addFolder);
  const importCSV = useVocabStore((s) => s.importCSV);
  const moveWordToFolder = useVocabStore((s) => s.moveWordToFolder);
  const addToast = useToastStore((s) => s.addToast);

  const selectedFolderId =
    folderIdParam && folders[folderIdParam] ? folderIdParam : DEFAULT_FOLDER;

  const [searchQuery, setSearchQuery] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editWord, setEditWord] = useState<VocabWord | null>(null);
  const [newFolderName, setNewFolderName] = useState('');
  const [showNewFolder, setShowNewFolder] = useState(false);
  const [draggingWord, setDraggingWord] = useState<VocabWord | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  const rootFolders = Object.values(folders).filter((f) => !f.parentId);
  const getChildren = (parentId: string) =>
    Object.values(folders).filter((f) => f.parentId === parentId);

  const displayWords = searchQuery.trim()
    ? searchWords(searchQuery)
    : getWordsByFolder(selectedFolderId);

  const selectFolder = (id: string) => {
    navigate(`/library/${id}`);
  };

  const handleDragStart = (e: DragStartEvent) => {
    const wordId = e.active.data.current?.wordId as string | undefined;
    if (wordId) {
      setDraggingWord(useVocabStore.getState().words[wordId] ?? null);
    }
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setDraggingWord(null);
    const wordId = e.active.data.current?.wordId as string | undefined;
    const targetFolderId = e.over?.data.current?.folderId as string | undefined;
    if (!wordId || !targetFolderId) return;

    const word = useVocabStore.getState().words[wordId];
    if (!word || word.folderId === targetFolderId) return;

    moveWordToFolder(wordId, targetFolderId);
    const folderName = folders[targetFolderId]?.name ?? 'folder';
    addToast(`Moved "${word.korean}" to ${folderName}`);
    if (selectedFolderId === word.folderId) {
      selectFolder(targetFolderId);
    }
  };

  const handleExport = () => {
    const words = getWordsByFolder(selectedFolderId);
    if (words.length === 0) {
      addToast('No words to export', 'info');
      return;
    }
    const lines = words.map(
      (w) => `${w.korean}\t${w.english}\t${w.pronunciation}${w.notes ? `\t${w.notes}` : ''}`,
    );
    const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${folders[selectedFolderId]?.name ?? 'vocab'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    addToast('Exported successfully');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const count = importCSV(String(reader.result), selectedFolderId);
        addToast(`Imported ${count} words`);
      } catch {
        addToast('Import failed', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const id = addFolder({
      name: newFolderName.trim(),
      icon: 'folder',
      color: '#6B7280',
      parentId: selectedFolderId,
    });
    addToast('Folder created');
    setNewFolderName('');
    setShowNewFolder(false);
    navigate(`/library/${id}`);
  };

  const handleDelete = (id: string) => {
    deleteWord(id);
    addToast('Word deleted', 'info');
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className={styles.library}>
        <aside className={styles.sidebar}>
          <p className={styles.dragHint}>Drag words onto a folder to move them</p>
          {rootFolders.map((folder) => (
            <FolderItem
              key={folder.id}
              folder={folder}
              wordCount={folder.wordIds.length}
              selectedId={selectedFolderId}
              onSelect={selectFolder}
              childFolders={getChildren(folder.id)}
            />
          ))}
          {showNewFolder ? (
            <div style={{ padding: '8px 12px', display: 'flex', gap: 8 }}>
              <input
                className={styles.search}
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
                placeholder="Folder name"
                onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
              />
              <button type="button" className={`${styles.btn} ${styles.btnPrimary}`} onClick={handleCreateFolder}>
                OK
              </button>
            </div>
          ) : (
            <button
              type="button"
              className={`${styles.btn} ${styles.btnSecondary}`}
              style={{ width: '100%', marginTop: 8 }}
              onClick={() => setShowNewFolder(true)}
            >
              <FolderPlus size={16} />
              New folder
            </button>
          )}
        </aside>

        <main className={styles.main}>
          <div className={styles.toolbar}>
            <div className={styles.searchWrap}>
              <Search size={16} className={styles.searchIcon} aria-hidden />
              <input
                className={styles.search}
                style={{ paddingLeft: 36 }}
                placeholder="Search Korean or English..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnPrimary}`}
              onClick={() => {
                setEditWord(null);
                setModalOpen(true);
              }}
            >
              <Plus size={16} />
              Add word
            </button>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnSecondary}`}
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={16} />
              Import CSV
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.txt"
              hidden
              onChange={handleImport}
            />
            <button
              type="button"
              className={`${styles.btn} ${styles.btnSecondary}`}
              onClick={handleExport}
            >
              <Download size={16} />
              Export
            </button>
          </div>

          {displayWords.length === 0 ? (
            <div className={styles.empty}>
              <p>No words in this folder yet.</p>
              <p>Click &quot;Add word&quot; or import a CSV to get started.</p>
            </div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Korean</th>
                  <th>English</th>
                  <th>Pronunciation</th>
                  <th>Due</th>
                  <th>State</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {displayWords.map((word) => (
                  <WordRow
                    key={word.id}
                    word={word}
                    onEdit={(w) => {
                      setEditWord(w);
                      setModalOpen(true);
                    }}
                    onDelete={handleDelete}
                  />
                ))}
              </tbody>
            </table>
          )}
        </main>

        <AddWordModal
          open={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setEditWord(null);
          }}
          onSaved={(isNew) =>
            addToast(isNew ? 'Word added' : 'Word updated')
          }
          defaultFolderId={selectedFolderId}
          editWord={editWord}
        />
      </div>

      <DragOverlay>
        {draggingWord ? (
          <div className={styles.dragOverlay}>
            <span className={styles.dragOverlayKr}>{draggingWord.korean}</span>
            <span>{draggingWord.english}</span>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
