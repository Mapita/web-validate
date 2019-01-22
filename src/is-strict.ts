// True when executing JS in strict mode and false otherwise.
// https://stackoverflow.com/a/10480227/4099022
export const isStrict: boolean = (
    function(this: any): boolean {return !this;}
)();
