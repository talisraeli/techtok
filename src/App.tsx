/* ============================================
   App — Root Component
   ============================================ */

import { BrowserRouter as Router, Routes, Route, useParams, useSearchParams } from 'react-router-dom';
import { Home } from './components/Home/Home';
import { CourseProfile } from './components/CourseProfile/CourseProfile';
import { FeedContainer } from './components/FeedContainer/FeedContainer';
import { clips } from './data/clips';

function WatchRoute() {
  const { courseId } = useParams();
  const [searchParams] = useSearchParams();
  const startClip = searchParams.get('startClip');
  
  const courseClips = clips.filter(c => c.courseId === courseId);
  const initialIndex = startClip ? courseClips.findIndex(c => c.id === startClip) : 0;
  
  return <FeedContainer clips={courseClips} initialIndex={Math.max(0, initialIndex)} courseId={courseId} />;
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/course/:courseId" element={<CourseProfile />} />
        <Route path="/watch/:courseId" element={<WatchRoute />} />
      </Routes>
    </Router>
  );
}
