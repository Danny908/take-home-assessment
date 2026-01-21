import { WorkCenterDocument, WorkOrderDocument } from './types';

export const WORK_CENTER_LIST: () => WorkCenterDocument[] = () => {
  const defaultCenters: WorkCenterDocument[] = [
    {
      docId: '0',
      docType: 'workCenter',
      data: {
        name: 'Genesis Hardware',
      },
    },
    {
      docId: '1',
      docType: 'workCenter',
      data: {
        name: 'Rodriques Electrics',
      },
    },
    {
      docId: '2',
      docType: 'workCenter',
      data: {
        name: 'Konsulting Inc',
      },
    },
    {
      docId: '3',
      docType: 'workCenter',
      data: {
        name: 'McMarrow Distribution',
      },
    },
    {
      docId: '4',
      docType: 'workCenter',
      data: {
        name: 'Spartan Manufacturing',
      },
    },
  ];

  // * If not first visit persist changes.
  // const savedWorkCenters = localStorage.getItem('workCenters');
  // if (savedWorkCenters) {
  //   return JSON.parse(savedWorkCenters);
  // }

  localStorage.setItem('workCenters', JSON.stringify(defaultCenters));
  return defaultCenters;
};

export const WORK_ORDER_LIST: () => {
  defaultOrders: WorkOrderDocument[];
  insert: (order: WorkOrderDocument) => void;
  update: (order: WorkOrderDocument) => void;
  remove: (order: WorkOrderDocument) => void;
} = () => {
  let defaultOrders: WorkOrderDocument[] = [
    {
      docId: '0',
      docType: 'workOrder',
      data: {
        name: 'Genesis Hardware',
        workCenterId: '0',
        status: 'blocked',
        startDate: '2025-12-15',
        endDate: '2026-01-15',
      },
    },
    {
      docId: '1',
      docType: 'workOrder',
      data: {
        name: 'Genesis Hardware',
        workCenterId: '0',
        status: 'open',
        startDate: '2026-01-17',
        endDate: '2026-01-20',
      },
    },
    {
      docId: '2',
      docType: 'workOrder',
      data: {
        name: 'Rodriques Electrics',
        workCenterId: '1',
        status: 'complete',
        startDate: '2025-06-05',
        endDate: '2025-07-10',
      },
    },
    {
      docId: '3',
      docType: 'workOrder',
      data: {
        name: 'Konsulting Inc',
        workCenterId: '2',
        status: 'in-progress',
        startDate: '2026-01-05',
        endDate: '2026-02-05',
      },
    },
  ];

  function updateStorage() {
    localStorage.setItem('workOrders', JSON.stringify(defaultOrders));
  }

  // * If not first visit persist changes.
  const savedWorkOrders = localStorage.getItem('workOrders');
  if (savedWorkOrders) {
    defaultOrders = JSON.parse(savedWorkOrders);
  } else {
    updateStorage();
  }

  return {
    defaultOrders,
    insert: (order) => {
      defaultOrders.push(order);
      updateStorage();
    },
    update: (order) => {
      const index = defaultOrders.findIndex((o) => o.docId === order.docId);
      if (index === -1) {
        defaultOrders.push(order);
        return;
      }
      defaultOrders[index] = order;
      updateStorage();
    },
    remove: (order) => {
      const index = defaultOrders.findIndex((o) => o.docId === order.docId);
      if (index === -1) return;
      defaultOrders.splice(index, 1);
      updateStorage();
    },
  };
};
