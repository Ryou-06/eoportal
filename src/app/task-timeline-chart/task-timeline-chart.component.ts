import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { Chart } from 'chart.js/auto';

@Component({
  standalone: true,
  selector: 'app-task-timeline-chart',
  templateUrl: './task-timeline-chart.component.html',
  styleUrls: ['./task-timeline-chart.component.css']
})
export class TaskTimelineChartComponent implements OnInit, OnChanges {
  @Input() tasks: any[] = [];
  chart: any;

  constructor() { }

  ngOnInit(): void {
    this.createChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tasks'] && !changes['tasks'].firstChange) {
      this.updateChart();
    }
  }

  private processData() {
    const tasksByDate: { [key: string]: number } = {};
    
    this.tasks.forEach(task => {
      const date = new Date(task.created_at).toLocaleDateString();
      tasksByDate[date] = (tasksByDate[date] || 0) + 1;
    });

    const dates = Object.keys(tasksByDate).sort((a, b) => 
      new Date(a).getTime() - new Date(b).getTime()
    );

    return {
      labels: dates,
      values: dates.map(date => tasksByDate[date])
    };
  }

  private createChart() {
    const data = this.processData();
    const canvas = document.getElementById('taskChart') as HTMLCanvasElement;
    if (!canvas) return;
  
    const ctx = canvas.getContext('2d');
    const gradient = ctx!.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(59, 130, 246, 0.5)');
    gradient.addColorStop(1, 'rgba(59, 130, 246, 0.1)');
  
    this.chart = new Chart(canvas, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Tasks Assigned',
          data: data.values,
          borderColor: '#3b82f6',
          backgroundColor: gradient,
          borderWidth: 2,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#3b82f6',
          pointBorderColor: '#ffffff',
          pointHoverBackgroundColor: '#ffffff',
          pointHoverBorderColor: '#3b82f6',
          pointRadius: 4,
          pointHoverRadius: 6
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              font: {
                size: 14,
                family: 'Arial, sans-serif',
                weight: 'bold',
                lineHeight: 1.2
              },
              color: '#ffffff' // Set legend text color to white
            }
          },
          title: {
            display: true,
            
            font: {
              size: 18,
              weight: 'bold',
              lineHeight: 1.2
            },
            color: '#ffffff', // Set title color to white
            padding: {
              top: 10,
              bottom: 30
            }
          },
          tooltip: {
            backgroundColor: '#f9f9f9',
            titleFont: {
              size: 14,
              weight: 'bold'
            },
            titleColor: '#000000', // Set tooltip title text color to white
            bodyFont: {
              size: 12
            },
            bodyColor: '#000000', // Set tooltip body text color to white
            borderWidth: 1,
            borderColor: '#ddd',
            cornerRadius: 8,
            padding: 10,
            displayColors: false
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 12,
                lineHeight: 1.2
              },
              color: '#ffffff' // Set x-axis text color to white
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(200, 200, 200, 0.3)',
              lineWidth: 1
            },
            ticks: {
              stepSize: 1,
              font: {
                size: 12,
                lineHeight: 1.2
              },
              color: '#ffffff' // Set y-axis text color to white
            }
          }
        },
        animation: {
          duration: 1000,
          easing: 'easeInOutQuart'
        }
      }
    });
  }
  

  private updateChart() {
    if (this.chart) {
      const data = this.processData();
      this.chart.data.labels = data.labels;
      this.chart.data.datasets[0].data = data.values;
      this.chart.update();
    }
  }
}
