import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { BreweryDataProvider } from './context/BreweryDataContext.jsx'
import AppLayout from './components/AppLayout.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import BreweryDetailPage from './pages/BreweryDetailPage.jsx'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <BreweryDataProvider>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/breweries/:breweryId" element={<BreweryDetailPage />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Route>
        </Routes>
      </BreweryDataProvider>
    </BrowserRouter>
  )
}

export default App
