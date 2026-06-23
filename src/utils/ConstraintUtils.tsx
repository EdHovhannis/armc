import { User } from '../store/auth/Types';
import {
  BasicAnalyticConstraint,
  BasicArchiveConstraint,
  BasicFulltextConstraint,
  BlockedInfo,
  BlockedUnit,
  Blocks,
  ClusterConstraint,
  ConstraintType,
  ConstraintValueType,
  OBJECT_TYPE,
} from '../store/constraint/Types';
import { Group } from '../store/group/Types';
import { Unit } from '../store/role/Types';

import SizeConverter from './SizeConverter';

export class ConstraintUtils {
  static getDataString(value: number, type: ConstraintValueType): string {
    switch (type) {
      case ConstraintValueType.time:
        return SizeConverter.makeTimeStringForConstraint(SizeConverter.getTimeForConstraints(value));
      case ConstraintValueType.size:
        return SizeConverter.makeSizeString(SizeConverter.convertBytes(value), false);
      case ConstraintValueType.number:
        return value + '';
    }
  }

  static defaultClusterConstraint(): ClusterConstraint {
    return {
      analytic: {
        maxSearchTimeIntervalForDatasourceSec: 0,
        maxSearchTimeIntervalForQuerySec: 0,
        maxRecordCountByQuery: 0,
      },
      archive: {
        maxSearchTimeIntervalSec: 0,
      },
      fulltext: {
        maxSizeBytesByQuery: 0,
        maxRecordCountByQuery: 0,
        maxSearchTimeIntervalSec: 0,
      },
    };
  }

  static defaultFulltextConstraint(): BasicFulltextConstraint {
    return {
      maxSizeBytesByQuery: 0,
      maxRecordCountByQuery: 0,
      maxSearchTimeIntervalSec: 0,
    };
  }

  static defaultAnalyticConstraint(): BasicAnalyticConstraint {
    return {
      maxSearchTimeIntervalForDatasourceSec: 0,
      maxSearchTimeIntervalForQuerySec: 0,
      maxRecordCountByQuery: 0,
    };
  }

  static defaultArchiveConstraint(): BasicArchiveConstraint {
    return {
      maxSearchTimeIntervalSec: 0,
    };
  }

  static clusterConstraintsIsEqual(constraint1: ClusterConstraint, constraint2: ClusterConstraint) {
    let res = true;
    Object.keys(constraint1).map((service) => {
      const serviceConstraint2 = constraint2[service];
      const serviceConstraint1 = constraint1[service];
      res = res && ConstraintUtils.constraintsIsEqual(serviceConstraint1, serviceConstraint2);
    });
    return res;
  }

  static constraintsIsEqual(constraint1, constraint2) {
    let res = true;
    Object.keys(constraint1).map((currentConstraint) => {
      if (constraint1[currentConstraint] !== constraint2[currentConstraint]) {
        res = res && false;
      }
    });
    return res;
  }

  static createBlockedInfoFromBlocksAndBlockedObjects(blocks: Blocks[], users: User[], groups: Group[], pvmMode: boolean): BlockedInfo[] {
    const blockedInfo: BlockedInfo[] = [];
    blocks.map((block) => {
      blockedInfo.push({
        objectName: block.objectName ? (block.objectType === OBJECT_TYPE.PROJECT ? '-' : block.objectName) : '-',
        projectKey: block.projectKey ? block.projectKey : '-',
        subjectId: block.subjectId,
        subjectName: pvmMode
          ? block.subjectId
          : block.subjectType === Unit.USER
            ? users.filter((user) => block.subjectId === user.id).map((user) => user.name)[0]
            : groups.filter((group) => block.subjectId === group.id).map((group) => group.name)[0],
        objectId: block.objectId,
        subjectType: block.subjectType,
        constraintType: block.constraintType,
        objectType: block.objectType,
        global: block.objectType === OBJECT_TYPE.GLOBAL,
      });
    });
    return blockedInfo;
  }
}
