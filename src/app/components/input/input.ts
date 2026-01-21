import { Component, forwardRef, Input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { CustomValueAccessor } from '../../control-value-accessor';

@Component({
  selector: 'app-input',
  imports: [],
  templateUrl: './input.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  styleUrl: './input.scss',
})
export class InputComponent extends CustomValueAccessor {
  @Input() placeholder = '';
}
