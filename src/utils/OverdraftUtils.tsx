import { OverdraftConfig } from '../store/overdraft/Types';

export interface OverdraftTableInfo {
  indexType: IndexType;
  type: string;
  maxOverdraftedTasks: number;
  maxOverdraftPercent: number;
}

export enum IndexType {
  fulltext = 'fulltext',
  archive = 'archive',
}

export class OverdraftUtils {
  static createDataForOverdraftConfigOverviewTable(archive?: OverdraftConfig, fulltext?: OverdraftConfig): OverdraftTableInfo[] {
    const result: OverdraftTableInfo[] = [];
    if (archive) {
      result.push({
        indexType: IndexType.archive,
        type: this.getIndexTypeString(IndexType.archive),
        maxOverdraftedTasks: archive.maxOverdraftedTasks,
        maxOverdraftPercent: archive.maxOverdraftPercent,
      });
    }
    if (fulltext) {
      result.push({
        indexType: IndexType.fulltext,
        type: this.getIndexTypeString(IndexType.fulltext),
        maxOverdraftedTasks: fulltext.maxOverdraftedTasks,
        maxOverdraftPercent: fulltext.maxOverdraftPercent,
      });
    }
    return result;
  }

  static getIndexTypeString(indexType: IndexType): string {
    switch (indexType) {
      case IndexType.archive:
        return 'Архивный';
      case IndexType.fulltext:
        return 'Полнотекстовый';
    }
  }
}
