export class MappingBuilder {
  private _properties: Record<string, any> = {};

  constructor() {}

  addProperty(name: string, mapping: Record<string, any>) {
    this._properties[name] = mapping;
    return this;
  }

  build() {
    return {
      properties: this._properties,
    };
  }
}
