import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const ProtectedRoute = () => {
  const { teacherInfo, isLoading } = useAppContext();

  if (isLoading) {
    return <div>Loading...</div>; 
  }

  if (!teacherInfo) {
    return <Navigate to="/setup" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;