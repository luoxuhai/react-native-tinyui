import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { Menu, Popover, PopoverClose } from 'react-native-tinyui';

export default function App() {
  const [lastAction, setLastAction] = useState('No action selected');

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
          <Text style={styles.cardTitle}>Menu</Text>
          <Text style={styles.body}>{lastAction}</Text>
          <Menu
            accessibilityLabel="Open document actions"
            options={[
              {
                title: 'Rename',
                systemImage: 'square.and.pencil',
                onSelect: () => setLastAction('Rename selected'),
              },
              {
                title: 'Duplicate',
                systemImage: 'doc.on.doc',
                state: 'on',
                onSelect: () => setLastAction('Duplicate selected'),
              },
              {
                type: 'submenu',
                title: 'Share',
                systemImage: 'square.and.arrow.up',
                options: [
                  {
                    title: 'Copy link',
                    systemImage: 'link',
                    onSelect: () => setLastAction('Copy link selected'),
                  },
                  {
                    title: 'Invite people',
                    systemImage: 'person.2',
                    onSelect: () => setLastAction('Invite people selected'),
                  },
                ],
              },
              { type: 'divider' },
              {
                title: 'Delete',
                destructive: true,
                systemImage: 'trash',
                onSelect: () => setLastAction('Delete selected'),
              },
            ]}
            style={styles.control}
          >
            <View style={styles.primaryButton}>
              <Text style={styles.primaryButtonText}>Document actions</Text>
              <Text style={styles.chevron}>⌄</Text>
            </View>
          </Menu>
        </View>

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
  primaryButton: {
    minHeight: 50,
    borderRadius: 15,
    backgroundColor: '#6E6BFF',
    paddingHorizontal: 17,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  chevron: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
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
