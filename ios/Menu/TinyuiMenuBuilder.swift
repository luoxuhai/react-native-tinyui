import React
import UIKit

@objc public protocol TinyuiMenuViewDelegate: AnyObject {
  func onActionPress(id: String, title: String)
}

/** Builds UIKit menu elements from the configuration generated in JavaScript. */
final class TinyuiMenuBuilder {
  private weak var delegate: TinyuiMenuViewDelegate?

  init(delegate: TinyuiMenuViewDelegate?) {
    self.delegate = delegate
  }

  func buildMenu(title: String, config: [String: Any]) -> UIMenu {
    print("[TinyUI][Menu] config:", config)

    return UIMenu(
      title: title,
      children: buildChildren(from: dictionaries(in: config, key: "items"))
    )
  }

  private func buildChildren(
    from dictionaries: [[String: Any]],
    inheritedDestructive: Bool = false,
    inheritedDisabled: Bool = false
  ) -> [UIMenuElement] {
    // UIKit represents separators by placing adjacent groups in inline menus.
    // Partitioning here also makes consecutive/leading/trailing dividers no-ops.
    let groups = dictionaries.split {
      ($0["type"] as? String) == "separator"
    }

    if groups.count <= 1 {
      return dictionaries.compactMap {
        buildElement(
          from: $0,
          inheritedDestructive: inheritedDestructive,
          inheritedDisabled: inheritedDisabled
        )
      }
    }

    return groups.compactMap { group in
      let children = group.compactMap {
        buildElement(
          from: $0,
          inheritedDestructive: inheritedDestructive,
          inheritedDisabled: inheritedDisabled
        )
      }
      guard !children.isEmpty else {
        return nil
      }
      return UIMenu(title: "", options: .displayInline, children: children)
    }
  }

  private func buildElement(
    from dictionary: [String: Any],
    inheritedDestructive: Bool,
    inheritedDisabled: Bool
  ) -> UIMenuElement? {
    guard !(dictionary["hidden"] as? Bool ?? false) else {
      return nil
    }

    switch dictionary["type"] as? String {
    case "action":
      return buildAction(
        from: dictionary,
        inheritedDestructive: inheritedDestructive,
        inheritedDisabled: inheritedDisabled
      )
    case "submenu":
      return buildSubmenu(
        from: dictionary,
        inheritedDestructive: inheritedDestructive,
        inheritedDisabled: inheritedDisabled
      )
    case "section":
      let children = buildChildren(
        from: dictionaries(in: dictionary, key: "children"),
        inheritedDestructive: inheritedDestructive,
        inheritedDisabled: inheritedDisabled
      )
      guard !children.isEmpty else {
        return nil
      }
      return UIMenu(
        title: dictionary["title"] as? String ?? "",
        options: .displayInline,
        children: children
      )
    default:
      return nil
    }
  }

  private func buildAction(
    from dictionary: [String: Any],
    inheritedDestructive: Bool,
    inheritedDisabled: Bool
  ) -> UIAction {
    let identifier = dictionary["id"] as? String ?? ""
    let title = dictionary["title"] as? String ?? ""
    var attributes: UIMenuElement.Attributes = []

    if inheritedDisabled || (dictionary["disabled"] as? Bool ?? false) {
      attributes.insert(.disabled)
    }
    if inheritedDestructive || (dictionary["destructive"] as? Bool ?? false) {
      attributes.insert(.destructive)
    }
    if dictionary["hidden"] as? Bool ?? false {
      attributes.insert(.hidden)
    }
    if dictionary["keepOpen"] as? Bool ?? false {
      attributes.insert(.keepsMenuPresented)
    }

    return UIAction(
      title: title,
      subtitle: nonEmptyString(dictionary["subtitle"]),
      image: image(from: dictionary),
      identifier: nil,
      discoverabilityTitle: nil,
      attributes: attributes,
      state: state(from: dictionary)
    ) { [weak delegate] _ in
      delegate?.onActionPress(id: identifier, title: title)
    }
  }

  private func buildSubmenu(
    from dictionary: [String: Any],
    inheritedDestructive: Bool,
    inheritedDisabled: Bool
  ) -> UIMenuElement? {
    let isDestructive =
      inheritedDestructive || (dictionary["destructive"] as? Bool ?? false)
    let isDisabled =
      inheritedDisabled || (dictionary["disabled"] as? Bool ?? false)
    let isInline = dictionary["displayInline"] as? Bool ?? false

    // UIKit doesn't expose disabled/hidden attributes on UIMenu. A disabled
    // hierarchical submenu is therefore represented by a disabled UIAction;
    // inline submenu children can be disabled individually.
    if isDisabled && !isInline {
      var attributes: UIMenuElement.Attributes = [.disabled]
      if isDestructive {
        attributes.insert(.destructive)
      }
      return UIAction(
        title: dictionary["title"] as? String ?? "",
        subtitle: nonEmptyString(dictionary["subtitle"]),
        image: image(from: dictionary),
        identifier: nil,
        discoverabilityTitle: nil,
        attributes: attributes,
        state: .off
      ) { _ in }
    }

    let children = buildChildren(
      from: dictionaries(in: dictionary, key: "children"),
      inheritedDestructive: isDestructive,
      inheritedDisabled: isDisabled
    )
    guard !children.isEmpty else {
      return nil
    }

    var options: UIMenu.Options = []
    if isInline {
      options.insert(.displayInline)
    }
    if isDestructive {
      options.insert(.destructive)
    }

    return UIMenu(
      title: dictionary["title"] as? String ?? "",
      subtitle: nonEmptyString(dictionary["subtitle"]),
      image: image(from: dictionary),
      identifier: nil,
      options: options,
      children: children
    )
  }

  private func image(from dictionary: [String: Any]) -> UIImage? {
    let image: UIImage?
    if let assetName = nonEmptyString(dictionary["icon"]),
       let assetImage = UIImage(named: assetName) {
      image = assetImage
    } else if let systemName = nonEmptyString(dictionary["systemImage"]) {
      image = UIImage(systemName: systemName)
    } else {
      image = nil
    }

    guard let image else {
      return nil
    }
    guard let tintColor = dictionary["iconColor"].flatMap(RCTConvert.uiColor) else {
      return image.withRenderingMode(.alwaysTemplate)
    }
    return image.withTintColor(tintColor, renderingMode: .alwaysOriginal)
  }

  private func state(from dictionary: [String: Any]) -> UIMenuElement.State {
    switch dictionary["state"] as? String {
    case "on":
      return .on
    case "mixed":
      return .mixed
    default:
      return .off
    }
  }

  private func dictionaries(
    in dictionary: [String: Any],
    key: String
  ) -> [[String: Any]] {
    dictionary[key] as? [[String: Any]] ?? []
  }

  private func nonEmptyString(_ value: Any?) -> String? {
    guard let value = value as? String, !value.isEmpty else {
      return nil
    }
    return value
  }
}
