import { useIsFocused } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  Button,
  PlatformColor,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import { TipKit } from 'react-native-tinyui';

export function TipKitGroupScreen() {
  const isFocused = useIsFocused();
  const [ready, setReady] = useState(false);
  const [running, setRunning] = useState(false);
  const [outside, setOutside] = useState(false);
  const [namespace, setNamespace] = useState('tinyui.example.ordered.v1');
  const [completed, setCompleted] = useState<string[]>([]);
  const [error, setError] = useState('');
  const tipIds = [`${namespace}.favorite`, `${namespace}.share`];

  useEffect(() => {
    let mounted = true;
    TipKit.configure({ displayFrequency: 'immediate' }).then(
      () => {
        if (mounted) setReady(true);
      },
      (reason: Error) => {
        if (mounted) setError(reason.message);
      }
    );
    return () => {
      mounted = false;
    };
  }, []);

  const finish = (tipId: string) => {
    TipKit.invalidate(tipId, 'actionPerformed').catch((reason: Error) =>
      setError(reason.message)
    );
  };

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.page}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Text style={styles.heading}>One tip at a time.</Text>
      <Text style={styles.body}>
        Start with favorites, then discover sharing. Close a tip with × or use
        its feature to continue.
      </Text>
      <View style={styles.row}>
        <Text style={styles.body}>Advance when tapping outside</Text>
        <Switch
          accessibilityLabel="Advance when tapping outside"
          testID="tip-group-outside"
          value={outside}
          onValueChange={setOutside}
        />
      </View>
      <Button
        title={running ? 'Pause tips' : 'Start tips'}
        testID="tip-group-start"
        disabled={!ready}
        onPress={() => setRunning(!running)}
      />
      {ready && (
        <TipKit.Group
          tipIds={tipIds}
          priority="ordered"
          enabled={isFocused && running}
          invalidateOnOutsideDismiss={outside}
        >
          {tipIds.map((tipId, index) => (
            <View key={tipId} style={styles.card}>
              <Text style={styles.title}>
                {index === 0 ? 'Your reading list' : 'Worth sharing'}
              </Text>
              <Text style={styles.body}>
                {index === 0
                  ? 'Keep something worth coming back to.'
                  : 'Send a good read to someone you know.'}
              </Text>
              <TipKit.Popover
                tipId={tipId}
                title={
                  index === 0 ? 'Save your favorites' : 'Share with a friend'
                }
                message={
                  index === 0
                    ? 'This is the first tip.'
                    : 'This is the second tip.'
                }
                systemImage={index === 0 ? 'star' : 'square.and.arrow.up'}
                actions={[
                  { id: 'next', title: index === 0 ? 'Next tip' : 'Done' },
                ]}
                onActionPress={() => finish(tipId)}
                onInvalidated={() =>
                  setCompleted((previous) =>
                    previous.includes(tipId) ? previous : [...previous, tipId]
                  )
                }
                onError={(event) => setError(event.message)}
                testID={`tip-group-anchor-${index}`}
              >
                <Button
                  title={index === 0 ? 'Favorite' : 'Share'}
                  onPress={() => finish(tipId)}
                />
              </TipKit.Popover>
            </View>
          ))}
        </TipKit.Group>
      )}
      <Text style={styles.body} testID="tip-group-progress">
        Completed {completed.length} of 2 tips
      </Text>
      <Button
        title="New demo sequence"
        testID="tip-group-new"
        onPress={() => {
          setRunning(false);
          setNamespace(`tinyui.example.ordered.demo.${Date.now()}`);
          setCompleted([]);
          setError('');
        }}
      />
      <Text style={styles.body}>
        Pausing or leaving this screen preserves progress. A new demo sequence
        uses fresh IDs so you can try again.
      </Text>
      {!!error && <Text style={styles.error}>{error}</Text>}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: PlatformColor('systemGroupedBackgroundColor'),
  },
  page: { padding: 24, paddingBottom: 48, gap: 20 },
  heading: {
    fontSize: 28,
    fontWeight: '700',
    color: PlatformColor('labelColor'),
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: PlatformColor('labelColor'),
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: PlatformColor('secondaryLabelColor'),
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  card: {
    padding: 24,
    borderRadius: 20,
    gap: 16,
    backgroundColor: PlatformColor('secondarySystemGroupedBackgroundColor'),
  },
  error: { color: PlatformColor('systemRedColor') },
});
