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
  private rpcRequestId = 0;

  constructor(private router: Router) {}

  ngOnInit(): void {
    window.addEventListener('message', this.handleMessage.bind(this));
    // Автоматический запрос контекста пользователя при инициализации iframe-клиента
    this.requestUserContext();
  }

  private handleMessage(event: MessageEvent) {
    const data = event.data;

    // Старый протокол с ручными кредами (username/password)
    if (data?.type === 'xroad_iframe') {
      this.iframeUrl = event.origin;
      const trview_login = localStorage.getItem('trview_login');
      if (trview_login === 'test') {
        this.router.navigate(['/trading']);
      } else {
        const { password, username } = data?.credential || {};
        if (password === 'testusersuperpasword2026' && username === 'test') {
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
      return;
    }

    // Новый JSON-RPC протокол get_user_context
    if (data && data.jsonrpc === '2.0' && data.result) {
      // В демо запоминаем origin родителя, если он ещё не известен
      if (!this.iframeUrl) {
        this.iframeUrl = event.origin;
      }
      this.handleUserContext(data.result);
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
  sendMessageToParent(message: any): void {
    if (window.parent) {
      const targetOrigin = this.iframeUrl || '*'; // В продакшене укажите конкретный origin
      window.parent.postMessage(message, targetOrigin);
    } else {
      console.warn('No parent window found for messaging');
    }
  }

  // Отправка JSON-RPC запроса get_user_context (client -> parent)
  requestUserContext(): void {
    this.rpcRequestId += 1;
    const requestId = String(this.rpcRequestId);
    const message = {
      jsonrpc: '2.0',
      method: 'get_user_context',
      id: requestId,
    };
    this.sendMessageToParent(message);
  }

  // Обработка результата get_user_context (parent -> client)
  private handleUserContext(result: { username?: string; roles?: string[] }): void {
    const username = result?.username ?? '';
    const roles = Array.isArray(result?.roles) ? result.roles : [];

    const allowedUsers = ['xroad', 'testUser'];
    const allowedRoles = ['is_superuser', 'iframe'];

    const hasAllowedRole = roles.some((role) => allowedRoles.includes(role));
    const isAllowedUser = allowedUsers.includes(username);

    if (isAllowedUser || hasAllowedRole) {
      // Успешный автоматический логин по контексту пользователя
      this.sendMessageToParent({
        type: 'success-notify',
        data: `auto auth to trading view as ${username || 'unknown user'}`,
      });
      this.router.navigate(['/trading']);
      // Сохраняем флаг логина (используем username, но можно оставить 'test' для полной обратной совместимости)
      localStorage.setItem('trview_login', username || 'auto');
    } else {
      // Нет нужных ролей / пользователь не входит в список допущенных
      this.sendMessageToParent({ type: 'close-connection' });
      this.router.navigate(['/not-permited']);
    }
  }
}

