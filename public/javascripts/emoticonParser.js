/*
 * Parse text for known emoticon tokens and replace with
 * image tags.
 *
 * @author brianstarke (brian.starke@gmail.com)
 *
 * Free to use under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */

var EmoticonParser = {
  emoticonMap:{
    bear:'bear.gif',
    beer:'beer.gif',
    flex:'flex.gif',
    n:'no.gif',
    party:'party.gif',
    penis:'penis.gif',
    poolparty:'poolparty.gif',
    rock:'rock.gif',
    y:'yes.gif'
  },

  parse:function (text) {
    while (this.getEmoticonTag(text)) {
      var a = this.getEmoticonTag(text);

      text = text.substring(0, a.s) + "<img src='/images/emoticons/" + a.tag + "'/>" + a.e;
    }

    return text;
  },

  getEmoticonTag:function (text) {
    var startIdx = text.indexOf('(');
    var endIdx = text.indexOf(')', startIdx);
    var tag = text.substring(startIdx + 1, endIdx);

    if (startIdx === -1 || this.emoticonMap[tag] === undefined) {
      return false;
    } else {
      return {tag:this.emoticonMap[tag], s:startIdx, e:text.substring(endIdx + 1)};
    }
  },

  getAllEmoticons:function () {
    return this.emoticonMap;
  }
};