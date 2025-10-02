import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { PageLayout } from './components/layout/PageLayout';

import HomePage from './pages/HomePage';
import DashboardPage from './pages/DashboardPage';
import WorkspacePage from './pages/WorkspacePage';
import ClassroomPage from './pages/ClassroomPage';
import StudentsPage from './pages/StudentsPage';
import AttendancePage from './pages/AttendancePage';
import InitialSetupPage from './pages/InitialSetupPage';
import GroupWorkspacePage from './pages/GroupWorkspacePage';

import ProtectedRoute from './router/ProtectedRoute';
import PublicRoute from './router/PublicRoute';

function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        <Routes>

          {/* Public Routes: Only accessible if NOT registered */}
          <Route element={<PublicRoute />}>
            <Route path="/setup" element={<InitialSetupPage />} />
          </Route>

          {/* Protected Routes: Only accessible if registered */}
          <Route element={<ProtectedRoute />}>
            <Route element={<PageLayout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/workspace" element={<WorkspacePage />} />
              <Route path="/workspace/:groupSlug" element={<GroupWorkspacePage />} />
              <Route path="/classroom" element={<ClassroomPage />} />
              <Route path="/students" element={<StudentsPage />} />
              <Route path="/attendance" element={<AttendancePage />} />
            </Route>
          </Route>
          
        </Routes>
      </BrowserRouter>
    </AppProvider>
  );
}

export default App;