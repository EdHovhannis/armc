export interface AlmgrProjectsQuota {
  projects: AlmgrProjectQuota[];
}

export interface AlmgrProjectQuota {
  project: string;
  quotas: AlmgrQuota;
}

export interface AlmgrQuota {
  currentGroupRulesAmount: string | number;
  currentRpm: string | number;
  maxGroupRulesAmount: string | number;
  maxRpm: string | number;
}

export interface AlmgrReducedQuota {
  RPM: reducedQuota;
  GROUP_RULES_AMOUNT: reducedQuota;
}

type fullQuota = { max: number; current: number };

type reducedQuota = { max: number };
