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
    coreActions: "these core actions",
    coreQualities: "these core qualities",
    similarActions: "other similar actions",
  })
});

Template.interactionReflection.helpers({

  parsedVerbs() {
    const instance = Template.instance();
    return instance.state.get('verbs');
  },

  coreActions() {
    const instance = Template.instance();
    return instance.state.get('coreActions');
  },

  coreQualities() {
    const instance = Template.instance();
    return instance.state.get('coreQualities');
  },

  similarActions() {
    const instance = Template.instance();
    return instance.state.get('similarActions');
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
  'change #input-actions': function(e) {
    const coreActions = e.target.value;
    const instance = Template.instance();
    instance.state.set('coreActions', coreActions);
  },
  'change #input-qualities': function(e) {
    const coreQualities = e.target.value;
    const instance = Template.instance();
    instance.state.set('coreQualities', coreQualities);
  },
  'change #expand-actions': function(e) {
    const similarActions = e.target.value;
    const instance = Template.instance();
    instance.state.set('similarActions', similarActions);
  }
})