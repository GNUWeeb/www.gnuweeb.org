import { Controller } from "@hotwired/stimulus"

export default class extends Controller {
  static get values() {
    return { text: String, type: String }
  }

  initialize() {
    for (const range of this.calloutRanges) {
      const content = range.toString()
      const element = this.createCalloutElement(content)
      range.deleteContents()
      range.insertNode(element)
    }
  }

  connect() {
    this.element.parentElement.removeChild(this.element)
  }

  get calloutRanges() {
    return this.matches.map(([start, end]) => {
      return this.createCalloutRange(start, end)
    })
  }

  createCalloutElement(textContent) {
    const element = document.createElement("span")
    element.textContent = textContent
    element.className = this.className
    return element
  }

  createCalloutRange(start, end) {
    const range = document.createRange()
    let startPosition = 0

    for (const node of this.textNodes) {
      const endPosition = startPosition + node.textContent.length

      if (startPosition <= start && start <= endPosition) {
        range.setStart(node, start - startPosition)
      }

      if (startPosition <= end && end <= endPosition) {
        range.setEnd(node, end - startPosition)
      }

      startPosition = endPosition
    }

    return range
  }

  get textNodes() {
    const nodes = []
    const iterator = this.createTextNodeIterator()
    while (iterator.nextNode()) nodes.push(iterator.currentNode)
    return nodes
  }

  get matches() {
    const matches = []
    let match, position
    while (match = this.findNextMatch(position)) matches.push(match), position = match[0]
    return matches
  }

  createTextNodeIterator() {
    return document.createTreeWalker(this.contentElement, NodeFilter.SHOW_TEXT)
  }

  findNextMatch(fromPosition = -1) {
    const position = this.content.indexOf(this.textValue, fromPosition + 1)
    return position == -1 ? null : [position, position + this.textValue.length]
  }

  get contentElement() {
    const element = this.createContentElementIterator().nextNode()
    if (!element) throw new Error("can't find content element")
    return element
  }

  createContentElementIterator() {
    return document.createTreeWalker(this.parentElement, NodeFilter.SHOW_ELEMENT, (node) => {
      const follows = this.element.compareDocumentPosition(node) & Node.DOCUMENT_POSITION_FOLLOWING
      const isContent = this.isContentElement(node)
      return follows && isContent ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP
    })
  }

  isContentElement(element) {
    return element.tagName.toLowerCase() == "pre"
  }

  get content() {
    return this.contentElement.textContent
  }

  get className() {
    return "callout" + (this.hasTypeValue ? "--" + this.typeValue : "")
  }

  get parentElement() {
    return this.element.parentElement
  }
}
