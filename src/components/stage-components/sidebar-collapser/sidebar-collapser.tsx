import React from 'react';
import classNames from 'classnames';
import { Icon } from '@teambit/evangelist-temp.elements.icon';
import styles from './sidebar-collapser.module.scss';

type CollapserProps = {
  isOpen: boolean;
} & React.HTMLAttributes<HTMLDivElement>;

export function Collapser({ isOpen, onClick, className, ...rest }: CollapserProps) {
  return (
    <div {...rest} onClick={onClick} className={classNames(styles.collapser, className, { [styles.open]: isOpen })}>
      <div className={styles.circle}>
        <div>
          <Icon of="right-rounded-corners" />
        </div>
      </div>
    </div>
  );
}
