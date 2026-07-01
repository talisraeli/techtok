/* ============================================
   App — Root Component
   ============================================ */

import { FeedContainer } from './components/FeedContainer/FeedContainer';
import { clips } from './data/clips';

export default function App() {
  return <FeedContainer clips={clips} />;
}
