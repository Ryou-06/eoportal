import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FileSubmissionModalComponent } from './file-submission-modal.component';

describe('FileSubmissionModalComponent', () => {
  let component: FileSubmissionModalComponent;
  let fixture: ComponentFixture<FileSubmissionModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FileSubmissionModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FileSubmissionModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
