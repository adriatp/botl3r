class Emotes {
  constructor() {
    //  https://api.betterttv.net/3/cached/frankerfacez/emotes/global
    //  https://api.betterttv.net/3/cached/emotes/global
    //  https://api.7tv.app/v2/emotes/global
    this.emotes = new Map();
    this.getExternEmotes();
  }

  getTwitchEmotes(message, twitch_emotes) {
    if (twitch_emotes === null) return;
    for (const [key, value] of Object.entries(twitch_emotes)) {
      if (!this.emotes.has(key)) {
        let pos = value[0].split('-').map(Number)
        let code = message.substring(pos[0],pos[1]+1);
        this.emotes.set(code, {});
        this.emotes.get(code)['url'] = `<img src="https://static-cdn.jtvnw.net/emoticons/v2/${key}/default/dark/3.0" class="twitch-emote">`;
        this.emotes.get(code)['overlap'] = false;
      }
    }
  }

  getExternEmotes() {
    //  BTTV GLOBAL
    fetch('https://api.betterttv.net/3/cached/emotes/global')
    .then(response => response.json())
    .then(data => data.forEach(e => {
      this.emotes.set(e.code, {});
      this.emotes.get(e.code)['url'] = `<img src="https://cdn.betterttv.net/emote/${e.id}/3x" class="modified-emote">`;
      this.emotes.get(e.code)['overlap'] = [
        "5e76d338d6581c3724c0f0b2", 
        "5e76d399d6581c3724c0f0b8", 
        "567b5b520e984428652809b6", 
        "5849c9a4f52be01a7ee5f79d", 
        "567b5c080e984428652809ba", 
        "567b5dc00e984428652809bd", 
        "58487cc6f52be01a7ee5f205", 
        "5849c9c8f52be01a7ee5f79e"
      ].includes(e.id);
    }))
    .catch(error => console.error(error))

    //  7TV GLOBAL
    fetch('https://api.7tv.app/v2/emotes/global')
    .then(response => response.json())
    .then(data => data.forEach(e => {
      this.emotes.set(e.name, {});
      this.emotes.get(e.name)['url'] = `<img src="${e.urls.at(-1)[1]}" class="modified-emote">`;
      this.emotes.get(e.name)['overlap'] = e.visibility_simple.includes("ZERO_WIDTH");
    }))
    .catch(error => console.error(error))
    
    //  7TV CHANNEL
    fetch('https://api.7tv.app/v2/users/768068723/emotes')
    .then(response => response.json())
    .then(data => data.forEach(e => {
      this.emotes.set(e.name, {});
      this.emotes.get(e.name)['url'] = `<img src="${e.urls.at(-1)[1]}" class="modified-emote">`;
      this.emotes.get(e.name)['overlap'] = e.visibility_simple.includes("ZERO_WIDTH");
    }))
    .catch(error => console.error(error))

    //  FFZ GLOBAL
    fetch('https://api.betterttv.net/3/cached/frankerfacez/emotes/global')
    .then(response => response.json())
    .then(data => data.forEach(e => {
      this.emotes.set(e.code, {});
      let url = e.images['4x'] || e.images['2x'] || e.images['1x'];
      this.emotes.get(e.code)['url'] = `<img src="${url}" class="modified-emote">`;
      this.emotes.get(e.code)['overlap'] = false;
    }))
    .catch(error => console.error(error))
  }

  getMessage(message) {
    let words = message.split(' ');
    let spans = [];
    let i=0;
    while (i<words.length) {
      //  Letra
      if (!this.emotes.has(words[i])) {
        let text_span = [];
        text_span.push(words[i]);
        while (i<words.length-1 && !this.emotes.has(words[i+1])) {
          i++;
          text_span.push(words[i]);
        }
        spans.push(`<span class="text-fragment">${text_span.join(' ')}</span>`)
      }
      //  Emote
      else {
        let emote_span = [];
        emote_span.push(this.emotes.get(words[i])['url']);
        while (i<words.length-1 && this.emotes.has(words[i+1]) && this.emotes.get(words[i+1])['overlap']) {
          i++;
          emote_span.push(`<span class="overlap">${this.emotes.get(words[i])['url']}</span>`);
        }
        spans.push(`<div class="emote-fragment">${emote_span.join(' ')}</div>`)
      }
      i++;
    }
    return spans.join('');
  }
}

const emotes = new Emotes();