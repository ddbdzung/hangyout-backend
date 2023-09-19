interface IBuilder {
  build(): any;
}

interface IDocumentBuilderV8 {
  get index(): string;
  get body(): object;
  get id(): string | null;
}

class IndexDocumentV8 {
  constructor(builder: IndexDocumentBuilderV8) {
    return [
      {
        index: {
          _index: builder.index,
          _id: builder.id,
        },
      },
      { ...builder.body },
    ];
  }
}

export class IndexDocumentBuilderV8 implements IBuilder, IDocumentBuilderV8 {
  private _index: string | null = null;
  private _body = {};
  private _id: string;

  constructor() {}

  get index(): string | null {
    return this._index;
  }

  get id(): string {
    return this._id;
  }

  get body(): object {
    return this._body;
  }

  setIndex(index) {
    this._index = index;
    return this;
  }

  setBody(data) {
    const { _id, ...rest } = data;
    if (_id) {
      rest.id = _id;
    }
    this._body = rest;
    return this;
  }

  withId(id: string) {
    this._id = id;
    return this;
  }

  build() {
    if (!this._index) {
      throw new Error('Index is required');
    }

    return new IndexDocumentV8(this);
  }
}
