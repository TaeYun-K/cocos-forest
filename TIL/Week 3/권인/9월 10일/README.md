# TIL - 2025년 9월 10일
 
## Zustand vs React Query 핵심 차이점

### 목적과 역할
- **Zustand**: 클라이언트 상태 관리 라이브러리 (Redux 대체)
- **React Query**: 서버 상태 관리 라이브러리 (데이터 페칭, 캐싱, 동기화)

### 사용 용도
```typescript
// Zustand - 클라이언트 상태
interface AppState {
  user: User | null;
  theme: 'light' | 'dark';
  sidebarOpen: boolean;
}

// React Query - 서버 상태
const { data: users, isLoading, error } = useQuery({
  queryKey: ['users'],
  queryFn: fetchUsers
});
```

## Zustand 특징

### 1. 간단한 스토어 생성
```typescript
import { create } from 'zustand';

interface CounterState {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

const useCounterStore = create<CounterState>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
  reset: () => set({ count: 0 }),
}));

// 사용법
const Counter = () => {
  const { count, increment, decrement } = useCounterStore();
  
  return (
    <div>
      <span>{count}</span>
      <button onClick={increment}>+</button>
      <button onClick={decrement}>-</button>
    </div>
  );
};
```

### 2. 미들웨어와 지속성
```typescript
import { persist, createJSONStorage } from 'zustand/middleware';

const useUserStore = create(
  persist(
    (set, get) => ({
      user: null,
      login: (userData) => set({ user: userData }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'user-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
```

### 3. Immer와의 조합
```typescript
import { immer } from 'zustand/middleware/immer';

const useTaskStore = create(
  immer((set) => ({
    tasks: [],
    addTask: (task) =>
      set((state) => {
        state.tasks.push(task);
      }),
    updateTask: (id, updates) =>
      set((state) => {
        const task = state.tasks.find((t) => t.id === id);
        if (task) {
          Object.assign(task, updates);
        }
      }),
  }))
);
```

## React Query 특징

### 1. 기본 데이터 페칭
```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// 데이터 조회
const useUsers = () => {
  return useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      const response = await fetch('/api/users');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5분
    cacheTime: 10 * 60 * 1000, // 10분
  });
};

// 데이터 변경
const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newUser) => {
      const response = await fetch('/api/users', {
        method: 'POST',
        body: JSON.stringify(newUser),
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
    },
  });
};
```

### 2. 무한 스크롤
```typescript
const useInfiniteUsers = () => {
  return useInfiniteQuery({
    queryKey: ['users', 'infinite'],
    queryFn: async ({ pageParam = 0 }) => {
      const response = await fetch(`/api/users?page=${pageParam}`);
      return response.json();
    },
    getNextPageParam: (lastPage, pages) => {
      return lastPage.hasMore ? pages.length : undefined;
    },
  });
};

// 사용법
const InfiniteList = () => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteUsers();

  return (
    <div>
      {data?.pages.map((page, i) => (
        <div key={i}>
          {page.users.map((user) => (
            <UserCard key={user.id} user={user} />
          ))}
        </div>
      ))}
      {hasNextPage && (
        <button onClick={fetchNextPage} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Loading...' : 'Load More'}
        </button>
      )}
    </div>
  );
};
```

### 3. Optimistic Updates
```typescript
const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateUserAPI,
    onMutate: async (newUserData) => {
      await queryClient.cancelQueries(['user', newUserData.id]);
      
      const previousUser = queryClient.getQueryData(['user', newUserData.id]);
      
      queryClient.setQueryData(['user', newUserData.id], {
        ...previousUser,
        ...newUserData,
      });
      
      return { previousUser, newUserData };
    },
    onError: (err, newUserData, context) => {
      queryClient.setQueryData(
        ['user', newUserData.id],
        context.previousUser
      );
    },
    onSettled: (data, error, variables) => {
      queryClient.invalidateQueries(['user', variables.id]);
    },
  });
};
```

## 함께 사용하기

```typescript
// Zustand로 UI 상태 관리
const useUIStore = create((set) => ({
  isModalOpen: false,
  selectedUserId: null,
  openModal: (userId) => set({ isModalOpen: true, selectedUserId: userId }),
  closeModal: () => set({ isModalOpen: false, selectedUserId: null }),
}));

// React Query로 서버 상태 관리
const UserList = () => {
  const { data: users, isLoading } = useQuery(['users'], fetchUsers);
  const { isModalOpen, selectedUserId, openModal, closeModal } = useUIStore();
  
  if (isLoading) return <div>Loading...</div>;
  
  return (
    <div>
      {users.map((user) => (
        <UserCard 
          key={user.id} 
          user={user} 
          onEdit={() => openModal(user.id)}
        />
      ))}
      {isModalOpen && (
        <EditUserModal 
          userId={selectedUserId} 
          onClose={closeModal} 
        />
      )}
    </div>
  );
};
```

## 선택 기준

### Zustand를 선택해야 할 때
- 클라이언트 전역 상태 관리가 필요할 때
- Redux보다 간단한 상태 관리를 원할 때
- 번들 크기를 최소화하고 싶을 때
- TypeScript와 함께 타입 안전성을 원할 때

### React Query를 선택해야 할 때
- API 데이터 페칭과 캐싱이 주요 관심사일 때
- 서버 상태와 클라이언트 상태를 분리하고 싶을 때
- 무한 스크롤, 페이지네이션이 필요할 때
- 실시간 데이터 동기화가 중요할 때

### 함께 사용하는 경우
- 대규모 애플리케이션에서 상태를 명확히 분리하고 싶을 때
- Zustand로 UI/UX 상태, React Query로 서버 상태 관리
- 각 라이브러리의 장점을 최대한 활용하고 싶을 때

## 느낀점

처음에는 둘 중 하나만 선택해야 한다고 생각했는데, 실제로는 서로 다른 영역을 담당하는 라이브러리였다. Zustand는 정말 Redux의 간편한 대안으로서 클라이언트 상태 관리에 탁월했고, React Query는 서버 상태 관리의 복잡성을 말끔히 해결해주었다.