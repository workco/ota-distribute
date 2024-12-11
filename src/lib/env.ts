export const getEnvRequired = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`ENV: ${key} is required`);
  }
  return value;
};
