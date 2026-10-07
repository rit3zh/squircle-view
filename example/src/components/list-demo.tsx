import { FlatList, StyleSheet, Text, type ListRenderItem } from 'react-native';
import { SquircleView } from 'squircle-view';

import { colors, LIST_ITEMS } from '../constants';
import { DemoSection } from './demo-section';

const renderItem: ListRenderItem<number> = ({ item }) => (
  <SquircleView
    borderSmoothing={1}
    style={[
      styles.item,
      { backgroundColor: `hsl(${(item * 23) % 360}, 70%, 60%)` },
    ]}
  >
    <Text style={styles.text}>{item}</Text>
  </SquircleView>
);

const keyExtractor = (item: number): string => String(item);

export function ListDemo() {
  return (
    <DemoSection title={`FlatList · ${LIST_ITEMS.length} items`}>
      <FlatList
        horizontal
        data={LIST_ITEMS}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        showsHorizontalScrollIndicator={false}
      />
    </DemoSection>
  );
}

const styles = StyleSheet.create({
  item: {
    width: 72,
    height: 72,
    marginRight: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
  },
  text: {
    color: colors.surface,
    fontWeight: '700',
  },
});
