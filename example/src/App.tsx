import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { LiquidGlassText, Popover, PopoverClose } from 'react-native-tinyui';

import { MenuExamples } from './MenuExamples';

export default function App() {
  return (
    <View style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.container}
        contentInsetAdjustmentBehavior="automatic"
      >
        <Text style={styles.eyebrow}>REACT NATIVE · NATIVE iOS</Text>
        <Text style={styles.title}>TinyUI</Text>
        <Text style={styles.subtitle}>
          Fabric components with a small, composable React API.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>LiquidGlassText</Text>
          <Text style={styles.body}>Native glass lettering · iOS 26+</Text>
          <View style={styles.glassStage}>
            <View style={styles.glassOrb} />
            <LiquidGlassText
              text="Liquid Glass"
              effect="regular"
              tint="#FFFFFF55"
              fontDesign="rounded"
              textStyle={styles.glassTitle}
              testID="liquid-glass-title"
            />
            <LiquidGlassText
              text={'Clear glass\n多行文字'}
              fontDesign="serif"
              textStyle={styles.glassMultiline}
              multilineTextAlignment="center"
              testID="liquid-glass-multiline"
            />
            <LiquidGlassText
              text="Hello, Glass!"
              effect="regular"
              tint="#80E8FF99"
              interactive
              fontDesign="monospaced"
              textStyle={styles.glassSubtitle}
            />
          </View>
        </View>

        <MenuExamples />

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Popover</Text>
          <Text style={styles.body}>
            The trigger is children; the content is a prop.
          </Text>
          <Popover
            attachmentAnchor="leading"
            arrowEdge="top"
            // eslint-disable-next-line react/no-unstable-nested-components -- render-prop, not a component definition
            content={({ close }) => (
              <View style={styles.popoverContent}>
                <Text style={styles.popoverTitle}>Built for React Native</Text>
                <Text style={styles.popoverBody}>
                  The popover is a real UIPopoverPresentationController, while
                  its body remains a normal React Native view tree.
                </Text>
                <PopoverClose close={close} style={styles.closeButton}>
                  <Text style={styles.closeButtonText}>Done</Text>
                </PopoverClose>
              </View>
            )}
            style={styles.control}
          >
            <View style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Show details</Text>
            </View>
          </Popover>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  glassStage: {
    marginTop: 18,
    paddingVertical: 24,
    borderRadius: 18,
    backgroundColor: '#423282',
    alignItems: 'center',
    gap: 16,
    overflow: 'hidden',
  },
  glassTitle: {
    fontSize: 38,
    fontWeight: '800',
  },
  glassMultiline: {
    fontSize: 30,
    fontWeight: '700',
  },
  glassSubtitle: {
    fontSize: 22,
    fontWeight: '600',
  },
  glassOrb: {
    position: 'absolute',
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: '#C34F8B',
    right: -55,
    top: -60,
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F5F7',
  },
  container: {
    paddingHorizontal: 24,
    paddingVertical: 36,
    gap: 18,
  },
  eyebrow: {
    color: '#6E6BFF',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
  },
  title: {
    color: '#17171B',
    fontSize: 40,
    fontWeight: '800',
    letterSpacing: -1.2,
  },
  subtitle: {
    color: '#62626C',
    fontSize: 17,
    lineHeight: 24,
    marginBottom: 8,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    shadowColor: '#101015',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.06,
    shadowRadius: 20,
  },
  cardTitle: {
    color: '#17171B',
    fontSize: 21,
    fontWeight: '700',
    marginBottom: 6,
  },
  body: {
    color: '#72727C',
    fontSize: 15,
    lineHeight: 21,
  },
  control: {
    marginTop: 18,
  },
  secondaryButton: {
    width: 200,
    minHeight: 50,
    borderRadius: 15,
    marginLeft: 100,
    borderWidth: 1,
    borderColor: '#D8D8E0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButtonText: {
    color: '#33333A',
    fontSize: 16,
    fontWeight: '700',
  },
  popoverContent: {
    padding: 22,
    justifyContent: 'center',
    width: 100,
    height: 100,
  },
  popoverTitle: {
    color: '#17171B',
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  popoverBody: {
    color: '#686872',
    fontSize: 15,
    lineHeight: 21,
  },
  closeButton: {
    alignSelf: 'flex-end',
    marginTop: 18,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
    backgroundColor: '#6E6BFF',
  },
  closeButtonText: {
    fontWeight: '700',
  },
});
