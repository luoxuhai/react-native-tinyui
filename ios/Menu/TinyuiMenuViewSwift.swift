import React
import SwiftUI
import UIKit

/**
 * Observable props shared between the Objective-C++ component view and the
 * SwiftUI `Menu` implementation. Mirror of `TinyuiMenuProps` in codegen.
 */
class TinyuiMenuProps: ObservableObject {
  @Published var menuConfig: [String: Any] = [:]
  @Published var title: String = ""
  @Published var disabled: Bool = false
  @Published var hasPrimaryAction: Bool = false
  @Published var triggerView: UIView?
}

/**
 * SwiftUI `Menu` backed by UIKit's UIMenu, matching expo-ui's MenuView.
 *
 * The React Native trigger (a UIView) is embedded as the menu label through
 * `RepresentableView`, so the tap target remains the native RN subtree while
 * the menu content is built natively from the configuration object.
 *
 * Named distinctly from the Fabric component view `TinyuiMenuView`.
 */
struct TinyuiMenuSwiftUIView: View {
  @ObservedObject var props: TinyuiMenuProps
  weak var delegate: TinyuiMenuViewDelegate?

  var body: some View {
    Group {
      if let triggerView = props.triggerView {
        if props.hasPrimaryAction {
          Menu {
            menuContent
          } label: {
            RepresentableView(view: triggerView)
          } primaryAction: {
            delegate?.onPrimaryAction()
          }
          .disabled(props.disabled)
        } else {
          Menu {
            menuContent
          } label: {
            RepresentableView(view: triggerView)
          }
          .disabled(props.disabled)
        }
      } else {
        // No trigger mounted yet; render an empty view until the RN child
        // is attached to the provider.
        Color.clear
      }
    }
  }

  @ViewBuilder
  private var menuContent: some View {
    if props.title.isEmpty {
      elementsContent
    } else {
      Section {
        elementsContent
      } header: {
        Text(props.title)
      }
    }
  }

  @ViewBuilder
  private var elementsContent: some View {
    ForEach(buildElements(from: props.menuConfig)) { element in
      element.buildView(delegate: delegate)
    }
  }

  /// Converts the menu config into a list of SwiftUI element builders.
  private func buildElements(from config: [String: Any]) -> [TinyuiMenuElement] {
    guard let items = config["items"] as? [[String: Any]] else {
      return []
    }
    return items.map { TinyuiMenuElement(dictionary: $0) }
  }
}

/**
 * Lightweight representation of a single UIMenu element read from the config.
 * Used to build SwiftUI menu content without resolving all elements
 * eagerly. Returns `AnyView` to avoid recursive opaque return type errors.
 */
struct TinyuiMenuElement: Identifiable {
  let id = UUID()
  private let dictionary: [String: Any]

  init(dictionary: [String: Any]) {
    self.dictionary = dictionary
  }

  func buildView(
    delegate: TinyuiMenuViewDelegate?,
    inheritedDestructive: Bool = false
  ) -> AnyView {
    if dictionary["hidden"] as? Bool ?? false {
      return AnyView(EmptyView())
    }

    switch dictionary["type"] as? String {
    case "action":
      let destructive = inheritedDestructive || (dictionary["destructive"] as? Bool ?? false)
      let keepOpen = dictionary["keepOpen"] as? Bool ?? false
      let id = dictionary["id"] as? String ?? ""
      let state = dictionary["state"] as? String ?? "off"

      // `on`/`off` use SwiftUI's native `Toggle` support inside `Menu`,
      // which renders the system checkmark. `mixed` has no native SwiftUI
      // equivalent, so it falls back to the minus indicator.
      if state == "on" || state == "off" {
        let isOn = Binding<Bool>(
          get: { state == "on" },
          set: { _ in delegate?.onItemPress(id: id) }
        )
        return AnyView(
          Toggle(isOn: isOn) {
            TinyuiMenuLabel(
              dictionary: dictionary,
              destructive: destructive,
              showsState: false
            )
          }
          .disabled(dictionary["disabled"] as? Bool ?? false)
        )
      }

      return AnyView(
        Button(role: destructive ? .destructive : nil) {
          delegate?.onItemPress(id: id)
        } label: {
          TinyuiMenuLabel(
            dictionary: dictionary,
            destructive: destructive,
            showsState: true
          )
        }
        .disabled(dictionary["disabled"] as? Bool ?? false)
        .menuActionDismissBehavior(keepOpen ? .disabled : .automatic)
      )

    case "submenu":
      let children = (dictionary["children"] as? [[String: Any]] ?? [])
        .map { TinyuiMenuElement(dictionary: $0) }
      let destructive = inheritedDestructive || (dictionary["destructive"] as? Bool ?? false)
      let disabled = dictionary["disabled"] as? Bool ?? false

      if dictionary["displayInline"] as? Bool ?? false {
        return AnyView(
          Section {
            ForEach(children) { child in
              child.buildView(
                delegate: delegate,
                inheritedDestructive: destructive
              )
            }
          } header: {
            TinyuiMenuLabel(
              dictionary: dictionary,
              destructive: destructive,
              showsState: false
            )
          }
          .disabled(disabled)
        )
      }

      return AnyView(
        Menu {
          ForEach(children) { child in
            child.buildView(
              delegate: delegate,
              inheritedDestructive: destructive
            )
          }
        } label: {
          TinyuiMenuLabel(
            dictionary: dictionary,
            destructive: destructive,
            showsState: false
          )
        }
        .disabled(disabled)
      )

    case "section":
      let children = (dictionary["children"] as? [[String: Any]] ?? [])
        .map { TinyuiMenuElement(dictionary: $0) }
      return AnyView(
        Section {
          ForEach(children) { child in
            child.buildView(
              delegate: delegate,
              inheritedDestructive: inheritedDestructive
            )
          }
        } header: {
          if let title = dictionary["title"] as? String, !title.isEmpty {
            Text(title)
          }
        }
      )

    case "separator":
      return AnyView(Divider())

    default:
      return AnyView(EmptyView())
    }
  }
}

/** Label content shared by actions and submenus. */
private struct TinyuiMenuLabel: View {
  let dictionary: [String: Any]
  let destructive: Bool
  let showsState: Bool

  @ViewBuilder
  var body: some View {
    // Menu controls interpret the first text as the title and the second as
    // the subtitle. When an icon is present, `Label` replaces the first Text,
    // matching SwiftUI's native menu-item representation.
    if hasIcon {
      Label {
        title
      } icon: {
        menuIcon
      }
    } else {
      title
    }

    if let subtitle {
      Text(subtitle)
    }

    if showsState {
      stateIndicator
    }
  }

  private var subtitle: String? {
    (dictionary["subtitle"] as? String).flatMap {
      $0.isEmpty ? nil : $0
    }
  }

  private var hasIcon: Bool {
    if let icon = dictionary["icon"] as? String, !icon.isEmpty {
      return UIImage(named: icon) != nil
    }
    return !(dictionary["systemImage"] as? String ?? "").isEmpty
  }

  private var stateIndicator: some View {
    // Only `mixed` reaches here; `on`/`off` are handled natively by `Toggle`.
    // UIKit's menu system renders "mixed" state with a minus/dash mark.
    if dictionary["state"] as? String == "mixed" {
      return AnyView(
        Image(systemName: "minus")
          .font(.system(size: 13, weight: .semibold))
      )
    }
    return AnyView(EmptyView())
  }

  private var title: Text {
    let text = Text(dictionary["title"] as? String ?? "")

    if destructive {
      return text.foregroundColor(.red)
    } else if let color = TinyuiMenuColor.uiColor(from: dictionary["titleColor"]) {
      return text.foregroundColor(Color(uiColor: color))
    } else {
      return text
    }
  }

  @ViewBuilder
  private var menuIcon: some View {
    let iconColor = TinyuiMenuColor.uiColor(from: dictionary["iconColor"])

    if let icon = dictionary["icon"] as? String, !icon.isEmpty {
      if let image = UIImage(named: icon) {
        if let iconColor {
          Image(
            uiImage: image.withTintColor(
              iconColor,
              renderingMode: .alwaysOriginal
            )
          )
        } else {
          Image(uiImage: image.withRenderingMode(.alwaysTemplate))
        }
      }
    } else if let systemImage = dictionary["systemImage"] as? String,
              !systemImage.isEmpty {
      if let iconColor {
        Image(systemName: systemImage)
          .foregroundStyle(Color(uiColor: iconColor))
      } else {
        Image(systemName: systemImage)
      }
    }
  }
}

/** Converts React Native's processed ColorValue JSON into a dynamic UIColor. */
private enum TinyuiMenuColor {
  static func uiColor(from value: Any?) -> UIColor? {
    value.flatMap(RCTConvert.uiColor)
  }
}

@objc public protocol TinyuiMenuViewDelegate {
  func onItemPress(id: String)
  func onPrimaryAction()
}
