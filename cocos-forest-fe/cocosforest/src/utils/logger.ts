// src/utils/logger.ts

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LogConfig {
  enableConsoleLog: boolean;
  logLevel: LogLevel;
}

class Logger {
  private config: LogConfig;

  constructor() {
    // 개발 환경에서는 모든 로그 활성화, 프로덕션에서는 error만
    this.config = {
      enableConsoleLog: __DEV__ || process.env.NODE_ENV === 'development',
      logLevel: __DEV__ ? 'debug' : 'error'
    };
  }

  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enableConsoleLog) return false;

    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };

    return levels[level] >= levels[this.config.logLevel];
  }

  debug(message: string, ...args: any[]): void {
    if (this.shouldLog('debug')) {
      console.log(`🔍 ${message}`, ...args);
    }
  }

  info(message: string, ...args: any[]): void {
    if (this.shouldLog('info')) {
      console.log(`ℹ️ ${message}`, ...args);
    }
  }

  warn(message: string, ...args: any[]): void {
    if (this.shouldLog('warn')) {
      console.warn(`⚠️ ${message}`, ...args);
    }
  }

  error(message: string, ...args: any[]): void {
    if (this.shouldLog('error')) {
      console.error(`❌ ${message}`, ...args);
    }
  }

  // API 관련 특화 로깅 메서드들
  apiStart(endpoint: string, params?: any): void {
    this.debug(`API 요청 시작: ${endpoint}`, params ? { params } : '');
  }

  apiSuccess(endpoint: string, data?: any): void {
    this.debug(`API 요청 성공: ${endpoint}`, data ? { data } : '');
  }

  apiError(endpoint: string, error: any): void {
    this.error(`API 요청 실패: ${endpoint}`, error);
  }

  carbonData(context: string, carbonValue: number, additionalData?: any): void {
    this.info(`🌱 ${context}: ${carbonValue}kg`, additionalData || '');
  }
}

// 싱글톤 인스턴스 생성
export const logger = new Logger();

// 기본 export
export default logger;