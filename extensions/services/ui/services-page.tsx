import { ComponentContext } from '@teambit/component';
import { H1 } from '@teambit/documenter.ui.heading';
import { Separator } from '@teambit/documenter.ui.separator';
import { EmptyBox } from '@teambit/staged-components.empty-box';
import classNames from 'classnames';
import React, { HTMLAttributes, useContext } from 'react';
import { TopBarNav } from '@teambit/component';
import { TaskBlock } from './task-block';

import styles from './services-page.module.scss';

const tasks = [
  {
    name: 'compile to es5',
    icon: 'https://static.bit.dev/extensions-icons/react.svg',
    description: 'Use Typescript to transpile code for modern browsers',
    isOverridden: false,
  },
  {
    name: 'compile to es5',
    icon: 'https://static.bit.dev/extensions-icons/react.svg',
    description: 'Use Typescript to transpile code for modern browsers',
    isOverridden: true,
    ui: <div>jskh</div>,
  },
];

const links = [
  {
    href: '/a',
    children: 'Compile',
  },
];

type ServicesPageProps = {
  services?: any;
} & HTMLAttributes<HTMLDivElement>;

export function ServicesPage({ className, services }: ServicesPageProps) {
  const component = useContext(ComponentContext);
  const tags = component.tags.toArray();
  if (!tags || tags.length === 0) {
    return (
      <EmptyBox
        title="This component is new and doesn’t have a services yet."
        linkText="Learn more about component services"
        link="https://docs.bit.dev/docs/tag-component-version"
      />
    );
  }

  return (
    <div className={classNames(styles.servicesPage, className)}>
      <H1 className={styles.title}>Development Environment Services</H1>
      <ServicesNavBar links={links} />
      <Separator className={styles.separator} />
      <DescriptionBlock></DescriptionBlock>
      {tasks.map((task, index) => (
        <TaskBlock key={index} task={task} />
      ))}
    </div>
  );
}

type DescriptionBlockProps = {} & HTMLAttributes<HTMLDivElement>;
function DescriptionBlock({ children }: DescriptionBlockProps) {
  return <div>{children}</div>;
}

function ServicesNavBar({ links }: any) {
  return (
    <div>
      {links.map((link, index) => {
        return (
          <TopBarNav key={index} href={link.href} className={styles.servicesNav}>
            {link.children}
          </TopBarNav>
        );
      })}
    </div>
  );
}
