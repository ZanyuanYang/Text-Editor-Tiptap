import { Routes, Route } from 'react-router-dom';
import EditorPage from '@/pages/Editor';
import Error from '@/pages/Error';

function App() {
  return (
    <Routes>
      <Route path="/" element={<EditorPage />} />
      <Route path="*" element={<Error />} />
    </Routes>
  );
}

export default App;
