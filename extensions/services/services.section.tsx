import { Section } from '@teambit/component';
import React from 'react';

import styles from './services.module.scss';
import { ServicesPage } from './ui/services-page';

export class ServicesSection implements Section {
  route = {
    path: '~services',
    children: <ServicesPage className={styles.services} />,
  };
  navigationLink = {
    href: '~services',
    children: 'Services',
  };
  order = 70;
}
