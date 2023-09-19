export function settingAutoCompleteSearch() {
  return {
    analysis: {
      analyzer: {
        autocomplete_analyzer: {
          tokenizer: 'autocomplete',
          filter: ['lowercase'],
        },
        autocomplete_search_analyzer: {
          tokenizer: 'keyword',
          filter: ['lowercase'],
        },
      },
      tokenizer: {
        autocomplete: {
          type: 'edge_ngram',
          min_gram: 1,
          max_gram: 30,
          token_chars: ['letter', 'digit', 'whitespace'],
        },
      },
    },
  };
}

export function mappingAutoCompleteSearch() {
  return {
    type: 'text',
    fields: {
      complete: {
        type: 'text',
        analyzer: 'autocomplete_analyzer',
        search_analyzer: 'autocomplete_search_analyzer',
      },
    },
  };
}
