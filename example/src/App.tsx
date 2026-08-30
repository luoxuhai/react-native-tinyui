import { useState } from 'react';
import { SafeAreaView, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Menu, Popover } from 'react-native-tinyui';

export default function App() {
  const [lastAction, setLastAction] = useState('No action selected');

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.eyebrow}>REACT NATIVE · NATIVE iOS</Text>
        <Text style={styles.title}>TinyUI</Text>
        <Text style={styles.subtitle}>
          Fabric components with a small, composable React API.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Menu</Text>
          <Text style={styles.body}>{lastAction}</Text>
          <Menu style={styles.control}>
            <Menu.Trigger accessibilityLabel="Open document actions">
              <View style={styles.primaryButton}>
                <Text style={styles.primaryButtonText}>Document actions</Text>
                <Text style={styles.chevron}>⌄</Text>
              </View>
            </Menu.Trigger>
            <Menu.Content>
              <Menu.Item
                systemImage="square.and.pencil"
                onSelect={() => setLastAction('Rename selected')}
              >
                Rename
              </Menu.Item>
              <Menu.Item
                systemImage="doc.on.doc"
                onSelect={() => setLastAction('Duplicate selected')}
              >
                Duplicate
              </Menu.Item>
              <Menu.Submenu title="Share" systemImage="square.and.arrow.up">
                <Menu.Item
                  systemImage="link"
                  onSelect={() => setLastAction('Copy link selected')}
                >
                  Copy link
                </Menu.Item>
                <Menu.Item
                  systemImage="person.2"
                  onSelect={() => setLastAction('Invite people selected')}
                >
                  Invite people
                </Menu.Item>
              </Menu.Submenu>
              <Menu.Divider />
              <Menu.Item
                destructive
                systemImage="trash"
                onSelect={() => setLastAction('Delete selected')}
              >
                Delete
              </Menu.Item>
            </Menu.Content>
          </Menu>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Popover</Text>
          <Text style={styles.body}>
            The trigger, content, and close action stay declarative.
          </Text>
          <Popover
            attachmentAnchor="bottom"
            arrowEdge="top"
            contentSize={{ width: 320, height: 196 }}
            style={styles.control}
          >
            <Popover.Trigger style={styles.secondaryButton}>
              <Text style={styles.secondaryButtonText}>Show details</Text>
            </Popover.Trigger>
            <Popover.Content style={styles.popoverContent}>
              <Text style={styles.popoverTitle}>Built for React Native</Text>
              <Text style={styles.popoverBody}>
                The popover is a real UIPopoverPresentationController, while its
                body remains a normal React Native view tree.
              </Text>
              <Popover.Close style={styles.closeButton}>
                <Text style={styles.closeButtonText}>Done</Text>
              </Popover.Close>
            </Popover.Content>
          </Popover>
        </View>
      </ScrollView>
    </SafeAreaView>
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
    minHeight: 50,
    borderRadius: 15,
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
    color: '#FFFFFF',
    fontWeight: '700',
  },
});
