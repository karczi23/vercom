declare module 'pell' {
  interface PellInitOptions {
    element: HTMLElement;
    actions: unknown[];
    defaultParagraphSeparator?: string;
    onChange: (html: string) => void;
  }

  interface PellEditor {
    content: HTMLElement;
  }

  const pell: {
    init(options: PellInitOptions): PellEditor;
  };

  export default pell;
}
