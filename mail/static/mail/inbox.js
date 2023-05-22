
document.addEventListener('DOMContentLoaded', function() {
// Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.getElementById('submit-compose').addEventListener('click', sendEmail);
  document.getElementById("archive").addEventListener("click", setEmailArchived);
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
  document.getElementById("email-view").style.display = "none";
  document.getElementById("archive").style.display = "none";
  document.getElementById("unarchive").style.display = "none";
  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  getEmails(mailbox);
}

function getEmails(mailbox){
  // make a fetch request here to load all the mails.
  fetch(`http://localhost:8000/emails/${mailbox}`)
  .then(response => response.json())
  .then(result => {
    let view = document.querySelector("#emails-view");
    result.forEach(element =>{
      let newDiv = document.createElement("div");
      newDiv.classList.add("inbox-email");
      if (element.read){
        newDiv.classList.add("read");
      }
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
/*
Add event listeners to email divs.
*/
function addEmailListeners(){
  let divs = document.querySelectorAll(".inbox-email");
  divs.forEach(element =>{
    element.addEventListener("click", showEmail);
  })
}
/*
Show clicked email.
*/
function showEmail(){
  document.getElementById("email-view").style.display = "block";
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector("#email-view > span").id = this.id;
  // Show archived or unarchived button on clicked email.
  getEmailById(this.id);
  isArchived(this.id);
}
function setEmailReadById(id){
  console.log("Setting email to read.");
  fetch(`http://localhost:8000/emails/${id}`,{
    method: "PUT",
    body: JSON.stringify({read: true})    
  })
}
function setEmailArchived(){
  console.log("Setting email to archived.");
  let id = document.querySelector("#email-view > span").id;
  fetch(`http://localhost:8000/emails/${id}`,{
    method: "PUT",
    body: JSON.stringify({archived: true})
  })
  .then(response => {
    load_mailbox("inbox");
  })
}
function getEmailById(id){
  fetch(`http://localhost:8000/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    console.log(email);
    document.getElementById("email-subject").innerHTML = email.subject;
    document.getElementById("email-from").innerHTML = email.sender;
    document.getElementById("email-timestamp").innerHTML = email.timestamp;
    document.getElementById("email-body").innerHTML = email.body;
    setEmailReadById(id);
  });
}
function isArchived(id){
  fetch(`http://localhost:8000/emails/${id}`)
  .then(response => response.json())
  .then(email => {
    if (email.archived){
      document.getElementById("archive").style.display = "block";
    }else{
      document.getElementById("unarchive").style.display = "block";
    }
  })
}

function sendEmail(){
  let recipients = document.getElementById("compose-recipients").value;
  let subject = document.getElementById("compose-subject").value;
  let body = document.getElementById("compose-body").value;

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
    load_mailbox("sent");
  });
}