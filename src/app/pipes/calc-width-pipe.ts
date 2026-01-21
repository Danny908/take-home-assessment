import { Pipe, PipeTransform } from '@angular/core';
import { Timescales, WorkOrderDocument } from '../types';
import { TimelineDataSource } from '../timeline-datasource';

@Pipe({
  name: 'calcWidth',
})
export class CalcWidthPipe implements PipeTransform {
  transform(
    order: WorkOrderDocument,
    timelineClass: TimelineDataSource,
    // * timescale triggers width recalculation
    _timescale: Timescales,
  ): Partial<CSSStyleDeclaration> {
    return timelineClass.calculateWorkOrderWidth(order);
  }
}
