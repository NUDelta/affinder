import {ReactiveDict} from 'meteor/reactive-dict';

const pos = require('pos')
const lexer = new pos.Lexer();
const tagger = new pos.Tagger();

Template.interactionReflection.onCreated(function() {
  this.state = new ReactiveDict();
  this.state.setDefault({
    verbs: [],
    adjectives: [],
    nouns: [],
  })
});

Template.interactionReflection.helpers({

  parsedVerbs() {
    const instance = Template.instance();
    return instance.state.get('verbs');
  }
});

Template.interactionReflection.events({
  'change #oce-description': function(e) {
    const description = e.target.value;
    console.log(description);
    const words = lexer.lex(description);
    const taggedWords = tagger.tag(words);

    const verbs = taggedWords.filter(word => ['VB', 'VBD', 'VBG', 'VBN', 'VBP', 'VBZ'].includes(word[1]));

    const instance = Template.instance();
    instance.state.set('verbs', verbs.map(word => word[0]));
  },
})