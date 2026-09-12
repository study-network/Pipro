export interface IframeMessage {
  type: 'IFRAME_PATH_CHANGE' | 'PARENT_NAVIGATE' | 'PARENT_BACK' | 'PARENT_FORWARD' | 'PARENT_RELOAD';
  path?: string;
  title?: string;
}

export interface QuickLink {
  label: string;
  path: string;
  iconName: 'home' | 'library' | 'search' | 'send';
  external?: boolean;
}
