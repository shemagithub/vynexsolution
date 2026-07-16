import { createContext, useContext } from 'react';
import config from '~/config.json';
import { mergeSiteConfig } from '~/utils/site-config';

const SiteConfigContext = createContext(mergeSiteConfig());

export function SiteConfigProvider({ value, children }) {
  return (
    <SiteConfigContext.Provider value={mergeSiteConfig(value)}>
      {children}
    </SiteConfigContext.Provider>
  );
}

export function useSiteConfig() {
  return useContext(SiteConfigContext);
}

export function getDefaultSiteConfig() {
  return mergeSiteConfig(config);
}
