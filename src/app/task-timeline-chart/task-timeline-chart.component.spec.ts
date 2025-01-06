import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskTimelineChartComponent } from './task-timeline-chart.component';

describe('TaskTimelineChartComponent', () => {
  let component: TaskTimelineChartComponent;
  let fixture: ComponentFixture<TaskTimelineChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskTimelineChartComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskTimelineChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
