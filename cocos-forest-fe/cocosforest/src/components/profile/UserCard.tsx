import * as React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import type { UserCard } from '../../api/finance';

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
    <TouchableOpacity 
      style={styles.cardItemHorizontal}
      onLongPress={() => onDisconnect(card)}
      delayLongPress={800}
      activeOpacity={0.8}
    >
      <View style={[styles.cardContainer, { backgroundColor: getCardColor(index) }]}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>COCO</Text>
          <TouchableOpacity 
            style={styles.cardMenuButton}
            onPress={() => onDisconnect(card)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
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
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  cardItemHorizontal: {
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
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardMenuButton: {
    padding: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  cardMenuText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    minWidth: 20,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    letterSpacing: 1.5,
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
  cardNickname: {
    fontSize: 12,
    color: '#E5E7EB',
    fontWeight: '300',
    marginTop: 2,
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

export default UserCard;
