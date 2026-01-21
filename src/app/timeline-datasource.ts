import { Timescales, WorkOrderDocument } from './types';

export class TimelineDataSource {
  private minDate!: number;
  private maxDate!: number;
  private _dateRanges: Date[] = [];
  private _todayIdx!: number;
  private _groupedOrders!: Map<string, WorkOrderDocument[]>;

  get dateRanges() {
    return this._dateRanges;
  }

  get todayIndex() {
    return this._todayIdx;
  }

  get groupedOrders() {
    return this._groupedOrders;
  }

  constructor(
    private workOrders: WorkOrderDocument[],
    private timescale: Timescales = 'month',
    private columnWidth = 120,
    private timeOffset = 5,
  ) {
    this.initData();
  }

  private initData() {
    this.calculateRange(this.workOrders);
    this.generateDatesRange();
    this.groupWorkOrders();
  }

  updateTimescale(timescale: Timescales): void {
    this.timescale = timescale;
    this.getOffsetDates();
    this.generateDatesRange();
  }

  updateGroupedOrder(workOrders: WorkOrderDocument[]): void {
    this.workOrders = workOrders;
    this.initData();
  }

  private calculateRange(orders: WorkOrderDocument[]): void {
    if (!orders || orders.length === 0) {
      this.getOffsetDates();
      return;
    }
    const startTimes = orders
      .map((o) => {
        const date = new Date(o.data?.startDate);
        date.setHours(0, 0, 0, 0);
        return date.getTime();
      })
      .filter((t) => !isNaN(t));

    const endTimes = orders
      .map((o) => {
        const date = new Date(o.data?.endDate);
        date.setHours(23, 59, 59, 999);
        return date.getTime();
      })
      .filter((t) => !isNaN(t));

    this.minDate = Math.min(...startTimes);
    this.maxDate = Math.max(...endTimes);
    this.getOffsetDates();
  }

  // * Returns default min/max offset in milliseconds
  private getOffsetDates(): void {
    const today = new Date();
    // today.setHours(0, 0, 0, 0);
    // today.setDate(1);
    const todayDate = today.getTime();
    let min: number;
    let max: number;
    let offsetCalc!: number;

    switch (this.timescale) {
      case 'hour':
        offsetCalc = this.timeOffset * 60 * 60 * 1000;
        break;
      case 'day':
        offsetCalc = this.timeOffset * 24 * 60 * 60 * 1000;
        break;
      case 'week':
        offsetCalc = this.timeOffset * 7 * 24 * 60 * 60 * 1000;
        break;
      default:
        // * months
        const pastDate = new Date(today);
        pastDate.setMonth(pastDate.getMonth() - this.timeOffset);
        offsetCalc = todayDate - pastDate.getTime();
        break;
    }

    min = todayDate - offsetCalc;
    max = todayDate + offsetCalc;
    // * Update min and max if orders dates are not small/big enough
    if (!this.minDate || (this.minDate && this.minDate > min)) {
      this.minDate = min;
    }
    if (!this.maxDate || (this.maxDate && this.maxDate < max)) {
      this.maxDate = max;
    }
  }

  private generateDatesRange(): void {
    const dateStart = new Date(this.minDate);
    const dateEnd = new Date(this.maxDate);
    this._dateRanges = [];
    this._todayIdx = 0;
    while (dateStart.getTime() < dateEnd.getTime()) {
      this._dateRanges.push(new Date(dateStart));
      // * Get today's date index to calculate scroll position
      if (dateStart.getTime() >= new Date().getTime() && !this._todayIdx) {
        this._todayIdx = this._dateRanges.length - 2;
      }

      switch (this.timescale) {
        case 'hour':
          dateStart.setHours(dateStart.getHours() + 1);
          break;
        case 'day':
          dateStart.setDate(dateStart.getDate() + 1);
          break;
        case 'week':
          dateStart.setDate(dateStart.getDate() + 7);
          break;
        default:
          dateStart.setMonth(dateStart.getMonth() + 1);
          dateStart.setDate(1);
          break;
      }
    }
  }

  // * Will group work orders array by work center
  private groupWorkOrders(): void {
    this._groupedOrders = this.workOrders.reduce(
      (acc: Map<string, WorkOrderDocument[]>, order: WorkOrderDocument) => {
        if (!acc.has(order.data.workCenterId)) {
          acc.set(order.data.workCenterId, [order]);
          return acc;
        }
        const orders = acc.get(order.data.workCenterId) || [];
        acc.set(order.data.workCenterId, [...orders, order]);

        return acc;
      },
      new Map(),
    );
  }

  calculateWorkOrderWidth(workOrder: WorkOrderDocument): Partial<CSSStyleDeclaration> {
    const start = workOrder.data.startDate;
    const end = workOrder.data.endDate;

    const startPx = this.calculatePosition(new Date(start));
    const endPx = this.calculatePosition(new Date(end));
    const totalWidth = endPx - startPx;

    return {
      width: `${totalWidth}px`,
      transform: `translateX(${startPx}px)`,
    };
  }

  private calculatePosition(targetDate: Date) {
    const startTs = this.minDate;
    const targetTs = targetDate.getTime();

    // 1. Find the difference in milliseconds
    const diffMs = targetTs - startTs;

    // 2. Convert MS to units based on timescale
    let unitDiff: number;
    const hour = 1000 * 60 * 60;

    switch (this.timescale) {
      case 'hour':
        unitDiff = diffMs / hour;
        break;
      case 'day':
        unitDiff = diffMs / (hour * 24);
        break;
      case 'week':
        unitDiff = diffMs / (hour * 24 * 7);
        break;
      default:
        unitDiff = this.calculatePreciseMonthDiff(new Date(startTs), targetDate);
        break;
    }

    // 3. Multiply by pixel width of one column
    return unitDiff * this.columnWidth;
  }

  private calculateMonthDiff(start: Date, end: Date): number {
    // 1. Calculate the year difference and convert to months
    const years = end.getFullYear() - start.getFullYear();
    const months = end.getMonth() - start.getMonth();

    // 2. Combine them
    // Example: Jan 2025 to Jan 2026 -> (1 * 12) + 0 = 12 months
    return years * 12 + months;
  }

  private calculatePreciseMonthDiff(start: Date, target: Date): number {
    // Get the whole month integer difference
    const wholeMonths = this.calculateMonthDiff(start, target);

    // Calculate how far we are into the target month
    const dayOfMonth = target.getDate();
    const daysInMonth = new Date(target.getFullYear(), target.getMonth() + 1, 0).getDate();

    const fraction = (dayOfMonth - 1) / daysInMonth; // -1 so the 1st of the month is 0.0

    return wholeMonths + fraction;
  }
}
