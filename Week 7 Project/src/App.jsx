import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { CrewmatesProvider } from './context/CrewmatesContext.jsx'
import TeamBuilderPage from './pages/TeamBuilderPage.jsx'
import CrewmateDetailPage from './pages/CrewmateDetailPage.jsx'
import EditCrewmatePage from './pages/EditCrewmatePage.jsx'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <CrewmatesProvider>
        <Routes>
          <Route path="/" element={<TeamBuilderPage />} />
          <Route path="/crewmates/:crewmateId" element={<CrewmateDetailPage />} />
          <Route path="/crewmates/:crewmateId/edit" element={<EditCrewmatePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </CrewmatesProvider>
    </BrowserRouter>
  )
}

export default App
