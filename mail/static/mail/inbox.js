
document.addEventListener('DOMContentLoaded', function() {
// Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.getElementById('submit-compose').addEventListener('click', sendEmail);
  // By default, load the inbox
  load_mailbox('inbox');
});
  
function compose_email() {
  console.log("compose email nav clicked.");
  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.getElementById("email-view").style.display = "none"
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  getEmails(mailbox);
}

function getEmails(mailbox){
  // make a fetch request here to load all the mails.
  fetch(`http://localhost:8000/emails/${mailbox}`)
  .then(response => response.json())
  .then(result => {
    console.log(result);
    let view = document.querySelector("#emails-view");
    result.forEach(element =>{
      let newDiv = document.createElement("div");
      newDiv.classList.add("inbox-email");
      newDiv.setAttribute("id", `${element.id}`)
      let from = `<span>${element.sender}</span>`;
      // let to = `<span>${element.recipients}</span>`;
      let subject = `<span>${element.subject}</span>`;
      let body = `<span>${element.body}</span>`;
      let timestamp = `<span>${element.timestamp}</span>`;
      newDiv.innerHTML = from + subject + body + timestamp;
      view.appendChild(newDiv);
    })
    addEmailListeners();
  });
}
function addEmailListeners(){
  let divs = document.querySelectorAll(".inbox-email");
  divs.forEach(element =>{
    element.addEventListener("click", showEmail);
  })
}
function showEmail(){
  document.getElementById("email-view").style.display = "block"
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  getEmailById(this.id);
}
function setEmailReadById(id){
  console.log("Setting email to read");
  fetch(`http://localhost:8000/emails/${id}`,{
    method: "PUT",
    body: JSON.stringify({read: True})    
  })
  .then(response => response.json())
  .then(resp => {
    console.log(resp);
  })
}
function setEmailArchived(id){
  console.log("Setting email to archived");
  fetch(`http://localhost:8000/emails/${id}`,{
    method: "PUT",
    body: JSON.stringify({archived: True})
  })
  .then(response => response.json())
  .then(resp => {
    console.log(resp);
  })
}
function getEmailById(id){
  console.log("fetching email details.");
  fetch(`http://localhost:8000/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    console.log(email);
    document.getElementById("email-subject").innerHTML = email.subject;
    document.getElementById("email-from").innerHTML = email.sender;
    document.getElementById("email-timestamp").innerHTML = email.timestamp;
    document.getElementById("email-body").innerHTML = email.body;
  });
}

function sendEmail(){

  console.log("clicked");
  /* Prevent form from submitting right away, let django handle routing.
  If we submit right away, fetch wont work since it is asynchronous.
  It returns a promise that it will give you back the information at some point,
  but doensn't know when. So if it happens before reload = no error. If it gets returned
  after reloading the page (and reloading all sources again) then you will get an error.
  */ 
  // https://stackoverflow.com/questions/57240628/how-to-make-a-button-call-a-function-that-uses-the-fetch-api
  //event.preventDefault();
  // using type button instead of submit
  //load_mailbox("sent");
  // console.log("going home");
  let recipients = document.getElementById("compose-recipients").value;
  let subject = document.getElementById("compose-subject").value;
  let body = document.getElementById("compose-body").value;

  console.log("sending request");
  fetch("http://localhost:8000/emails/",{
    method: "POST",
    body: JSON.stringify({
      recipients: recipients,
      subject: subject,
      body: body
    })
  })
  .then(response => response.json()) // no curly braces because returning right away
  .then(result => {
    console.log(result);
    console.log("done");
    console.log("loading sent mailbox");
    load_mailbox("sent");
  }); // curly braces, because not returning console.log
  // see if code is working, refreshes too fast
  //time.sleep(3);
}