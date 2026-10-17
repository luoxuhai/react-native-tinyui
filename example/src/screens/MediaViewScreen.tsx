import { useState } from 'react';
import { PlatformColor, StyleSheet, Text, View } from 'react-native';
import { MediaView, type ResizeMode } from 'react-native-tinyui';

import { EventStatus } from '../components/ExampleList';
import {
  Choices,
  ControlPanel,
  PanelDivider,
  PlaygroundPage,
  Setting,
} from '../components/Playground';

const samples = [
  { label: 'AVIF image', source: require('../assets/sample.avif') },
  { label: 'MP4 video', source: require('../assets/sample.mp4') },
] as const;
const resizeModes: readonly ResizeMode[] = [
  'contain',
  'cover',
  'stretch',
  'center',
];

export function MediaViewScreen() {
  const [sampleIndex, setSampleIndex] = useState(0);
  const [resizeIndex, setResizeIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('Waiting for media');
  const sample = samples[sampleIndex] ?? samples[0];
  const resizeMode = resizeModes[resizeIndex] ?? 'contain';

  return (
    <PlaygroundPage
      title={'Images.\nMotion. Native.'}
      description="Display a bundled AVIF image or a muted, looping video using native iOS media views."
    >
      <View style={styles.preview}>
        <MediaView
          accessibilityLabel={sample.label}
          onError={({ nativeEvent }) => setStatus(nativeEvent.error)}
          onLoad={() => setStatus('Ready')}
          onLoadEnd={() => setLoading(false)}
          onLoadStart={() => {
            setLoading(true);
            setStatus('Loading');
          }}
          resizeMode={resizeMode}
          source={sample.source}
          style={styles.media}
          testID="media-view-preview"
        />
      </View>
      <EventStatus>{loading ? 'Loading…' : status}</EventStatus>

      <ControlPanel>
        <Setting title="Media" hint="Both samples are included with the app.">
          <Choices
            label="Media source"
            labels={samples.map((item) => item.label)}
            onSelect={setSampleIndex}
            selected={sampleIndex}
          />
        </Setting>
        <PanelDivider />
        <Setting
          title="Resize mode"
          hint="Center keeps images at their natural size. Videos use aspect fit."
        >
          <Choices
            label="Media resize mode"
            labels={resizeModes}
            onSelect={setResizeIndex}
            selected={resizeIndex}
          />
        </Setting>
      </ControlPanel>
      <Text style={styles.note}>
        Videos start automatically, loop seamlessly, and play without sound.
      </Text>
    </PlaygroundPage>
  );
}

const styles = StyleSheet.create({
  preview: {
    aspectRatio: 1,
    borderRadius: 22,
    overflow: 'hidden',
    backgroundColor: PlatformColor('secondarySystemGroupedBackgroundColor'),
  },
  media: { width: '100%', height: '100%' },
  note: {
    color: PlatformColor('secondaryLabelColor'),
    fontSize: 13,
    lineHeight: 19,
  },
});
