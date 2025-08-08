import { writable, derived } from 'svelte/store';
import type { Step, Recipe } from './app';
import { soundUtils } from '$lib/soundUtils';
import { wakeLockManager } from '$lib/wakeLock';

interface TimerState {
  steps: Step[];
  currentStepIndex: number;
  timeRemaining: number;
  isRunning: boolean;
  showAgitation: boolean;
  agitationTimeRemaining: number;
}

const initialState: TimerState = {
  steps: [],
  currentStepIndex: 0,
  timeRemaining: 0,
  isRunning: false,
  showAgitation: false,
  agitationTimeRemaining: 0
};

function createTimer() {
  const { subscribe, set, update } = writable<TimerState>(initialState);
  let interval: NodeJS.Timeout | null = null;
  let previousAgitationState = false;

  const shouldAgitate = (step: Step, elapsed: number): boolean => {
    if (!step.initialAgitation && !step.agitationInterval) return false;
    
    if (step.initialAgitation && elapsed < step.initialAgitation) {
      return true;
    }
    
    if (step.agitationInterval && step.agitationDuration && step.initialAgitation) {
      const firstIntervalStart = step.initialAgitation + step.agitationInterval;
      
      if (elapsed >= firstIntervalStart) {
        const timeFromFirstInterval = elapsed - firstIntervalStart;
        const intervalPosition = timeFromFirstInterval % step.agitationInterval;
        return intervalPosition < step.agitationDuration;
      }
    }
    
    return false;
  };

  const getAgitationTimeRemaining = (step: Step, elapsed: number): number => {
    if (!shouldAgitate(step, elapsed)) return 0;
    
    if (step.initialAgitation && elapsed < step.initialAgitation) {
      return step.initialAgitation - elapsed;
    }
    
    if (step.agitationInterval && step.agitationDuration && step.initialAgitation) {
      const firstIntervalStart = step.initialAgitation + step.agitationInterval;
      
      if (elapsed >= firstIntervalStart) {
        const timeFromFirstInterval = elapsed - firstIntervalStart;
        const intervalPosition = timeFromFirstInterval % step.agitationInterval;
        
        if (intervalPosition < step.agitationDuration) {
          return step.agitationDuration - intervalPosition;
        }
      }
    }
    
    return 0;
  };

  return {
    subscribe,
    
    loadRecipe: (recipe: Recipe) => {
      update(state => ({
        ...state,
        steps: recipe.steps.map(step => ({ ...step, completed: false })),
        currentStepIndex: 0,
        timeRemaining: recipe.steps[0]?.duration || 0,
        isRunning: false,
        showAgitation: false,
        agitationTimeRemaining: 0
      }));
    },

    start: () => {
      update(state => ({ ...state, isRunning: true }));
      
      // Request wake lock to prevent screen from sleeping
      wakeLockManager.requestWakeLock();
      
      interval = setInterval(() => {
        update(state => {
          if (state.timeRemaining <= 1) {
            // Play completion sound
            soundUtils.playComplete();
            
            // Move to next step
            const nextIndex = state.currentStepIndex + 1;
            if (nextIndex < state.steps.length) {
              const newSteps = state.steps.map((step, index) => 
                index === state.currentStepIndex ? { ...step, completed: true } : step
              );
              
              return {
                ...state,
                steps: newSteps,
                currentStepIndex: nextIndex,
                timeRemaining: state.steps[nextIndex].duration,
                showAgitation: false,
                agitationTimeRemaining: 0
              };
            } else {
              // All steps complete
              soundUtils.playGong();
              clearInterval(interval!);
              wakeLockManager.releaseWakeLock(); // Release wake lock when timer completes
              return {
                ...state,
                isRunning: false,
                steps: state.steps.map((step, index) => 
                  index === state.currentStepIndex ? { ...step, completed: true } : step
                )
              };
            }
          }

          // Update agitation
          const currentStep = state.steps[state.currentStepIndex];
          const elapsed = (currentStep?.duration || 0) - state.timeRemaining;
          const shouldShow = shouldAgitate(currentStep, elapsed);
          
          // Play agitation sounds when starting or stopping
          if (shouldShow && !previousAgitationState) {
            soundUtils.playBell(); // Start agitation
          } else if (!shouldShow && previousAgitationState) {
            soundUtils.playBell(); // Stop agitation
          }
          previousAgitationState = shouldShow;

          return {
            ...state,
            timeRemaining: state.timeRemaining - 1,
            showAgitation: shouldShow,
            agitationTimeRemaining: getAgitationTimeRemaining(currentStep, elapsed)
          };
        });
      }, 1000);
    },

    pause: () => {
      if (interval) clearInterval(interval);
      wakeLockManager.releaseWakeLock(); // Release wake lock when paused
      update(state => ({ ...state, isRunning: false }));
    },

    reset: () => {
      if (interval) clearInterval(interval);
      wakeLockManager.releaseWakeLock(); // Release wake lock when reset
      update(state => ({
        ...state,
        currentStepIndex: 0,
        timeRemaining: state.steps[0]?.duration || 0,
        isRunning: false,
        showAgitation: false,
        agitationTimeRemaining: 0,
        steps: state.steps.map(step => ({ ...step, completed: false }))
      }));
    },

    skipToNext: () => {
      update(state => {
        if (state.currentStepIndex < state.steps.length - 1) {
          const newSteps = state.steps.map((step, index) => 
            index === state.currentStepIndex ? { ...step, completed: true } : step
          );
          const nextIndex = state.currentStepIndex + 1;
          
          return {
            ...state,
            steps: newSteps,
            currentStepIndex: nextIndex,
            timeRemaining: state.steps[nextIndex].duration,
            showAgitation: false,
            agitationTimeRemaining: 0
          };
        }
        return state;
      });
    },

    skipToPrevious: () => {
      update(state => {
        if (state.currentStepIndex > 0) {
          const newSteps = state.steps.map((step, index) => 
            index === state.currentStepIndex ? { ...step, completed: false } : step
          );
          const prevIndex = state.currentStepIndex - 1;
          
          return {
            ...state,
            steps: newSteps,
            currentStepIndex: prevIndex,
            timeRemaining: state.steps[prevIndex].duration,
            showAgitation: false,
            agitationTimeRemaining: 0
          };
        }
        return state;
      });
    }
  };
}

export const timer = createTimer();

export const currentStep = derived(timer, $timer => $timer.steps[$timer.currentStepIndex]);
export const totalTime = derived(currentStep, $currentStep => $currentStep?.duration || 0);
export const elapsedTime = derived([totalTime, timer], ([$totalTime, $timer]) => $totalTime - $timer.timeRemaining);
export const isCompleted = derived(timer, $timer => $timer.currentStepIndex >= $timer.steps.length);