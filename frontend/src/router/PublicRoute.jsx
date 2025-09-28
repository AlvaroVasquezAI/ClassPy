import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const PublicRoute = () => {
  const { teacherInfo, isLoading } = useAppContext();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (teacherInfo) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default PublicRoute;