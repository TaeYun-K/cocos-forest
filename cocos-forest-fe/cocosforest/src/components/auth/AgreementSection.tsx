import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { AllAgreementToggle } from './AllAgreementToggle';
import { IndividualAgreementItem } from './IndividualAgreementItem';

interface AgreementSectionProps {
  agreements: {
    terms: boolean;
    privacy: boolean;
    marketing: boolean;
  };
  onAgreementChange: (type: 'terms' | 'privacy' | 'marketing') => void;
  onAllAgreementToggle: () => void;
}

export const AgreementSection: React.FC<AgreementSectionProps> = ({
  agreements,
  onAgreementChange,
  onAllAgreementToggle,
}) => {
  const allRequiredAgreed = agreements.terms && agreements.privacy;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <AllAgreementToggle
        isAllAgreed={allRequiredAgreed}
        onToggle={onAllAgreementToggle}
      />

      <View style={styles.individualAgreements}>
        <IndividualAgreementItem
          isChecked={agreements.terms}
          onToggle={() => onAgreementChange('terms')}
          title="이용약관 동의"
          isRequired={true}
          onViewDetails={() => {}}
        />

        <IndividualAgreementItem
          isChecked={agreements.privacy}
          onToggle={() => onAgreementChange('privacy')}
          title="개인정보처리방침 동의"
          isRequired={true}
          onViewDetails={() => {}}
        />

        <IndividualAgreementItem
          isChecked={agreements.marketing}
          onToggle={() => onAgreementChange('marketing')}
          title="마케팅 정보 수신 동의"
          isRequired={false}
          onViewDetails={() => {}}
        />
      </View>

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>
          • 필수 항목에 동의하지 않으시면 서비스 이용이 제한될 수 있습니다.
        </Text>
        <Text style={styles.infoText}>
          • 선택 항목은 동의하지 않아도 서비스 이용이 가능합니다.
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  individualAgreements: {
    marginBottom: 24,
  },
  infoContainer: {
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  infoText: {
    fontSize: 12,
    color: '#6C757D',
    lineHeight: 18,
    marginBottom: 4,
  },
});