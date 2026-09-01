import SwiftUI
import UIKit

/**
 * Observable props shared between the Objective-C++ component view and the
 * SwiftUI `Menu` implementation. Mirror of `TinyuiMenuProps` in codegen.
 */
class TinyuiMenuProps: ObservableObject {
  @Published var menuConfig: String = "{}"
  @Published var disabled: Bool = false
  @Published var hasPrimaryAction: Bool = false
  @Published var triggerView: UIView?
}

/**
 * SwiftUI `Menu` backed by UIKit's UIMenu, matching expo-ui's MenuView.
 *
 * The React Native trigger (a UIView) is embedded as the menu label through
 * `RepresentableView`, so the tap target remains the native RN subtree while
 * the menu content is built natively from the JSON config.
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
    ForEach(buildElements(from: props.menuConfig)) { element in
      element.buildView(delegate: delegate)
    }
  }

  /// Parses the JSON menu config into a list of SwiftUI element builders.
  private func buildElements(from json: String) -> [TinyuiMenuElement] {
    guard
      let data = json.data(using: .utf8),
      let root = try? JSONSerialization.jsonObject(with: data) as? [String: Any],
      let items = root["items"] as? [[String: Any]]
    else {
      return []
    }
    return items.map { TinyuiMenuElement(dictionary: $0) }
  }
}

/**
 * Lightweight representation of a single UIMenu element parsed from the JSON
 * config. Used to build SwiftUI menu content without resolving all elements
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
      return AnyView(
        Button(role: destructive ? .destructive : nil) {
          if let id = dictionary["id"] as? String {
            delegate?.onItemPress(id: id)
          }
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

  var body: some View {
    HStack {
      menuIcon

      VStack(alignment: .leading, spacing: 1) {
        title

        if let subtitle = dictionary["subtitle"] as? String,
           !subtitle.isEmpty {
          Text(subtitle)
            .font(.caption)
            .foregroundStyle(.secondary)
        }
      }

      if showsState {
        switch dictionary["state"] as? String {
        case "on":
          Image(systemName: "checkmark")
        case "mixed":
          Image(systemName: "minus")
        default:
          EmptyView()
        }
      }
    }
  }

  @ViewBuilder
  private var title: some View {
    let text = Text(dictionary["title"] as? String ?? "")
    if let color = TinyuiMenuColor.uiColor(from: dictionary["titleColor"]) {
      text.foregroundStyle(Color(uiColor: color))
    } else if destructive {
      text.foregroundStyle(Color.red)
    } else {
      text
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
    if let number = value as? NSNumber {
      let argb = number.uint32Value
      return UIColor(
        red: CGFloat((argb >> 16) & 0xff) / 255,
        green: CGFloat((argb >> 8) & 0xff) / 255,
        blue: CGFloat(argb & 0xff) / 255,
        alpha: CGFloat((argb >> 24) & 0xff) / 255
      )
    }

    guard let object = value as? [String: Any] else {
      return nil
    }

    if let semanticNames = object["semantic"] as? [String] {
      for name in semanticNames {
        if let color = semanticColor(named: name) {
          return color
        }
      }
    }

    if let dynamic = object["dynamic"] as? [String: Any] {
      return UIColor { traits in
        let highContrast = traits.accessibilityContrast == .high
        let dark = traits.userInterfaceStyle == .dark
        let preferredKey: String

        switch (dark, highContrast) {
        case (true, true):
          preferredKey = "highContrastDark"
        case (false, true):
          preferredKey = "highContrastLight"
        case (true, false):
          preferredKey = "dark"
        case (false, false):
          preferredKey = "light"
        }

        return uiColor(from: dynamic[preferredKey])
          ?? uiColor(from: dynamic[dark ? "dark" : "light"])
          ?? UIColor.clear
      }
    }

    return nil
  }

  private static func semanticColor(named name: String) -> UIColor? {
    if let color = UIColor(named: name) {
      return color
    }

    let normalizedName = name.hasSuffix("Color")
      ? String(name.dropLast("Color".count))
      : name

    switch normalizedName {
    case "label": return .label
    case "secondaryLabel": return .secondaryLabel
    case "tertiaryLabel": return .tertiaryLabel
    case "quaternaryLabel": return .quaternaryLabel
    case "placeholderText": return .placeholderText
    case "separator": return .separator
    case "opaqueSeparator": return .opaqueSeparator
    case "link": return .link
    case "systemBackground": return .systemBackground
    case "secondarySystemBackground": return .secondarySystemBackground
    case "tertiarySystemBackground": return .tertiarySystemBackground
    case "systemGroupedBackground": return .systemGroupedBackground
    case "secondarySystemGroupedBackground": return .secondarySystemGroupedBackground
    case "tertiarySystemGroupedBackground": return .tertiarySystemGroupedBackground
    case "systemFill": return .systemFill
    case "secondarySystemFill": return .secondarySystemFill
    case "tertiarySystemFill": return .tertiarySystemFill
    case "quaternarySystemFill": return .quaternarySystemFill
    case "systemRed": return .systemRed
    case "systemOrange": return .systemOrange
    case "systemYellow": return .systemYellow
    case "systemGreen": return .systemGreen
    case "systemMint": return .systemMint
    case "systemTeal": return .systemTeal
    case "systemCyan": return .systemCyan
    case "systemBlue": return .systemBlue
    case "systemIndigo": return .systemIndigo
    case "systemPurple": return .systemPurple
    case "systemPink": return .systemPink
    case "systemBrown": return .systemBrown
    case "systemGray": return .systemGray
    case "systemGray2": return .systemGray2
    case "systemGray3": return .systemGray3
    case "systemGray4": return .systemGray4
    case "systemGray5": return .systemGray5
    case "systemGray6": return .systemGray6
    default: return nil
    }
  }
}

@objc public protocol TinyuiMenuViewDelegate {
  func onItemPress(id: String)
  func onPrimaryAction()
}
