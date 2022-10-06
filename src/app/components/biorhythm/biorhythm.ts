import { Component, OnInit, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { ProfilePipeModule } from '../../pipes/profile.pipe';
import * as moment from 'moment';
import { GoogleChartsModule } from 'angular-google-charts';

import { Cycle } from "./models/cycle.model";
import { Data } from "./models/data.model";
import { dateFormat } from "./date";
import { CreateLabels } from "./models/biorhythm.model";
import { Observable } from 'rxjs';

@Component({
    selector: 'app-biorhythm',
    templateUrl: './component.html',
    styleUrls: ['./component.scss'],
})
export class BiorhythmComponent implements OnInit {
    private cycles: any;

    private dataBase = {
      labels: [],
      datasets: null,
      data: []
    };

    public chartOptions: any = {}

    public chart = {};

    constructor(
        private http: HttpClient
    ) {

        this.getJSON().subscribe(data => {
            this.cycles = data;
            this.dataBase.datasets = this.createDatasets();


            this.generate({birthday: '1972-11-12', range: 10, startDate: '2022-10-05'});
            this.drawLineChart();
       });
    }

    ngOnInit() { }

    private getJSON(): Observable<any> {
       return this.http.get('assets/json/cycle.json');
     }

    private createDatasets() {
        return this.cycles.map((cycle: Cycle) => ({
            data: [],
            label: cycle.label,
            fill: false,
            borderColor: cycle.color,
            cycle: cycle.cycle,
            hidden: cycle.hidden,
        }));
    }

    private createLabels(range: number, startDate: string): CreateLabels {
        const datesChart: string[] = [];
        let datesRange: number[] = [];

        const startDateParsed = Date.parse(startDate);
        datesRange.push(startDateParsed);

        for (let before = 1; before <= range; before++) {
            const b = new Date(startDateParsed).getDate() - before;
            datesRange.push(new Date(startDateParsed).setDate(b));
        }

        for (let after = 1; after <= range; after++) {
            const a = new Date(startDateParsed).getDate() + after;
            datesRange.push(new Date(startDateParsed).setDate(a));
        }

        datesRange = datesRange.sort((a, b) => a - b);
        datesRange.forEach((date: number) => {
            const dateFormatted = dateFormat(date);
            datesChart.push(dateFormatted);
        });

      return { datesChart, datesRange };
    }

    private generate(data: Data) {
        const { birthday, range, startDate } = data;
        const birthdayDate = new Date(birthday);

        const { datesChart, datesRange } = this.createLabels(range, startDate);
        this.dataBase.labels = datesChart;

        this.dataBase.datasets.forEach((dataset: any) => {
            dataset.data = [];
            datesRange.forEach((date: number) => {
                const d = new Date(date);
                const diff = d.getTime() - birthdayDate.getTime();
                const days = diff / (1000 * 60 * 60 * 24);

                const cycle = Math.round(
                    Math.sin((2 * Math.PI * days) / dataset.cycle) * 100
                );
                dataset.data.push(cycle);
            });
        });

        // 그래프용 데이타를 새로 만든다.
        let i = 0;
        datesRange.forEach((date: number) => {
            const d = moment(new Date(date)).format('DD');
            const chart = [
                    d, // 날짜
                    this.dataBase.datasets[0].data[i], // 신체리듬
                    this.dataBase.datasets[1].data[i], // 감성리듬
                    this.dataBase.datasets[2].data[i] // 지성리듬
                ];
            this.dataBase.data.push(chart);
            i++;
        });
    }

    private drawLineChart() {
        this.chart = {
            title: '바이오리듬',
            type: 'LineChart',
            data:  this.dataBase.data,

            columnNames: ['날짜', '신체리듬', '감성리듬', '지성리듬'],
            options: {
                legend: 'bottom',
                animation: {duration: 1000, easing: 'out'},
                curveType: 'function',
                smoothline: true,
                vAxis: {minValue:0, maxValue:110}
            }
        };
    }

}


@NgModule({
    declarations: [
        BiorhythmComponent,
    ],
    imports: [
        CommonModule,
        FormsModule,
        ProfilePipeModule,
        GoogleChartsModule
    ],

    exports: [
        BiorhythmComponent
    ]
})
export class BiorhythmModule { }
