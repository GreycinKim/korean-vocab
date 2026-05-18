import { useVocabStore } from './vocabStore';

/** Thin helpers over vocabStore folder APIs */
export function useFolderStore() {
  const folders = useVocabStore((s) => s.folders);
  const addFolder = useVocabStore((s) => s.addFolder);
  const deleteFolder = useVocabStore((s) => s.deleteFolder);
  const updateFolder = useVocabStore((s) => s.updateFolder);
  const getWordsByFolder = useVocabStore((s) => s.getWordsByFolder);

  const rootFolders = Object.values(folders).filter((f) => !f.parentId);
  const getChildFolders = (parentId: string) =>
    Object.values(folders).filter((f) => f.parentId === parentId);

  return {
    folders,
    rootFolders,
    getChildFolders,
    addFolder,
    deleteFolder,
    updateFolder,
    getWordsByFolder,
  };
}
