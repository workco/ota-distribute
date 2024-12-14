import ora, { Ora } from "ora";

export const logProgress = async <T>(
  text: string,
  promise:
    | Promise<T>
    | ((spinner: Pick<Ora, "info" | "warn" | "fail">) => Promise<T>),
): Promise<T> => {
  const spinner = ora(text).start();
  try {
    return await (promise instanceof Promise ? promise : promise(spinner));
  } finally {
    spinner.stop();
  }
};
