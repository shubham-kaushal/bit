import classNames from 'classnames';
import React, { HTMLAttributes } from 'react';

import styles from './task-block.module.scss';

export type TaskProps = {
  name: string;
  icon?: string;
  description?: string;
  isOverridden?: boolean;
  ui?: any;
} & HTMLAttributes<HTMLDivElement>;

export type TaskBlockProps = { task: TaskProps } & HTMLAttributes<HTMLDivElement>;

export function TaskBlock({ task, ...rest }: TaskBlockProps) {
  const { name, icon, description, isOverridden, ui } = task;
  return (
    <div {...rest} className={styles.taskBlock}>
      <div className={styles.taskTitle}>
        <div>
          <div>
            <div className={styles.name}>{name}</div>
            <img className={styles.icon} src={icon} />
          </div>
          <div className={styles.spacer} />
          <OverriddenLabel isOverridden={isOverridden} />
        </div>
        <div className={styles.description}>{description}</div>
      </div>
      {ui}
    </div>
  );
}

type OverriddenLabelProps = { isOverridden?: boolean } & HTMLAttributes<HTMLDivElement>;
function OverriddenLabel({ isOverridden, ...rest }: OverriddenLabelProps) {
  if (!isOverridden) return null;
  return (
    <div {...rest} className={styles.overriddenLabel}>
      Overridden
    </div>
  );
}
