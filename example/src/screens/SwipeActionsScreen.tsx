import { useState } from 'react';
import {
  FlatList,
  PlatformColor,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SwipeActions, type SwipeActionsEdge } from 'react-native-tinyui';

import {
  Choices,
  ControlPanel,
  PanelDivider,
  Setting,
  ToggleSetting,
  playgroundStyles,
} from '../components/Playground';

const initialRows = Array.from({ length: 24 }, (_, index) => ({
  id: `message-${index}`,
  title: index === 0 ? 'Weekend plans' : `Message ${index + 1}`,
}));

export function SwipeActionsScreen() {
  const [rows, setRows] = useState(initialRows);
  const [edge, setEdge] = useState<SwipeActionsEdge>('trailing');
  const [allowsFullSwipe, setAllowsFullSwipe] = useState(true);
  const [disabled, setDisabled] = useState(false);
  const [rtl, setRtl] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [lastEvent, setLastEvent] = useState(
    'Swipe a row to reveal its actions.'
  );

  return (
    <FlatList
      data={rows}
      keyExtractor={(item) => item.id}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
      ListHeaderComponent={
        <View style={styles.header}>
          <Text accessibilityRole="header" style={styles.heading}>
            A swipe away.
          </Text>
          <Text style={playgroundStyles.caption}>
            Swipe to archive or delete. Tap a row to test its React Native press
            handler.
          </Text>
          <ControlPanel>
            <Setting title="Edge" value={edge}>
              <Choices
                label="Swipe edge"
                labels={['Trailing', 'Leading']}
                selected={edge === 'trailing' ? 0 : 1}
                onSelect={(index) =>
                  setEdge(index === 0 ? 'trailing' : 'leading')
                }
              />
            </Setting>
            <PanelDivider />
            <ToggleSetting
              title="Allow full swipe"
              hint="Swipe all the way to archive the message."
              value={allowsFullSwipe}
              onValueChange={setAllowsFullSwipe}
            />
            <PanelDivider />
            <ToggleSetting
              title="Disable actions"
              hint="Row taps continue working while swipes are disabled."
              value={disabled}
              onValueChange={setDisabled}
            />
            <PanelDivider />
            <ToggleSetting
              title="Right-to-left rows"
              hint="Leading and trailing follow the row's direction."
              value={rtl}
              onValueChange={setRtl}
            />
            <PanelDivider />
            <ToggleSetting
              title="Taller rows"
              hint="Resize the content without setting a fixed height."
              value={expanded}
              onValueChange={setExpanded}
            />
          </ControlPanel>
          <Text testID="swipe-last-event" style={playgroundStyles.caption}>
            {lastEvent}
          </Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setRows(initialRows)}
          >
            <Text style={styles.reset}>Reset messages</Text>
          </Pressable>
        </View>
      }
      renderItem={({ item }) => (
        <SwipeActions
          testID={`swipe-${item.id}`}
          edge={edge}
          allowsFullSwipe={allowsFullSwipe}
          disabled={disabled}
          style={[styles.row, rtl ? styles.rtl : styles.ltr]}
          contentContainerStyle={styles.card}
          actions={[
            {
              id: 'archive',
              title: 'Archive',
              systemImage: 'archivebox',
              tintColor: PlatformColor('systemBlueColor'),
            },
            {
              id: 'delete',
              title: 'Delete',
              systemImage: 'trash',
              destructive: true,
            },
          ]}
          onActionPress={({ nativeEvent }) => {
            setLastEvent(`${nativeEvent.title}: ${item.title}`);
            setRows((current) => current.filter((row) => row.id !== item.id));
          }}
        >
          <Pressable
            accessibilityRole="button"
            onPress={() => setLastEvent(`Pressed: ${item.title}`)}
            style={styles.rowContent}
          >
            <Text style={styles.title}>{item.title}</Text>
            <Text style={playgroundStyles.caption}>
              React Native content · Native swipe actions
            </Text>
            {expanded && (
              <Text style={playgroundStyles.caption}>
                This row grows with its content. Swipe actions follow the height
                computed by Yoga.
              </Text>
            )}
          </Pressable>
        </SwipeActions>
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  header: { gap: 16, marginBottom: 20 },
  heading: {
    color: PlatformColor('labelColor'),
    fontSize: 30,
    fontWeight: '700',
  },
  reset: { color: PlatformColor('systemBlueColor'), fontSize: 16 },
  row: {
    marginBottom: 8,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: PlatformColor('secondarySystemGroupedBackgroundColor'),
  },
  rowContent: { padding: 18, gap: 6 },
  rtl: { direction: 'rtl' },
  ltr: { direction: 'ltr' },
  title: {
    color: PlatformColor('labelColor'),
    fontSize: 17,
    fontWeight: '600',
  },
});
