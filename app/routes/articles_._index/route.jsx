import { baseMeta } from '~/utils/meta';
import { loadBlogPageData } from '~/utils/page-loaders';
import config from '~/config.json';

export async function clientLoader() {
  return loadBlogPageData();
}

clientLoader.hydrate = true;

export function meta() {
  return baseMeta({
    title: 'Blog',
    description: `Articles and insights from ${config.name} — web, mobile, IoT, and product delivery.`,
  });
}

export { Articles as default } from './articles';
