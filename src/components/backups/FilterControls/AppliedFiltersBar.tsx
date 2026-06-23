import Chip from '@material-ui/core/Chip';
import Grid from '@material-ui/core/Grid';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import { Link } from '@sds-eng/base';
import { FilterDefinition, FilterSelections } from '@src/components/backups/types';
import moment from 'moment';
import React, { useMemo } from 'react';

interface IAppliedFiltersBar {
  definitions: FilterDefinition[];
  selections: FilterSelections;
  onDelete: (key: string) => void;
  onTruncate: () => void;
}

interface DisplayText {
  key: string;
  label: string;
  text: string;
  fullText: string;
}

const AppliedFiltersBar = ({ definitions, selections, onDelete, onTruncate }: IAppliedFiltersBar) => {
  const displayTexts = useMemo<DisplayText[]>(() => {
    // Динамический лимит длины текста на основе количества чипов
    const baseMax = 50; // базовая длина при малом количестве
    const minMax = 20; // минимальная длина
    const dynamicMax = Math.max(minMax, Math.floor(baseMax / Math.sqrt(selections.length || 1)));

    return selections
      .map((selection) => {
        const def = definitions.find((d) => d.key === selection.key);
        if (!def) return null;

        let values: { label: string }[] = [];

        if (def.type === 'daterange') {
          const parts: string[] = [];
          const formatDate = (value: string) => {
            const parsed = moment(value, moment.ISO_8601, true);
            if (parsed.isValid()) {
              return parsed.format('YYYY-MM-DD');
            }
            return value;
          };

          if (selection.fromValue) {
            parts.push(`от ${formatDate(selection.fromValue)}`);
          }
          if (selection.toValue) {
            parts.push(`до ${formatDate(selection.toValue)}`);
          }
          const label = parts.length ? parts.join(' ') : '';
          values = label ? [{ label }] : [];
        } else {
          values = Array.isArray(selection.value) ? selection.value : selection.value ? [selection.value] : [];
        }

        const fullText = values.map((v) => v.label).join(', ');
        return {
          key: def.key,
          label: def.label,
          text: fullText.length <= dynamicMax ? fullText : fullText.slice(0, dynamicMax) + '...',
          fullText,
        };
      })
      .filter((item): item is DisplayText => item !== null);
  }, [definitions, selections]);

  return (
    <Grid item>
      <Grid container wrap="nowrap" spacing={1}>
        {displayTexts.length === 0 && (
          <Grid item>
            <Typography variant="subtitle1">Фильтры не выбраны</Typography>
          </Grid>
        )}
        {displayTexts.length > 0 && (
          <>
            <Grid item>
              <Typography variant="subtitle1">Фильтр</Typography>
            </Grid>
            <Grid
              item
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 8,
                marginLeft: 8,
                alignItems: 'center',
              }}
            >
              {displayTexts.map((filter) => (
                <Tooltip key={`tooltip-${filter.key}`} title={filter.fullText} arrow>
                  <div style={{ display: 'inline-flex' }}>
                    <Chip
                      key={filter.key}
                      label={
                        <>
                          <span style={{ fontSize: '14px', fontWeight: 400, color: 'rgba(0, 0, 0, 0.6)' }}>{filter.label}: </span>
                          <span
                            style={{
                              fontSize: '14px',
                              fontWeight: 700,
                              color: 'rgba(0, 0, 0, 0.86)',
                              marginLeft: 2,
                            }}
                          >
                            {filter.text}
                          </span>
                        </>
                      }
                      onDelete={() => onDelete(filter.key)}
                      style={{ height: 32, borderRadius: 4 }}
                    />
                  </div>
                </Tooltip>
              ))}
              <Link
                onClick={(e) => {
                  e.preventDefault();
                  onTruncate();
                }}
                style={{ cursor: 'pointer' }}
              >
                сбросить все
              </Link>
            </Grid>
          </>
        )}
      </Grid>
    </Grid>
  );
};

export default AppliedFiltersBar;
