export interface Project {
  id: number;
  name: string;
  shortName: string;
  canManageAccess: boolean | undefined;
}

export interface EditableProject {
  name: string;
  description: string;
}
