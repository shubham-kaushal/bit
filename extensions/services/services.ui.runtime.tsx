import { ComponentAspect, ComponentUI } from '@teambit/component';
import { UIRuntime } from '@teambit/ui';
import { Slot, SlotRegistry } from '@teambit/harmony';
import React, { ReactNode } from 'react';
import R from 'ramda';
import { ServicesAspect } from './services.aspect';
import { ServicesSection } from './services.section';
import { ServicesPage } from './ui/services-page';

export type Task = {
  name: string;
  icon?: string;
  description?: string;
  overridden?: boolean;
  ui: ReactNode;
};

export type ServiceProps = {
  displayName: string;
  description?: ReactNode;
  link: string;
  tasks?: Task[];
};

export type ServiceSlot = SlotRegistry<ServiceProps[]>;

export class ServicesUI {
  constructor(private serviceSlot: ServiceSlot) {}
  Services = () => {
    const services = R.flatten(this.serviceSlot.values());
    return <ServicesPage services={services} />;
  };

  registerService(services: ServiceProps[]) {
    this.serviceSlot.register(services);
    return this;
  }

  static dependencies = [ComponentAspect];

  static runtime = UIRuntime;

  static slots = [Slot.withType<ServiceSlot>()];

  static async provider([component]: [ComponentUI], config, [serviceSlot]: [ServiceSlot]) {
    const ui = new ServicesUI(serviceSlot);
    const section = new ServicesSection();

    component.registerRoute(section.route);
    component.registerNavigation(section.navigationLink, section.order);
    // ui.registerService(example);
    return ui;
  }
}

ServicesAspect.addRuntime(ServicesUI);

// const example = [
//   {
//     displayName: 'string',
//     description: <div>ReactNode</div>,
//     link: 'link',
//   },
// ];
