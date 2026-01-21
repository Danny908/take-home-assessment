import { CdkMenuModule } from '@angular/cdk/menu';
import { ConnectedPosition, OverlayModule } from '@angular/cdk/overlay';
import {
  Component,
  ContentChild,
  effect,
  EventEmitter,
  forwardRef,
  Input,
  OnInit,
  Output,
  signal,
  TemplateRef,
} from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { CustomValueAccessor } from '../../control-value-accessor';
import { NgTemplateOutlet } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

export interface DropdownOption<T> {
  display: string;
  value: T;
}

@Component({
  selector: 'app-dropdown',
  imports: [NgTemplateOutlet, OverlayModule, CdkMenuModule, MatIconModule],
  templateUrl: './dropdown.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => Dropdown),
      multi: true,
    },
  ],
  styleUrl: './dropdown.scss',
})
export class Dropdown extends CustomValueAccessor {
  @ContentChild('selectionEl') customSelectionEl?: TemplateRef<any>;
  @Input('options') options: DropdownOption<unknown>[] = [];
  @Input() icon = 'keyboard_arrow_down';
  @Input() placeholder = 'Select an option';
  @Output() onChange = new EventEmitter<unknown>();
  protected selection = signal('');
  optionsPosition: ConnectedPosition[] = [
    {
      originX: 'start',
      originY: 'bottom',
      overlayX: 'start',
      overlayY: 'top',
      offsetY: 5,
    },
  ];
  protected isOpen = signal(false);

  constructor() {
    super();
    effect(() => {
      const selection = this.options.find((opt) => opt.value === this.val());
      if (selection) {
        this.selection.set(selection.display);
      }
    });
  }

  optionSelected(optValue: unknown): void {
    this.val.set(optValue);
    this.onChange.emit(optValue);
    this.onModelChange(optValue);
    this.onTouched();
  }
}
