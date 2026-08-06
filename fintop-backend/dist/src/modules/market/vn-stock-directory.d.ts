export interface StockDirectoryEntry {
    symbol: string;
    exchange: 'HOSE' | 'HNX' | 'UPCOM';
    industry: string;
    companyName: string;
}
export declare const VN_STOCK_DIRECTORY: Record<string, StockDirectoryEntry>;
