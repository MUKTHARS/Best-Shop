import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const Card = ({ 
  children, 
  style, 
  onPress,
  elevation = 2,
  padding = 16,
}) => {
  const cardStyle = [
    styles.card,
    { 
      padding,
      shadowOpacity: elevation * 0.1,
      shadowRadius: elevation * 1.5,
      elevation: elevation,
    },
    style,
  ];

  if (onPress) {
    return (
      <TouchableOpacity style={cardStyle} onPress={onPress}>
        {children}
      </TouchableOpacity>
    );
  }

  return (
    <View style={cardStyle}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    marginVertical: 4,
    marginHorizontal: 2,
  },
});

// Card Header Component
export const CardHeader = ({ title, subtitle, action, style }) => {
  return (
    <View style={[styles.cardHeader, style]}>
      <View style={styles.cardHeaderContent}>
        {title && <Text style={styles.cardTitle}>{title}</Text>}
        {subtitle && <Text style={styles.cardSubtitle}>{subtitle}</Text>}
      </View>
      {action && <View style={styles.cardHeaderAction}>{action}</View>}
    </View>
  );
};

// Card Content Component
export const CardContent = ({ children, style }) => {
  return (
    <View style={[styles.cardContent, style]}>
      {children}
    </View>
  );
};

// Card Footer Component
export const CardFooter = ({ children, style }) => {
  return (
    <View style={[styles.cardFooter, style]}>
      {children}
    </View>
  );
};

const componentStyles = StyleSheet.create({
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  cardHeaderContent: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  cardHeaderAction: {
    marginLeft: 12,
  },
  cardContent: {
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    gap: 8,
  },
});

export default Card;