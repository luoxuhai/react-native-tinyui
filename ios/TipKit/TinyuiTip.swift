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
