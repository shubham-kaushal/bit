import React from 'react';

import styles from './overview-link.module.scss';
import { SidebarLink, SidebarLinkProps } from '../sidebar-link';

export type OverviewLinkProps = {
  links?: SidebarLinkProps[];
} & React.HTMLAttributes<HTMLDivElement>;

export function OverviewLink({ links, ...rest }: OverviewLinkProps) {
  if (!links) return null;
  return (
    <div className={styles.sidebarLinkBox} {...rest}>
      {links.map((link, index) => (
        <SidebarLink key={index} icon={link.icon} href={link.href} {...link}>
          {link.children}
        </SidebarLink>
      ))}
    </div>
  );
}
