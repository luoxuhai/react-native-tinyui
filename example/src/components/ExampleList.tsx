import type { PropsWithChildren, ReactNode } from 'react';
import {
  PlatformColor,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

export function ExampleList({
  children,
  intro,
}: PropsWithChildren<{ intro: string }>) {
  return (
    <ScrollView
      contentContainerStyle={styles.list}
      contentInsetAdjustmentBehavior="automatic"
    >
      <Text style={styles.intro}>{intro}</Text>
      {children}
    </ScrollView>
  );
}

export function ExampleCard({
  children,
  description,
  title,
}: PropsWithChildren<{ description: string; title: string }>) {
  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
      {children}
    </View>
  );
}

export function EventStatus({ children }: { children: ReactNode }) {
  return (
    <View style={styles.eventStatus}>
      <View style={styles.eventDot} />
      <Text style={styles.eventText}>{children}</Text>
    </View>
  );
}

export const exampleStyles = StyleSheet.create({
  primaryButton: {
    minHeight: 52,
    borderRadius: 15,
    backgroundColor: PlatformColor('systemBlueColor'),
    paddingHorizontal: 18,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  primaryButtonText: {
    color: PlatformColor('whiteColor'),
    fontSize: 16,
    fontWeight: '700',
  },
  secondaryButton: {
    minHeight: 52,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: PlatformColor('separatorColor'),
    backgroundColor: PlatformColor('secondarySystemGroupedBackgroundColor'),
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  secondaryButtonText: {
    color: PlatformColor('labelColor'),
    fontSize: 16,
    fontWeight: '700',
  },
});

const styles = StyleSheet.create({
  list: {
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 48,
    gap: 16,
  },
  intro: {
    color: PlatformColor('secondaryLabelColor'),
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 2,
  },
  card: {
    borderRadius: 20,
    backgroundColor: PlatformColor('secondarySystemGroupedBackgroundColor'),
    padding: 18,
    gap: 16,
    shadowColor: PlatformColor('blackColor'),
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 20,
  },
  cardHeader: {
    gap: 5,
  },
  cardTitle: {
    color: PlatformColor('labelColor'),
    fontSize: 19,
    fontWeight: '700',
  },
  description: {
    color: PlatformColor('secondaryLabelColor'),
    fontSize: 13,
    lineHeight: 19,
  },
  eventStatus: {
    minHeight: 42,
    borderRadius: 12,
    backgroundColor: PlatformColor('tertiarySystemGroupedBackgroundColor'),
    paddingHorizontal: 13,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },
  eventDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: PlatformColor('systemBlueColor'),
  },
  eventText: {
    flex: 1,
    color: PlatformColor('secondaryLabelColor'),
    fontSize: 13,
  },
});
