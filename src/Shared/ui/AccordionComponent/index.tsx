import { Accordion as SDSAccordion, AccordionItem } from '@sds-eng/base';
import { FC, ReactNode } from 'react';

import * as styles from './styles.module.css';

interface AccordionProps {
  title: string;
  defaultExpanded?: boolean;
  children: ReactNode;
}

const AccordionComponent: FC<AccordionProps> = ({ title, defaultExpanded = false, children }) => {
  return (
    <SDSAccordion>
      <AccordionItem
        header={
          <div className={styles.archiveAccordionHeaderItem}>
            <span>{title}</span>
          </div>
        }
        arrowPosition="left"
        defaultExpanded={defaultExpanded}
        size="sm"
        classes={{
          headerIcon: styles.archiveAccordionWrapperButtonIcon,
        }}
      >
        {children}
      </AccordionItem>
    </SDSAccordion>
  );
};

export default AccordionComponent;
