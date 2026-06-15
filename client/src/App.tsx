import {useAuth} from '@clerk/react'
import PageLoader from './components/PageLoader';
import Layout from './components/Layout';
import { Routes, Route, Navigate } from 'react-router';
import Homepage from './pages/Homepage';
import CartPage from './pages/CartPage';
import OrdersPage from './pages/OrdersPage';
import CheckoutReturnPage from './pages/CheckoutReturnPage';

function App() {
  const { isLoaded, isSignedIn } = useAuth();

  if (!isLoaded) return <PageLoader />

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Homepage />}/>
        <Route path="/cart" element={<CartPage />}/>
        <Route path="/orders" element={isSignedIn ? <OrdersPage /> : <Navigate to={"/"} replace />} />
        <Route path="/checkout/return" element={<CheckoutReturnPage />}/>
      </Routes>
    </Layout>
  )
}

export default App
