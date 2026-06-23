export const JSON_PATH_REGEXP = /^\$\.[a-zA-Z\-]+((\.(\[\")[a-zA-Z\-]+(\.[a-zA-Z\-]+)*(\"\]))|(\.[a-zA-Z\-]+))*$/;

export class GlobalConfigsUtil {
  static parseMonitoringConfig(configs?: Map<string, any>): string {
    let configString = '';
    if (configs == null) {
      return configString;
    }
    Object.keys(configs).map((key) => {
      if (configString != '') {
        configString += '\n';
      }
      configString += key + '=' + configs[key];
    });
    return configString;
  }

  static serializeMonitoringConfig(config: string): any {
    const configMap = {};
    const configLine = config.split('\n');
    configLine.map((value) => {
      const configPair = value.split('=');
      if (configPair.length == 2) {
        if (JSON_PATH_REGEXP.exec(configPair[0])) {
          configMap[configPair[0]] = configPair[1];
        } else {
          throw new Error('Error while parse: wrong JSONPath');
        }
      } else {
        throw new Error('Error while parse');
      }
    });
    return configMap;
  }

  static reorderGlobalVersionsWithCurrent(globalVersions: string[], currentVersion: string): string[] {
    const globalVersionList: string[] = [];
    if (currentVersion) {
      globalVersionList.push(currentVersion);
    }
    globalVersions.filter((version) => version != currentVersion).map((version) => globalVersionList.push(version));
    return globalVersionList;
  }

  static getCurrentTabFromCurrentZone(zones: string[], current: string): number {
    return (
      zones
        .map((zone, index) => {
          if (zone === current) {
            return index;
          }
        })
        .filter((tab) => tab != null)[0] || 0
    );
  }
}
