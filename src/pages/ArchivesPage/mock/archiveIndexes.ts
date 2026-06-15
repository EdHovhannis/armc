import { ArchiveIndexRow } from '../types';

const configurations = [
  'C03132782PL_rps_lib_TRANSFER',
  'CI02001608_CI00682968_PINSURANCE_MORTGAGE',
  'CI02001608_CI00682968_PINS_LOANS_OMN',
  'CI02001608_CI00682968_PINS_LOANS_OMN',
  'CI02001608_CI00682968_PINS_LOANS_OMN',
  'CI02001608_CI00682968_PINS_LOANS_OMN',
  'CI02001608_CI00682968_PINS_LOANS_OMN',
  'CI02001608_CI00682968_PINS_LOANS_OMN',
  'CI02001608_CI00682968_PINS_LOANS_OMN',
  'CI02001608_CI00682968_PINS_LOANS_OMN',
  'CI02001608_CI00682968_PINS_LOANS_OMN',
  'CI02001608_CI00682968_PINS_LOANS_OMN',
  'CI02001608_CI00682968_PINS_LOANS_OMN',
  'CI02001608_CI00682968_PINS_LOANS_OMN',
  'CI02001608_CI00682968_PINS_LOANS_OMN',
  'CI02001608_CI00682968_PINS_LOANS_OMN',
  'CI02001608_CI00682968_PINS_LOANS_OMN',
  'CI02001608_CI00682968_PINS_LOANS_OMN',
  'CI02001608_CI00682968_PINS_LOANS_OMN',
];

const statuses: ArchiveIndexRow['status'][] = ['RUNNING', 'STOPPED', 'FAILED', 'UNDEFINED', 'WITHOUT_RESPONSE'];
const zones: ArchiveIndexRow['zone'][] = ['PRIMARY', 'SECONDARY'];
const memoryUsed = ['21.43 Kb', '0 Kb', '1.2 Mb', '512 B'];
const memoryAllocated = ['3.72 Gb', '2.64 Gb', '2 Gb'];
const maxWriteSpeed = ['512 B/s', '20 MB/s', '10 MB/s', '1 MB/s'];

export const archiveIndexesMock: ArchiveIndexRow[] = Array.from({ length: 60 }, (_, index) => {
  const status = statuses[index % statuses.length] ?? 'RUNNING';
  const hasVersionMismatch = index % 7 === 3;

  return {
    id: `archive-index-${index + 1}`,
    configuration: configurations[index % configurations.length] ?? configurations[0] ?? '',
    zone: zones[index % zones.length] ?? 'PRIMARY',
    status,
    memoryUsed: memoryUsed[index % memoryUsed.length] ?? memoryUsed[0] ?? '',
    memoryAllocated: memoryAllocated[index % memoryAllocated.length] ?? memoryAllocated[0] ?? '',
    maxWriteSpeed: maxWriteSpeed[index % maxWriteSpeed.length] ?? maxWriteSpeed[0] ?? '',
    maxIndexSize: '3.72 Gb',
    maxRetention: '90 дней',
    hasVersionMismatch,
    configVersion: hasVersionMismatch ? '2026-05-15T07:35:58.049Z' : undefined,
    instanceVersion: hasVersionMismatch ? '2026-02-05T09:50:24.678Z' : undefined,
  };
});
