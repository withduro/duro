// packages/duro-dev/src/index.ts

export type Prop = {
  name: string;
  type: string;
  required: boolean;
};

// .duro fayl ichidagi bloklarni ajratib oluvchi parser
export function parseDuroFile(content: string) {
  const blockRegex = /<(\w+)([^>]*)>([\s\S]*?)<\/\1>/g;
  const blocks: {
    type: string;
    content: string;
    lang?: string;
    setup?: boolean;
  }[] = [];
  let match;

  while ((match = blockRegex.exec(content)) !== null) {
    const [, type, attrs, blockContent] = match;
    if (["template", "script", "style"].includes(type)) {
      const langMatch = attrs.match(/lang=["'](\w+)["']/);
      const setupMatch = attrs.match(/\bsetup\b/);

      blocks.push({
        type,
        lang: langMatch ? langMatch[1] : type === "script" ? "ts" : undefined,
        setup: !!setupMatch || type === "script",
        content: blockContent.trim(),
      });
    }
  }

  return blocks;
}

// defineProps ichidan prop nomi, turi va requiredligini olish uchun parser
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
      required: !m[0].includes("?"),
    });
  }

  return props;
}

// template ichidagi {{ prop }} ni qiymati bilan almashtirish funksiyasi
export function renderTemplate(
  template: string,
  props: Record<string, any>
): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
    return props[key] ?? "";
  });
}

// Bosh funksiya: .duro faylni o‘qib, template va prop larni qaytaradi va natijani HTMLga aylantiradi
export function renderDuroFile(
  content: string,
  propsData: Record<string, any> = {}
) {
  const blocks = parseDuroFile(content);
  const scriptBlock = blocks.find((b) => b.type === "script");
  let props: Prop[] = [];

  if (scriptBlock) {
    props = parseDefineProps(scriptBlock.content);
  }

  const defaultProps = props.reduce((acc, prop) => {
    if (propsData[prop.name] !== undefined) {
      acc[prop.name] = propsData[prop.name];
    } else if (prop.type === "string") {
      acc[prop.name] = "Duro User";
    } else if (prop.type === "number") {
      acc[prop.name] = 0;
    } else {
      acc[prop.name] = "";
    }
    return acc;
  }, {} as Record<string, any>);

  const templateBlock = blocks.find((b) => b.type === "template");
  if (!templateBlock) return "";

  return renderTemplate(templateBlock.content, defaultProps);
}
