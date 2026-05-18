import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/Layout/AppLayout';
import { Home } from './components/Home/Home';
import { Library } from './components/Library/Library';
import { FlashcardStudy } from './components/Flashcards/FlashcardStudy';
import { StructureLab } from './components/Structure/StructureLab';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route index element={<Home />} />
        <Route path="flashcards/study" element={<FlashcardStudy />} />
        <Route path="flashcards" element={<Navigate to="/" replace />} />
        <Route path="structure" element={<StructureLab />} />
        <Route path="library" element={<Navigate to="/library/church-vocab" replace />} />
        <Route path="library/:folderId" element={<Library />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}
