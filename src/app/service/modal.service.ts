import { Injectable, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { DialogService, DynamicDialogRef } from 'primeng/dynamicdialog';

// Components
import { ChatDialogComponent } from '../customer/chat-dialog/chat-dialog.component';
import { VideoDialogComponent } from '../video/video-dialog/video-dialog.component';
import { UserInfoModalComponent } from '../customer/user-info-modal/user-info-modal.component';

// Services
import { ChatService } from './chat.service';
import { VideoService } from './video.service';
import { UserInfoService } from './user-info.service';

@Injectable({
  providedIn: 'root'
})
export class ModalService implements OnDestroy {
  private refs: { [key: string]: DynamicDialogRef } = {};
  private routeSub!: Subscription;
  private basePath: string | null = null;
  private currentZIndex = 10000;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private dialogService: DialogService,
    private chatService: ChatService,
    private videoService: VideoService,
    private userInfoService: UserInfoService
  ) {}

  /** Call this in AppComponent ngOnInit */
  initListener() {
    this.routeSub = this.route.queryParamMap.subscribe(paramMap => {
      if (!this.basePath && paramMap.keys.length > 0) {
        this.basePath = this.router.url.split('?')[0];
      }

      const modalStr = paramMap.get('modal'); // "[chat,video,userinfo]"
      const idStr = paramMap.get('paramsId'); // "[8,2,9]"

      if (!modalStr || !idStr) {
        this.closeAllModals();
        return;
      }

      // Parse arrays using []
      const modalTypes = modalStr.replace(/[\[\]]/g, '').split(',').filter(Boolean);
      const ids = idStr.replace(/[\[\]]/g, '').split(',').map(i => parseInt(i, 10)).filter(n => !isNaN(n));

      if (modalTypes.length !== ids.length) return;

      // Build current requested modals
      const requested = modalTypes.map((type, idx) => ({ type, id: ids[idx] }));

      // Close removed modals
      Object.keys(this.refs).forEach(key => {
        if (!requested.some(m => `${m.type}-${m.id}` === key)) {
          this.refs[key]?.close();
          delete this.refs[key];
        }
      });

      // Open new modals
      requested.forEach(m => {
        const key = `${m.type}-${m.id}`;
        if (!this.refs[key]) {
          this.openModal(m.type, m.id);
        }
      });
    });
  }

  ngOnDestroy() {
    if (this.routeSub) this.routeSub.unsubscribe();
    this.closeAllModals();
  }

  /** Add a modal */
  addModal(type: string, id: number) {
    const params = { ...this.route.snapshot.queryParams };
    const modalStr = params['modal'] || '[]';
    const idStr = params['paramsId'] || '[]';

    const modalArr = modalStr.replace(/[\[\]]/g, '').split(',').filter(Boolean);
    const idArr = idStr.replace(/[\[\]]/g, '').split(',').filter(Boolean);

    if (!modalArr.includes(type) || !idArr.includes(id.toString())) {
      modalArr.push(type);
      idArr.push(id.toString());
    }

    this.router.navigate([], {
      queryParams: {
        modal: `[${modalArr.join(',')}]`,
        paramsId: `[${idArr.join(',')}]`
      },
      queryParamsHandling: 'merge'
    });
  }

  /** Close a modal */
  closeModal(type: string, id: number) {
    const params = { ...this.route.snapshot.queryParams };
    const modalStr = params['modal'] || '[]';
    const idStr = params['paramsId'] || '[]';

    let modalArr = modalStr.replace(/[\[\]]/g, '').split(',').filter(Boolean);
    let idArr = idStr.replace(/[\[\]]/g, '').split(',').filter(Boolean);

    const index = modalArr.findIndex((t: string, idx: number) => t === type && idArr[idx] === id.toString());

    if (index !== -1) {
      modalArr.splice(index, 1);
      idArr.splice(index, 1);
    }

    this.router.navigate([], {
      queryParams: {
        modal: modalArr.length ? `[${modalArr.join(',')}]` : null,
        paramsId: idArr.length ? `[${idArr.join(',')}]` : null
      },
      queryParamsHandling: 'merge'
    });
  }

  /** Open modal dynamically */
  private openModal(type: string, id: number) {
    let component: any;
    let data: any = null;
    const zIndex = ++this.currentZIndex;

    switch (type.toLowerCase()) {
      case 'chat':
      case 'chatmodal':
        component = ChatDialogComponent;
        const customer = this.chatService.getUsers().find(c => c.id === id);
        if (!customer) return;
        data = { userId: customer.id, name: customer.name, avatar: customer.avatar };
        break;

      case 'video':
      case 'videomodal':
        component = VideoDialogComponent;
        const video = this.videoService.getVideoById(id);
        if (!video) return;
        data = video;
        break;

      case 'userinfo':
      case 'infomodal':
        component = UserInfoModalComponent;
        const user = this.userInfoService.getCustomers().find(c => c.id === id);
        if (!user) return;
        data = { customer: user };
        break;

      default:
        return;
    }

    const ref = this.dialogService.open(component, {
      data,
      header: data?.name || data?.title || '',
      style: { width: '60vw', maxWidth: '1200px', height: '70vh' },
      modal: true,
      dismissableMask: true,
      baseZIndex: zIndex,
      closable: true
    });

    this.refs[`${type}-${id}`] = ref;

    ref.onClose.subscribe(() => {
      delete this.refs[`${type}-${id}`];
      this.closeModal(type, id);
      if (Object.keys(this.refs).length === 0) this.checkReturnBasePath();
    });
  }

  private closeAllModals() {
    Object.values(this.refs).forEach(r => r.close());
    this.refs = {};
    this.currentZIndex = 10000;
  }

  private checkReturnBasePath() {
    if (Object.keys(this.refs).length === 0 && this.basePath) {
      this.router.navigate([this.basePath]);
      this.basePath = null;
    }
  }
}
