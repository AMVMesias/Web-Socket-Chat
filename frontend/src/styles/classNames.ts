type ClassValue = string | false | null | undefined;

export const cn = (...classes: ClassValue[]) => classes.filter(Boolean).join(' ');

export const loginStyles = {
  page: 'min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-blue-500/30 selection:text-blue-200',
  background: {
    wrapper: 'fixed inset-0 z-0',
    grid: 'absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]',
    radial:
      'absolute inset-0 bg-radial-gradient from-blue-500/5 via-transparent to-transparent opacity-50',
    mask: 'absolute inset-0 bg-zinc-950 [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,transparent_0%,#000_100%)]',
    noise:
      'absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-overlay bg-[radial-gradient(circle_at_center,#ffffff_1px,transparent_1px)] bg-[size:4px_4px]',
  },
  main: 'relative z-10 mx-auto grid min-h-screen max-w-6xl grid-cols-1 gap-12 px-6 py-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center animate-in fade-in duration-1000 ease-out',
  introSection: 'space-y-12 animate-in slide-in-from-left-8 duration-700 ease-out',
  introHeader: 'relative space-y-6',
  brandIconBox:
    'relative inline-flex items-center justify-center rounded-2xl bg-blue-500/10 p-4 ring-1 ring-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)]',
  brandIcon: 'h-8 w-8 text-blue-400',
  brandPulse: 'absolute -top-1 -right-1 h-3 w-3 rounded-full bg-blue-500 blur-sm animate-pulse',
  brandContent: 'space-y-4',
  statusBadge:
    'inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500',
  statusPingBox: 'relative flex h-2 w-2',
  statusPing: 'animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75',
  statusDot: 'relative inline-flex rounded-full h-2 w-2 bg-blue-500',
  title: 'text-6xl font-black tracking-tighter text-white lg:text-7xl xl:text-8xl',
  titleAccentBox: 'relative inline-block',
  titleAccentText: 'relative z-10 text-blue-500',
  titleAccentGlow: 'absolute -inset-1 z-0 bg-blue-500/20 blur-2xl animate-pulse',
  subtitle: 'max-w-md text-lg font-medium leading-relaxed text-zinc-400',
  subtitleHighlight: 'text-zinc-200 border-b border-blue-500/30',
  joinForm:
    'group/form relative space-y-6 rounded-3xl border border-zinc-800 bg-zinc-900/40 p-10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl transition-all hover:border-zinc-700/50',
  joinFormGlow:
    'absolute -inset-0.5 rounded-3xl bg-gradient-to-br from-blue-500/20 to-purple-500/0 opacity-0 blur transition-opacity group-hover/form:opacity-100',
  field: 'relative space-y-2',
  joinLabel:
    'text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300 transition-colors group-focus-within/form:text-blue-400',
  fieldGroup: 'group/input relative',
  joinInput:
    'block w-full rounded-2xl border border-zinc-800 bg-zinc-950/50 px-5 py-4 text-sm text-white placeholder-zinc-400 outline-none transition-all focus:border-blue-500/50 focus:bg-zinc-950 focus:ring-4 focus:ring-blue-500/10',
  inputOverlay:
    'absolute inset-0 rounded-2xl bg-blue-500/5 opacity-0 transition-opacity group-focus-within/input:opacity-100 pointer-events-none',
  joinButton:
    'group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-2xl bg-blue-600 px-6 py-5 text-sm font-black uppercase tracking-widest text-white shadow-[0_10px_20px_rgba(37,99,235,0.3)] transition-all hover:-translate-y-0.5 hover:bg-blue-500 hover:shadow-[0_15px_30px_rgba(37,99,235,0.4)] active:translate-y-0 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 disabled:hover:shadow-none',
  joinButtonShine:
    'absolute inset-0 translate-x-[-100%] bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-[100%]',
  joinButtonIcon: 'h-4 w-4 relative z-10',
  joinButtonText: 'relative z-10',
  feedback: (hasError: boolean) =>
    cn(
      'rounded-2xl border px-6 py-4 text-xs font-bold animate-in fade-in zoom-in-95 duration-500 fill-mode-both',
      hasError
        ? 'border-red-500/30 bg-red-500/5 text-red-400'
        : 'border-emerald-500/30 bg-emerald-500/5 text-emerald-400',
    ),
  feedbackBody: 'flex items-center gap-3',
  feedbackDot: (hasError: boolean) =>
    cn(
      'h-2 w-2 rounded-full ring-4',
      hasError ? 'bg-red-500 ring-red-500/20' : 'bg-blue-500 ring-blue-500/20',
    ),
  actionsSection:
    'grid gap-8 animate-in slide-in-from-right-8 duration-700 ease-out delay-150 fill-mode-both',
  createForm:
    'group/create relative rounded-3xl border border-zinc-800 bg-zinc-900/30 p-8 backdrop-blur-md transition-all hover:border-zinc-700/50 hover:bg-zinc-900/40',
  panelHeader: 'mb-8 flex items-center gap-4',
  createIconBox:
    'flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800/80 ring-1 ring-zinc-700/50 transition-transform group-hover/create:scale-110 group-hover/create:rotate-3',
  createIcon: 'h-5 w-5 text-blue-400',
  panelTitle: 'text-lg font-black uppercase tracking-tight text-white',
  panelSubtitle: 'text-[10px] font-medium text-zinc-500',
  createGrid: 'grid gap-6 sm:grid-cols-[1fr_120px]',
  compactLabel: 'text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300',
  createInput:
    'block w-full rounded-xl border border-zinc-700 bg-zinc-950/30 px-4 py-3 text-sm text-white placeholder-zinc-400 focus:border-blue-400 focus:bg-zinc-950 outline-none transition-all',
  capacityInput:
    'block w-full rounded-xl border border-zinc-700 bg-zinc-950/30 px-4 py-3 text-center text-sm text-white focus:border-blue-400 focus:bg-zinc-950 outline-none transition-all',
  createButton:
    'group/btn mt-8 flex w-full items-center justify-center gap-2 rounded-xl border border-zinc-700 bg-zinc-800/50 px-5 py-4 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-all hover:border-zinc-500 hover:bg-zinc-800 disabled:opacity-60',
  createButtonIcon: 'h-3 w-3 transition-transform group-hover/btn:rotate-90',
  createButtonSpinner: 'h-3 w-3 animate-spin',
  roomsPanel: 'rounded-3xl border border-zinc-800 bg-zinc-900/40 p-8 shadow-xl backdrop-blur-sm',
  roomsHeader: 'mb-8 flex items-center justify-between',
  roomsHeaderTitleGroup: 'flex items-center gap-4',
  roomsIconBox:
    'flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-800/80 ring-1 ring-zinc-600/50',
  roomsIcon: 'h-5 w-5 text-zinc-100',
  roomsTitle: 'text-lg font-black uppercase tracking-tight text-white uppercase',
  roomsSubtitle: 'text-[10px] font-medium text-zinc-100',
  refreshButton:
    'group flex h-10 w-10 items-center justify-center rounded-full bg-zinc-800/80 text-zinc-400 ring-1 ring-zinc-700/50 hover:bg-zinc-700 hover:text-white transition-all hover:ring-zinc-500 disabled:opacity-20',
  refreshIcon: 'h-4 w-4 transition-transform duration-700 group-hover:rotate-180',
  roomList: 'max-h-72 space-y-4 overflow-y-auto pr-3 custom-scrollbar',
  emptyRooms:
    'flex flex-col items-center justify-center rounded-2xl border border-dashed border-zinc-800 py-16 text-zinc-500',
  emptyRoomsIcon: 'mb-4 h-8 w-8 opacity-20 animate-spin-slow',
  emptyRoomsText: 'text-[10px] font-black uppercase tracking-[0.3em]',
  roomButton: (isSelected: boolean, isFull: boolean) =>
    cn(
      'group relative flex w-full flex-col gap-3 rounded-2xl border p-5 text-left transition-all animate-in fade-in slide-in-from-right-4 duration-500 fill-mode-both',
      isSelected
        ? 'border-blue-400/60 bg-blue-500/10 ring-1 ring-blue-400/60 scale-[1.02]'
        : 'border-zinc-800 bg-zinc-950/80 hover:border-zinc-600 hover:bg-zinc-800/50 hover:scale-[1.01]',
      isFull && 'cursor-not-allowed opacity-40',
    ),
  roomHeader: 'flex items-center justify-between',
  roomTextGroup: 'space-y-1',
  roomName: 'block text-sm font-black text-zinc-200 group-hover:text-white transition-colors',
  roomId: 'block text-[8px] font-bold uppercase tracking-[0.2em] text-zinc-100',
  roomStats: 'flex items-center gap-3',
  roomCapacity:
    'font-mono text-[10px] font-bold text-zinc-400 group-hover:text-blue-300 transition-colors',
  roomStatusDot: (isFull: boolean) =>
    cn(
      'h-2 w-2 rounded-full shadow-[0_0_10px]',
      isFull ? 'bg-zinc-700 shadow-transparent' : 'bg-blue-400 shadow-blue-400/50 animate-pulse',
    ),
  capacityTrack: 'relative h-1 w-full overflow-hidden rounded-full bg-zinc-800',
  capacityFill: (isFull: boolean) =>
    cn(
      'absolute inset-y-0 left-0 transition-all duration-700 ease-out',
      isFull ? 'bg-zinc-600' : 'bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]',
    ),
};

export const roomStyles = {
  joinErrorButton:
    'mt-5 w-full rounded-lg bg-blue-600 px-4 py-3 text-sm font-semibold transition-colors hover:bg-blue-700',
  page: 'flex h-screen bg-gray-900 text-white',
  readerMenu:
    'fixed z-50 w-72 rounded-lg border border-gray-600 bg-gray-800 p-3 text-sm text-white shadow-2xl',
  readerMenuHeader: 'mb-2 flex items-center gap-2 font-semibold',
  readerMenuIcon: 'h-4 w-4 text-blue-300',
  readerMenuSummary: 'mb-3 text-xs text-gray-400',
  readerList: 'max-h-36 space-y-1 overflow-y-auto',
  readerListItem: 'rounded bg-gray-700 px-2 py-1',
  emptyReaders: 'rounded bg-gray-700 px-2 py-2 text-xs text-gray-300',
};

export const chatStyles = {
  panel: 'flex-1 flex flex-col min-w-0',
  messageList: 'flex-1 overflow-y-auto p-6 space-y-6',
  messageRow: (isMe: boolean) => cn('flex', isMe ? 'justify-end' : 'justify-start'),
  bubble: (isMe: boolean) =>
    cn(
      'max-w-[70%] rounded-2xl px-4 py-3 shadow-sm',
      isMe ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-100',
    ),
  senderName: 'text-xs text-gray-300 font-bold mb-1',
  messageText: 'break-words',
  metaRow: (isMe: boolean) =>
    cn(
      'flex flex-wrap items-center justify-end gap-2 mt-1 text-xs',
      isMe ? 'text-blue-100' : 'text-gray-400',
    ),
  timer: (isActive: boolean) =>
    cn('flex items-center gap-1', isActive ? 'text-orange-200' : 'text-gray-300'),
  timerIcon: 'w-3 h-3',
  readButton:
    'ml-1 flex items-center gap-1 rounded px-1 py-0.5 hover:bg-blue-500/40 focus:outline-none focus:ring-2 focus:ring-blue-200',
  readIcon: (allRead: boolean) => cn('w-4 h-4', allRead ? 'text-emerald-200' : 'text-blue-200'),
  unreadIcon: 'w-4 h-4',
  footer: 'p-4 bg-gray-800 border-t border-gray-700',
  form: 'flex gap-2',
  ttlSelect:
    'bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500',
  messageInput:
    'flex-1 bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500',
  sendButton:
    'bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 flex items-center justify-center transition-colors',
  sendIcon: 'w-5 h-5',
};

export const sideBarStyles = {
  panel: 'w-64 bg-gray-800 border-r border-gray-700 flex flex-col',
  header: 'p-4 border-b border-gray-700',
  title: 'text-xl font-bold flex items-center gap-2',
  titleIcon: 'w-5 h-5',
  username: 'text-sm text-gray-400 mt-1',
  body: 'flex-1 overflow-y-auto p-4',
  usersTitle: 'text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3',
  userList: 'space-y-2',
  userItem: 'flex items-center gap-2',
  onlineDot: 'w-2 h-2 rounded-full bg-green-500',
  footer: 'p-4 border-t border-gray-700',
  leaveButton:
    'w-full flex items-center justify-center gap-2 py-2 px-4 bg-red-600 hover:bg-red-700 rounded-lg transition-colors',
  leaveIcon: 'w-4 h-4',
};

export const errorTemplateStyles = {
  page: 'flex min-h-screen items-center justify-center bg-gray-900 p-4 text-white',
  card: 'w-full max-w-md rounded-lg border border-gray-700 bg-gray-800 p-6 shadow-xl',
  title: 'text-xl font-semibold',
  subtitle: 'mt-2 text-sm text-gray-300',
};
