export interface NapiConfigurationRegister<Data = unknown> {
  (config: NapiConfiguration): Data;
}

export class NapiConfiguration {
  private static instance: NapiConfiguration;

  private env: Record<string, unknown> = {};

  private constructor() {
    this.parseEnv();
  }

  private parseEnv() {
    if (typeof process === 'undefined' || typeof process.env === 'undefined') {
      return;
    }

    Object.entries(process.env).forEach(([key, value]) => {
      this.env[key] = value;
    });

    return this;
  }

  private async loadRegister(register: Record<string, NapiConfigurationRegister>) {
    await Promise.all(
      Object.entries(register).map(async ([key, regFn]) => {
        const value = await regFn(this);
        this.env[key] = value;
      })
    )
   
    return this;
  }

  get<Type = string>(key?: string, defaultValue?: Type): Type | undefined {
    if (!key) {
      return this.env as Type;
    }

    const value = this.env[key];

    if (value === undefined) {
      return defaultValue;
    }

    if (typeof value !== "string") {
      return value as Type;
    }

    if (["true", "false"].includes(value.toLowerCase())) {
      return (value.toLowerCase() === "true") as Type;
    }

    const asNumber = Number(value);

    if (
      !Number.isNaN(asNumber) &&
      Number.isFinite(asNumber) &&
      asNumber !== Infinity &&
      asNumber !== -Infinity &&
      asNumber >= Number.MIN_SAFE_INTEGER &&
      asNumber <= Number.MAX_SAFE_INTEGER
    ) {
      return asNumber as Type;
    }

    return value as Type;
  }

  static initialize(register: Record<string, NapiConfigurationRegister> = {}) {
    if (!NapiConfiguration.instance) {
      NapiConfiguration.instance = new NapiConfiguration();
    }

    return NapiConfiguration.instance.loadRegister(register);
  }
}
