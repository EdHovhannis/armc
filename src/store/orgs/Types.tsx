export interface Group {
  id: number;
  name: string;
  canManageUsers: boolean;
  canManageAccess: boolean;
  virtual: boolean;
}

export interface Org {
  id: number;
  projectId: string;
  name: string;
}

export interface IndicatorUser {
  name: string;
  orgId: number;
  role: string;
  sub: string;
}

export interface IndicatorDatasource {
  id: number;
  uid: string;
  orgId: number;
  name: string;
  type: string;
  typeName: string;
  typeLogoUrl: string;
  access: string;
  url: string;
  password: string;
  user: string;
  database: string;
  basicAuth: boolean;
  isDefault: boolean;
  jsonData: any;
  readOnly: boolean;
}

export interface IndicatorDatasourceCreateNew {
  id: number;
  message: string;
  name: string;
  datasource: IndicatorDatasource;
}

export interface MigrateStatus {
  migration_state: string;
  migration_users_cnt?: number;
  migration_error_cnt?: number;
  auth_filter?: string[];
}
