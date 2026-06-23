import React from 'react';
import { useNavigate } from 'react-router';

export interface WithNavigationProps {
  navigate: ReturnType<typeof useNavigate>;
}

export const withNavigation = <P extends object>(WrappedComponent: React.ComponentType<P & WithNavigationProps>) => {
  return (props: P) => {
    const navigate = useNavigate();
    return <WrappedComponent {...props} navigate={navigate} />;
  };
};
