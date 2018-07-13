(function(root) {

   "use strict";

  function sortNumber(a,b) {
    return a - b;
  }

  var droll = {};

  // Define a "class" to represent a formula
  function DrollFormula() {
    this.formula     = "";
    this.numDice     = 0;
    this.numSides    = 0;
    this.modifier    = 0;
    this.keepNum     = 0;
    this.keepHL      = 0;
    this.multFactor  = 0;
    this.repeat      = 1;
  }

  // Define a "class" to represent the results of the roll
  function DrollResult() {
    this.formula = "";
    this.rolls    = [];
    this.total    = 0;
  }

  /**
   * Returns a string representation of the roll result
   */
  DrollResult.prototype.toString = function() {
    if (this.rolls.length === 1 && this.modifier === 0) {
      return this.rolls[0] + '';
    }

    if (this.rolls.length > 1 && this.modifier === 0) {
      return this.rolls.join(' + ') + ' = ' + this.total;
    }

    if (this.rolls.length === 1 && this.modifier > 0) {
      return this.rolls[0] + ' + ' + this.modifier + ' = ' + this.total;
    }

    if (this.rolls.length > 1 && this.modifier > 0) {
      return this.rolls.join(' + ') + ' + ' + this.modifier + ' = ' + this.total;
    }

    if (this.rolls.length === 1 && this.modifier < 0) {
      return this.rolls[0] + ' - ' + Math.abs(this.modifier) + ' = ' + this.total;
    }

    if (this.rolls.length > 1 && this.modifier < 0) {
      return this.rolls.join(' + ') + ' - ' + Math.abs(this.modifier) + ' = ' + this.total;
    }
  };

  /**
   * Parse the formula into its component pieces.
   * Returns a DrollFormula object on success or false on failure.
   */
  droll.parse = function(formula) {
    var results = [];
    //pieces = formula.match(/^([1-9]\d*)?d([1-9]\d*)([+-]\d+)?$/i);
    var words = formula.split(" ");
    //console.log(words);
    for(var i=0; i < words.length; ++i) {
      var word = words[i];
      if(word == '+' || word == '-') {
        results.push(word);
        continue;
      }
      var result = new DrollFormula();
      result.formula = word;
      var pieces = null;

      pieces = word.match(/^(([1-9]\d*)x)?\(?([1-9]\d*)?d([1-9]\d*)(K([1-9]\d*)([HL]))?(x([1-9]\d*))?([+-]\d+)?\)?$/i);
      if (!pieces) { return false; }

      result.repeat = (pieces[2]-0) || 1;
      result.numDice  = (pieces[3] - 0) || 1;
      result.numSides = (pieces[4] - 0);
      result.keepNum = (pieces[6] - 0) || result.numDice;
      if(result.keepNum > result.numDice || result.keepNum < 0) {
        console.log("You can only keep as many dice as you have!")
        return false;
      }
      result.keepHL = pieces[7]
      result.multFactor = (pieces[9] - 0) || 1;
      result.modifier = (pieces[10] - 0) || 0;

      //console.log(pieces);

      results.push(result);
    }
    //console.log(results);
    return results;
  };

  /**
   * Test the validity of the formula.
   * Returns true on success or false on failure.
   */
  droll.validate = function(formula) {
    var valid = (droll.parse(formula)) ? true : false;
    return valid;
  };

  /**
   * Roll the dice defined by the formula.
   * Returns a DrollResult object on success or false on failure.
   */
  droll.roll = function(formula) {
    var pieces = null;

    pieces = droll.parse(formula);
    if (!pieces) { return false; }

    var results = [];

    for(var i = 0; i < pieces.length; ++i) {
      if(pieces[i]=='+' || pieces[i]=='-') {
        continue;
      }
      // Roll all the dice for this command
      for(var k = 0; k < pieces[i].repeat; ++k) {
        var result = new DrollResult();
        result.formula = pieces[i].formula;
        var dice = [];
        for(var j = 0; j < pieces[i].numDice; ++j) {
          dice.push((1 + Math.floor(Math.random() * pieces[i].numSides)));
        }
        dice.sort(sortNumber);
        if(pieces[i].keepHL == 'H') {
          dice.reverse();
        }
        var total = 0;
        for(var j = 0; j < pieces[i].keepNum; ++j) {
          total += dice[j];
        }
        total *= pieces[i].multFactor;
        result.total = total + pieces[i].modifier;
        if(i > 0 && pieces[i-1]=='-') {
          result.total = -result.total;
        }
        result.rolls = dice;
        results.push(result);
      }
    }

    var sum_total = 0;
    for(var i = 0; i < results.length; ++i) {
      sum_total += results[i].total;
    }
    console.log(results);
    return sum_total;
  };

  // Export library for use in node.js or browser
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = droll;
  } else {
    root.droll = droll;
  }

}(this));
