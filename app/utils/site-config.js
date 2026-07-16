import config from '~/config.json';

export function mergeSiteConfig(remote = {}) {
  return {
    ...config,
    ...remote,
    disciplines: remote.disciplines?.length ? remote.disciplines : config.disciplines,
    logoLight: remote.logoLight || config.logoLight || '',
    logoDark: remote.logoDark || config.logoDark || '',
  };
}
