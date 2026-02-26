import type { PRDVersion, UIDesignVersion } from '../types';

const DEFAULT_SECTION = '概览';

const SECTION_HEADER = /^##\s+/;

const roundToTens = (value: number): number => Math.max(0, Math.min(100, Math.round(value / 10) * 10));

export const PROGRESS_WIDTH_CLASSES: Record<number, string> = {
  0: 'w-[0%]',
  10: 'w-[10%]',
  20: 'w-[20%]',
  30: 'w-[30%]',
  40: 'w-[40%]',
  50: 'w-[50%]',
  60: 'w-[60%]',
  70: 'w-[70%]',
  80: 'w-[80%]',
  90: 'w-[90%]',
  100: 'w-[100%]',
};

export const getProgressWidthClass = (percent: number): string => {
  const rounded = roundToTens(percent);
  return PROGRESS_WIDTH_CLASSES[rounded] || PROGRESS_WIDTH_CLASSES[0];
};

export const getCurrentVersionNumber = (versions: Array<{ id: string; version: number }>, currentVersionId: string): number => {
  const current = versions.find(version => version.id === currentVersionId);
  if (current) return current.version;
  const last = versions[versions.length - 1];
  return last ? last.version : 1;
};

export const getLatestTwoVersions = <T extends { id: string; version: number }>(
  versions: T[],
  currentVersionId: string
): { previous?: T; current?: T } => {
  if (versions.length === 0) return { previous: undefined, current: undefined };
  const current = versions.find(version => version.id === currentVersionId) ?? versions[versions.length - 1];
  if (!current) return { previous: undefined, current: undefined };
  const previous = versions
    .filter(version => version.version < current.version)
    .sort((a, b) => b.version - a.version)[0];
  return { previous, current };
};

export const getPRDSectionMap = (content: string): Record<string, string> => {
  const lines = content.split('\n');
  let currentSection = DEFAULT_SECTION;
  const sections: Record<string, string[]> = { [DEFAULT_SECTION]: [] };

  lines.forEach(line => {
    if (SECTION_HEADER.test(line)) {
      const title = line.replace(SECTION_HEADER, '').trim();
      currentSection = title || DEFAULT_SECTION;
      if (!sections[currentSection]) {
        sections[currentSection] = [];
      }
      return;
    }
    sections[currentSection].push(line);
  });

  return Object.fromEntries(
    Object.entries(sections).map(([key, value]) => [key, value.join('\n').trim()])
  );
};

export const getPRDDiffSummary = (previous?: PRDVersion, current?: PRDVersion): string[] => {
  if (!previous || !current) return [];
  const prevSections = getPRDSectionMap(previous.content);
  const currentSections = getPRDSectionMap(current.content);
  const added: string[] = [];
  const removed: string[] = [];
  const changed: string[] = [];

  Object.keys(currentSections).forEach(section => {
    if (!prevSections[section]) {
      added.push(section);
      return;
    }
    if (prevSections[section] !== currentSections[section]) {
      changed.push(section);
    }
  });

  Object.keys(prevSections).forEach(section => {
    if (!currentSections[section]) {
      removed.push(section);
    }
  });

  const summary: string[] = [];
  if (added.length) summary.push(`新增 ${added.join('、')}`);
  if (changed.length) summary.push(`修改 ${changed.join('、')}`);
  if (removed.length) summary.push(`删除 ${removed.join('、')}`);
  return summary;
};

export const getUIDiffSummary = (previous?: UIDesignVersion, current?: UIDesignVersion): string[] => {
  if (!previous || !current) return [];
  const changes: string[] = [];
  if (previous.title !== current.title) changes.push('标题');
  if (previous.description !== current.description) changes.push('描述');
  if (previous.tool !== current.tool) changes.push('设计工具');
  if (previous.prdTitle !== current.prdTitle) changes.push('关联PRD');
  if (previous.componentTree !== current.componentTree) changes.push('结构');
  if (previous.thumbnail !== current.thumbnail) changes.push('视觉');
  return changes.length ? [`调整 ${changes.join('、')}`] : [];
};

export const formatDiffSummary = (items: string[]): string => {
  if (!items.length) return '暂无结构性变更';
  return items.join('；');
};

export const getDaysBetween = (startDate?: string, endDate?: string): number => {
  if (!startDate || !endDate) return 0;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;
  const diff = Math.abs(end.getTime() - start.getTime());
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};
