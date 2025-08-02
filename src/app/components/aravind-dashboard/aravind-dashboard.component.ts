// Redesigned aravind-dashboard.component.ts
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart, ChartConfiguration, registerables } from 'chart.js';
import { interval, Subscription } from 'rxjs';

Chart.register(...registerables);

interface KPIData {
  totalRevenue: number;
  totalExpenses: number;
  netOperatingIncome: number;
  avgRevenuePerPatient: number;
  reconciliationPercentage: number;
  cashOnHand: number;
  bankBalance: number;
  accountReceivableDays: number;
  trends: {
    daily: number;
    monthly: number;
    yearly: number;
  };
}

interface PaymentModeData {
  name: string;
  value: number;
  amount: number;
  color: string;
  details: { time: string; amount: number }[];
}

interface DepartmentData {
  dept: string;
  revenue: number;
  percentage: number;
  patients: number;
  avgRevenue: number;
  growth: number;
}

interface AlertData {
  type: string;
  count: number;
  severity: 'high' | 'medium' | 'low';
  details: string;
  actions: string[];
}

@Component({
  selector: 'app-aravind-dashboard',
  templateUrl: './aravind-dashboard.component.html',
  styleUrls: ['./aravind-dashboard.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class AravindDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('revenueChart', { static: false }) revenueChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('locationChart', { static: false }) locationChart!: ElementRef<HTMLCanvasElement>;
  @ViewChild('paymentChart', { static: false }) paymentChart!: ElementRef<HTMLCanvasElement>;

  currentTime: Date = new Date();
  screenHeight: number = window.innerHeight;
  screenWidth: number = window.innerWidth;
  
  // Modal state
  showModal: boolean = false;
  modalData: any = null;
  modalType: string = '';

  private timeSubscription?: Subscription;
  private charts: Chart[] = [];

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.screenHeight = event.target.innerHeight;
    this.screenWidth = event.target.innerWidth;
    
    setTimeout(() => {
      this.destroyCharts();
      this.createCharts();
    }, 100);
  }

  kpiData: KPIData = {
    totalRevenue: 45675000,
    totalExpenses: 32450000,
    netOperatingIncome: 13225000,
    avgRevenuePerPatient: 2850,
    reconciliationPercentage: 98.5,
    cashOnHand: 8750000,
    bankBalance: 125000000,
    accountReceivableDays: 28,
    trends: {
      daily: 5.2,
      monthly: 12.8,
      yearly: 18.5
    }
  };

  revenueData = [
    { month: 'Jan', revenue: 42500000, expenses: 30200000, target: 45000000 },
    { month: 'Feb', revenue: 38900000, expenses: 28500000, target: 45000000 },
    { month: 'Mar', revenue: 45200000, expenses: 31800000, target: 45000000 },
    { month: 'Apr', revenue: 47300000, expenses: 33100000, target: 45000000 },
    { month: 'May', revenue: 44800000, expenses: 32200000, target: 45000000 },
    { month: 'Jun', revenue: 48900000, expenses: 34500000, target: 45000000 },
  ];

  paymentModeData: PaymentModeData[] = [
    { 
      name: 'Cash', 
      value: 35, 
      amount: 15986250, 
      color: '#3b82f6',
      details: [
        { time: '09:00', amount: 2500000 },
        { time: '12:00', amount: 4200000 },
        { time: '15:00', amount: 3800000 },
        { time: '18:00', amount: 5486250 }
      ]
    },
    { 
      name: 'Digital',
      value: 60, 
      amount: 27405000,
      color: '#10b981',
      details: [
        { time: '09:00', amount: 4700000 },
        { time: '12:00', amount: 8600000 },
        { time: '15:00', amount: 7100000 },
        { time: '18:00', amount: 7005000 }
      ]
    },
    { 
      name: 'Insurance', 
      value: 5, 
      amount: 2283750, 
      color: '#f59e0b',
      details: [
        { time: '09:00', amount: 400000 },
        { time: '12:00', amount: 800000 },
        { time: '15:00', amount: 600000 },
        { time: '18:00', amount: 483750 }
      ]
    }
  ];

  locationRevenueData = [
    { location: 'Madurai', revenue: 12500000, patients: 4850, growth: 15.2 },
    { location: 'Chennai', revenue: 9800000, patients: 3920, growth: 12.8 },
    { location: 'Coimbatore', revenue: 8200000, patients: 3240, growth: 8.5 },
    { location: 'Tirunelveli', revenue: 7300000, patients: 2890, growth: 10.2 },
    { location: 'Salem', revenue: 4900000, patients: 1950, growth: 6.8 },
    { location: 'Others', revenue: 2975000, patients: 1180, growth: 4.2 },
  ];

  departmentData: DepartmentData[] = [
    { dept: 'Cataract', revenue: 18200000, percentage: 39.8, patients: 6200, avgRevenue: 2935, growth: 18.5 },
    { dept: 'Retina', revenue: 12400000, percentage: 27.1, patients: 2800, avgRevenue: 4428, growth: 22.3 },
    { dept: 'Glaucoma', revenue: 6800000, percentage: 14.9, patients: 3100, avgRevenue: 2193, growth: 8.7 },
    { dept: 'Cornea', revenue: 4200000, percentage: 9.2, patients: 1850, avgRevenue: 2270, growth: 12.1 },
    { dept: 'Pediatric', revenue: 2300000, percentage: 5.0, patients: 1200, avgRevenue: 1916, growth: 15.8 },
    { dept: 'Others', revenue: 1775000, percentage: 3.9, patients: 850, avgRevenue: 2088, growth: 5.2 },
  ];

  alertData: AlertData[] = [
    { 
      type: 'Revenue Mismatch', 
      count: 3, 
      severity: 'high',
      details: 'Discrepancy found in Chennai and Salem branches',
      actions: ['Verify cash collection records', 'Check digital payment reconciliation', 'Contact branch managers']
    },
    { 
      type: 'Unposted Transactions', 
      count: 12, 
      severity: 'medium',
      details: 'Pending transactions from yesterday evening',
      actions: ['Review transaction logs', 'Post pending entries', 'Update accounting system']
    },
    { 
      type: 'Delayed Bank Credits', 
      count: 5, 
      severity: 'medium',
      details: 'Bank deposits not reflected in account',
      actions: ['Contact bank representative', 'Verify deposit slips', 'Follow up on processing']
    },
    { 
      type: 'AR Delays', 
      count: 8, 
      severity: 'low',
      details: 'Insurance claims pending beyond 30 days',
      actions: ['Follow up with insurance companies', 'Review claim documentation', 'Escalate if necessary']
    }
  ];

  ngOnInit() {
    this.timeSubscription = interval(1000).subscribe(() => {
      this.currentTime = new Date();
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.createCharts();
    }, 100);
  }

  ngOnDestroy() {
    if (this.timeSubscription) {
      this.timeSubscription.unsubscribe();
    }
    this.destroyCharts();
  }

  private destroyCharts() {
    this.charts.forEach(chart => chart.destroy());
    this.charts = [];
  }

  formatCurrency(value: number): string {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(1)} Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(1)}L`;
    } else {
      return `₹${(value / 1000).toFixed(0)}K`;
    }
  }

  formatAmount(value: number): string {
    if (value >= 10000000) {
      return `₹${(value / 10000000).toFixed(2)} Cr`;
    } else if (value >= 100000) {
      return `₹${(value / 100000).toFixed(2)}L`;
    } else {
      return `₹${value.toLocaleString('en-IN')}`;
    }
  }

  getTrendClass(trend: number): string {
    return trend > 0 ? 'positive' : trend < 0 ? 'negative' : 'neutral';
  }

  getAlertSeverityClass(severity: string): string {
    switch (severity) {
      case 'high': return 'high-severity';
      case 'medium': return 'medium-severity';
      default: return 'low-severity';
    }
  }

  // Modal functions
  openKPIModal(kpiType: string) {
    this.modalType = 'kpi';
    this.modalData = this.getKPIDetails(kpiType);
    this.showModal = true;
  }

  openChartModal(chartType: string) {
    this.modalType = 'chart';
    this.modalData = this.getChartDetails(chartType);
    this.showModal = true;
  }

  openPaymentModal(payment: PaymentModeData) {
    this.modalType = 'payment';
    this.modalData = payment;
    this.showModal = true;
  }

  openDepartmentModal(department: DepartmentData) {
    this.modalType = 'department';
    this.modalData = department;
    this.showModal = true;
  }

  openAlertModal(alert: AlertData) {
    this.modalType = 'alert';
    this.modalData = alert;
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.modalData = null;
    this.modalType = '';
  }

  private getKPIDetails(kpiType: string): any {
    switch (kpiType) {
      case 'totalRevenue':
        return {
          title: 'Total Revenue Analysis',
          value: this.kpiData.totalRevenue,
          trend: this.kpiData.trends.daily,
          breakdown: [
            { label: 'Surgical Revenue', value: 25400000, percentage: 55.6 },
            { label: 'Consultation Fees', value: 8120000, percentage: 17.8 },
            { label: 'Diagnostic Tests', value: 6890000, percentage: 15.1 },
            { label: 'Pharmacy Sales', value: 3265000, percentage: 7.1 },
            { label: 'Other Services', value: 2000000, percentage: 4.4 }
          ],
          insights: [
            'Revenue increased by 5.2% compared to yesterday',
            'Surgical procedures contributed 55.6% of total revenue',
            'Chennai and Madurai are top performing locations',
            'Digital payment adoption increasing',
          ]
        };
      case 'totalExpenses':
        return {
          title: 'Total Expenses Analysis',
          value: this.kpiData.totalExpenses,
          trend: -2.3,
          breakdown: [
            { label: 'Staff Salaries', value: 18500000, percentage: 57.0 },
            { label: 'Medical Supplies', value: 7200000, percentage: 22.2 },
            { label: 'Equipment Maintenance', value: 3100000, percentage: 9.5 },
            { label: 'Utilities', value: 2150000, percentage: 6.6 },
            { label: 'Other Operational', value: 1500000, percentage: 4.6 }
          ],
          insights: [
            'Expenses decreased by 2.3% from yesterday',
            'Staff costs remain the largest expense category',
            'Medical supply costs optimized through bulk purchasing',
            'Energy efficiency initiatives reducing utility costs'
          ]
        };
      case 'netIncome':
        return {
          title: 'Net Operating Income Analysis',
          value: this.kpiData.netOperatingIncome,
          trend: this.kpiData.trends.monthly,
          breakdown: [
            { label: 'Gross Revenue', value: 45675000, percentage: 100.0 },
            { label: 'Operating Expenses', value: -32450000, percentage: -71.0 },
            { label: 'Net Operating Income', value: 13225000, percentage: 29.0 }
          ],
          insights: [
            'Operating margin improved to 29% this month',
            'Revenue growth outpacing expense increases',
            'Efficiency improvements contributing to higher margins',
            'Strong performance across all service lines'
          ]
        };
      case 'bankBalance':
        return {
          title: 'Bank Balance Overview',
          value: this.kpiData.bankBalance,
          trend: 2.1,
          breakdown: [
            { label: 'Current Account', value: 45000000, percentage: 36.0 },
            { label: 'Savings Account', value: 35000000, percentage: 28.0 },
            { label: 'Fixed Deposits', value: 30000000, percentage: 24.0 },
            { label: 'Investment Account', value: 15000000, percentage: 12.0 }
          ],
          insights: [
            'Strong liquidity position maintained',
            'Balanced portfolio across account types',
            'Fixed deposits providing stable returns',
            'Ready for planned expansion investments'
          ]
        };
      default:
        return { 
          title: 'KPI Details', 
          value: 0, 
          trend: 0, 
          breakdown: [], 
          insights: ['No detailed analysis available for this metric'] 
        };
    }
  }

  private getChartDetails(chartType: string): any {
    switch (chartType) {
      case 'revenue':
        return {
          title: 'Revenue Trend Analysis',
          insights: [
            'Revenue shows consistent upward trend over 6 months',
            'Target achievement improved from 94% to 109%',
            'Q2 performance exceeded expectations by 8.7%',
            'Operating margin improved by 15% year-over-year',
            'Digital payment adoption contributing to efficiency'
          ]
        };
      case 'location':
        return {
          title: 'Location Performance Details',
          insights: [
            'Madurai leads with ₹12.5 Cr revenue and 4,850 patients',
            'Chennai shows highest revenue per patient at ₹2,500',
            'Growth rate varies from 4.2% to 15.2% across locations',
            'Tier-2 cities showing strong growth potential',
            'Coimbatore and Tirunelveli performing above average'
          ]
        };
      default:
        return { title: 'Chart Analysis', insights: ['No detailed analysis available'] };
    }
  }

  private createCharts() {
    this.createRevenueChart();
    this.createLocationChart();
    this.createPaymentChart();
  }

  private createRevenueChart() {
    if (!this.revenueChart?.nativeElement) return;

    const ctx = this.revenueChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: this.revenueData.map(d => d.month),
        datasets: [
          {
            label: 'Revenue',
            data: this.revenueData.map(d => d.revenue / 1000000),
            borderColor: '#3b82f6',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#3b82f6',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 6
          },
          {
            label: 'Target',
            data: this.revenueData.map(d => d.target / 1000000),
            borderColor: '#ef4444',
            backgroundColor: 'transparent',
            borderWidth: 2,
            borderDash: [8, 4],
            fill: false,
            pointRadius: 0
          },
          {
            label: 'Expenses',
            data: this.revenueData.map(d => d.expenses / 1000000),
            borderColor: '#f59e0b',
            backgroundColor: 'rgba(245, 158, 11, 0.15)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#f59e0b',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2,
            pointRadius: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          intersect: false,
          mode: 'index'
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20,
              font: {
                size: 12,
                weight: 600
              }
            }
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#1f2937',
            bodyColor: '#1f2937',
            borderColor: 'rgba(59, 130, 246, 0.2)',
            borderWidth: 1,
            cornerRadius: 8,
            padding: 12,
            callbacks: {
              label: (context) => `${context.dataset.label}: ₹${context.parsed.y} Cr`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(148, 163, 184, 0.1)'
            },
            ticks: {
              callback: (value) => `₹${value} Cr`,
              font: {
                size: 11
              },
              color: '#64748b'
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 11,
                weight: 500
              },
              color: '#64748b'
            }
          }
        }
      }
    });

    this.charts.push(chart);
  }

  private createLocationChart() {
    if (!this.locationChart?.nativeElement) return;

    const ctx = this.locationChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: this.locationRevenueData.map(d => d.location),
        datasets: [{
          label: 'Revenue',
          data: this.locationRevenueData.map(d => d.revenue / 1000000),
          backgroundColor: [
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)',
            'rgba(139, 92, 246, 0.8)',
            'rgba(107, 114, 128, 0.8)'
          ],
          borderColor: [
            '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6b7280'
          ],
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#1f2937',
            bodyColor: '#1f2937',
            borderColor: 'rgba(59, 130, 246, 0.2)',
            borderWidth: 1,
            cornerRadius: 8,
            padding: 12,
            callbacks: {
              label: (context) => {
                const location = this.locationRevenueData[context.dataIndex];
                return [
                  `Revenue: ₹${context.parsed.y} Cr`,
                  `Patients: ${location.patients.toLocaleString()}`,
                  `Growth: ${location.growth}%`
                ];
              }
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 11
              },
              color: '#64748b'
            }
          },
          y: {
            beginAtZero: true,
            grid: {
              color: 'rgba(148, 163, 184, 0.1)'
            },
            ticks: {
              callback: (value) => `₹${value} Cr`,
              font: {
                size: 11
              },
              color: '#64748b'
            }
          }
        }
      }
    });

    this.charts.push(chart);
  }

  private createPaymentChart() {
    if (!this.paymentChart?.nativeElement) return;

    const ctx = this.paymentChart.nativeElement.getContext('2d');
    if (!ctx) return;

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: this.paymentModeData.map(d => d.name),
        datasets: [{
          data: this.paymentModeData.map(d => d.value),
          backgroundColor: this.paymentModeData.map(d => d.color),
          borderWidth: 3,
          borderColor: '#ffffff',
          hoverBorderWidth: 4,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '65%',
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            titleColor: '#1f2937',
            bodyColor: '#1f2937',
            borderColor: 'rgba(59, 130, 246, 0.2)',
            borderWidth: 1,
            cornerRadius: 8,
            padding: 12,
            callbacks: {
              label: (context) => {
                const payment = this.paymentModeData[context.dataIndex];
                return [
                  `${context.label}: ${context.parsed}%`,
                  `Amount: ${this.formatAmount(payment.amount)}`
                ];
              }
            }
          }
        }
      }
    });

    this.charts.push(chart);
  }
}