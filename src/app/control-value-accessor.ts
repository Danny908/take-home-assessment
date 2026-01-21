import { ChangeDetectorRef, Directive, inject, Input, signal } from '@angular/core';
import { ControlValueAccessor } from '@angular/forms';

@Directive()
export class CustomValueAccessor implements ControlValueAccessor {
  // 1. Direct Input Support
  @Input() set value(externalVal: any) {
    this.val.set(externalVal || '');
    this.cdr.markForCheck();
  }

  private cdr = inject(ChangeDetectorRef);
  protected val = signal<any>('');

  // 2. ControlValueAccessor implementation
  onModelChange: any = () => {};
  onTouched: any = () => {};
  focused = false;
  disabled = false;

  // 2. Methods from ControlValueAccessor Interface
  writeValue(formVal: any): void {
    // Only update if the form value is actually defined
    if (formVal !== undefined) {
      this.val.set(formVal || '');
      this.cdr.markForCheck();
    }
  }

  registerOnChange(fn: any): void {
    this.onModelChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  // 3. Helper to update the form on user input
  onInput(event: Event) {
    const newVal = (event.target as HTMLInputElement).value;
    this.val.set(newVal);
    this.onModelChange(newVal); // Updates the Reactive Form
  }

  onBlur() {
    this.focused = false;
    this.onTouched(); // Marks the control as 'touched' for validation
  }
}
