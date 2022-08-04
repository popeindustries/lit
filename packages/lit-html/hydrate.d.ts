/**
 * Hydrate existing server-rendered markup.
 */
export function hydrateOrRender(
  value: unknown,
  container: HTMLElement | DocumentFragment,
  options?: ClientRenderOptions,
): void;

declare type ClientTemplateInstance = InstanceType<typeof import('lit-html')['_$LH']['_TemplateInstance']>;
export type ClientRenderOptions = Partial<import('lit-html').RenderOptions>;
export type ClientChildPart = InstanceType<typeof import('lit-html')['_$LH']['_ChildPart']>;
export type ClientChildPartState =
  | {
      type: 'leaf';
      part: ClientChildPart;
    }
  | {
      type: 'iterable';
      part: ClientChildPart;
      value: Iterable<unknown>;
      iterator: Iterator<unknown>;
      done: boolean;
    }
  | {
      type: 'template-instance';
      part: ClientChildPart;
      result: import('lit-html').TemplateResult;
      instance: ClientTemplateInstance;
      templatePartIndex: number;
      instancePartIndex: number;
    };
