import { Component, computed, inject, input, signal } from '@angular/core';
import * as THREE from 'three';
import katex from 'katex';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'matrix-display',
  imports: [],
  templateUrl: './matrix-display.component.html',
  styleUrl: './matrix-display.component.scss'
})

export class MatrixDisplayComponent {
  private sanitizer = inject(DomSanitizer);

  // Set to 0 for integers (0, 1, -1), or 2 for decimals (0.00, 1.00)
  private readonly DECIMAL_PLACES = 0;

  // Input Signal
  matrix = input.required<THREE.Matrix3>();

  // Computed Signal
  public safeLatex = computed((): SafeHtml => {
    const m = this.matrix();
    const e = m.elements;

    // Helper: Formats numbers and adds invisible spacing for alignment
    const align = (val: number): string => {
      // 1. Sanitize "negative zero" (turn -0 into 0)
      const safeVal = Object.is(val, -0) ? 0 : val;
      
      // 2. Convert to string based on decimal preference
      const str = safeVal.toFixed(this.DECIMAL_PLACES);

      // 3. The Magic: If positive, add an invisible minus sign (\phantom{-})
      // This ensures "1" is exactly as wide as "-1"
      return str.startsWith('-') ? str : `\\phantom{-}${str}`;
    };

    // Construct the LaTeX string
    // We use {rrr} (right align) or {ccc} (center) depending on preference.
    // {rrr} usually looks better with phantom alignment.
    const tex = [
      '\\left( \\begin{array}{rrr}', 
      `${align(e[0])} & ${align(e[3])} & ${align(e[6])} \\\\`,
      `${align(e[1])} & ${align(e[4])} & ${align(e[7])} \\\\`,
      `${align(e[2])} & ${align(e[5])} & ${align(e[8])}`,
      '\\end{array} \\right)'
    ].join(' ');

    const rawHtml = katex.renderToString(tex, { 
      throwOnError: false, 
      displayMode: true 
    });

    return this.sanitizer.bypassSecurityTrustHtml(rawHtml);
  });
}