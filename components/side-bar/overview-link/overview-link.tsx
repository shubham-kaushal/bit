import React from 'react';

import styles from './overview-link.module.scss';
import { SidebarLink } from '../sidebar-link';

export function OverviewLink() {
  return (
    <div className={styles.sidebarLinkBox}>
      <SidebarLink icon="comps" href="/">
        Overview
      </SidebarLink>
      <SidebarLink icon="settings" href="/settings">
        Settings
      </SidebarLink>
    </div>
  );
}
