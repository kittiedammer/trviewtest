import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  template: `
    <div>
      <div style="background: white">
        <h2>test notify</h2>
        <label
          ><input
            type="radio"
            name="msgType"
            [(ngModel)]="type"
            [value]="'error-notify'"
          />
          error</label
        >
        <label
          ><input
            type="radio"
            name="msgType"
            [(ngModel)]="type"
            [value]="'success-notify'"
          />
          success</label
        >
      </div>
      <input type="text" [(ngModel)]="text" />
      <button (click)="testMessage()">test message</button
      ><button (click)="closeConnection()">close from iframe</button>
    </div>
    <router-outlet></router-outlet>
  `,
  styleUrl: './app.component.scss',
  imports: [RouterOutlet, FormsModule],
})
export class AppComponent implements OnInit {
  iframeUrl: string = '';
  text = '';
  type: 'error-notify' | 'success-notify' = 'error-notify';

  constructor(private router: Router) {}

  ngOnInit(): void {
    window.addEventListener('message', this.handleMessage.bind(this));
  }

  private handleMessage(event: MessageEvent) {
    if (event.data?.type === 'xroad_iframe') {
      this.iframeUrl = event.origin;
      const trview_login = localStorage.getItem('trview_login');
      if (trview_login === 'test') {
        this.router.navigate(['/trading']);
      } else {
        const { password, username } = event.data?.credential;
        if (password === 'aUuKuKu!' && username === 'test') {
          this.sendMessageToParent({
            type: 'success-notify',
            data: "you're auth to trading view",
          });
          this.router.navigate(['/trading']);
          localStorage.setItem('trview_login', 'test');
        } else {
          this.sendMessageToParent({ type: 'close-connection' });
          this.router.navigate(['/not-permited']);
        }
      }
    }
  }

  testMessage() {
    if(this.text?.length) this.sendMessageToParent({ type: this.type, data: this.text });
  }

  closeConnection() {
    localStorage.removeItem('trview_login');
    this.sendMessageToParent({ type: 'close-connection' });
  }

  // Основной метод отправки сообщений
  sendMessageToParent(message: { type: string; data?: string }): void {
    if (window.parent) {
      window.parent.postMessage(message, this.iframeUrl); // В продакшене укажите конкретный origin
    } else {
      console.warn('No parent window found for messaging');
    }
  }
}

