/*
  TODO:
  edit users
  edit channels
  edit and delete posts
  enhance scroller behavior
  refine stylesheet
  
  I'M CONSIDERING:
  media embeds, eg youtube
  markdown
*/

let channels = [];
let posts = [];
let users = [];
let fileFired = false;

const renderChannel = (channel) => {
  let element = document.createElement("div");
  element.setAttribute("data-channel-id", channel.id);
  element.classList.add("channel-name");
  element.addEventListener("click", selectChannel);
  element.innerText = channel.name;
  document.querySelector("#channels").appendChild(element);
  element = document.createElement("div");
  element.classList.add("scroller");
  element.setAttribute("data-channel-id", channel.id);
  element.style.display = "none";
  document.querySelector("#scroller-area").appendChild(element);
}

document.querySelector("#channel-submit").addEventListener("click", e => {
  // NEW CHANNEL
  const name = document.querySelector("#channel-input").value;
  if (channels.map(e => e.name).indexOf(name) > -1 || !name) return;
  const channel  = {id: channels.length, name:name, posts:[]};
  channels.push(channel);
  renderChannel(channel);
  selectChannel({target:{getAttribute:()=> channel.id}});
});

const renderUser = (user) => {
  const root = document.createElement("div");
  root.classList.add("user");
  root.setAttribute("data-user-id", user.id); // three times? i'm doing something wrong.
  root.addEventListener("click", selectUser);
  // the clickable username
  let span = document.createElement("span");
  span.innerText = user.name;
  span.classList.add("user-name");
  span.style.color = user.color;
  span.setAttribute("data-user-id", user.id);
  root.appendChild(span);
  // the clickable edit button
  span = document.createElement("span");
  span.classList.add("user-edit-button");
  span.setAttribute("data-user-id", user.id);
  span.innerText = "⚙";
  span.addEventListener("click", editUser);
  root.appendChild(span);
  document.querySelector("#users").appendChild(root);
}

document.querySelector("#user-submit").addEventListener("click", e => {
  // NEW USER
  const name = document.querySelector("#user-name").value;
  if (users.map(e => e.name).indexOf(name) > -1){
    window.alert("they already exist!");
    return
  }
  const user = {id:users.length,name:name,color:document.querySelector("#user-color").value,posts:[]};
  users.push(user);
  renderUser(user);
  selectUser({target:{getAttribute:()=>user.id}});
});

document.querySelector("#post-input").addEventListener("keydown", e => {
  if (e.keyCode === 13) {
    e.preventDefault();
    postMessage();
    e.target.value = "";
  }
});

const selectChannel = (e) => {
  try {
    const oldChannel = document.querySelector("#channels > .selected");
    oldChannel.classList.remove("selected");
    oldChannel.classList.add("unselected");
    document.querySelector(`#scroller-area > [data-channel-id="${oldChannel.getAttribute("data-channel-id")}"]`).style.display = "none";
  } catch (error) {
  }
  const cid = e.target.getAttribute("data-channel-id");
  document.querySelector(`#channels > [data-channel-id="${cid}"]`).classList.remove("unselected");
  document.querySelector(`#channels > [data-channel-id="${cid}"]`).classList.add("selected");
  document.querySelector(`#scroller-area > [data-channel-id="${cid}"]`).style.display = "block";
}

const selectUser = (e) => {
  const id = e.target.getAttribute("data-user-id");
  try {
    const oldUser = document.querySelector("#users > .selected");
    oldUser.classList.remove("selected");
    oldUser.classList.add("unselected");
    oldUser.querySelector(".user-edit-button").style.display = "none";
  } catch (error) {
  }
  const newUser = document.querySelector(`.user[data-user-id="${id}"]`)
  newUser.classList.remove("unselected");
  newUser.classList.add("selected");
  newUser.querySelector(".user-edit-button").style.display = "inline";
  document.querySelector("#user-name").value = users[id].name;
}

const renderPost = (post) => {
  const element = document.createElement("div");
  element.classList.add("post");
  element.setAttribute("data-post-id", post.id);
  element.innerHTML = `<span class="post-time">${new Date(post.time).toTimeString().split(/ GMT/)[0]}</span> <span class="post-name" style="color:${post.user.color}">${post.user.name}:</span> <span class="post-text">${post.text}</span>`;
  return element;
}

const postMessage = () => {
  const post = {
    id: posts.length,
    user: users[document.querySelector("#users > .selected").getAttribute("data-user-id")],
    channel: channels[document.querySelector("#channels > .selected").getAttribute("data-channel-id")],
    time: Date.now(),
    text: document.querySelector("#post-input").value
  }
  post.channel.posts.push(post.id);
  post.user.posts.push(post.id);
  posts.push(post);
  const scroller = document.querySelector(`.scroller[data-channel-id="${post.channel.id}"]`)
  scroller.appendChild(renderPost(post));
  scroller.scrollTop = scroller.scrollHeight;
}


document.querySelector("#save-chat-button").addEventListener("click", e => {
  const data = JSON.stringify({channels:channels, users:users, posts: posts});
  const link = document.createElement("a");
  link.setAttribute("href", URL.createObjectURL(new Blob([data], {type:"text/json"})));
  link.setAttribute("download", "intrachat" + "-" + Date.now() + ".json");
  link.click();
  fileFired = true;
});

document.querySelector("#load-chat-button").addEventListener("click", e => {
  if (fileFired){
    window.alert("for now you gotta refresh before loading will work again");
    return
  }
  if (!document.querySelector("#load-chat-input").files.length){
    alert("gotta select a file before loading it!");
    return
  }
  const fr = new FileReader();
  fr.onloadend = e => {
    const data = JSON.parse(fr.result);
    users = data.users;
    posts = data.posts;
    channels = data.channels;
    let scroller;
    for (let user of users){
      renderUser(user);
    }

    for (let channel of channels){
      renderChannel(channel);
      scroller = document.querySelector(`.scroller[data-channel-id="${channel.id}"`);
      if (!channel.posts.length){
        break;
      }
      const thesePosts = channel.posts.map(e => posts[e]);
      for (let post of thesePosts){
        scroller.append(renderPost(post));
      }
    }
  }
  fr.readAsText(document.querySelector("#load-chat-input").files[0]);
  fileFired = true;
});

document.querySelector("#inspector-exit").addEventListener("click", e => {
  document.querySelector("#inspector").style.display = "none";
  document.querySelector("#shade").style.display = "none";
})

const editUser = (e) => {
  document.querySelector("#shade").style.display = "block";
  document.querySelector("#inspector").style.display = "grid";
  const user = users[e.target.getAttribute("data-user-id")];
  document.querySelector("#inspector-title").innerText = user.name;
  document.querySelector("#inspector-title").style.color = user.color;
  document.querySelector("#inspector-color").value = user.color;
  document.querySelector("#inspector-name-input").value = user.name;
  document.querySelector("#inspector-info").innerText = `${user.posts.length} posts`
  document.querySelector("#inspector-submit").setAttribute("data-user-id", user.id);
}

document.querySelector("#inspector-submit").addEventListener("click", e => {
  const user = users[e.target.getAttribute("data-user-id")];
  user.color = document.querySelector("#inspector-color").value;
  user.name = document.querySelector("#inspector-name-input").value;
  document.querySelector("#user-color").value = user.color;
  document.querySelector(`.user-name[data-user-id="${user.id}"]`).innerText = user.name;
  document.querySelector(`.user-name[data-user-id="${user.id}"]`).style.color = user.color;
  document.querySelector("#user-name").value = user.name;
  editUser(e);
})