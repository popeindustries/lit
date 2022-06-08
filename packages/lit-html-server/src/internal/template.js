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

const ATTR_VALUE_CHAR = `[^ \t\n\f\r"'\`<>=]`;
const NAME_CHAR = `[^\\s"'>=/]`;
const SPACE_CHAR = `[ \t\n\f\r]`;
// const TAG_NAME_CHAR = `[a-zA-Z0-9-]`;

const RE_TEXT_END = /<(?:(?<commentStart>!--|\/[^a-zA-Z])|(?<tagName>\/?[a-zA-Z][^>\s]*)|(?<dynamicTagName>\/?$))/g;
const RE_COMMENT_END = /-->/g;
const RE_COMMENT_ALT_END = />/g;
const RE_TAG_END = new RegExp(
  `>|${SPACE_CHAR}(?:(?<attributeName>${NAME_CHAR}+)(?<spacesAndEquals>${SPACE_CHAR}*=${SPACE_CHAR}*(?:${ATTR_VALUE_CHAR}|(?<quoteChar>"|')|))|$)`,
  'g',
);
const RE_SINGLE_QUOTE_ATTR_END = /'/g;
const RE_DOUBLE_QUOTE_ATTR_END = /"/g;
// const RE_RAW_TEXT_ELEMENT = /^(?:script|style|textarea|title)$/i;

// Parse modes:
const CLOSE = 0;
const OPEN = 1;
const ATTRIBUTE = 2;
const TEXT = 3;
const COMMENT = 4;

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
    /** @type { Array<Buffer> } */
    this._strings = [];
    /** @type { Array<Part> } */
    this._parts = [];
    this._parse(strings);
  }

  /**
   * Prepare the template's static strings,
   * and create Part instances for the dynamic values,
   * based on lit-html syntax.
   * @param { TemplateStringsArray } strings
   */
  _parse(strings) {
    const digest = digestForTemplateStrings(strings);
    const n = strings.length;
    let attributeName = '';
    let hasAttributes = false;
    let mode = CLOSE;
    let nextString = strings[0];
    let nodeIndex = -1;
    let regex = RE_TEXT_END;
    let tagName = '';

    for (let i = 0; i < n; i++) {
      const isFirstString = i === 0;
      const isLastString = i === n - 1;
      let string = nextString;
      nextString = strings[i + 1] ?? '';
      let lastIndex = 0;
      let match;

      // TODO: metadata parts
      // TODO: custom-element parts
      // TODO: rawTextEndRegex

      if (isFirstString) {
        // Add opening metadata before first string in template
        this._strings.push(EMPTY_STRING_BUFFER);
        this._parts.push(new MetadataPart(Buffer.from(`<!--lit-part ${digest}-->`)));
      } else if (mode === TEXT) {
        // Add closing metadata for child part if between tag open/close and starting new string
        // metadata.push([0, `<!--/lit-part-->`]);
      }

      while (lastIndex < string.length) {
        // Start search from end of last match
        regex.lastIndex = lastIndex;
        match = regex.exec(string);

        if (match === null) {
          break;
        }

        const groups = /** @type { { [name: string]: string } } */ (match.groups);
        lastIndex = regex.lastIndex;

        if (regex === RE_TEXT_END) {
          if (groups.commentStart === '!--') {
            mode = COMMENT;
            regex = RE_COMMENT_END;
          } else if (groups.commentStart !== undefined) {
            mode = COMMENT;
            regex = RE_COMMENT_ALT_END;
          } else {
            const isDynamicTagName = groups.dynamicTagName !== undefined;
            const rawTagName = isDynamicTagName ? groups.dynamicTagName : groups.tagName;
            const isOpeningTag = rawTagName[0] !== '/';

            if (isOpeningTag) {
              mode = OPEN;
              tagName = rawTagName;
              nodeIndex++;
            } else {
              mode = CLOSE;
            }

            regex = RE_TAG_END;

            if (isDynamicTagName) {
              // TODO: dev error
            } else {
              // TODO: rawTextEndRegex
            }
          }
        } else if (regex === RE_TAG_END) {
          if (match[0] === '>') {
            if (mode === OPEN && hasAttributes) {
              // TODO: insert node metadata
            }
            attributeName = '';
            mode = isLastString ? CLOSE : TEXT;
            regex = RE_TEXT_END;
            // TODO: rawTextEndRegex
          } else if (groups.attributeName === undefined) {
            hasAttributes = true;
            attributeName = '';
            mode = ATTRIBUTE;
            regex = RE_TAG_END;
          } else {
            hasAttributes = true;
            attributeName = groups.attributeName;
            mode = ATTRIBUTE;
            regex =
              groups.quoteChar === undefined
                ? RE_TAG_END
                : groups.quoteChar === '"'
                ? RE_DOUBLE_QUOTE_ATTR_END
                : RE_SINGLE_QUOTE_ATTR_END;

            const prefix = attributeName[0];
            const isConditional = prefix === '?' || prefix === '@';

            // Since some attributes are conditional, remove surrounding text from static strings
            if (isConditional) {
              const prefix = groups.attributeName + groups.spacesAndEquals;
              string = string.slice(0, string.length - prefix.length);
              lastIndex -= prefix.length;

              if (groups.quoteChar !== undefined) {
                nextString = nextString.slice(nextString.indexOf(groups.quoteChar) + 1);
                regex = RE_TAG_END;
              }
            }
          }
        } else if (regex === RE_DOUBLE_QUOTE_ATTR_END || regex === RE_SINGLE_QUOTE_ATTR_END) {
          mode = OPEN;
          regex = RE_TAG_END;
        } else if (regex === RE_COMMENT_END || regex === RE_COMMENT_ALT_END) {
          mode = CLOSE;
          regex == RE_TEXT_END;
        } else {
          mode = OPEN;
          regex = RE_TAG_END;
          // TODO: rawTextEndRegex
        }
      }

      this._strings.push(Buffer.from(string));

      if (mode === TEXT) {
        this._parts.push(new MetadataPart(Buffer.from(`<!--lit-part-->`)));
        this._strings.push(EMPTY_STRING_BUFFER);
        this._parts.push(new ChildPart(tagName));
        this._strings.push(EMPTY_STRING_BUFFER);
        this._parts.push(new MetadataPart(Buffer.from(`<!--/lit-part-->`)));
      } else if (mode === ATTRIBUTE) {
        this._parts.push(handleAttributeExpressions(attributeName, tagName));
      }

      // Add closing metadata
      if (isLastString) {
        this._parts.push(new MetadataPart(Buffer.from(`<!--/lit-part-->`)));
        this._strings.push(EMPTY_STRING_BUFFER);
      }
    }
  }
}

/**
 * Create part instance for dynamic attribute values
 * @param { string } name
 * @param { string } tagName
 */
function handleAttributeExpressions(name, tagName) {
  if (name === '') {
    return new ElementPart(tagName);
  }

  const prefix = name[0];

  if (prefix === '.') {
    return new PropertyPart(name.slice(1), tagName);
  } else if (prefix === '@') {
    return new EventPart(name.slice(1), tagName);
  } else if (prefix === '?') {
    return new BooleanAttributePart(name.slice(1), tagName);
  }

  return new AttributePart(name, tagName);
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
