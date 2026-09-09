export declare class HashUtil {
    static hash(data: string, saltOrRounds?: number): Promise<string>;
    static compare(data: string, encrypted: string): Promise<boolean>;
}
