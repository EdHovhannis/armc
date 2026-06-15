import { Accordion, AccordionItem, Icon, TextField } from '@sds-eng/base';
import { FC, ReactNode } from 'react';

import * as styles from './styles.module.css';

interface AccordionWithSearchProps {
  title: string;
  search: string;
  onChangeSearch: (value: string) => void;
  defaultExpanded?: boolean;
  children: ReactNode;
}

const AccordionWithSearch: FC<AccordionWithSearchProps> = ({ title, search, defaultExpanded = false, onChangeSearch, children }) => {
  return (
    <Accordion>
      <AccordionItem
        header={
          <div className={styles.archiveAccordionHeaderItem}>
            <span>{title}</span>
            <TextField
              value={search}
              size="sm"
              onChange={onChangeSearch}
              onClick={(e) => e.stopPropagation()}
              placeholder="Найти поле"
              prefix={<Icon.Search />}
              canClear
              classes={{ inputContainer: styles.archiveAccordionHeaderItemInput }}
            />
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
    </Accordion>
  );
};

export default AccordionWithSearch;
