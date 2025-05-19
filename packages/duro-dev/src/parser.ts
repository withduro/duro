// packages/duro-dev/src/parser.ts

export type Prop = {
  name: string,
  type: string,
  required: boolean
}

export function parseDuroFile(content: string) {
  const blockRegex = /<(\w+)([^>]*)>([\s\S]*?)<\/\1>/g;
  const blocks: { type: string; content: string; lang?: string; setup?: boolean }[] = [];
  let match;

  while ((match = blockRegex.exec(content)) !== null) {
    const [, type, attrs, blockContent] = match;
    if (['template', 'script', 'style'].includes(type)) {
      const langMatch = attrs.match(/lang=["'](\w+)["']/);
      const setupMatch = attrs.match(/\bsetup\b/);

      blocks.push({
        type,
        lang: langMatch ? langMatch[1] : (type === 'script' ? 'ts' : undefined),
        setup: !!setupMatch || (type === 'script'),
        content: blockContent.trim(),
      });
    }
  }

  return blocks;
}

export function parseDefineProps(scriptContent: string): Prop[] {
  const definePropsRegex = /defineProps\s*<\s*{([^}]*)}\s*>\s*\(\s*\)/;
  const match = scriptContent.match(definePropsRegex);
  if (!match) return [];

  const propsString = match[1];
  const props: Prop[] = [];

  const propRegex = /(\w+)\??:\s*([\w\[\]\|]+)/g;
  let m;
  while ((m = propRegex.exec(propsString)) !== null) {
    props.push({
      name: m[1],
      type: m[2],
      required: !m[0].includes('?')
    });
  }

  return props;
}

export function renderTemplate(template: string, props: Record<string, any>): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
    return props[key] ?? '';
  });
}
