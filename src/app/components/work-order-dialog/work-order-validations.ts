import { AbstractControl, ValidatorFn } from '@angular/forms';
import { WorkOrderDocument } from '../../types';

export const dateRangeValidator: (otherCtrl: string) => ValidatorFn = (otherCtrl: string) => {
  return (control: AbstractControl) => {
    const form = control.parent;
    const start = form?.get('startDate')?.value;
    const end = form?.get('endDate')?.value;
    if (start && end && new Date(start) > new Date(end)) {
      return { dateRangeInvalid: true };
    }
    clearOtherCtrl(form?.get(otherCtrl));
    return null;
  };
};

// * Update other control.
function clearOtherCtrl(
  ctrl: AbstractControl | null | undefined,
  errorName = 'dateRangeInvalid',
): void {
  if (!ctrl || !ctrl.hasError(errorName)) return;

  let errors = ctrl.errors || {};
  delete errors['dateRangeInvalid'];
  ctrl.setErrors(errors);
  ctrl.updateValueAndValidity();
}

export const datesOverlapValidator: (
  ordersCollection: WorkOrderDocument[],
  docId?: string,
) => ValidatorFn = (ordersCollection: WorkOrderDocument[], docId?: string) => {
  return (control: AbstractControl) => {
    const start = control?.get('startDate');
    const end = control?.get('endDate');

    if (!ordersCollection?.length || !start?.value || !end?.value) {
      return null;
    }

    for (let order of ordersCollection) {
      // * Skip itself of validation.
      if (docId === order.docId) continue;
      if (
        !!start.value &&
        start?.value >= new Date(order.data.startDate) &&
        start?.value <= new Date(order.data.endDate)
      ) {
        start.setErrors({
          ...(start.errors || {}),
          datesOverlap: true,
        });
        start.markAsDirty();
        return { datesOverlap: true };
      }
      if (
        !!end.value &&
        end?.value >= new Date(order.data.startDate) &&
        end?.value <= new Date(order.data.endDate)
      ) {
        end.setErrors({
          ...(end.errors || {}),
          datesOverlap: true,
        });
        end.markAsDirty();
        return { datesOverlap: true };
      }
    }

    clearOtherCtrl(start, 'datesOverlap');
    clearOtherCtrl(end, 'datesOverlap');
    return null;
  };
};
