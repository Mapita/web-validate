export declare class ValueError extends Error {
    constructor(message: string);
    toJSON(): {
        [key: string]: any;
    };
}
export default ValueError;
