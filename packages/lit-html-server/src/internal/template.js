import {
  AttributePart,
  BooleanAttributePart,
  ChildPart,
  ElementPart,
  EventPart,
  MetadataPart,
  PropertyPart,
} from './parts.js';
import { Buffer } from 'buffer';

const EMPTY_STRING_BUFFER = Buffer.from('');

// const ATTR_VALUE_CHAR = `[^ \t\n\f\r"'\`<>=]`;
// const NAME_CHAR = `[^\\s"'>=/]`;
// const SPACE_CHAR = `[ \t\n\f\r]`;
// const TAG_NAME_CHAR = `[a-zA-Z0-9-]`;

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
const RE_ATTR =
  />|[ \t\n\f\r](?:(?<attributeName>[^\s"'>=/]+)(?:(?<spacesAndEquals>[ \t\n\f\r]*=[ \t\n\f\r]*)(?<quoteChar>["'])?)?|$)/g;
const RE_COMMENT_END = /-->/g;
const RE_COMMENT_ALT_END = />/g;
const RE_CUSTOM_ELEMENT = /^[a-z][a-z0-9._\p{Emoji_Presentation}]*-[a-z0-9._\p{Emoji_Presentation}]*$/u;
const RE_SINGLE_QUOTED_ATTR_VALUE = /^(?<attributeValue>[^'\n\f\r]*)(?:(?<closingChar>')|$)/;
const RE_DOUBLE_QUOTED_ATTR_VALUE = /^(?<attributeValue>[^"\n\f\r]*)(?:(?<closingChar>")|$)/;
const RE_UNQUOTED_ATTR_VALUE = /^(?<attributeValue>[^'"=<>` \t\n\f\r]+)/;
// const RE_RAW_TEXT_ELEMENT = /^(?:script|style|textarea|title)$/i;

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
    /** @type { { [name: string]: string } } */
    let attributes = {};
    /** @type { string | undefined } */
    let attributeName;
    /** @type { Array<Buffer> } */
    let attributeStrings = [];
    let hasAttributeParts = false;
    let isCustomElement = false;
    let mode = TEXT;
    let n = strings.length;
    let nextString = strings[0];
    let nodeIndex = -1;
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

      // TODO: custom-element parts
      // TODO: rawTextEndRegex

      // Add opening metadata before first string in template
      // if (isFirstString) {
      //   this.strings.push(EMPTY_STRING_BUFFER);
      //   this.parts.push(new MetadataPart(Buffer.from(`<!--lit-part ${digest}-->`)));
      // }

      while (lastIndex < string.length) {
        // Start search from end of last match
        regex.lastIndex = lastIndex;
        match = regex.exec(string);

        if (match === null) {
          break;
        }

        lastIndex = regex.lastIndex;

        if (regex === RE_TAG) {
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

            attributes = {};
            hasAttributeParts = false;
            isCustomElement = isCustomElementTagName(rawTagName);
            mode = ATTRIBUTE;
            regex = RE_ATTR;

            if (isOpeningTag) {
              tagName = rawTagName;
              nodeIndex++;
            }

            if (isDynamicTagName) {
              // TODO: dev error
            } else {
              // TODO: rawTextEndRegex
            }
          }
        } else if (regex === RE_ATTR) {
          const groups = /** @type { RegexAttrGroups } */ (match.groups);

          // Tag close
          if (match[0] === '>') {
            // Insert metadata for attributes after close of opening tag
            if (hasAttributeParts) {
              this.strings.push(Buffer.from(string.slice(0, lastIndex)));
              this.parts.push(new MetadataPart(Buffer.from(`<!--lit-node ${nodeIndex}-->`)));
              string = string.slice(lastIndex);
              lastIndex = 0;
            }
            attributeName = undefined;
            attributeStrings = [];
            mode = TEXT;
            regex = RE_TAG;
            // TODO: rawTextEndRegex
          }
          // No attribute name, so must be `ElementAttribute`
          else if (groups.attributeName === undefined) {
            attributeName = undefined;
            attributeStrings = [];
            hasAttributeParts = true;
            mode = ATTRIBUTE;
            regex = RE_ATTR;
          }
          // Attribute, static or dynamic
          else {
            attributeName = groups.attributeName;
            mode = ATTRIBUTE;

            // Attribute name index is current position less full matching string (not including leading space)
            const attributeNameIndex = lastIndex - match[0].length + 1;
            const hasQuotes = groups.quoteChar !== undefined;
            let isStatic = false;
            let valueString = string.slice(lastIndex);

            // Static boolean attribute
            if (groups.spacesAndEquals === undefined) {
              isStatic = true;
              attributes[attributeName] = '';
            } else {
              attributeStrings = [];
              const valueRegex = !hasQuotes
                ? RE_UNQUOTED_ATTR_VALUE
                : groups.quoteChar === '"'
                ? RE_DOUBLE_QUOTED_ATTR_VALUE
                : RE_SINGLE_QUOTED_ATTR_VALUE;
              let j = 0;

              if (!hasQuotes) {
                const valueMatch = valueRegex.exec(valueString);
                // @ts-ignore
                const attributeValue = valueMatch?.groups.attributeValue ?? '';

                if (attributeValue !== '') {
                  isStatic = true;
                  attributes[attributeName] = attributeValue;
                } else {
                  attributeStrings.push(EMPTY_STRING_BUFFER, EMPTY_STRING_BUFFER);
                }
              } else {
                while (valueString !== undefined) {
                  const valueMatch = valueRegex.exec(valueString);

                  if (valueMatch === null) {
                    break;
                  }

                  const { attributeValue = '', closingChar } = /** @type { RegexAttrValueGroups } */ (
                    valueMatch.groups
                  );

                  if (closingChar !== undefined) {
                    // Static value since closed on first pass
                    if (j === 0) {
                      isStatic = true;
                      attributes[attributeName] = attributeValue;
                    } else {
                      attributeStrings.push(Buffer.from(attributeValue));
                      i += j - 1;
                      nextString = valueString.slice(valueMatch[0].length - 1);
                    }
                    break;
                  }

                  attributeStrings.push(Buffer.from(attributeValue));
                  valueString = strings[i + ++j];
                }
              }
            }

            if (!isStatic) {
              hasAttributeParts = true;
              // Trim leading attribute characters (name, spaces, equals, quotes)
              string = string.slice(0, attributeNameIndex);
              lastIndex = attributeNameIndex;
              // Trim closing quotes from start of next string
              if (hasQuotes) {
                // @ts-ignore
                nextString = nextString.slice(nextString.indexOf(groups.quoteChar) + 1);
              }
            }
          }
        } else if (regex === RE_COMMENT_END || regex === RE_COMMENT_ALT_END) {
          mode = TEXT;
          regex == RE_TAG;
        } else {
          mode = ATTRIBUTE;
          regex = RE_ATTR;
          // TODO: rawTextEndRegex
        }
      }

      this.strings.push(Buffer.from(string));

      if (!isLastString) {
        if (mode === TEXT) {
          // this.parts.push(new MetadataPart(Buffer.from(`<!--lit-part-->`)));
          // this.strings.push(EMPTY_STRING_BUFFER);
          this.parts.push(new ChildPart(tagName));
          // this.strings.push(EMPTY_STRING_BUFFER);
          // this.parts.push(new MetadataPart(Buffer.from(`<!--/lit-part-->`)));
        } else if (mode === ATTRIBUTE) {
          this.parts.push(handleAttributeExpressions(attributeName ?? '', attributeStrings, tagName));
        }
      } else {
        // this.parts.push(new MetadataPart(Buffer.from(`<!--/lit-part-->`)));
        // this.strings.push(EMPTY_STRING_BUFFER);
      }
    }
  }
}

/**
 * Create part instance for dynamic attribute values
 * @param { string } name
 * @param { Array<Buffer> } strings
 * @param { string } tagName
 */
function handleAttributeExpressions(name, strings, tagName) {
  if (name === '') {
    return new ElementPart(tagName);
  }

  const prefix = name[0];

  if (prefix === '.') {
    return new PropertyPart(name.slice(1), strings, tagName);
  } else if (prefix === '@') {
    return new EventPart(name.slice(1), tagName);
  } else if (prefix === '?') {
    return new BooleanAttributePart(name.slice(1), tagName);
  }

  return new AttributePart(name, strings, tagName);
}

/**
 * Generate hash from template "strings".
 * Unable to use version imported from lit-html because of reliance on global `btoa`
 * (`btoa` is now a global in Node, but should be avoided at all costs),
 * so copied and modified here instead.
 * @see https://github.com/lit/lit/blob/72877fd1de43ccdd579778d5df407e960cb64b03/packages/lit-html/src/experimental-hydrate.ts#L423
 * @param { TemplateStringsArray } strings
 */
function digestForTemplateStrings(strings) {
  const digestSize = 2;
  const hashes = new Uint32Array(digestSize).fill(5381);

  for (const s of strings) {
    for (let i = 0; i < s.length; i++) {
      hashes[i % digestSize] = (hashes[i % digestSize] * 33) ^ s.charCodeAt(i);
    }
  }

  return Buffer.from(String.fromCharCode(...new Uint8Array(hashes.buffer)), 'binary').toString('base64');
}

/**
 * Determine whether `tagName` is a custom element name
 * @param { string } tagName
 */
function isCustomElementTagName(tagName) {
  return !HTML_TAGS_WITH_HYPHENS.has(tagName) && RE_CUSTOM_ELEMENT.test(tagName);
}
