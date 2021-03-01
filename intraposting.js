/*
let channels = [];
let posts = [];
let users = [];
let fileFired = false;

const postMessage = () => {
  const post = {
    id: posts.length,
    userId: document.querySelector("#users > .selected").getAttribute("data-user-id"),
    channelId: document.querySelector("#channels > .selected").getAttribute("data-channel-id"),
    time: Date.now(),
    text: document.querySelector("#post-input").value
  }
  channels[post.channelId].posts.push(post.id);
  users[post.userId].posts.push(post.id);
  posts.push(post);
}
*/

let channels, posts, users;

document.querySelector("#file-save-button").addEventListener("click", e => {
  const data = JSON.stringify({channels, users, posts}, 2);
  const link = document.createElement("a");
  link.setAttribute("href", URL.createObjectURL(new Blob([data], {type:"text/json"})));
  link.setAttribute("download", "intrachat" + "-" + Date.now() + ".json");
  link.click();
});


document.querySelector("#file-load-button").addEventListener("click", e => {
  const loader =  document.createElement("input");
  loader.setAttribute("type", "file");
  loader.addEventListener("change", e => {
    if (loader.files.length) {
      const fr = new FileReader();
      fr.onloadend = () => {
        const data = JSON.parse(fr.result);
        ({users, posts, channels} = data);
      }
      fr.readAsText(loader.files[0]);
    }
  });
  loader.click();
});

