/* eslint-disable max-classes-per-file */

import { BitBaseEvent } from '@teambit/pubsub';
import type { ExecutionContext } from '@teambit/envs';
import type { DevServer } from '@teambit/bundler';

export class ComponentsServerStartedEventData {
  constructor(readonly componentsServer, readonly context, readonly hostname, readonly port) {}
}

export class ComponentsServerStartedEvent extends BitBaseEvent<ComponentsServerStartedEventData> {
  static readonly TYPE = 'components-server-started';

  constructor(
    readonly timestamp: string,
    readonly componentsServer: DevServer,
    readonly context: ExecutionContext,
    readonly hostname: string,
    readonly port: number
  ) {
    super(
      ComponentsServerStartedEvent.TYPE,
      '0.0.1',
      timestamp,
      new ComponentsServerStartedEventData(componentsServer, context, hostname, port)
    );
  }
}
