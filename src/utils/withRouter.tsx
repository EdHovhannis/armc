import * as React from 'react';
import { useLocation, useNavigate, NavigateFunction, Location, useParams, useSearchParams } from 'react-router';

export interface RouterProps {
  location: Location;
  navigate: NavigateFunction;
  params: {
    id?: string;
    datasource?: string;
    [key: string]: string | undefined;
  };
  searchParams: URLSearchParams;
}

export function withRouter<P extends object>(Component: React.ComponentType<P & RouterProps>) {
  return (props: P) => {
    const location = useLocation();
    const navigate = useNavigate();
    const params = useParams();
    const [searchParams] = useSearchParams();

    return <Component {...props} location={location} navigate={navigate} params={params} searchParams={searchParams} />;
  };
}
