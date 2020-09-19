type HandlerFunction = (error: any, ctx: any) => void;

function handleError(ctx: any, errorClass: any, handler: HandlerFunction, error: any) {
  if (typeof handler === "function" && error instanceof errorClass) {
    handler.call(null, error, ctx);
  } else {
    throw error;
  }
}

export default (errorClass: any, handler: HandlerFunction): any => {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      try {
        const result = originalMethod.apply(this, args);

        if (result && typeof result.then === "function" && typeof result.catch === "function") {
          return result.catch((error: any) => {
            handleError(this, errorClass, handler, error);
          });
        }

        return result;
      } catch (error) {
        handleError(this, errorClass, handler, error);
      }
    };

    return descriptor;
  };
};
