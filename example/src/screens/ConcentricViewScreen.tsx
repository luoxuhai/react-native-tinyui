import { useState } from 'react';
import { Platform, PlatformColor, StyleSheet, Text, View } from 'react-native';
import { ConcentricView } from 'react-native-tinyui';

import {
  Choices,
  ControlPanel,
  PanelDivider,
  PlaygroundPage,
  Setting,
  playgroundStyles,
} from '../components/Playground';

const edgeInsets = [8, 16, 32] as const;
const bottomOffsets = [0, 16, 32] as const;
const spacings = [8, 16, 26] as const;

export function ConcentricViewScreen() {
  const [edgeInsetIndex, setEdgeInsetIndex] = useState(0);
  const [bottomOffsetIndex, setBottomOffsetIndex] = useState(0);
  const [spacingIndex, setSpacingIndex] = useState(1);
  const edgeInset = edgeInsets[edgeInsetIndex] ?? edgeInsets[0];
  const bottomOffset = bottomOffsets[bottomOffsetIndex] ?? bottomOffsets[0];
  const spacing = spacings[spacingIndex] ?? spacings[1];
  const supportsConcentricCorners =
    Platform.OS === 'ios' && parseInt(String(Platform.Version), 10) >= 26;

  return (
    <View style={styles.container}>
      <PlaygroundPage
        title={'Corners that\nfollow their container.'}
        description="Change the position and spacing below. On iOS 26+, UIKit adapts each corner to the surrounding geometry."
      >
        <ControlPanel>
          <Setting
            title="Edge inset"
            hint="Inset the preview from the sides and bottom of the screen."
          >
            <Choices
              label="Edge inset"
              labels={edgeInsets.map((value) => `${value} pt`)}
              onSelect={setEdgeInsetIndex}
              selected={edgeInsetIndex}
            />
          </Setting>
          <PanelDivider />
          <Setting
            title="Lift from bottom"
            hint="Move away from the bottom corners to see how the rounding changes."
          >
            <Choices
              label="Lift from bottom"
              labels={bottomOffsets.map((value) => `${value} pt`)}
              onSelect={setBottomOffsetIndex}
              selected={bottomOffsetIndex}
            />
          </Setting>
          <PanelDivider />
          <Setting
            title="Nested spacing"
            hint="Change the gap between the three colored containers."
          >
            <Choices
              label="Nested spacing"
              labels={spacings.map((value) => `${value} pt`)}
              onSelect={setSpacingIndex}
              selected={spacingIndex}
            />
          </Setting>
        </ControlPanel>
        <Text style={playgroundStyles.caption}>
          {supportsConcentricCorners
            ? 'Each corner is resolved independently, with no minimum radius. Corners can become square as they move away from a rounded container corner.'
            : 'Automatic concentric corners require iOS 26+. On this version, all three containers use a fixed 24 pt fallback radius.'}
        </Text>
      </PlaygroundPage>

      {/* Keep the preview outside the scroll view and bottom safe area so its
          corners can approach the window corners. Do not set borderRadius. */}
      <View
        style={[
          styles.preview,
          {
            paddingHorizontal: edgeInset,
            paddingBottom: edgeInset + bottomOffset,
          },
        ]}
      >
        <ConcentricView
          minimumRadius={24}
          style={[styles.outer, { padding: spacing }]}
          testID="concentric-outer"
        >
          <ConcentricView
            minimumRadius={24}
            style={[styles.middle, { padding: spacing }]}
            testID="concentric-middle"
          >
            <ConcentricView
              minimumRadius={24}
              style={styles.inner}
              testID="concentric-inner"
            >
              <Text style={styles.previewTitle}>Watch the corners.</Text>
              <Text style={styles.previewDescription}>
                {supportsConcentricCorners
                  ? 'The shape follows the container.'
                  : 'Fixed corners on iOS before 26.'}
              </Text>
            </ConcentricView>
          </ConcentricView>
        </ConcentricView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: PlatformColor('systemGroupedBackgroundColor'),
  },
  preview: { flexShrink: 0 },
  outer: { backgroundColor: '#2D3E92' },
  middle: { backgroundColor: '#8FADF4' },
  inner: {
    minHeight: 140,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: '#E5EDFF',
  },
  previewTitle: {
    color: '#21316E',
    fontSize: 25,
    fontWeight: '700',
    textAlign: 'center',
  },
  previewDescription: {
    color: '#394D85',
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
});
