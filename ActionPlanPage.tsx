import React from 'react';
import {
  CheckSquare,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Code2,
  FolderPlus,
  Terminal,
} from 'lucide-react';
import type { ActionPlanItem } from '../types/index.ts';
import { togglePlanTask } from '../api.ts';

interface ActionPlanPageProps {
  actionPlan: ActionPlanItem[];
  onRefreshState: () => void;
  onNavigateToProjects: () => void;
}

export const ActionPlanPage: React.FC<ActionPlanPageProps> = ({
  actionPlan,
  onRefreshState,
  onNavigateToProjects,
}) => {
  const handleToggleTask = async (planId: string, taskId: string) => {
    try {
      await togglePlanTask(planId, taskId);
      onRefreshState();
    } catch (err: any) {
      console.error('Error toggling checklist task:', err);
    }
  };

  const topRecommendations = actionPlan.slice(0, 3);
  const additionalRecommendations = actionPlan.slice(3);

  return (
    <div className="space-y-8 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Action Plan</h1>
        <p className="text-slate-600 text-sm mt-1 max-w-2xl leading-relaxed">
          Actionable, high-impact improvements prioritized by your target job. Complete these practical code exercises in your repositories to close your biggest evidence gaps.
        </p>
      </div>

      {actionPlan.length > 0 ? (
        <div className="space-y-6">
          {/* Top 3 High-Impact Priority Actions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-sky-600" />
                Top Priority Actions (Start Here)
              </h2>
              <span className="text-xs text-slate-500">
                Ranked by target job requirement weighting
              </span>
            </div>

            <div className="space-y-4">
              {topRecommendations.map((item, idx) => {
                const completedTasks = item.checklist.filter((c) => c.completed).length;
                const totalTasks = item.checklist.length;
                const isAllCompleted = totalTasks > 0 && completedTasks === totalTasks;

                return (
                  <div
                    key={item.id}
                    className={`bg-white rounded-xl border p-6 transition-all shadow-2xs space-y-4 ${
                      isAllCompleted ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                          {idx + 1}
                        </span>
                        <div>
                          <h3 className="font-bold text-base text-slate-900">{item.skill}</h3>
                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                            {item.priority} priority
                          </span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-500 font-medium">
                        Progress: <span className="font-semibold text-slate-800">{completedTasks}/{totalTasks} tasks completed</span>
                      </div>
                    </div>

                    {/* Context & Relevance */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                        <span className="font-bold text-[10px] uppercase text-slate-500">
                          Why It Matters for This Job
                        </span>
                        <p className="text-slate-700 leading-relaxed">{item.targetJobRelevance}</p>
                      </div>

                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-100 space-y-1">
                        <span className="font-bold text-[10px] uppercase text-slate-500">
                          Current Evidence Status
                        </span>
                        <p className="text-slate-700 leading-relaxed">{item.currentEvidenceStatus}</p>
                      </div>
                    </div>

                    {/* Hands-on Exercise */}
                    <div className="p-4 rounded-xl bg-sky-50/50 border border-sky-100 space-y-2 text-xs">
                      <span className="font-bold text-sky-950 flex items-center gap-1.5 text-xs">
                        <Code2 className="w-4 h-4 text-sky-600" />
                        Practical Project Exercise
                      </span>
                      <p className="text-sky-900 text-xs leading-relaxed font-medium">
                        {item.practicalExercise}
                      </p>
                      <div className="pt-1 text-[11px] text-slate-600">
                        <strong>Expected Evidence to Produce:</strong> {item.expectedEvidenceToProduce}
                      </div>
                    </div>

                    {/* Interactive Completion Checklist */}
                    <div className="space-y-2 pt-1">
                      <span className="text-xs font-bold text-slate-800 block">
                        Completion Checklist (Push to GitHub when done):
                      </span>
                      <div className="space-y-1.5">
                        {item.checklist.map((task) => (
                          <label
                            key={task.id}
                            className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50 cursor-pointer text-xs text-slate-700 transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={task.completed}
                              onChange={() => handleToggleTask(item.id, task.id)}
                              className="mt-0.5 rounded border-slate-300 text-slate-900 focus:ring-sky-500 w-4 h-4 cursor-pointer"
                            />
                            <span className={task.completed ? 'line-through text-slate-400' : 'font-medium'}>
                              {task.task}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Secondary Recommendations */}
          {additionalRecommendations.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-200">
              <h2 className="text-base font-bold text-slate-900">
                Additional Recommendations ({additionalRecommendations.length})
              </h2>

              <div className="space-y-4">
                {additionalRecommendations.map((item, idx) => (
                  <div key={item.id} className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-bold text-sm text-slate-900">{item.skill}</h3>
                      <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {item.priority} priority
                      </span>
                    </div>
                    <p className="text-xs text-slate-600">{item.practicalExercise}</p>
                    <p className="text-[11px] text-slate-500 italic">
                      Proof: {item.expectedEvidenceToProduce}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-slate-50 rounded-xl border border-slate-200 p-8 text-center text-slate-500 text-xs space-y-3">
          <CheckSquare className="w-8 h-8 text-slate-400 mx-auto" />
          <p className="font-semibold text-slate-800 text-sm">No action items generated yet.</p>
          <p className="max-w-md mx-auto">
            Once you run a skill assessment for a target job, SkillTrace will automatically suggest specific exercises to close your evidence gaps.
          </p>
        </div>
      )}
    </div>
  );
};
