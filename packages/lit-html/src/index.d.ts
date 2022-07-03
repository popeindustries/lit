declare type RenderOptions = Partial<import('lit-html').RenderOptions>;
declare type ChildPart = InstanceType<typeof import('lit-html')['_$LH']['_ChildPart']>;
declare type TemplateInstance = InstanceType<typeof import('lit-html')['_$LH']['_TemplateInstance']>;
declare type ChildPartState =
  | {
      type: 'leaf';
      part: ChildPart;
    }
  | {
      type: 'iterable';
      part: ChildPart;
      value: Iterable<unknown>;
      iterator: Iterator<unknown>;
      done: boolean;
    }
  | {
      type: 'template-instance';
      part: ChildPart;
      result: import('lit-html').TemplateResult;
      instance: TemplateInstance;
      templatePartIndex: number;
      instancePartIndex: number;
    };
