declare type ClientRenderOptions = Partial<import('lit-html').RenderOptions>;
declare type ClientChildPart = InstanceType<typeof import('lit-html')['_$LH']['_ChildPart']>;
declare type ClientTemplateInstance = InstanceType<typeof import('lit-html')['_$LH']['_TemplateInstance']>;
declare type ClientChildPartState =
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
