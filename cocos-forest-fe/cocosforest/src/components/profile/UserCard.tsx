import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import type { UserCard } from '../../types/finance';

interface UserCardProps {
  card: UserCard;
  index: number;
  onDisconnect: (card: UserCard) => void;
  getCardColor: (index: number) => string;
}

const UserCard: React.FC<UserCardProps> = ({
  card,
  index,
  onDisconnect,
  getCardColor,
}) => {
  return (
    <View style={styles.cardItemHorizontal}>
      <View style={[styles.cardContainer, { backgroundColor: getCardColor(index) }]}>
        {/* 배경 그라데이션 효과 */}
        <View style={styles.gradientOverlay} />
        
        <View style={styles.cardHeader}>
          <View style={styles.cardTitleContainer}>
            <Text style={styles.cardTitle}>COCO</Text>
            <View style={styles.cardTitleUnderline} />
          </View>
          <TouchableOpacity 
            style={styles.cardMenuButton}
            onPress={() => onDisconnect(card)}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
          >
            <Text style={styles.cardMenuText}>⋯</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.cardBody}>
          <Text style={styles.cardName}>{card.cardName}</Text>
          <Text style={styles.cardNickname}>{card.cardDescription || '에코 카드'}</Text>
        </View>
        
        <View style={styles.cardFooter}>
          <View style={styles.cardChip}>
            <Text style={styles.cardChipText}>ECO</Text>
          </View>
          <Text style={styles.cardNumber}>•••• {card.cardUniqueNo.slice(-4).toUpperCase()}</Text>
        </View>

        {/* 장식 요소 */}
        <View style={styles.decorativeCircle1} />
        <View style={styles.decorativeCircle2} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardItemHorizontal: {
    width: 300,
    height: 190,
    marginRight: 20,
  },
  cardContainer: {
    flex: 1,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  gradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 24,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    zIndex: 2,
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 3,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  cardTitleUnderline: {
    width: 25,
    height: 3,
    backgroundColor: 'rgba(255,255,255,0.8)',
    marginLeft: 8,
    borderRadius: 2,
  },
  cardMenuButton: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  cardMenuText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    textAlign: 'center',
    minWidth: 28,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  cardBody: {
    flex: 1,
    justifyContent: 'center',
    marginBottom: 24,
    zIndex: 2,
  },
  cardName: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 12,
    letterSpacing: 1.5,
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  cardNickname: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 2,
  },
  cardChip: {
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.5)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  cardChipText: {
    fontSize: 12,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1.5,
  },
  cardNumber: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 2,
    fontWeight: '700',
  },
  decorativeCircle1: {
    position: 'absolute',
    top: -20,
    right: -20,
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255,255,255,0.1)',
    zIndex: 1,
  },
  decorativeCircle2: {
    position: 'absolute',
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.08)',
    zIndex: 1,
  },
});

export default UserCard;
