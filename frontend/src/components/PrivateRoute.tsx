import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Navigate } from 'react-router-dom';
import { RootState } from '../store';
import { getCurrentUser } from '../store/slices/authSlice';
import LoadingSpinner from './ui/LoadingSpinner';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const dispatch = useDispatch();
  const { token, user, isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (token && !user) {
      dispatch(getCurrentUser());
    }
  }, [token, user, dispatch]);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  if (isLoading) {
    return (
      <LoadingSpinner
        size="lg"
        message="Loading your dashboard..."
        fullScreen={true}
      />
    );
  }

  return <>{children}</>;
};

export default PrivateRoute;
