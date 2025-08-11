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
    const hasInitial = typeof step.initialAgitation === 'number';
    const hasInterval = typeof step.agitationInterval === 'number' && typeof step.agitationDuration === 'number';
    const hasContinuous = typeof step.agitationDuration === 'number' && !hasInitial && !step.agitationInterval;

    // Continuous agitation for entire step if only agitationDuration is provided
    if (hasContinuous) return true;

    // Initial agitation window at start of step
    if (hasInitial && elapsed < (step.initialAgitation as number)) {
      return true;
    }

    // Interval agitation
    if (hasInterval) {
      if (hasInitial) {
        const firstIntervalStart = (step.initialAgitation as number) + (step.agitationInterval as number);
        if (elapsed >= firstIntervalStart) {
          const timeFromFirstInterval = elapsed - firstIntervalStart;
          const intervalPosition = timeFromFirstInterval % (step.agitationInterval as number);
          return intervalPosition < (step.agitationDuration as number);
        }
      } else {
        // No initial agitation defined: start intervals immediately
        const intervalPosition = elapsed % (step.agitationInterval as number);
        return intervalPosition < (step.agitationDuration as number);
      }
    }

    return false;
  };

  const getAgitationTimeRemaining = (step: Step, elapsed: number): number => {
    if (!shouldAgitate(step, elapsed)) return 0;

    const hasInitial = typeof step.initialAgitation === 'number';
    const hasInterval = typeof step.agitationInterval === 'number' && typeof step.agitationDuration === 'number';
    const hasContinuous = typeof step.agitationDuration === 'number' && !hasInitial && !step.agitationInterval;

    if (hasContinuous) {
      return Math.max(0, step.duration - elapsed);
    }

    if (hasInitial && elapsed < (step.initialAgitation as number)) {
      return (step.initialAgitation as number) - elapsed;
    }

    if (hasInterval) {
      if (hasInitial) {
        const firstIntervalStart = (step.initialAgitation as number) + (step.agitationInterval as number);
        if (elapsed >= firstIntervalStart) {
          const timeFromFirstInterval = elapsed - firstIntervalStart;
          const intervalPosition = timeFromFirstInterval % (step.agitationInterval as number);
          if (intervalPosition < (step.agitationDuration as number)) {
            return (step.agitationDuration as number) - intervalPosition;
          }
        }
      } else {
        const intervalPosition = elapsed % (step.agitationInterval as number);
        if (intervalPosition < (step.agitationDuration as number)) {
          return (step.agitationDuration as number) - intervalPosition;
        }
      }
    }

    return 0;
  };

  return {
    subscribe,
    
    loadRecipe: (recipe: Recipe) => {
      // Reset agitation tracking when loading a new recipe
      previousAgitationState = false;
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

      // Reset agitation tracking on (re)start so first agitation plays sound
      previousAgitationState = false;
      
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
              
              // Clear interval to pause timer
              clearInterval(interval!);
              wakeLockManager.releaseWakeLock();

              // Reset agitation tracking when switching steps
              previousAgitationState = false;
              
              return {
                ...state,
                steps: newSteps,
                currentStepIndex: nextIndex,
                timeRemaining: state.steps[nextIndex].duration,
                showAgitation: false,
                agitationTimeRemaining: 0,
                isRunning: false // Pause timer when moving to next step
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
      previousAgitationState = false; // Reset agitation tracking
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

          // Reset agitation tracking when switching steps
          previousAgitationState = false;
          
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

          // Reset agitation tracking when switching steps
          previousAgitationState = false;
          
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
    },

    updateStepDuration: (stepIndex: number, newDuration: number) => {
      update(state => {
        const newSteps = state.steps.map((step, index) => 
          index === stepIndex ? { ...step, duration: newDuration } : step
        );
        
        // If updating the current step, also update timeRemaining
        const timeRemaining = stepIndex === state.currentStepIndex 
          ? newDuration 
          : state.timeRemaining;
        
        return {
          ...state,
          steps: newSteps,
          timeRemaining
        };
      });
    },

    jumpToStep: (stepIndex: number) => {
      update(state => {
        if (stepIndex < 0 || stepIndex >= state.steps.length) return state;
        
        const newSteps = state.steps.map((step, index) => ({
          ...step,
          completed: index < stepIndex
        }));
        
        return {
          ...state,
          currentStepIndex: stepIndex,
          timeRemaining: state.steps[stepIndex].duration,
          showAgitation: false,
          agitationTimeRemaining: 0,
          steps: newSteps
        };
      });
    }
  };
}

export const timer = createTimer();

export const currentStep = derived(timer, $timer => $timer.steps[$timer.currentStepIndex]);
export const totalTime = derived(currentStep, $currentStep => $currentStep?.duration || 0);
export const elapsedTime = derived([totalTime, timer], ([$totalTime, $timer]) => $totalTime - $timer.timeRemaining);
export const isCompleted = derived(timer, $timer => $timer.currentStepIndex >= $timer.steps.length);