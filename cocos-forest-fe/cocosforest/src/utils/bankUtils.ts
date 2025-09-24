// 은행 관련 유틸리티 함수들

export const getBankColor = (bankCode: string): string => {
  const colorMap: { [key: string]: string } = {
    '001': '#DC2626', '002': '#059669', '003': '#2563EB', '004': '#FBBF24',
    '011': '#16A34A', '020': '#0EA5E9', '023': '#10B981', '027': '#DC2626',
    '032': '#7C3AED', '034': '#EC4899', '035': '#F59E0B', '037': '#8B5CF6',
    '039': '#EF4444', '045': '#84CC16', '081': '#10B981', '088': '#3B82F6',
    '090': '#FBBF24', '999': '#6366F1'
  };
  return colorMap[bankCode] || '#6B7280';
};

export const getBankIcon = (bankCode: string, bankName: string) => {
  const iconMap: { [key: string]: any } = {
    '001': require('../../assets/bank-logos/bok.png'), // 한국은행
    '002': require('../../assets/bank-logos/kdb.png'), // 산업은행
    '003': require('../../assets/bank-logos/ibk.png'), // 기업은행
    '004': require('../../assets/bank-logos/kb.png'), // 국민은행
    '011': require('../../assets/bank-logos/nh.png'), // 농협은행
    '020': require('../../assets/bank-logos/woori.png'), // 우리은행
    '023': require('../../assets/bank-logos/sc.png'), // SC제일은행
    '027': require('../../assets/bank-logos/citi.png'), // 시티은행
    '032': require('../../assets/bank-logos/dgb.png'), // 대구은행
    '034': require('../../assets/bank-logos/kjb.png'), // 광주은행
    '035': require('../../assets/bank-logos/jb.png'), // 제주은행
    '037': require('../../assets/bank-logos/jbbank.png'), // 전북은행
    '039': require('../../assets/bank-logos/knb.png'), // 경남은행
    '045': require('../../assets/bank-logos/kfcc.png'), // 새마을금고
    '081': require('../../assets/bank-logos/hana.png'), // KEB하나은행
    '088': require('../../assets/bank-logos/shinhan.png'), // 신한은행
    '090': require('../../assets/bank-logos/kakao.png'), // 카카오뱅크
    '999': require('../../assets/bank-logos/ssafy-bank.png') // 싸피은행
  };
  return iconMap[bankCode] || null;
};

export const getCardColor = (index: number): string => {
  const colors = ['#6366F1', '#8B5CF6', '#EC4899', '#F59E0B'];
  return colors[index % colors.length];
};

