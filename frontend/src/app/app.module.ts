import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

// Material
import { MatToolbarModule }          from '@angular/material/toolbar';
import { MatSidenavModule }          from '@angular/material/sidenav';
import { MatListModule }             from '@angular/material/list';
import { MatIconModule }             from '@angular/material/icon';
import { MatButtonModule }           from '@angular/material/button';
import { MatMenuModule }             from '@angular/material/menu';
import { MatTooltipModule }          from '@angular/material/tooltip';
import { MatSnackBarModule }         from '@angular/material/snack-bar';
import { MatProgressSpinnerModule }  from '@angular/material/progress-spinner';
import { MatDividerModule }          from '@angular/material/divider';
import { MatChipsModule }            from '@angular/material/chips';
import { MatBadgeModule }            from '@angular/material/badge';
import { MatDialogModule }           from '@angular/material/dialog';
import { MatProgressBarModule }      from '@angular/material/progress-bar';
import { MatFormFieldModule }        from '@angular/material/form-field';
import { MatInputModule }            from '@angular/material/input';
import { MatCardModule }             from '@angular/material/card';
import { MatTableModule }            from '@angular/material/table';
import { MatPaginatorModule }        from '@angular/material/paginator';
import { MatSortModule }             from '@angular/material/sort';
import { MatSelectModule }           from '@angular/material/select';
import { RouterModule }              from '@angular/router';

import { AppRoutingModule }    from './app-routing.module';
import { AppComponent }        from './app.component';
import { SidebarComponent }    from './shared/components/sidebar/sidebar.component';
import { HeaderComponent }     from './shared/components/header/header.component';
import { ConfirmDialogComponent } from './shared/components/confirm-dialog/confirm-dialog.component';
import { JwtInterceptor }      from './core/interceptors/jwt.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    SidebarComponent,
    HeaderComponent,
    ConfirmDialogComponent
  ],
  imports: [
    BrowserModule, BrowserAnimationsModule, HttpClientModule, CommonModule,
    FormsModule, ReactiveFormsModule, AppRoutingModule,
    RouterModule,
    MatToolbarModule, MatSidenavModule, MatListModule, MatIconModule,
    MatButtonModule, MatMenuModule, MatTooltipModule, MatSnackBarModule,
    MatProgressSpinnerModule, MatDividerModule, MatChipsModule, MatBadgeModule,
    MatDialogModule, MatProgressBarModule, MatFormFieldModule, MatInputModule,
    MatCardModule, MatTableModule, MatPaginatorModule, MatSortModule, MatSelectModule
  ],
  providers: [{ provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true }],
  bootstrap: [AppComponent]
})
export class AppModule {}
