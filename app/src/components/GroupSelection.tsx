import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UsersIcon } from '@/components/icons';
import type { GroupType } from '@/types';
import { cn } from '@/lib/utils';
import { G1_LABS, G2_LABS } from '@/data/groups';

interface GroupSelectionProps {
  dark: boolean;
  onSelectGroup: (group: GroupType) => void;
}

export function GroupSelection({ dark, onSelectGroup }: GroupSelectionProps) {
  const [selectedGroup, setSelectedGroup] = useState<GroupType | null>(null);

  const handleContinue = () => {
    if (selectedGroup) {
      onSelectGroup(selectedGroup);
    }
  };

  return (
    <div className={cn(
      "min-h-screen flex items-center justify-center p-4",
      dark ? "bg-slate-950" : "bg-slate-50"
    )}>
      <Card className={cn(
        "w-full max-w-md",
        dark ? "bg-slate-900 border-slate-800" : "bg-white"
      )}>
        <CardContent className="p-6">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <UsersIcon size={32} className="text-primary" />
            </div>
            <h1 className="text-2xl font-bold mb-2">Welcome to CSE Timetable</h1>
            <p className="text-muted-foreground">
              Please select your group to personalize your schedule
            </p>
          </div>

          {/* Group Selection */}
          <div className="space-y-3 mb-6">
            {/* G1 Option */}
            <button
              onClick={() => setSelectedGroup('G1')}
              className={cn(
                "w-full p-4 rounded-xl border-2 text-left transition-all duration-200",
                selectedGroup === 'G1'
                  ? "border-primary bg-primary/5"
                  : dark
                    ? "border-slate-700 hover:border-slate-600"
                    : "border-slate-200 hover:border-slate-300"
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-lg">Group 1 (G1)</h3>
                    <Badge variant="default">Default</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your lab schedule:
                  </p>
                </div>
                {selectedGroup === 'G1' && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="mt-3 space-y-1">
                {Object.entries(G1_LABS.labs).map(([day, labs]) => (
                  labs.length > 0 && (
                    <div key={day} className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground w-20">{day}:</span>
                      <span className="font-medium">{labs.join(', ')}</span>
                    </div>
                  )
                ))}
              </div>
            </button>

            {/* G2 Option */}
            <button
              onClick={() => setSelectedGroup('G2')}
              className={cn(
                "w-full p-4 rounded-xl border-2 text-left transition-all duration-200",
                selectedGroup === 'G2'
                  ? "border-primary bg-primary/5"
                  : dark
                    ? "border-slate-700 hover:border-slate-600"
                    : "border-slate-200 hover:border-slate-300"
              )}
            >
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-lg">Group 2 (G2)</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Your lab schedule:
                  </p>
                </div>
                {selectedGroup === 'G2' && (
                  <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                )}
              </div>
              <div className="mt-3 space-y-1">
                {Object.entries(G2_LABS.labs).map(([day, labs]) => (
                  labs.length > 0 && (
                    <div key={day} className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground w-20">{day}:</span>
                      <span className="font-medium">{labs.join(', ')}</span>
                    </div>
                  )
                ))}
              </div>
            </button>
          </div>

          {/* Continue Button */}
          <Button
            onClick={handleContinue}
            disabled={!selectedGroup}
            className="w-full py-6 text-base font-semibold"
          >
            Continue
          </Button>

          <p className="text-xs text-center text-muted-foreground mt-4">
            You can change your group anytime from the More section
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
