var fs = require('fs'),
    mongoose = require('mongoose'),
    word = require('../model/word');

mongoose.connect('mongodb://localhost/youdao');

var inject = function(spell, trans) {
    word.findOne({ spell: spell}, function(err, doc) {
        if (doc) {
        } else {
            wordData = { 
                spell: spell,
                trans: trans
            };
            newWord = new word(wordData);
            console.log(newWord);
            newWord.save();
        }
    });
}

var subBefore = function(str, reg) {
    var index = str.indexOf(reg);
    if (index != -1) {
        return str.substring(0, index);
    } else {
        return str;
    }
}

fs.readFile('./cet4.json', function(err, data) {
    var json = JSON.parse(data),
        words = json.wordbook.item;
    var wordData,
        newWord;
    for (var i = 0; i < words.length; i++) {
        if (words[i].trans.length) {
            var trans = words[i].trans;
            trans = trans.replace(/\w+\.?/g, '###');
            trans = trans.replace(/^###/g, '');
            trans = trans.replace(/\[.+\]/g, '');
            trans = trans.replace(/（[^()]+）/g, '').trim();
            trans = subBefore(trans, '###');
            trans = subBefore(trans, '；');
            trans = subBefore(trans, '，');
            trans = subBefore(trans, ',');
            inject(words[i].word, trans);
        }
    }
});
