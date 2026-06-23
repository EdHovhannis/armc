import { Dialog, DialogActions, DialogContent, DialogTitle, Typography, FormControlLabel, Switch, Button, Grid, TextField } from '@material-ui/core';
import BackendProvider, { SystemType } from '@src/services/BackendProvider';
import * as React from 'react';
import { FC, useCallback, useEffect, useMemo, useState } from 'react';

import { QuotaErrors } from '../taskParts/QuotaErrors';
import { QuotaEstimate } from '../taskParts/QuotaEstimate';

import { SupervisorInstanceQuotaOverrideDialogProps, SupervisorInstanceQuotaOverrideDialogState } from './types';

export const InstanceQuotaOverride: FC<SupervisorInstanceQuotaOverrideDialogProps> = (props) => {
  const { open, handleClose, supervisorName, projectName, zone, configQuotaUsage, instanceQuotaUsage, onUpdate } = props;
  const [state, setState] = useState<SupervisorInstanceQuotaOverrideDialogState>({
    taskCount: 1,
    replicas: 1,
    quotaEstimate: null,
    loading: false,
    isValid: true,
    hasOverride: false,
  });

  const quotaInfo = useMemo(() => {
    const maxTaskCount = state.quotaEstimate?.projectQuota?.maxTaskCount || 0;
    const currentTaskCount = state.quotaEstimate?.projectQuota?.currentTaskCount || 0;
    const quotaCount = !state.quotaEstimate?.directUsage && maxTaskCount ? maxTaskCount - currentTaskCount : '';
    const isTaskCountExcess = !!quotaCount && (state.taskCount || 0) > quotaCount + (instanceQuotaUsage?.taskCount || 0);
    const invalidToSave = state.hasOverride ? !state.taskCount : !instanceQuotaUsage;
    const isDisabled = state.loading || !state.isValid || isTaskCountExcess || invalidToSave;

    return {
      maxTaskCount,
      currentTaskCount,
      quotaCount,
      isTaskCountExcess,
      invalidToSave,
      isDisabled,
    };
  }, [state.quotaEstimate, state.taskCount, state.loading, state.isValid, state.hasOverride, instanceQuotaUsage]);

  useEffect(() => {
    if (open) {
      const hasOverride = !!instanceQuotaUsage;
      const taskCount = hasOverride ? instanceQuotaUsage.taskCount : configQuotaUsage?.taskCount;
      const replicas = hasOverride ? instanceQuotaUsage.replicas : configQuotaUsage?.replicas || 1;

      setState((prev) => ({
        ...prev,
        taskCount,
        replicas,
        hasOverride,
      }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleToggleOverride = useCallback(() => {
    setState((prev) => {
      const newOverride = !prev.hasOverride;
      return {
        ...prev,
        hasOverride: newOverride,
        taskCount: newOverride ? undefined : (configQuotaUsage?.taskCount ?? undefined),
      };
    });
  }, [configQuotaUsage]);

  const onSave = useCallback(async () => {
    const url = `/v2/index/analytical/task/project/${projectName}/name/${supervisorName}/zone/${zone}/instance/config`;
    setState((prev) => ({ ...prev, loading: true }));
    const request = state.hasOverride
      ? BackendProvider.request(
          'PUT',
          url,
          null,
          null,
          JSON.stringify({
            replicas: state.replicas,
            taskCount: state.taskCount,
            zone,
          }),
          false,
          SystemType.legacy_api_path_without_version,
        )
      : BackendProvider.request('DELETE', url, null, null, undefined, false, SystemType.legacy_api_path_without_version);
    request
      .then(async (response) => {
        if (response.ok) {
          handleClose();
          if (onUpdate) onUpdate();
        }
      })
      .finally(() => {
        setState((prev) => ({ ...prev, loading: false }));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectName, state.replicas, state.taskCount, state.hasOverride, supervisorName, zone]);

  return (
    <Dialog open={open} onClose={handleClose} aria-labelledby="supervisor-quota-override-dialog-title" maxWidth="md" fullWidth>
      <DialogTitle id="supervisor-quota-override-dialog-title">Переопределение квоты экземпляра конфигурации</DialogTitle>
      <DialogContent style={{ minHeight: 350 }}>
        <Grid container direction="column" spacing={2}>
          <Grid item>
            <TextField fullWidth disabled label="Название конфигурации" defaultValue={supervisorName || ''} />
          </Grid>
          <Grid item>
            <TextField fullWidth disabled label="Проект" defaultValue={projectName || ''} />
          </Grid>
          <Grid item>
            <FormControlLabel
              control={<Switch checked={state.hasOverride} onChange={handleToggleOverride} color="primary" />}
              label="Переопределить квоту экземпляра"
            />
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={4}>
            <Typography variant="subtitle1" gutterBottom>
              Количество задач
            </Typography>
          </Grid>
          <Grid item xs={8}>
            <Typography variant="subtitle1" gutterBottom>
              Количество доступной квоты
            </Typography>
          </Grid>
          <Grid item xs={4} style={{ paddingRight: 24 }}>
            <TextField
              label="Количество задач"
              value={state.taskCount ?? ''}
              onChange={(e) => setState((prev) => ({ ...prev, taskCount: parseInt(e.target.value) || undefined }))}
              error={quotaInfo.isTaskCountExcess}
              fullWidth
              disabled={!state.hasOverride}
            />
          </Grid>
          <Grid item xs={4}>
            <TextField fullWidth disabled label="Количество доступной квоты" value={quotaInfo.quotaCount} />
          </Grid>
        </Grid>
        <QuotaEstimate
          maxTaskCount={state.taskCount || configQuotaUsage?.taskCount || 0}
          replicaCount={state.replicas}
          project={projectName || null}
          indexName={supervisorName}
          onEstimate={(data) => setState((prev) => ({ ...prev, quotaEstimate: data }))}
          onValidChange={(isValid) => setState((prev) => ({ ...prev, isValid }))}
          zone={zone}
        />
        <QuotaErrors quotaData={state.quotaEstimate} />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => handleClose()} color="primary">
          Закрыть
        </Button>
        <Button onClick={onSave} color="primary" variant="contained" disabled={quotaInfo.isDisabled}>
          Сохранить
        </Button>
      </DialogActions>
    </Dialog>
  );
};
