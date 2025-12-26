import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type {
  CalculatorState,
  CalculatorResult,
  CalculatorConfig,
  CalculatorType,
  ProposalContext,
  ClientContext,
  ProjectContext,
} from '@/types/calculator';
import type { FlowExecutionState, SharedFlowContext } from './flow-manager';
import { createFlowExecution, updateSharedContext, getFlowById } from './flow-manager';

const MAX_HISTORY_ITEMS = 50;

// Extend CalculatorState with new features
interface ExtendedCalculatorState extends CalculatorState {
  _hasHydrated: boolean;
  setHasHydrated: (state: boolean) => void;

  // Client/Project contexts
  currentClientContext: ClientContext | null;
  currentProjectContext: ProjectContext | null;
  setClientContext: (context: ClientContext | null) => void;
  setProjectContext: (context: ProjectContext | null) => void;

  // Flow state
  activeFlow: FlowExecutionState | null;
  startFlow: (flowId: string) => void;
  completeFlowStep: (result: CalculatorResult) => void;
  nextFlowStep: () => void;
  exitFlow: () => void;

  // Comparison state
  comparisonResults: CalculatorResult[];
  addToComparison: (result: CalculatorResult) => void;
  removeFromComparison: (id: string) => void;
  clearComparison: () => void;
  isInComparison: (id: string) => boolean;

  // UI state
  historyPanelOpen: boolean;
  favoritesPanelOpen: boolean;
  comparePanelOpen: boolean;
  flowMode: boolean;
  toggleHistoryPanel: () => void;
  toggleFavoritesPanel: () => void;
  toggleComparePanel: () => void;
  setFlowMode: (enabled: boolean) => void;
}

export const useCalculatorStore = create<ExtendedCalculatorState>()(
  persist(
    (set, get) => ({
      // Existing state
      history: [],
      favorites: [],
      currentProposalContext: null,
      _hasHydrated: false,
      setHasHydrated: (state: boolean) => set({ _hasHydrated: state }),

      // New context state
      currentClientContext: null,
      currentProjectContext: null,

      // Flow state
      activeFlow: null,

      // Comparison state
      comparisonResults: [],

      // UI state
      historyPanelOpen: false,
      favoritesPanelOpen: false,
      comparePanelOpen: false,
      flowMode: false,

      // Existing actions
      addResult: (result: CalculatorResult) => {
        set((state) => {
          const newHistory = [result, ...state.history].slice(0, MAX_HISTORY_ITEMS);
          return { history: newHistory };
        });
      },

      clearHistory: () => {
        set({ history: [] });
      },

      removeFromHistory: (id: string) => {
        set((state) => ({
          history: state.history.filter((item) => item.id !== id),
        }));
      },

      addFavorite: (config: CalculatorConfig) => {
        set((state) => ({
          favorites: [config, ...state.favorites],
        }));
      },

      removeFavorite: (id: string) => {
        set((state) => ({
          favorites: state.favorites.filter((item) => item.id !== id),
        }));
      },

      setProposalContext: (context: ProposalContext | null) => {
        set({ currentProposalContext: context });
      },

      getRecentByType: (type: CalculatorType, limit = 5): CalculatorResult[] => {
        const state = get();
        return state.history
          .filter((item) => item.type === type)
          .slice(0, limit);
      },

      // New context actions
      setClientContext: (context: ClientContext | null) => {
        set({ currentClientContext: context });
      },

      setProjectContext: (context: ProjectContext | null) => {
        set({ currentProjectContext: context });
      },

      // Flow actions
      startFlow: (flowId: string) => {
        const flowState = createFlowExecution(flowId);
        if (flowState) {
          set({ activeFlow: flowState, flowMode: true });
        }
      },

      completeFlowStep: (result: CalculatorResult) => {
        const state = get();
        if (!state.activeFlow) return;

        const flow = getFlowById(state.activeFlow.flowId);
        if (!flow) return;

        const currentStep = flow.steps[state.activeFlow.currentStepIndex];
        if (!currentStep) return;

        set({
          activeFlow: {
            ...state.activeFlow,
            completedSteps: [...state.activeFlow.completedSteps, currentStep.calculator],
            results: {
              ...state.activeFlow.results,
              [currentStep.calculator]: result,
            },
            sharedContext: updateSharedContext(state.activeFlow.sharedContext, result),
          },
        });
      },

      nextFlowStep: () => {
        const state = get();
        if (!state.activeFlow) return;

        const flow = getFlowById(state.activeFlow.flowId);
        if (!flow) return;

        // Find next uncompleted step
        let nextIndex = state.activeFlow.currentStepIndex + 1;
        while (nextIndex < flow.steps.length) {
          if (!state.activeFlow.completedSteps.includes(flow.steps[nextIndex].calculator)) {
            break;
          }
          nextIndex++;
        }

        if (nextIndex < flow.steps.length) {
          set({
            activeFlow: {
              ...state.activeFlow,
              currentStepIndex: nextIndex,
            },
          });
        }
      },

      exitFlow: () => {
        set({ activeFlow: null, flowMode: false });
      },

      // Comparison actions
      addToComparison: (result: CalculatorResult) => {
        set((state) => {
          if (state.comparisonResults.some((r) => r.id === result.id)) {
            return state;
          }
          return {
            comparisonResults: [...state.comparisonResults, result],
            comparePanelOpen: true,
          };
        });
      },

      removeFromComparison: (id: string) => {
        set((state) => ({
          comparisonResults: state.comparisonResults.filter((r) => r.id !== id),
        }));
      },

      clearComparison: () => {
        set({ comparisonResults: [], comparePanelOpen: false });
      },

      isInComparison: (id: string): boolean => {
        return get().comparisonResults.some((r) => r.id === id);
      },

      // UI actions
      toggleHistoryPanel: () => {
        set((state) => ({
          historyPanelOpen: !state.historyPanelOpen,
          favoritesPanelOpen: false,
        }));
      },

      toggleFavoritesPanel: () => {
        set((state) => ({
          favoritesPanelOpen: !state.favoritesPanelOpen,
          historyPanelOpen: false,
        }));
      },

      toggleComparePanel: () => {
        set((state) => ({
          comparePanelOpen: !state.comparePanelOpen,
        }));
      },

      setFlowMode: (enabled: boolean) => {
        set({ flowMode: enabled });
        if (!enabled) {
          set({ activeFlow: null });
        }
      },
    }),
    {
      name: 'boltinsight-calculator-storage',
      storage: createJSONStorage(() => {
        // Only use localStorage on client side
        if (typeof window !== 'undefined') {
          return localStorage;
        }
        // Return a no-op storage for SSR
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        };
      }),
      partialize: (state) => ({
        history: state.history,
        favorites: state.favorites,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// Selector hooks for convenience
export const useCalculatorHistory = () => useCalculatorStore((state) => state.history);
export const useCalculatorFavorites = () => useCalculatorStore((state) => state.favorites);
export const useProposalContext = () => useCalculatorStore((state) => state.currentProposalContext);

// Helper to generate unique IDs
export const generateCalculatorId = (): string => {
  return `calc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
