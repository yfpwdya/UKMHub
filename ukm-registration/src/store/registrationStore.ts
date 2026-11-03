import { create } from 'zustand';
import type { UKM, UKMChoice } from '../types/ukm';
import { arrayMove } from '@dnd-kit/sortable';

interface RegistrationStore {
  answers: Record<number, number>;
  scores: Record<string, number>;
  recommended: UKM[];
  selectedUKM: UKMChoice[];
  setAnswer: (questionId: number, answerId: number) => void;
  setScores: (scores: Record<string, number>) => void;
  setRecommended: (ukm: UKM[]) => void;
  addUKMChoice: (ukm: UKM) => void;
  removeUKMChoice: (ukmId: number) => void;
  reorderChoices: (fromIndex: number, toIndex: number) => void;
  reset: () => void;
}

export const useRegistrationStore = create<RegistrationStore>((set) => ({
  answers: {},
  scores: {},
  recommended: [],
  selectedUKM: [],

  setAnswer: (questionId, answerId) =>
    set((state) => ({
      answers: { ...state.answers, [questionId]: answerId },
    })),

  setScores: (scores) => set({ scores }),

  setRecommended: (ukm) => set({ recommended: ukm }),

  addUKMChoice: (ukm) =>
    set((state) => {
      if (state.selectedUKM.length >= 4) return state;
      if (state.selectedUKM.find((c) => c.ukm.id === ukm.id)) return state;
      const newChoice: UKMChoice = {
        priority: state.selectedUKM.length + 1,
        ukm,
      };
      return { selectedUKM: [...state.selectedUKM, newChoice] };
    }),

  removeUKMChoice: (ukmId) =>
    set((state) => {
      const filtered = state.selectedUKM
        .filter((c) => c.ukm.id !== ukmId)
        .map((c, i) => ({ ...c, priority: i + 1 }));
      return { selectedUKM: filtered };
    }),

  reorderChoices: (fromIndex, toIndex) =>
    set((state) => {
      const reordered = arrayMove(state.selectedUKM, fromIndex, toIndex).map((c, i) => ({
        ...c,
        priority: i + 1,
      }));
      return { selectedUKM: reordered };
    }),

  reset: () => set({ answers: {}, scores: {}, recommended: [], selectedUKM: [] }),
}));
