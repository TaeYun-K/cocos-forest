import { create } from 'zustand';
import type { CategoryMonthlyDetails } from '../types/dashboard';

interface DashboardState {
  // 날짜 상태
  selectedMonth: number;
  selectedYear: number;
  selectedDay: number | null;

  // UI 상태
  activeTab: number;
  showDetailCard: boolean;

  // 카테고리 상세 모달 상태
  showCategoryModal: boolean;
  categoryModalData: CategoryMonthlyDetails | null;
  categoryModalLoading: boolean;
}

interface DashboardActions {
  // 날짜 액션
  setSelectedMonth: (month: number) => void;
  setSelectedYear: (year: number) => void;
  setSelectedDay: (day: number | null) => void;

  // UI 액션
  setActiveTab: (tab: number) => void;
  setShowDetailCard: (show: boolean) => void;

  // 카테고리 모달 액션
  setShowCategoryModal: (show: boolean) => void;
  setCategoryModalData: (data: CategoryMonthlyDetails | null) => void;
  setCategoryModalLoading: (loading: boolean) => void;
  closeCategoryModal: () => void;

  // 월 변경 액션
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;

  // 복합 액션
  handleDayPress: (day: number) => void;
  handleCloseDetailCard: () => void;
  handlePreviousMonth: () => void;
  handleNextMonth: () => void;
}

type DashboardStore = DashboardState & DashboardActions;

const useDashboardStore = create<DashboardStore>((set, get) => ({
  // 초기 상태
  selectedMonth: new Date().getMonth(),
  selectedYear: new Date().getFullYear(),
  selectedDay: null,
  activeTab: 0,
  showDetailCard: false,

  // 카테고리 모달 초기 상태
  showCategoryModal: false,
  categoryModalData: null,
  categoryModalLoading: false,

  // 기본 setter 액션들
  setSelectedMonth: (month: number) => set({ selectedMonth: month }),
  setSelectedYear: (year: number) => set({ selectedYear: year }),
  setSelectedDay: (day: number | null) => set({ selectedDay: day }),
  setActiveTab: (tab: number) => set({ activeTab: tab }),
  setShowDetailCard: (show: boolean) => set({ showDetailCard: show }),

  // 카테고리 모달 액션들
  setShowCategoryModal: (show: boolean) => set({ showCategoryModal: show }),
  setCategoryModalData: (data: CategoryMonthlyDetails | null) => set({ categoryModalData: data }),
  setCategoryModalLoading: (loading: boolean) => set({ categoryModalLoading: loading }),
  closeCategoryModal: () => set({
    showCategoryModal: false,
    categoryModalData: null,
    categoryModalLoading: false
  }),

  // 월 변경 액션들
  goToPreviousMonth: () => {
    const { selectedMonth, selectedYear } = get();
    if (selectedMonth === 0) {
      set({ selectedMonth: 11, selectedYear: selectedYear - 1 });
    } else {
      set({ selectedMonth: selectedMonth - 1 });
    }
  },

  goToNextMonth: () => {
    const { selectedMonth, selectedYear } = get();
    if (selectedMonth === 11) {
      set({ selectedMonth: 0, selectedYear: selectedYear + 1 });
    } else {
      set({ selectedMonth: selectedMonth + 1 });
    }
  },

  // 복합 액션들
  handleDayPress: (day: number) => {
    console.log(`📅 Day pressed: ${day}`);
    set({ selectedDay: day, showDetailCard: true });
    console.log(`📍 Selected day set to: ${day}, showDetailCard: true`);
  },

  handleCloseDetailCard: () => {
    set({ showDetailCard: false, selectedDay: null });
  },

  handlePreviousMonth: () => {
    const { goToPreviousMonth, handleCloseDetailCard, showDetailCard } = get();
    goToPreviousMonth();
    if (showDetailCard) {
      handleCloseDetailCard();
    }
  },

  handleNextMonth: () => {
    const { goToNextMonth, handleCloseDetailCard, showDetailCard } = get();
    goToNextMonth();
    if (showDetailCard) {
      handleCloseDetailCard();
    }
  },
}));

export default useDashboardStore;