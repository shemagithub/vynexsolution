import { Fragment } from 'react';
import { postMarkdown } from '~/layouts/post/post-markdown';

function slugifyHeading(text) {
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function inlineToNodes(text) {
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`|\[[^\]]+\]\([^)]+\))/g;
  const parts = String(text).split(pattern).filter(Boolean);

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      const Strong = postMarkdown.strong;
      return <Strong key={index}>{part.slice(2, -2)}</Strong>;
    }
    if (part.startsWith('*') && part.endsWith('*')) {
      return <em key={index}>{part.slice(1, -1)}</em>;
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      const Code = postMarkdown.code;
      return <Code key={index}>{part.slice(1, -1)}</Code>;
    }
    const linkMatch = part.match(/^\[([^\]]+)\]\(([^)]+)\)$/);
    if (linkMatch) {
      const Link = postMarkdown.a;
      return (
        <Link key={index} href={linkMatch[2]}>
          {linkMatch[1]}
        </Link>
      );
    }
    return <Fragment key={index}>{part}</Fragment>;
  });
}

function renderBlocks(markdown) {
  const lines = String(markdown || '').replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (!line.trim()) {
      i += 1;
      continue;
    }

    if (line.trim() === '---' || line.trim() === '***') {
      const Hr = postMarkdown.hr;
      blocks.push(<Hr key={`hr-${i}`} />);
      i += 1;
      continue;
    }

    if (line.trim().startsWith('```')) {
      const lang = line.trim().slice(3).trim();
      const codeLines = [];
      i += 1;
      while (i < lines.length && !lines[i].trim().startsWith('```')) {
        codeLines.push(lines[i]);
        i += 1;
      }
      i += 1;
      const Pre = postMarkdown.pre;
      blocks.push(
        <Pre
          key={`pre-${i}`}
          className={lang ? `language-${lang}` : undefined}
        >
          {codeLines.join('\n')}
        </Pre>
      );
      continue;
    }

    const headingMatch = line.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const text = headingMatch[2].trim();
      const id = slugifyHeading(text);
      const Heading =
        postMarkdown[`h${level}`] || postMarkdown.h4;
      blocks.push(
        <Heading key={`h-${i}`} id={id}>
          {inlineToNodes(text)}
        </Heading>
      );
      i += 1;
      continue;
    }

    if (line.trim().startsWith('>')) {
      const quoteLines = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        quoteLines.push(lines[i].replace(/^>\s?/, ''));
        i += 1;
      }
      const Blockquote = postMarkdown.blockquote;
      blocks.push(
        <Blockquote key={`bq-${i}`}>{inlineToNodes(quoteLines.join(' '))}</Blockquote>
      );
      continue;
    }

    if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {
      const ordered = /^\s*\d+\./.test(line);
      const items = [];
      while (i < lines.length && /^\s*([-*+]|\d+\.)\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*([-*+]|\d+\.)\s+/, ''));
        i += 1;
      }
      const List = ordered ? postMarkdown.ol : postMarkdown.ul;
      const ListItem = postMarkdown.li;
      blocks.push(
        <List key={`list-${i}`}>
          {items.map((item, itemIndex) => (
            <ListItem key={itemIndex}>{inlineToNodes(item)}</ListItem>
          ))}
        </List>
      );
      continue;
    }

    const paragraphLines = [];
    while (
      i < lines.length &&
      lines[i].trim() &&
      !lines[i].match(/^#{1,4}\s/) &&
      !lines[i].trim().startsWith('```') &&
      !lines[i].trim().startsWith('>') &&
      !/^\s*([-*+]|\d+\.)\s+/.test(lines[i]) &&
      lines[i].trim() !== '---' &&
      lines[i].trim() !== '***'
    ) {
      paragraphLines.push(lines[i]);
      i += 1;
    }
    const Paragraph = postMarkdown.p;
    blocks.push(
      <Paragraph key={`p-${i}`}>{inlineToNodes(paragraphLines.join(' '))}</Paragraph>
    );
  }

  return blocks;
}

export function MarkdownContent({ children }) {
  const content = typeof children === 'string' ? children : '';
  const Paragraph = postMarkdown.p;
  if (!content.trim()) {
    return <Paragraph>This article has no content yet.</Paragraph>;
  }
  return <>{renderBlocks(content)}</>;
}
