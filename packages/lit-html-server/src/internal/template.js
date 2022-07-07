import { AttributePart, ChildPart, CustomElementChildPart, getAttributeTypeFromName, MetadataPart } from './parts.js';
import { Buffer } from '#buffer';
import { EMPTY_STRING_BUFFER } from './consts.js';
import { digestForTemplateStrings } from '#digest';

// https://html.spec.whatwg.org/multipage/scripting.html#valid-custom-element-name
const HTML_TAGS_WITH_HYPHENS = new Set([
  'annotation-xml',
  'color-profile',
  'font-face',
  'font-face-src',
  'font-face-uri',
  'font-face-format',
  'font-face-name',
  'missing-glyph',
]);

const RE_TAG = /<(?:(?<commentStart>!--|\/[^a-zA-Z])|(?<tagName>\/?[a-zA-Z][^>\s]*)|(?<dynamicTagName>\/?$))/g;
const RE_TAG_END = />/g;
const RE_ATTR =
  />|[ \t\n\f\r](?:(?<attributeName>[^\s"'>=/]+)(?:(?<spacesAndEquals>[ \t\n\f\r]*=[ \t\n\f\r]*)(?<quoteChar>["'])?)?|$)/g;
const RE_COMMENT_END = /-->/g;
const RE_COMMENT_ALT_END = />/g;
const RE_CUSTOM_ELEMENT = /^[a-z][a-z0-9._\p{Emoji_Presentation}]*-[a-z0-9._\p{Emoji_Presentation}]*$/u;
const RE_SINGLE_QUOTED_ATTR_VALUE = /^(?<attributeValue>[^'\n\f\r]*)(?:(?<closingChar>')|$)/;
const RE_DOUBLE_QUOTED_ATTR_VALUE = /^(?<attributeValue>[^"\n\f\r]*)(?:(?<closingChar>")|$)/;
const RE_UNQUOTED_ATTR_VALUE = /^(?<attributeValue>[^'"=<>` \t\n\f\r]+)/;
const RE_RAW_TEXT_ELEMENT = /^(?:script|style|textarea|title)$/i;

// Parse modes:
const TEXT = 1;
const ATTRIBUTE = 2;
const COMMENT = 3;

/**
 * A cacheable Template that stores the "strings" and "parts" associated with a
 * tagged template literal invoked with "html`...`".
 */
export class Template {
  /**
   * Create Template instance
   * @param { TemplateStringsArray } strings
   */
  constructor(strings) {
    this.digest = digestForTemplateStrings(strings);
    /** @type { Array<Buffer> } */
    this.strings = [];
    /** @type { Array<Part> } */
    this.parts = [];
    this._parse(strings);
  }

  /**
   * Prepare the template's static strings,
   * and create Part instances for the dynamic values,
   * based on lit-html syntax.
   * @param { TemplateStringsArray } strings
   */
  _parse(strings) {
    /** @type { AttributePart | undefined } */
    let attributePart;
    let isCustomElement = false;
    /** @type { typeof ATTRIBUTE | typeof TEXT | typeof COMMENT } */
    let mode = TEXT;
    let n = strings.length;
    let nextString = strings[0];
    let nodeIndex = -1;
    /** @type { RegExp | undefined } */
    let rawTextEndRegex = undefined;
    let regex = RE_TAG;
    let tagName = '';

    for (let i = 0; i < n; i++) {
      const isFirstString = i === 0;
      const isLastString = i === n - 1;
      let string = nextString;
      nextString = strings[i + 1] ?? '';
      let lastIndex = 0;
      /** @type { RegExpMatchArray | null } */
      let match;

      while (lastIndex < string.length) {
        // Start search from end of last match
        regex.lastIndex = lastIndex;
        match = regex.exec(string);

        if (match === null) {
          break;
        }

        lastIndex = regex.lastIndex;

        // Match opening/closing tag
        if (mode === TEXT) {
          const groups = /** @type { RegexTagGroups } */ (match.groups);

          if (groups.commentStart === '!--') {
            mode = COMMENT;
            regex = RE_COMMENT_END;
          } else if (groups.commentStart !== undefined) {
            mode = COMMENT;
            regex = RE_COMMENT_ALT_END;
          } else {
            const isDynamicTagName = groups.dynamicTagName !== undefined;
            const rawTagName = /** @type { string } */ (isDynamicTagName ? groups.dynamicTagName : groups.tagName);
            const isOpeningTag = rawTagName[0] !== '/';

            isCustomElement = isCustomElementTagName(rawTagName);
            mode = ATTRIBUTE;
            regex = RE_ATTR;

            if (isOpeningTag) {
              tagName = rawTagName;
              nodeIndex++;

              // Hop over raw text content when done parsing opening tag
              if (RE_RAW_TEXT_ELEMENT.test(tagName)) {
                rawTextEndRegex = new RegExp(`</${tagName}`, 'g');
              }

              // Switch to attribute parsing mode if custom-element...
              let needsAttributeParsing = isCustomElement;

              // ...or current string contains tag end (no attribute expressions)
              if (!needsAttributeParsing) {
                RE_TAG_END.lastIndex = lastIndex;
                const endMatch = RE_TAG_END.exec(string);

                if (endMatch === null) {
                  needsAttributeParsing = true;
                } else {
                  // Skip to tag end
                  lastIndex = RE_TAG_END.lastIndex - 1;
                }
              }

              if (needsAttributeParsing) {
                this.strings.push(Buffer.from(string.slice(0, lastIndex + 1)));
                // attributes = {};
                attributePart = new AttributePart(tagName);
                this.parts.push(attributePart);
              }
            }

            if (isDynamicTagName) {
              // TODO: dev error?
            }
          }
        }
        // Match attributes inside opening tag, or tag end for closing tag
        else if (mode === ATTRIBUTE) {
          const groups = /** @type { RegexAttrGroups } */ (match.groups);

          // Tag end
          if (match[0] === '>') {
            // Insert metadata for attributes after close of opening tag
            if (attributePart) {
              this.strings.push(Buffer.from(string.slice(0, lastIndex)));
              this.parts.push(new MetadataPart(Buffer.from(`<!--lit-node ${nodeIndex}-->`)));
              string = string.slice(lastIndex);
              lastIndex = 0;
            }
            if (isCustomElement) {
              this.strings.push(Buffer.from(string.slice(0, lastIndex)));
              this.parts.push(new CustomElementChildPart(tagName, /* attributes */ {}));
              string = string.slice(lastIndex);
              lastIndex = 0;
            }
            attributePart = undefined;
            mode = TEXT;
            regex = rawTextEndRegex ?? RE_TAG;
          } else if (attributePart !== undefined) {
            // No attribute name, so must be `ElementAttribute`
            if (groups.attributeName === undefined) {
              attributePart.addAttributeData('element');
            }
            // All other attribute types
            else {
              /** @type { string | undefined } */
              const attributeName = groups.attributeName;
              // Attribute name index is current position less full matching string (not including leading space)
              const attributeNameIndex = lastIndex - match[0].length + 1;

              // Static boolean attribute if no leading spaces/equals
              if (groups.spacesAndEquals === undefined) {
                attributePart.addAttributeData('boolean', attributeName, '');
              } else {
                const hasQuotes = groups.quoteChar !== undefined;
                let trim = false;
                let valueString = string.slice(lastIndex);

                // No quotes, so multiple values not possible
                if (!hasQuotes) {
                  const valueMatch = RE_UNQUOTED_ATTR_VALUE.exec(valueString);
                  // @ts-ignore
                  const attributeValue = valueMatch?.groups.attributeValue ?? '';

                  // Static attribute part if value
                  if (attributeValue !== '') {
                    attributePart.addAttributeData('attribute', attributeName, attributeValue);
                  }
                  // Dynamic attribute part with single value
                  else {
                    attributePart.addAttributeData(getAttributeTypeFromName(attributeName), attributeName, undefined, [
                      EMPTY_STRING_BUFFER,
                      EMPTY_STRING_BUFFER,
                    ]);
                    trim = true;
                  }
                } else {
                  /** @type { Array<Buffer> } */
                  const attributeStrings = [];
                  const valueRegex =
                    groups.quoteChar === '"' ? RE_DOUBLE_QUOTED_ATTR_VALUE : RE_SINGLE_QUOTED_ATTR_VALUE;
                  let j = 0;

                  // Loop through remainint strings until we reach closing quote
                  while (valueString !== undefined) {
                    const valueMatch = valueRegex.exec(valueString);

                    if (valueMatch === null) {
                      break;
                    }

                    const { attributeValue = '', closingChar } = /** @type { RegexAttrValueGroups } */ (
                      valueMatch.groups
                    );

                    if (closingChar !== undefined) {
                      // Static attribute part since closed on first pass
                      if (j === 0) {
                        attributePart.addAttributeData('attribute', attributeName, attributeValue);
                      } else {
                        attributeStrings.push(Buffer.from(attributeValue));
                        // Advance to hop over next string
                        i += j - 1;
                        nextString = valueString.slice(valueMatch[0].length - 1);
                      }
                      break;
                    }

                    attributeStrings.push(Buffer.from(attributeValue));
                    valueString = strings[i + ++j];
                  }

                  // Store dynamic attribute part with possible multiple values
                  if (attributeStrings.length > 0) {
                    attributePart.addAttributeData(
                      getAttributeTypeFromName(attributeName),
                      attributeName,
                      undefined,
                      attributeStrings,
                    );
                    trim = true;
                  }
                }

                if (trim) {
                  // Trim leading attribute characters (name, spaces, equals, quotes)
                  string = string.slice(0, attributeNameIndex);
                  lastIndex = attributeNameIndex;
                  // Trim closing quotes from start of next string
                  if (groups.quoteChar !== undefined) {
                    nextString = nextString.slice(nextString.indexOf(groups.quoteChar) + 1);
                  }
                }
              }
            }
          }
        }
        // Match comment end
        else if (mode === COMMENT) {
          mode = TEXT;
          regex = RE_TAG;
        }
        // Match raw text closing tag
        else if (regex === rawTextEndRegex) {
          mode = TEXT;
          regex = RE_TAG;
          rawTextEndRegex = undefined;
        }
      }

      if (mode !== ATTRIBUTE) {
        this.strings.push(Buffer.from(string));

        if (mode === TEXT) {
          if (!isLastString) {
            this.parts.push(new ChildPart(tagName));
          }
        } else if (mode === COMMENT) {
          throw Error('parsing expressions inside comment tags is not supported!');
        }
      }
    }
  }
}

/**
 * Determine whether `tagName` is a custom element name
 * @param { string } tagName
 */
function isCustomElementTagName(tagName) {
  return !HTML_TAGS_WITH_HYPHENS.has(tagName) && RE_CUSTOM_ELEMENT.test(tagName);
}
