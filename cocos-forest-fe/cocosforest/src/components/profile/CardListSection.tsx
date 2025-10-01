import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import type { UserCard } from '../../types/finance';
import { getCardColor } from '../../utils/bankUtils';

interface CardListSectionProps {
  userCards: UserCard[];
  onCardMenuPress: (card: UserCard) => void;
}

const CardListSection: React.FC<CardListSectionProps> = ({
  userCards,
  onCardMenuPress
}) => {
  if (userCards.length === 0) {
    return null;
  }

  return (
    <View style={[styles.section, styles.cardsSection]}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>연결된 카드</Text>
        <Text style={styles.cardCount}>{userCards.length}개</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.cardsScrollContainer}
        style={styles.cardsScrollView}
        nestedScrollEnabled={true}
      >
        {userCards.map((card, index) => (
          <View key={card.userCardId} style={styles.cardItemContainer}>
            <View style={[styles.cardContainer, { backgroundColor: getCardColor(index) }]}>
              <View style={styles.creditCardHeader}>
                <Text style={styles.cardTitle}>COCO</Text>
                <TouchableOpacity
                  style={styles.cardMenuButton}
                  onPress={() => onCardMenuPress(card)}
                >
                  <Text style={styles.cardMenuButtonText}>⋯</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.cardBody}>
                <Text style={styles.cardName}>{card.cardName}</Text>
                <Text style={styles.cardDescription}>환경을 생각하는 카드</Text>
              </View>
              <View style={styles.cardFooter}>
                <View style={styles.cardChip}>
                  <Text style={styles.cardChipText}>ECO</Text>
                </View>
                <Text style={styles.cardNumber}>•••• {card.userCardId.toString().slice(-4)}</Text>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#fff',
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  cardsSection: {
    paddingBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },
  cardCount: {
    fontSize: 14,
    color: '#666',
  },
  cardsScrollContainer: {
    paddingRight: 20,
  },
  cardsScrollView: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  cardItemContainer: {
    width: 280,
    height: 175,
    marginRight: 16,
  },
  cardContainer: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  creditCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1.5,
  },
  cardMenuButton: {
    padding: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardMenuButtonText: {
    fontSize: 10,
    color: '#fff',
    fontWeight: 'bold',
  },
  cardBody: {
    flex: 1,
    justifyContent: 'center',
  },
  cardName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  cardDescription: {
    fontSize: 9,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  cardChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  cardChipText: {
    fontSize: 8,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 0.5,
  },
  cardNumber: {
    fontSize: 8,
    color: 'rgba(255, 255, 255, 0.7)',
    letterSpacing: 1,
  },
});

export default CardListSection;