import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';


@Component({
    selector: 'app-star',
    standalone: true,
    imports: [CommonModule, RouterOutlet],
    templateUrl: './star.component.html',
    styleUrls: ['./star.component.css']
})
export class StarComponent {

}
