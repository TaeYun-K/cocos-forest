declare module '*.glb' {
  const uri: number; // RN에서 require(...)는 보통 숫자 모듈 ID를 반환
  export default uri;
}
