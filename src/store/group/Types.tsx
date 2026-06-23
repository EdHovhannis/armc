export interface Group {
  id: string;
  name: string;
  canManageUsers: boolean;
  canManageAccess: boolean;
  virtual: boolean;
}
