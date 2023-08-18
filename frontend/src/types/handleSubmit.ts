type sometype = ((data: Object, e?: Event) => Promise<void>, (errors: Object, e?: Event) => void) => Promise<void>;

type DataErrorHandler = (
  dataProcessor: (data: Object, e?: Event) => Promise<void>,
  errorHandler: (errors: Object, e?: Event) => void
) => Promise<void>;

type DataErrorHandler2 = (...args: [
  (data: Object, e?: Event) => Promise<void>,
  (errors: Object, e?: Event) => void
]) => Promise<void>;

type DataErrorHandler3 = (...args: [
  (data: number, e?: Event) => Promise<void>,
  (errors: Object, e?: Event) => void
]) => number;

h: DataErrorHandler3 = ( (data: number, e?: Event) => Promise<void>,  (errors: Object, e?: Event) => void)
