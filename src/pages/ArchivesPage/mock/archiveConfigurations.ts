import { ArchiveConfigurationRow } from '../types';

const configurations = [
  { configuration: 'C03132782PL_rps_lib_TRANSFER', projectKey: 'C03132782PL' },
  { configuration: 'CI02001608_CI00682968_PINSURANCE_MORTGAGE', projectKey: 'CI02001608' },
  { configuration: 'CI02001608_CI00682968_PINS_LOANS_OMN', projectKey: 'CI02001608' },
  { configuration: 'CI02001608_CI00682968_PINS_LOANS_OMN', projectKey: 'CI02001608' },
  { configuration: 'CI02001608_CI00682968_PINS_LOANS_OMN', projectKey: 'CI02001608' },
  { configuration: 'CI02001608_CI00682968_PINS_LOANS_OMN', projectKey: 'CI02001608' },
  { configuration: 'CI02001608_CI00682968_PINS_LOANS_OMN', projectKey: 'CI02001608' },
  { configuration: 'CI02001608_CI00682968_PINS_LOANS_OMN', projectKey: 'CI02001608' },
  { configuration: 'CI02001608_CI00682968_PINS_LOANS_OMN', projectKey: 'CI02001608' },
  { configuration: 'CI02001608_CI00682968_PINS_LOANS_OMN', projectKey: 'CI02001608' },
];

const labelsPool = [['Compliance', 'Security'], ['Application Logs'], ['Клиенты МСБ'], ['Compliance'], ['Security', 'Application Logs'], []];

const instancesCounts = [0, 1, 2, 0, 1, 2, 1, 0, 2, 1];
const maxWriteSpeed = ['512 B/s', '20 MB/s', '10 MB/s', '1 MB/s'];

export const archiveConfigurationsMock: ArchiveConfigurationRow[] = Array.from({ length: 60 }, (_, index) => {
  const config = configurations[index % configurations.length] ?? configurations[0]!;

  return {
    id: `archive-configuration-${index + 1}`,
    configuration: config.configuration,
    projectKey: config.projectKey,
    instancesCount: instancesCounts[index % instancesCounts.length] ?? 0,
    maxWriteSpeed: maxWriteSpeed[index % maxWriteSpeed.length] ?? maxWriteSpeed[0]!,
    maxIndexSize: '3.72 Gb',
    maxRetention: '90 дней',
    labels: labelsPool[index % labelsPool.length] ?? [],
  };
});
