import { useIsFocused } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import {
  PlatformColor,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  View,
} from 'react-native';
import {
  SFSymbol,
  TipKit,
  type TipAction,
  type TipError,
} from 'react-native-tinyui';

export function TipKitScreen() {
  const isFocused = useIsFocused();
  const [ready, setReady] = useState(false);
  const [inline, setInline] = useState(true);
  const [enabled, setEnabled] = useState(true);
  const [saved, setSaved] = useState(false);
  const [tipId, setTipId] = useState('tinyui.example.favorite.v1');
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;
    // Repeating this configuration when the screen remounts preserves history.
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

  const save = () => {
    setSaved(true);
    TipKit.invalidate(tipId, 'actionPerformed').catch((reason: Error) =>
      setError(reason.message)
    );
  };

  const newTip = () => {
    setTipId(`tinyui.example.favorite.demo.${Date.now()}`);
    setSaved(false);
    setError('');
    setEnabled(true);
  };

  const tipProps = {
    tipId,
    title: 'Keep your favorites close',
    message: 'Save an item to find it quickly next time.',
    systemImage: 'star',
    actions: [
      { id: 'save', title: 'Save this item' },
      { id: 'not-now', title: 'Not now' },
    ],
    maxDisplayCount: 3,
    enabled: enabled && isFocused && !saved,
    onActionPress: ({ id }: TipAction) => {
      if (id === 'save') save();
      if (id === 'not-now') setEnabled(false);
    },
    onError: (event: TipError) => setError(`${event.code}: ${event.message}`),
  };

  const saveButton = (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={saved ? 'Saved' : 'Save favorite'}
      onPress={save}
      style={styles.saveButton}
      testID="tip-save"
    >
      <SFSymbol
        name={saved ? 'star.fill' : 'star'}
        color={PlatformColor('systemBlueColor')}
        size={22}
      />
      <Text style={styles.buttonText}>{saved ? 'Saved' : 'Save favorite'}</Text>
    </Pressable>
  );

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.page}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Text style={styles.eyebrow}>TIPKIT · iOS 17+</Text>
      <Text style={styles.heading}>A hint, right on time.</Text>
      <Text style={styles.body}>
        Show a native tip inline or beside a feature. Save the item to complete
        this tip, or choose Not now to hide it temporarily.
      </Text>

      <View style={styles.row}>
        <Text style={styles.label}>Inline view</Text>
        <Switch
          accessibilityLabel="Inline view"
          value={inline}
          onValueChange={setInline}
          testID="tip-inline-mode"
        />
      </View>

      <View style={styles.stage}>
        <Text style={styles.stageTitle}>Weekend reading</Text>
        <Text style={styles.body}>Keep something worth coming back to.</Text>
        {ready ? (
          inline ? (
            <>
              <TipKit.View {...tipProps} testID="tip-inline" />
              <View style={styles.anchor}>{saveButton}</View>
            </>
          ) : (
            <TipKit.Popover
              {...tipProps}
              arrowEdge="bottom"
              style={styles.anchor}
              testID="tip-favorite-anchor"
            >
              {saveButton}
            </TipKit.Popover>
          )
        ) : (
          <Text style={styles.body}>Preparing tips…</Text>
        )}
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <View style={styles.copy}>
            <Text style={styles.label}>Allow this tip</Text>
            <Text style={styles.caption}>
              Hiding it does not erase its history.
            </Text>
          </View>
          <Switch
            accessibilityLabel="Allow this tip"
            value={enabled}
            onValueChange={setEnabled}
            testID="tip-enabled"
          />
        </View>
        {!!error && (
          <Text style={styles.error} testID="tip-error">
            {error}
          </Text>
        )}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={newTip}
        style={styles.newTip}
        testID="tip-new-demo"
      >
        <Text style={styles.buttonText}>New demo tip</Text>
      </Pressable>
      <Text style={styles.caption}>
        This button creates a separate demo ID so you can try again. In your
        app, keep each feature’s tip ID stable across launches.
      </Text>
      <Text style={styles.caption}>
        Closing the tip or saving the item persists its status. Leaving this
        screen only dismisses the bubble.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: PlatformColor('systemGroupedBackgroundColor'),
  },
  page: { padding: 24, paddingBottom: 48, gap: 16 },
  eyebrow: {
    fontSize: 11,
    letterSpacing: 1.5,
    fontWeight: '700',
    color: PlatformColor('systemBlueColor'),
  },
  heading: {
    fontSize: 30,
    fontWeight: '700',
    color: PlatformColor('labelColor'),
  },
  body: {
    fontSize: 15,
    lineHeight: 22,
    color: PlatformColor('secondaryLabelColor'),
  },
  stage: {
    borderRadius: 24,
    padding: 24,
    minHeight: 260,
    justifyContent: 'center',
    gap: 16,
    backgroundColor: PlatformColor('secondarySystemGroupedBackgroundColor'),
  },
  stageTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: PlatformColor('labelColor'),
  },
  anchor: { alignSelf: 'flex-start', marginTop: 30 },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 48,
    paddingHorizontal: 18,
    borderRadius: 24,
    backgroundColor: PlatformColor('tertiarySystemGroupedBackgroundColor'),
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: PlatformColor('systemBlueColor'),
  },
  card: {
    padding: 20,
    borderRadius: 20,
    gap: 12,
    backgroundColor: PlatformColor('secondarySystemGroupedBackgroundColor'),
  },
  row: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  copy: { flex: 1, gap: 4 },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: PlatformColor('labelColor'),
  },
  caption: {
    fontSize: 13,
    lineHeight: 19,
    color: PlatformColor('secondaryLabelColor'),
  },
  error: { fontSize: 13, color: PlatformColor('systemRedColor') },
  newTip: {
    minHeight: 48,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: PlatformColor('secondarySystemGroupedBackgroundColor'),
  },
});
