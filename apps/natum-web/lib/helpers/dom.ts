export const getLineHeight = (
  elem: HTMLElement,
  pseudoElement?: string | null
) => {
  const elementStyle = getComputedStyle(elem, pseudoElement);
  const lineHeight = elementStyle.getPropertyValue("line-height");
  if (lineHeight === "normal") {
    // Normal line heights vary from browser to browser. The spec recommends
    // a value between 1.0 and 1.2 of the font size. Using 1.1 to split the diff.
    return parseInt(elementStyle.getPropertyValue("font-size")) * 1.2;
  }
  return parseInt(lineHeight);
};
