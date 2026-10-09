import SwiftUI
import TipKit

struct TinyuiTip: Tip, Sendable {
  struct ActionContent: Equatable, Sendable {
    let id: String
    let title: String
  }

  let id: String
  var titleString = ""
  var messageString = ""
  var symbolName = ""
  var actionContents: [ActionContent] = []
  var maximumDisplayCount = 0
  var ignoresFrequency = false

  var title: Text { Text(verbatim: titleString) }
  var message: Text? { messageString.isEmpty ? nil : Text(verbatim: messageString) }
  var image: Image? { symbolName.isEmpty ? nil : Image(systemName: symbolName) }
  var actions: [Action] {
    return actionContents.map { Action(id: $0.id, title: $0.title) }
  }
  var options: [any TipOption] {
    var result: [any TipOption] = [Tips.IgnoresDisplayFrequency(ignoresFrequency)]
    if maximumDisplayCount > 0 {
      result.append(Tips.MaxDisplayCount(maximumDisplayCount))
    }
    return result
  }
}

extension TinyuiTip {
  init(configuration: [String: Any]) {
    self.init(
      id: configuration["tipId"] as? String ?? "",
      titleString: configuration["title"] as? String ?? "",
      messageString: configuration["message"] as? String ?? "",
      symbolName: configuration["systemImage"] as? String ?? "",
      actionContents: (configuration["actions"] as? [[String: String]] ?? []).map {
        ActionContent(id: $0["id"] ?? "", title: $0["title"] ?? "")
      },
      maximumDisplayCount: configuration["maxDisplayCount"] as? Int ?? 0,
      ignoresFrequency: configuration["ignoresDisplayFrequency"] as? Bool ?? false
    )
  }
}
