import { Logger } from '@nestjs/common';
import { REQUIRED_ENVS } from 'src/common/const';

export const checkEnvs = (envs: Partial<typeof REQUIRED_ENVS>) => {
  const getEnvs = envs.map((env) => ({ [env]: process.env[env] ?? null }));

  const missingEnvs = getEnvs.filter((env) => Object.values(env)[0] === null);

  if (missingEnvs.length) {
    Logger.error(
      `Missing environment variables: ${missingEnvs
        .map((env) => Object.keys(env)[0])
        .join(', ')}`,
    );

    return process.exit(1);
  }
};
