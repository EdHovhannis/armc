import { User } from '../../store/auth/Types';
import { AnalyticConstraint, ArchiveConstraint, FulltextConstraint, ConstraintType } from '../../store/constraint/Types';
import { FulltextTask } from '../../store/index/Types';
import { OverdraftConfig } from '../../store/overdraft/Types';
import { Pipeline, PipelineShort } from '../../store/pipeline/Types';
import { Unit } from '../../store/role/Types';
import { Zone } from '../../store/zone/Types';
import { IndexOverviewDataNew, IndexOverviewDataTableConfig } from '../../utils/IndexUtils';
import { FilterMenuItem } from '../utils/FilterMenu';

export interface IndexOverviewState {
  labelDialogOpen: boolean;
  labelName?: string;
  labelProjectName?: string;
  canEditLabel: boolean;
  labelRefetch: boolean;
  overviewIsOpen: boolean;
  pipeline?: Pipeline;
  zoneId?: string;
  deleteIndexName?: string;
  deleteZoneId?: string;
  deleteProjectName?: string;
  confirmDialogDeleteOpen: boolean;
  confirmAllDeleteDialogOpen: boolean;
  blockedObject?: PipelineShort;
  selectedRows?: any[];
  errorMessage: string;
  detailsMessage?: string;
  isSingleDeletion: boolean;
  isStart: boolean;
  waitForAddingInstance?: boolean;
  successAddingInstance?: boolean;
  completeAddingInstance?: boolean;
  waitForUpdateInstance?: boolean;
  successUpdateInstance?: boolean;
  completeUpdateInstance?: boolean;
  waitForTaskDeletion?: boolean;
  successTaskDeletion?: boolean;
  taskDeletionComplete?: boolean;
  waitForTaskStart?: boolean;
  successTaskStart?: boolean;
  completeTaskStart?: boolean;
  waitForTaskStop?: boolean;
  successTaskStop?: boolean;
  completeTaskStop?: boolean;
  constraintDialogOpen: boolean;
  currentConstraint?: ArchiveConstraint | AnalyticConstraint | FulltextConstraint;
  constraintTitle?: any;
  constraintEditTask?: any;
  isBlockUserDialogOpen: boolean;
  blockIndexProjectName?: string;
  blockIndexName?: string;
  blockTitle?: any;
  confirmStart: boolean;
  startIndexName?: string;
  startZoneId?: string;
  startProjectShortName?: string;
  confirmRotate: boolean;
  rotateIndexName?: string;
  rotateZoneId?: string;
  rotateProjectShortName?: string;
  confirmStop: boolean;
  stopIndexName?: string;
  stopZoneId?: string;
  stopProjectShortName?: string;
  roleEditOpen: boolean;
  redefineQuotasDialogOpen: boolean;
  roleIndexName?: string;
  roleProjectShortName?: string;
  roleIndexId?: number;
  confirmRefreshInstance: boolean;
  refreshInstanceVersion?: string;
  refreshConfigVersion?: string;
  refreshName?: string;
  refreshProject?: string;
  refreshZoneId?: string;
  confirmAddInstance: boolean;
  addInstanceIndexName?: string;
  addInstanceProjectShortName?: string;
  confirmOverdraft: boolean;
  overdraftProject?: string;
  overdraftName?: string;
  overdraftZoneId?: string;
  overdraftValue?: number;
  overdraftMaxAvailable?: number;
  groupingState: any[];
  isOffsetDialogOpen: boolean;
  rowData?: IndexOverviewDataNew;
  forcePageSizeUpdate: number;
  backupCount?: number;
}

export interface IndexOverviewConfigTableProps {
  data: IndexOverviewDataTableConfig[];
  instancesData: IndexOverviewDataNew[];
  user: User;
  isAdmin: boolean;
  isLegacyMode: boolean;
  isLoading: boolean;
  filter?: FilterMenuItem[];
  allZones: Zone;
  fulltextTasks: FulltextTask[];
  fulltextOverdraftConfig?: OverdraftConfig;
  statisticsLoad: (rowData) => void;
  displayError: (error) => void;
  displaySuccess: (message: string) => void;
  listFulltextTasks: (labels?: string[], okCallback?, errorCallback?) => void;
  getAllFulltextLabelsList: (okCallback?, errorCallback?) => void;
  refetchPipelines: () => void;
  getPipelineInfo: (
    projectShortName: string,
    name: string,
    okCallback?: (pipeline: Pipeline) => void,
    errorCallback?: (errorMsg: string) => void,
  ) => void;
  redirect: (where: string | any) => void;
  downloadPipeline: (projectShortName: string, name: string) => void;
  getFulltextTaskByProjectAndName: (projectShortName, indexName, okCallback?, errorCallback?) => void;
  fetchConstraintForObject: (taskId: number, type: ConstraintType, okCallback?, errorCallback?) => void;
  addInstanceFulltext: (projectShortName: string, name: string, zoneId: string, okCallback?, errorCallback?) => void;
  updateConstraintOnObject: (
    taskId: number,
    type: ConstraintType,
    patch: any,
    okCallback: () => void,
    errorCallback: (message: string) => void,
  ) => void;
  blockSubjectOnObject: (
    subjectId: number,
    subjectType: Unit,
    projectId: number,
    taskId: number,
    isProject: boolean,
    type: ConstraintType,
    description: string,
    okCallback: () => void,
    errorCallback: (message: string) => void,
  ) => void;
  deletePipelineById: (projectShortName: string, name: string, zoneId?: string, okCallback?, errorCallback?) => void;
  refreshInstanceFulltext: (projectShortName: string, name: string, zoneId: string, okCallback?, errorCallback?) => void;
  resumeTask: (projectShortName: string, name: string, zoneId: string, okCallback?, errorCallback?) => void;
  forceRotate: (projectShortName: string, name: string, zoneId: string, okCallback?, errorCallback?) => void;
  suspendTask: (projectShortName: string, name: string, zoneId: string, okCallback?, errorCallback?) => void;
  displayInfo: (info) => void;
  changeInstanceOverdraft: (
    project: string,
    name: string,
    zoneId: string,
    value: number,
    okCallback?: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  resetInstanceOverdraft: (
    project: string,
    name: string,
    zoneId: string,
    okCallback?: () => void,
    errorCallback?: (errorMsg: { message: string; details?: string }) => void,
  ) => void;
  onSearch: (searchText: string) => void;
  searchText?: string;
}

export enum MENU_TYPE {
  delete,
  start,
  stop,
  edit,
  export,
  constraints,
  block,
  label,
  privilege,
  addInstance,
  overdraft,
  rotation,
  offset,
  redefine,
}
