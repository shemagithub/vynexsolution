import { useRouteError } from '@remix-run/react';
import { Error } from '~/layouts/error';

export async function clientLoader() {
  throw new Response(null, { status: 404, statusText: 'Not found' });
}

clientLoader.hydrate = true;

export const meta = () => {
  return [
    { title: '404 | Page not found | Vynex Solutions' },
    {
      name: 'description',
      content:
        'Page not found. Explore Vynex Solutions for website development, systems design, mobile apps, and IoT.',
    },
    { name: 'robots', content: 'noindex, follow' },
  ];
};

export function ErrorBoundary() {
  const error = useRouteError();

  return <Error error={error} />;
}
