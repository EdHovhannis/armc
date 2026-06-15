import { clsx } from '@sds-eng/base';
import { FC } from 'react';

import PreprocessingAuditMessage from '@src/Widgets/PreprocessingComponents/PreprocessingAuditMessage';
import PreprocessingCopySchema from '@src/Widgets/PreprocessingComponents/PreprocessingCopySchema';
import PreprocessingFilterMessage from '@src/Widgets/PreprocessingComponents/PreprocessingFilterMessage';

import * as styles from './styles.module.css';

const StepPreprocessing: FC = () => {
  return (
    <div className={clsx(styles.archiveStepWrapper, styles.archiveStepWrapperFullWidth)}>
      <div className={styles.archiveStepSchemaAccordionWrapper}>
        <PreprocessingCopySchema />
      </div>
      <div className={styles.archiveStepSchemaAccordionWrapper}>
        <PreprocessingFilterMessage />
      </div>
      <div className={styles.archiveStepSchemaAccordionWrapper}>
        <PreprocessingAuditMessage />
      </div>
    </div>
  );
};

export default StepPreprocessing;
