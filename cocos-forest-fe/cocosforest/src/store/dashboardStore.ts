import { create } from 'zustand';
import { fetchMonthlyReport, fetchDayDetails, fetchTodayData } from '../api/dashboard';
import type { MonthlyReportData, DayData } from '../types/dashboard';

interface DashboardState {
  // 날짜 상태
  selectedMonth: number;
  selectedYear: number;
  selectedDay: number | null;

  // UI 상태
  activeTab: number;
  showDetailCard: boolean;
  loading: boolean;

  // API 데이터 상태
  monthlyReportData: MonthlyReportData | null;
  todayData: DayData | null;  // 고정된 오늘 데이터
  currentDayData: DayData | null;  // 선택된 날짜 데이터
}

interface DashboardActions {
  // 날짜 액션
  setSelectedMonth: (month: number) => void;
  setSelectedYear: (year: number) => void;
  setSelectedDay: (day: number | null) => void;

  // UI 액션
  setActiveTab: (tab: number) => void;
  setShowDetailCard: (show: boolean) => void;

  // 월 변경 액션
  goToPreviousMonth: () => void;
  goToNextMonth: () => void;

  // API 액션
  loadMonthlyReport: (year: number, month: number) => Promise<void>;
  loadDayDetails: (year: number, month: number, day: number) => Promise<void>;
  loadTodayData: () => Promise<void>;

  // 복합 액션
  handleDayPress: (day: number) => Promise<void>;
  handleCloseDetailCard: () => void;
  handlePreviousMonth: () => void;
  handleNextMonth: () => void;

  // 초기화
  initializeDashboard: (year?: number, month?: number) => Promise<void>;
}

type DashboardStore = DashboardState & DashboardActions;

const useDashboardStore = create<DashboardStore>((set, get) => ({
  // 초기 상태
  selectedMonth: new Date().getMonth(),
  selectedYear: new Date().getFullYear(),
  selectedDay: null,
  activeTab: 0,
  showDetailCard: false,
  loading: false,
  monthlyReportData: null,
  todayData: null,
  currentDayData: null,

  // 기본 setter 액션들
  setSelectedMonth: (month: number) => set({ selectedMonth: month }),
  setSelectedYear: (year: number) => set({ selectedYear: year }),
  setSelectedDay: (day: number | null) => set({ selectedDay: day }),
  setActiveTab: (tab: number) => set({ activeTab: tab }),
  setShowDetailCard: (show: boolean) => set({ showDetailCard: show }),

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

  // API 호출 액션들
  loadMonthlyReport: async (year: number, month: number) => {
    try {
      set({ loading: true });
      const yearMonth = `${year}-${String(month + 1).padStart(2, '0')}`;
      const data = await fetchMonthlyReport(yearMonth);
      set({ monthlyReportData: data });
    } catch (error) {
      console.error('Failed to load monthly report:', error);
      set({ monthlyReportData: null });
    } finally {
      set({ loading: false });
    }
  },

  loadDayDetails: async (year: number, month: number, day: number) => {
    try {
      console.log(`🔄 Loading day details for ${year}-${month + 1}-${day}`);
      set({ loading: true });
      const date = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const data = await fetchDayDetails(date, true);
      console.log(`📊 Day data received:`, data);
      set({ currentDayData: data });
      console.log(`✅ Day data state updated`);
    } catch (error) {
      console.error('Failed to load day details:', error);
      set({ currentDayData: null });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  loadTodayData: async () => {
    try {
      console.log(`🔄 Loading today's data`);
      set({ loading: true });
      const data = await fetchTodayData();
      console.log(`📊 Today data received:`, data);
      set({ todayData: data });
      console.log(`✅ Today data state updated`);
    } catch (error) {
      console.error('Failed to load today data:', error);
      set({ todayData: null });
    } finally {
      set({ loading: false });
    }
  },

  // 복합 액션들
  handleDayPress: async (day: number) => {
    console.log(`📅 Day pressed: ${day}`);
    const { selectedYear, selectedMonth, loadDayDetails } = get();

    set({ selectedDay: day });
    console.log(`📍 Selected day set to: ${day}`);

    try {
      await loadDayDetails(selectedYear, selectedMonth, day);
      console.log(`✅ Day details loaded successfully for ${selectedYear}-${selectedMonth}-${day}`);
      set({ showDetailCard: true });
      console.log(`🎯 Show detail card set to: true`);
    } catch (error) {
      console.error(`❌ Failed to load day details:`, error);
    }
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

  // 초기화 액션
  initializeDashboard: async (year?: number, month?: number) => {
    const { loadMonthlyReport, loadTodayData } = get();
    const targetYear = year ?? get().selectedYear;
    const targetMonth = month ?? get().selectedMonth;

    if (year !== undefined) set({ selectedYear: year });
    if (month !== undefined) set({ selectedMonth: month });

    try {
      await Promise.all([
        loadMonthlyReport(targetYear, targetMonth),
        loadTodayData()
      ]);
    } catch (error) {
      console.error('Failed to initialize dashboard:', error);
    }
  },
}));

export default useDashboardStore;