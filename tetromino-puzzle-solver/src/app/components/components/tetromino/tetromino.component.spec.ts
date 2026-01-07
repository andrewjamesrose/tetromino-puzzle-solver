import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TetrominoComponent } from './tetromino.component';

describe('TetrominoComponent', () => {
  let component: TetrominoComponent;
  let fixture: ComponentFixture<TetrominoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TetrominoComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TetrominoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
