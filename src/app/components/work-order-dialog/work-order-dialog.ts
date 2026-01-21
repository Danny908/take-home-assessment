import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject, inject, OnInit, signal } from '@angular/core';
import { delay, Subject, take, tap } from 'rxjs';
import { InputComponent } from '../input/input';
import { Dropdown, DropdownOption } from '../dropdown/dropdown';
import { DatePicker } from '../date-picker/date-picker';
import { WorkOrderDocument, WorkOrderStatus } from '../../types';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { dateRangeValidator, datesOverlapValidator } from './work-order-validations';

@Component({
  selector: 'app-work-order-dialog',
  imports: [InputComponent, Dropdown, DatePicker, FormsModule, ReactiveFormsModule],
  templateUrl: './work-order-dialog.html',
  styleUrl: './work-order-dialog.scss',
})
export class WorkOrderDialog implements OnInit {
  private readonly dialogRef = inject(DialogRef);
  private handleOnClose = new Subject();
  protected readonly statuses: DropdownOption<WorkOrderStatus>[] = [
    { display: 'Open', value: 'open' },
    { display: 'In Progress', value: 'in-progress' },
    { display: 'Completed', value: 'complete' },
    {
      display: 'Blocked',
      value: 'blocked',
    },
  ];
  protected contentVisible = signal(true);
  protected workOrderForm = new FormGroup({});
  protected isEditing = false;

  constructor(
    @Inject(DIALOG_DATA)
    private dialogData: {
      workCenterId?: string;
      startDate?: Date;
      workOrder?: WorkOrderDocument;
      orderList?: WorkOrderDocument[];
    },
  ) {
    const { workCenterId, startDate, workOrder, orderList } = this.dialogData || {};
    const { data } = workOrder || {};

    this.isEditing = !!workOrder;
    this.workOrderForm.addValidators(datesOverlapValidator(orderList || [], workOrder?.docId));
    this.workOrderForm.addControl('name', new FormControl(data?.name || '', Validators.required));
    this.workOrderForm.addControl(
      'workCenterId',
      new FormControl(data?.workCenterId || workCenterId),
    );
    this.workOrderForm.addControl(
      'status',
      new FormControl(data?.status || '', Validators.required),
    );
    this.workOrderForm.addControl(
      'startDate',
      new FormControl(data?.startDate || startDate, [
        Validators.required,
        dateRangeValidator('endDate'),
      ]),
    );
    this.workOrderForm.addControl(
      'endDate',
      new FormControl(data?.endDate || null, [
        Validators.required,
        dateRangeValidator('startDate'),
      ]),
    );
  }

  ngOnInit() {
    this.dialogRef.backdropClick.pipe(take(1)).subscribe(() => this.closeOrder());
    this.handleOnClose
      .pipe(
        tap(() => this.contentVisible.set(false)),
        delay(300),
        take(1),
      )
      .subscribe((data) => {
        let _workOrder = null;
        if (data) {
          const docIds = this.dialogData.orderList?.map((order) => Number(order.docId)) || [];
          _workOrder = {
            docId: this.isEditing
              ? this.dialogData.workOrder?.docId
              : (Math.max(...docIds, 0) + 1).toString(),
            docType: 'workOrder',
            data,
          };
        }
        this.dialogRef.close(_workOrder);
      });
  }

  closeOrder(): void {
    this.handleOnClose.next(null);
  }

  createOrder(): void {
    this.handleOnClose.next(this.workOrderForm.value);
  }
}
