import { Accordion, AccordionSummary, FormControlLabel, Checkbox, AccordionDetails } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { ClassNameMap } from '@material-ui/styles';
import * as React from 'react';

import { Connection, Tls } from '../../types';

interface ITlsFields {
  tls: Tls;
  classes: ClassNameMap;
  connectionHandler<T extends keyof Connection>(property: T, value: Connection[T]): void;
}

const TlsFields: React.FC<ITlsFields> = ({ tls, classes, connectionHandler }: ITlsFields) => {
  const tlsHandler = <T extends keyof Tls>(property: T, value: Tls[T]) => {
    const newTls: Tls = tls;
    newTls[property] = value;
    connectionHandler('tls', newTls);
  };

  return (
    <Accordion square className={classes.accordion}>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>TLS</AccordionSummary>
      <AccordionDetails className={classes.block}>
        <FormControlLabel
          label="Включить TLS"
          className={classes.block}
          control={<Checkbox color="primary" checked={tls.enabled} onChange={() => tlsHandler('enabled', !tls.enabled)} />}
        />
        <FormControlLabel
          label="Верификация имени хоста"
          className={classes.block}
          control={<Checkbox color="primary" checked={tls.verifyHosts} onChange={() => tlsHandler('verifyHosts', !tls.verifyHosts)} />}
        />
      </AccordionDetails>
    </Accordion>
  );
};

export default TlsFields;
