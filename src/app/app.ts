import { Dialog, DialogModule } from '@angular/cdk/dialog';
import { CdkMenuModule } from '@angular/cdk/menu';
import { ConnectedPosition, Overlay } from '@angular/cdk/overlay';
import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  computed,
  effect,
  inject,
  signal,
  ViewChild,
} from '@angular/core';
import { WorkOrderDialog } from './components/work-order-dialog/work-order-dialog';
import { Dropdown, DropdownOption } from './components/dropdown/dropdown';
import { Timescales, TimescalesDisplay, WorkCenterDocument, WorkOrderDocument } from './types';
import { CdkVirtualScrollViewport, ScrollingModule } from '@angular/cdk/scrolling';
import { TimelineDataSource } from './timeline-datasource';
import { WORK_CENTER_LIST, WORK_ORDER_LIST } from './workers-data';
import { DatePipe, NgStyle } from '@angular/common';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatIconModule } from '@angular/material/icon';
import { CalcWidthPipe } from './pipes/calc-width-pipe';
import { filter, take } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  styleUrl: './app.scss',
  imports: [
    CdkMenuModule,
    DialogModule,
    Dropdown,
    ScrollingModule,
    DatePipe,
    MatTooltipModule,
    MatIconModule,
    NgStyle,
    CalcWidthPipe,
  ],
})
export class App implements AfterViewInit {
  @ViewChild('timeDropdown') private timescaleEl!: Dropdown;
  @ViewChild(CdkVirtualScrollViewport) viewport!: CdkVirtualScrollViewport;
  private readonly dialog = inject(Dialog);
  private readonly overlay = inject(Overlay);
  private readonly cd = inject(ChangeDetectorRef);
  private firstLoad = true;
  protected readonly timescaleOptions: DropdownOption<Timescales>[] = [
    { display: 'Hour', value: 'hour' },
    { display: 'Day', value: 'day' },
    { display: 'Week', value: 'week' },
    { display: 'Month', value: 'month' },
  ];
  protected currentTimescale = signal<Timescales>('month');
  private prevTimescale = this.currentTimescale();
  protected currentLabel = computed(() => {
    switch (this.currentTimescale()) {
      case 'hour':
        return 'Current Hour';
      case 'day':
        return 'Current Day';
      case 'week':
        return 'Current Week';
      default:
        return 'Current Month';
    }
  });
  protected dateFormat = computed(() => {
    switch (this.currentTimescale()) {
      case 'hour':
        return 'MMM d h a';
      case 'day':
        return 'EEE, MMM d';
      case 'week':
        return 'ww, MMM d';
      default:
        return 'MMM y';
    }
  });
  protected readonly workOrderActions: DropdownOption<string>[] = [
    { display: 'Edit', value: 'edit' },
    { display: 'Delete', value: 'delete' },
  ];
  protected readonly workCenterList = WORK_CENTER_LIST();
  protected workOrderList = WORK_ORDER_LIST();
  protected isWorkOrderOpen = signal(false);
  protected rowHover = signal(-1);
  protected scrollOffset = signal(0);
  protected readonly colWidth = 120;
  protected workOrdersData = new TimelineDataSource(
    this.workOrderList.defaultOrders,
    this.currentTimescale(),
    this.colWidth,
  );

  constructor() {
    effect(() => {
      this.currentTimescale();
      setTimeout(() => this.scrollCurrentDateIntoView(), 100);
    });
  }

  ngAfterViewInit(): void {
    // * Custom positioning of Dropdown component.
    if (!this.timescaleEl) return;
    const timescalePosition: ConnectedPosition[] = [
      {
        originX: 'start',
        originY: 'bottom',
        overlayX: 'start',
        overlayY: 'top',
        offsetX: -75,
        offsetY: 5,
      },
    ];
    this.timescaleEl.optionsPosition = timescalePosition;
  }

  selectTimescale(timescale: any): void {
    this.prevTimescale = this.currentTimescale();
    this.currentTimescale.set(timescale);
    this.workOrdersData.updateTimescale(timescale);
  }

  scrollCurrentDateIntoView(): void {
    if (
      !this.firstLoad &&
      (!this.viewport ||
        this.currentTimescale() === '' ||
        this.currentTimescale() === this.prevTimescale)
    )
      return;
    const index = this.workOrdersData.todayIndex;
    const viewportWidth = this.viewport.getViewportSize();
    const scrollOffset = index * this.colWidth - viewportWidth / 2 + this.colWidth / 2;
    this.firstLoad = false;
    this.viewport.scrollToOffset(scrollOffset, 'smooth');
  }

  updateScrollAbsoluteLayer(): void {
    this.scrollOffset.set(this.viewport.measureScrollOffset());
  }

  handleScheduleOrder(
    workCenterId?: string | null,
    startDate?: Date | null,
    workOrder?: WorkOrderDocument | null,
  ): void {
    const centerId = workCenterId || workOrder?.data?.workCenterId;
    let orderList: WorkOrderDocument[] = [];

    if (centerId) {
      orderList = this.workOrdersData.groupedOrders.get(centerId) || [];
    }

    this.dialog
      .open(WorkOrderDialog, {
        data: {
          workCenterId,
          workOrder,
          startDate,
          orderList,
        },
        width: '591px',
        height: '100vh',
        positionStrategy: this.overlay.position().global().top('0').right('0').bottom('0'),
        hasBackdrop: true,
        disableClose: true,
      })
      .closed.pipe(
        filter(Boolean),
        take(1),
        map((order) => order as WorkOrderDocument),
      )
      .subscribe((order) => {
        !!workOrder ? this.workOrderList.update(order) : this.workOrderList.insert(order);
        // * Alert change detection for an incoming background update.
        this.cd.markForCheck();
        this.workOrdersData.updateGroupedOrder(this.workOrderList.defaultOrders);
        this.currentTimescale.set('');
        setTimeout(() => this.currentTimescale.set(this.prevTimescale));
      });
  }

  selectWorkOrderAction(action: any, workOrder: WorkOrderDocument): void {
    if (action === 'edit') {
      this.handleScheduleOrder(null, null, workOrder);
      return;
    }
    this.workOrderList.remove(workOrder);
    this.cd.markForCheck();
    this.workOrdersData.updateGroupedOrder(this.workOrderList.defaultOrders);
    this.currentTimescale.set('');
    setTimeout(() => this.currentTimescale.set(this.prevTimescale));
  }

  getStatusLabel(status: string): string {
    return TimescalesDisplay[status];
  }
}
