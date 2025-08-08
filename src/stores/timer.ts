import { writable, derived } from 'svelte/store';
import type { Step, Recipe } from './app';

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

  const playSound = (frequency: number, duration: number) => {
    try {
      const audioContext = new AudioContext();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.value = frequency;
      oscillator.type = 'sine';
      
      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
      
      oscillator.start();
      oscillator.stop(audioContext.currentTime + duration);
    } catch (error) {
      console.warn('Could not play sound');
    }
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
      
      interval = setInterval(() => {
        update(state => {
          if (state.timeRemaining <= 1) {
            // Play completion sound
            playSound(800, 0.2);
            
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
              playSound(1000, 0.5);
              clearInterval(interval!);
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
          
          // Play agitation sound when starting
          if (shouldShow && !previousAgitationState) {
            playSound(600, 0.1);
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
      update(state => ({ ...state, isRunning: false }));
    },

    reset: () => {
      if (interval) clearInterval(interval);
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