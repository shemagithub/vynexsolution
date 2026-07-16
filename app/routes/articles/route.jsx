import { Outlet } from '@remix-run/react';
import { MDXProvider } from '@mdx-js/react';
import { postMarkdown } from '~/layouts/post';

export default function ArticlesLayout() {
  return (
    <MDXProvider components={postMarkdown}>
      <Outlet />
    </MDXProvider>
  );
}
