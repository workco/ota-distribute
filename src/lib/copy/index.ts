export interface Copier {
  baseUrl: string;
  copy(dir: string): Promise<void>;
}
