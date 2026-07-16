import { useLoaderData } from '@remix-run/react';
import { Post } from '~/layouts/post';
import { MarkdownContent } from '~/components/markdown-content';
import { baseMeta } from '~/utils/meta';
import { loadArticlePageData } from '~/utils/page-loaders';
import config from '~/config.json';

export async function clientLoader({ params }) {
  const article = await loadArticlePageData(params.slug);
  if (!article) {
    throw new Response('Article not found', { status: 404 });
  }
  return article;
}

clientLoader.hydrate = true;

export function meta({ data }) {
  if (!data?.frontmatter) {
    return baseMeta({ title: 'Article', description: 'Blog article' });
  }
  const { title, abstract } = data.frontmatter;
  return baseMeta({
    title,
    description: abstract,
    prefix: '',
    ogImage: `${config.url}/static/og.jpg`,
  });
}

export default function ArticleDetail() {
  const { frontmatter, timecode, content } = useLoaderData();

  return (
    <Post
      title={frontmatter.title}
      date={frontmatter.date}
      banner={frontmatter.banner}
      timecode={timecode}
    >
      <MarkdownContent>{content}</MarkdownContent>
    </Post>
  );
}
