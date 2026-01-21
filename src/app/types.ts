import { KeyValue } from '@angular/common';

export interface WorkCenterDocument {
  docId: string;
  docType: 'workCenter';
  data: {
    name: string;
  };
}

export interface WorkOrderDocument {
  docId: string;
  docType: 'workOrder';
  data: WorkOrderDocumentData;
}

export interface WorkOrderDocumentData {
  name: string;
  workCenterId: string; // References WorkCenterDocument.docId
  status: WorkOrderStatus;
  startDate: string; // ISO format (e.g., "2025-01-15")
  endDate: string; // ISO format
}
export type Timescales = 'hour' | 'day' | 'week' | 'month' | '';
export type WorkOrderStatus = 'open' | 'in-progress' | 'complete' | 'blocked';
export const TimescalesDisplay: { [key: string]: string } = {
  open: 'Open',
  'in-progress': 'In Progress',
  complete: 'Completed',
  blocked: 'Blocked',
};
