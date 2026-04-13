// Group configurations for G1 and G2

export type GroupType = 'G1' | 'G2';

export interface GroupConfig {
  name: string;
  labs: {
    Monday: string[];
    Tuesday: string[];
    Wednesday: string[];
    Thursday: string[];
    Friday: string[];
  };
}

// G1 Lab Schedule
export const G1_LABS: GroupConfig = {
  name: 'Group 1',
  labs: {
    Monday: ['OOP Lab'],      // 3:00-4:00 PM
    Tuesday: ['Chemistry Lab'], // 3:00-4:00 PM
    Wednesday: [],             // No lab
    Thursday: ['EG Lab'],      // 3:00-4:00 PM
    Friday: ['BEE Lab'],       // 10:00-12:00 PM
  }
};

// G2 Lab Schedule
export const G2_LABS: GroupConfig = {
  name: 'Group 2',
  labs: {
    Monday: ['EG Lab'],        // 3:00-4:00 PM
    Tuesday: ['OOP Lab'],      // 3:00-4:00 PM
    Wednesday: [],             // No lab
    Thursday: ['BEE Lab'],     // 3:00-4:00 PM
    Friday: ['Chemistry Lab'], // 10:00-12:00 PM
  }
};

// Get lab config for a group
export function getGroupConfig(group: GroupType): GroupConfig {
  return group === 'G1' ? G1_LABS : G2_LABS;
}

// Get lab slot for a specific day and group
export function getLabForDay(group: GroupType, day: string): string | null {
  const config = getGroupConfig(group);
  const labs = config.labs[day as keyof typeof config.labs];
  return labs && labs.length > 0 ? labs[0] : null;
}

// Get all labs for a group
export function getAllLabsForGroup(group: GroupType): string[] {
  const config = getGroupConfig(group);
  const allLabs = new Set<string>();
  Object.values(config.labs).forEach(dayLabs => {
    dayLabs.forEach(lab => allLabs.add(lab));
  });
  return Array.from(allLabs);
}
