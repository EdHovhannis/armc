export const getSchemaName = (piplineSchemaName: string | null | undefined, schemaNamesList: string[]) => {
  if (piplineSchemaName === null || piplineSchemaName === undefined || !schemaNamesList.includes(piplineSchemaName)) {
    return undefined;
  }
  return piplineSchemaName;
};
