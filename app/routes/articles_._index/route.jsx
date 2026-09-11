import { pageMeta } from '~/utils/meta';
import { loadBlogPageData } from '~/utils/page-loaders';

export async function clientLoader() {
  return loadBlogPageData();
}

clientLoader.hydrate = true;

export function meta() {
  return pageMeta('/articles');
}

export { Articles as default } from './articles';
