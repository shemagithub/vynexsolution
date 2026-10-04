import { createContext, useContext, useEffect, useState } from 'react';
import config from '~/config.json';
import { getSiteConfig } from '~/utils/api';
import { mergeSiteConfig } from '~/utils/site-config';

const SiteConfigContext = createContext(mergeSiteConfig());

export function SiteConfigProvider({ value, children }) {
  const [siteConfig, setSiteConfig] = useState(() => mergeSiteConfig(value));

  useEffect(() => {
    setSiteConfig(mergeSiteConfig(value));
  }, [value]);

  useEffect(() => {
    let cancelled = false;
    getSiteConfig()
      .then(remote => {
        if (!cancelled && remote) {
          setSiteConfig(mergeSiteConfig(remote));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <SiteConfigContext.Provider value={siteConfig}>
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
