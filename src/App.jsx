import { Routes, Route } from 'react-router-dom'
import Login from './pages/login/Login'
import ArticlePage from './pages/article/ArticlePage'
import VideoPage from './pages/video/VideoPage'
import AdPage from './pages/adds/AdPage'
import SeoPage from './pages/seo/SeoPage'
// استيراد الصفحات الجديدة
import LeaguesPage from './pages/leagues/LeaguesPage'
import FixturesPage from './pages/fixtures/FixturesPage'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<ArticlePage />} />
      <Route path="/video" element={<VideoPage />} />
      <Route path="/ads" element={<AdPage />} />
      <Route path="/seo" element={<SeoPage />} />
      
      {/* المسارات الجديدة */}
      <Route path="/leagues" element={<LeaguesPage />} />
      <Route path="/fixtures" element={<FixturesPage />} />
    </Routes>
  )
}

export default App