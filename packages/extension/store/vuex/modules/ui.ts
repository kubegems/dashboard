const ui = {
  state: {
    SidebarDrawer: null,
    Progress: false,
    Confirm: {},
    SidebarColor: 'white',
    SidebarBg: '',
    SnackBar: {},
    Circular: false,
    SidebarKey: '',
    Scale: 1,
    DialogActive: false,
    PanelActive: false,
    FullDialogActive: false,
    SelfOut: false,
  },
  mutations: {
    SET_DIALOG(state: { [key: string]: any }, payload: boolean) {
      state.DialogActive = payload;
    },
    SET_PANEL(state: { [key: string]: any }, payload: boolean): void {
      state.PanelActive = payload;
    },
    SET_FULL_DIALOG(state: { [key: string]: any }, payload: boolean): void {
      state.FullDialogActive = payload;
    },
    SET_SIDEBAR_DRAWER(state: { [key: string]: any }, payload: any): void {
      state.SidebarDrawer = payload;
    },
    SET_CONFIRM(
      state: { [key: string]: any },
      {
        title,
        content,
        doFunc,
        param,
        doClose = () => {
          return;
        },
      }: { [key: string]: any },
    ): void {
      state.Confirm = {
        title,
        content,
        doFunc,
        param,
        value: true,
        doClose,
      };
    },
    SET_CONFIRM_STATUS(state: { [key: string]: any }, paload: { [key: string]: any }): void {
      if (state.Confirm.content && state.Confirm.content.type === 'batch_delete') {
        state.Confirm.content.status[paload.key] = paload.value;
      }
    },
    SET_PROGRESS(state: { [key: string]: any }, payload: boolean): void {
      state.Progress = payload;
    },
    SET_SCALE(state: { [key: string]: any }, payload: number): void {
      state.Scale = payload;
    },
    SET_CIRCULAR(state: { [key: string]: any }, payload: boolean): void {
      state.Circular = payload;
    },
    SET_SNACKBAR(state: { [key: string]: any }, { text, color }: { [key: string]: any }): void {
      if (!color) {
        return;
      }
      let icon = 'mdi-information';
      switch (color) {
        case 'success':
          icon = 'mdi-information';
          break;
        case 'warning':
          icon = 'mdi-alert';
          break;
        case 'error':
          icon = 'mdi-close-circle';
          break;
      }
      state.SnackBar = { text, color, value: true, collapse: true, icon: icon };
    },
    SET_SIDEBAR_KEY(state: { [key: string]: any }): void {
      state.SidebarKey = new Date().toJSON();
    },
  },
  actions: {},
  getters: {},
};

export default ui;
