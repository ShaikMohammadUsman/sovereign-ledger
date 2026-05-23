import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import RequestList from './pages/RequestList';
import RequestDetail from './pages/RequestDetail';
import CreateRequest from './pages/CreateRequest';
import VendorList from './pages/VendorList';
import VendorDetail from './pages/VendorDetail';
import Approvals from './pages/Approvals';
import POList from './pages/POList';
import PODetail from './pages/PODetail';
import AIInsights from './pages/AIInsights';
import Analytics from './pages/Analytics';
import GlobalSourcing from './pages/GlobalSourcing';
import Settings from './pages/Settings';
import MainLayout from './components/Layout/MainLayout';
import { useAuth } from './context/AuthContext';

function App() {
  const { isAuthenticated } = useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" /> : <Login />} />
        <Route path="/register" element={isAuthenticated ? <Navigate to="/" /> : <Register />} />
        <Route
          path="/*"
          element={
            isAuthenticated ? (
              <MainLayout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/requests" element={<RequestList />} />
                  <Route path="/requests/new" element={<CreateRequest />} />
                  <Route path="/requests/:id/edit" element={<CreateRequest />} />
                  <Route path="/requests/:id" element={<RequestDetail />} />
                  <Route path="/vendors" element={<VendorList />} />
                  <Route path="/vendors/:id" element={<VendorDetail />} />
                  <Route path="/approvals" element={<Approvals />} />
                  <Route path="/purchase-orders" element={<POList />} />
                  <Route path="/purchase-orders/:id" element={<PODetail />} />
                  <Route path="/ai-insights" element={<AIInsights />} />
                  <Route path="/analytics" element={<Analytics />} />
                  <Route path="/global-sourcing" element={<GlobalSourcing />} />
                  <Route path="/settings" element={<Settings />} />
                </Routes>
              </MainLayout>
            ) : (
              <Navigate to="/login" />
            )
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
