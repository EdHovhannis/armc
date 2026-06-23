import React from 'react';
import { useParams } from 'react-router';

export interface WithParamsProps {
  id?: string;
  name?: string;
  collection?: string;
  projectShortName?: string;
}

export function withParams<P extends WithParamsProps>(WrappedComponent: React.ComponentType<P>) {
  return function WithParamsComponent(props: Omit<P, keyof WithParamsProps>) {
    const params = useParams();
    return <WrappedComponent {...(props as P)} {...params} />;
  };
}
