import { Component, forwardRef, Input } from '@angular/core';
import { MAT_DATE_FORMATS, MAT_DATE_LOCALE, MatDateFormats } from '@angular/material/core';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import {
  MomentDateModule,
  MAT_MOMENT_DATE_ADAPTER_OPTIONS,
} from '@angular/material-moment-adapter';
import { CustomValueAccessor } from '../../control-value-accessor';
import { NG_VALUE_ACCESSOR } from '@angular/forms';

export const MY_DOT_FORMATS: MatDateFormats = {
  parse: {
    dateInput: 'MM.DD.YYYY',
  },
  display: {
    dateInput: 'MM.DD.YYYY',
    monthYearLabel: 'MMM YYYY',
    dateA11yLabel: 'LL',
    monthYearA11yLabel: 'MMMM YYYY',
  },
};

@Component({
  selector: 'app-date-picker',
  imports: [MatDatepickerModule, MomentDateModule],
  providers: [
    { provide: MAT_DATE_FORMATS, useValue: MY_DOT_FORMATS },
    { provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS, useValue: { useUtc: true } },
    { provide: MAT_DATE_LOCALE, useValue: 'en-US' },
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => DatePicker),
      multi: true,
    },
  ],
  templateUrl: './date-picker.html',
  styleUrl: './date-picker.scss',
})
export class DatePicker extends CustomValueAccessor {
  @Input() placeholder = 'Pick a date';

  handleDateChange(date: MatDatepickerInputEvent<any>): void {
    this.onInput({ target: { value: date.value } } as any as Event);
  }

  onlyNumbers(event: KeyboardEvent): void {
    // 1. Allow functional keys (navigation & deletion)
    const isControlKey = [
      'Backspace',
      'Tab',
      'ArrowLeft',
      'ArrowRight',
      'Delete',
      'Enter',
      'Home',
      'End',
    ].includes(event.key);

    // 2. Allow numbers 0-9
    const isNumber = /^[0-9]$/.test(event.key);

    // 3. Allow date separators (adjust based on your locale, e.g., / or -)
    const isSeparator = event.key === '/' || event.key === '-' || event.key === '.';

    // 4. Allow Meta/Control shortcuts (Copy/Paste/Select All)
    const isShortcut = event.ctrlKey || event.metaKey;

    if (!isControlKey && !isNumber && !isSeparator && !isShortcut) {
      event.preventDefault();
    }
  }
}
