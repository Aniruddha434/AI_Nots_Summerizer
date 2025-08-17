import { Routes, Route } from 'react-router-dom'
import { useState } from 'react'
import Layout from './components/Layout'
import Home from './pages/Home'
import Summary from './pages/Summary'
import History from './pages/History'
import Login from './pages/Login'
import Signup from './pages/Signup'
import { AppProvider } from './context/AppContext'

function App() {
  return (
    <AppProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/summary/:id" element={<Summary />} />
          <Route path="/history" element={<History />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </Layout>
    </AppProvider>
  )
}

export default App
