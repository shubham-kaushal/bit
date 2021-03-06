import { ComponentComposition } from '@teambit/compositions';
import { Icon } from '@teambit/evangelist.elements.icon';
import React from 'react';
import { ComponentModel } from '@teambit/component';
import styles from './preview-placeholder.module.scss';

export function PreviewPlaceholder({
  component,
  shouldShowPreview,
}: {
  component: ComponentModel;
  shouldShowPreview: boolean;
}) {
  if (shouldShowPreview) {
    return <ComponentComposition component={component} hotReload={false} />;
  }
  const name = component.id.toString();
  return (
    <div className={styles.previewPlaceholder} data-tip="" data-for={name}>
      <Icon of="img" />
      <div>No preview available</div>
    </div>
  );
}
