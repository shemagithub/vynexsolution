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

export function meta({ data, params }) {
  const slug = params?.slug || data?.slug || '';
  if (!data?.frontmatter) {
    return baseMeta({
      title: 'Article',
      description: 'Insights on website development, systems design, and smart systems.',
      pathname: '/articles',
    });
  }
  const { title, abstract } = data.frontmatter;
  return baseMeta({
    title,
    description: abstract,
    prefix: '',
    pathname: slug ? `/articles/${slug}` : '/articles',
    type: 'article',
    keywords: [
      'website development',
      'systems design',
      'web development',
      'IoT',
      'smart systems',
      title,
    ],
    ogImage: `${config.url}/social-image.png`,
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
