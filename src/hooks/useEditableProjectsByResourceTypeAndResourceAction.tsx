import { useState, useEffect, useCallback } from 'react';
import { useDispatch } from 'react-redux';

import ProjectService from '../services/ProjectService';
import * as notificationActions from '../store/notification/Actions';
import { EditableProject } from '../store/project/Types';

export interface IProjectsByResourceTypeAndResourceActionProps {
  resourceType: string;
  resourceAction: string;
}

const useEditableProjectsByResourceTypeAndResourceAction = (props: IProjectsByResourceTypeAndResourceActionProps) => {
  const { resourceType, resourceAction } = props;
  const dispatch = useDispatch();
  const [editableProjects, setEditableProjects] = useState<EditableProject[]>([]);

  const errorHandler = useCallback(
    (error: string) => {
      dispatch(notificationActions.error(error));
    },
    [dispatch],
  );

  useEffect(() => {
    ProjectService.fetchEditableProjectsForAddingNewElement(resourceType, resourceAction, setEditableProjects, errorHandler);
  }, [errorHandler, resourceAction, resourceType]);

  return editableProjects;
};

export default useEditableProjectsByResourceTypeAndResourceAction;
