import {useAuth} from '@clerk/react'
import PageLoader from './components/PageLoader';
import Layout from './components/Layout';
import { Routes, Route } from 'react-router';
import Homepage from './pages/Homepage';

function App() {
  const { isLoaded } = useAuth();

  if (!isLoaded) return <PageLoader />

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Homepage />}/>
      </Routes>
    </Layout>
  )
}

export default App
