import { Slot } from '@teambit/harmony';
import { ClickInsideAnIframeEvent } from '@teambit/preview';
import PubsubAspect, { PubsubUI, BitBaseEvent } from '@teambit/pubsub';
import { NavigationSlot, NavLinkProps, RouteSlot } from '@teambit/react-router';
import { UIRuntime } from '@teambit/ui';
import React from 'react';
import { RouteProps } from 'react-router-dom';

import { ComponentAspect } from './component.aspect';
import { Component } from './ui/component';
import { Menu, NavPlugin, OrderedNavigationSlot } from './ui/menu';

export type Server = {
  env: string;
  url: string;
};

export type ComponentMeta = {
  id: string;
};

export type MenuItem = {
  label: JSX.Element | string | null;
};

export const componentIdUrlRegex = '[\\w\\/-]*[\\w-]';

export class ComponentUI {
  constructor(
    private routeSlot: RouteSlot,

    private navSlot: OrderedNavigationSlot,

    /**
     * slot for registering a new widget to the menu.
     */
    private widgetSlot: NavigationSlot,
    /**
     * register to pubsub
     */
    private pubsub: PubsubUI
  ) {
    this.registerPubSub();
  }

  readonly routePath = `/:componentId(${componentIdUrlRegex})`;

  getComponentUI(host: string) {
    return <Component routeSlot={this.routeSlot} host={host} />;
  }

  getMenu(host: string) {
    return <Menu navigationSlot={this.navSlot} pubsub={this.pubsub} widgetSlot={this.widgetSlot} host={host} />;
  }
  // getTopBarUI() {
  //   return (
  //     <TopBar
  //       // className={styles.topbar}
  //       navigationSlot={this.navSlot}
  //       version={'new'} // TODO - get component data here
  //       widgetSlot={this.widgetSlot}
  //     />
  //   );
  // }

  registerPubSub() {
    console.log('pubsub???', this.pubsub);
    // this.pubsub.sub(ComponentAspect.id, (be: BitBaseEvent<any>) => {
    //   switch(be.type) {
    //     case ClickInsideAnIframeEvent.TYPE:
    //       console.log('Click Inside an IFrame in preview!!!!', be);
    //       const body = document.querySelector('body');
    //       const _backgroundColor = body?.style.backgroundColor || 'red';

    //       const new_backgroundColor = _backgroundColor == 'red' ? 'green' : 'red';

    //       if(body){
    //         body.style.backgroundColor = new_backgroundColor;
    //       }
    //       break;
    //   }

    // });
  }

  registerRoute(route: RouteProps) {
    this.routeSlot.register(route);
    return this;
  }

  registerNavigation(nav: NavLinkProps, order?: number) {
    this.navSlot.register({
      props: nav,
      order,
    });
  }

  registerWidget(widget: NavLinkProps) {
    this.widgetSlot.register(widget);
  }

  static dependencies = [];

  static runtime = UIRuntime;

  static slots = [Slot.withType<RouteProps>(), Slot.withType<NavPlugin>(), Slot.withType<NavigationSlot>()];

  static async provider(
    deps,
    config,
    [routeSlot, navSlot, widgetSlot, pubsub]: [RouteSlot, OrderedNavigationSlot, NavigationSlot, PubsubUI]
  ) {
    // TODO: refactor ComponentHost to a separate extension (including sidebar, host, graphql, etc.)
    // TODO: add contextual hook for ComponentHost @uri/@oded
    console.log('pub is here!', pubsub);
    const componentUI = new ComponentUI(routeSlot, navSlot, widgetSlot, pubsub);
    return componentUI;
  }
}

export default ComponentUI;

ComponentAspect.addRuntime(ComponentUI);
