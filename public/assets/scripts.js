let profiles = {}
let active_confetti = false;
let seconds_message = 4;

$(document).ready(function(){
  const socket = io(location.protocol + '//' + location.host);

  socket.on('connect', (data) => {
    console.log('Connected to socket');
  });
  
  socket.on('chat', (data) => {
    add_new_message(data['data']);
  });

  socket.on('new_event', (data) => {
    add_new_event(data['data']);
  });
  
  socket.on('channel.follow', (data) => {
    document.querySelector('#marquee_last_follow').textContent = data;
    // display_message(`FOLLOW DE ${data}`, seconds_message);
    display_confetti_laterals(2);
  });

  socket.on('channel.subscribe', (data) => {
    document.querySelector('#marquee_last_1st_sub').textContent = data;
    // display_message(`SUB DE ${data}`, seconds_message);
    display_confetti_laterals(2);
  });

  socket.on('channel.subscription.message', (data) => {
    document.querySelector('#marquee_last_resub').textContent = data;
    // display_message(`RESUB DE ${data}`, seconds_message);
    display_confetti_laterals(2);
  });

  socket.on('channel.subscription.gift', (data) => {
    document.querySelector('#marquee_last_gifts').textContent = data;
    // display_message(`SUBS DE ${data}`, seconds_message);
    display_confetti_laterals(2);
  });

  socket.on('channel.cheer', (data) => {
    document.querySelector('#marquee_last_bits').textContent = data;
    // display_message(`BITS DE ${data}`, seconds_message);
    display_confetti_laterals(2);
  });

  socket.on('channel.raid', (data) => {
    document.querySelector('#marquee_last_raid').textContent = data;
    // display_message(`RAID DE ${data}`, seconds_message);
    display_confetti_laterals(2);
  });

  socket.on('channel.channel_points_custom_reward_redemption.add', (data) => {
    console.log(`last reward: ${data}`);
    // display_message(`CANJEO DE ${data}`, seconds_message);
    display_confetti_laterals(2);
  });
});

function add_new_message(data) {
  let message = DOMPurify.sanitize(data['message']);
  emotes.getTwitchEmotes(message, data['emotes']);
  
  let chat_container = document.getElementById('chat_container');
  let message_container = document.createElement("div");
  let left_container = document.createElement("span");
  let image_container = document.createElement("div");
  let right_container = document.createElement("span");
  let message_name = document.createElement("div");
  let message_text = document.createElement("span");
  let escaped_text = DOMPurify.sanitize(message);
  let escaped_name = DOMPurify.sanitize(data['name']);
  let image_elem = document.createElement("img");
  
  if (escaped_text.trim().length == 0 || escaped_name.trim().length == 0)
    return;
  
  escaped_text = emotes.getMessage(escaped_text);

  image_elem.src = data['image'];
  image_elem.className = 'message-avatar';
  message_container.className = "message-container fade-out";
  left_container.className = "left-container";
  image_container.className = "image-container";
  right_container.className = "right-container";
  message_name.className = "message-name";
  message_text.className = "message-text";
  
  image_container.appendChild(image_elem);
  message_name.innerHTML = escaped_name;
  message_text.innerHTML = escaped_text;
  left_container.appendChild(image_container);
  right_container.appendChild(message_name);
  right_container.appendChild(message_text);
  message_container.appendChild(left_container);
  message_container.appendChild(right_container);
  chat_container.insertBefore(message_container, chat_container.firstChild);

  setTimeout(function() {
    message_container.classList.add("hidden");
    setTimeout(function() {
      chat_container.removeChild(message_container);
    }, 2000);
  }, 180000);
}

function display_confetti_laterals(seconds) {
  if (!active_confetti) {
    active_confetti = true;
    var duration = seconds * 1000;
    var end = Date.now() + duration;
    (function frame() {
      confetti({
        particleCount: 5,
        angle: -40,
        spread: 90,
        origin: { x: 0, y: 0},
        colors: ['#0d2c40', '#05bb80', '#03101b', '#05bb80']
      });
      confetti({
        particleCount: 5,
        angle: -150,
        spread: 90,
        origin: { x: 0.75, y: 0},
        colors: ['#0d2c40', '#05bb80', '#03101b', '#05bb80']
      });
      confetti({
        particleCount: 5,
        angle: -90,
        spread: 180,
        origin: { x: 0.375, y: 0},
        colors: ['#0d2c40', '#05bb80', '#03101b', '#05bb80']
      });
      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
      else active_confetti = false;
    }());
  }
}

function display_message(message, seconds) {
  let message_elem = document.querySelector('#notification_message');
  console.log(message);
  message_elem.innerHTML = message;
  message_elem.classList.add("show");
  setTimeout(function() {
    message_elem.classList.remove("show");
  }, seconds * 1000);
}

function add_new_event(data) {
  console.log(data);
}