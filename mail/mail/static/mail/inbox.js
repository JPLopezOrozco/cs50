document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);

  document.querySelector('#compose-button').addEventListener('click', function(event){

    const recipients = document.querySelector('#compose-recipients').value;
    const subject = document.querySelector('#compose-subject').value;
    const body = document.querySelector('#compose-body').value;

    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body,
      })
    })
    .then(response => response.json())
  });
  


  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

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
  document.querySelector('.email-content').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(emails => {
    for (let i = 0; i < emails.length; i++) {
      const email = emails[i];
      const element = document.createElement('div')
      element.innerHTML = `
      <div class="email-container">
        <button class="email-button">
          <div class="left">
            <h3>${email.sender}</h3>
            <p>${email.subject}</p>
          </div>
          <div class="right">
            <p>${email.timestamp}</p>
          </div>
        </button>
      </div>
      `
      console.log(email)

      if(email.read){
        element.querySelector('.email-button').style.backgroundColor = 'rgb(186, 183, 182)';
      }
      

      element.querySelector('.email-button').addEventListener('click', ()=>{
        
        console.log(email)
        fetch(`/emails/${email.id}`, {
          method: 'PUT',
          body: JSON.stringify({
            read: true
          })
        });
        document.querySelectorAll('.email-container').forEach((container)=>{
          container.style.display = 'none'
        })
        document.querySelector('.email-content').style.display = 'block';
        document.querySelector('.mailbox_title').style.display = 'none'
        
        const emailContent = document.createElement('div')
        const previousEmailContent = document.querySelector('.mail');
        if (previousEmailContent) {
            previousEmailContent.remove();
        }        
        emailContent.innerHTML = `
        <div class='mail'>
        <ul>
          <li><b>From: </b>${email.sender}</li>
          <li><b>To: </b>${email.recipients}</li>
          <li><b>Subject: </b>${email.subject}</li>
          <li><b>Timestamp: </b>${email.timestamp}</li>
          </ul>
          <button class="btn btn-outline-primary reply">Reply</button>
          <button class="btn btn-outline-danger archive">Archive</button>
        <hr>
        <p>${email.body}</p>
      </div>
      `


      //archive 
      document.querySelector('.email-content').append(emailContent)
      emailContent.querySelector('.archive').addEventListener('click', () => {
        fetch(`/emails/${email.id}`, {
            method: 'PUT',
            body: JSON.stringify({
                archived: !email.archived
            })
        })
        location.reload()
    });
    if(email.archived){
      document.querySelector('.archive').textContent = 'Unarchive'
    }else{
      document.querySelector('.archive').textContent = 'Archive'
    }
      //reply

      document.querySelector('.reply').addEventListener('click',()=>{
        compose_email()
        const previousEmailContent = document.querySelector('.mail');        
        if (previousEmailContent) {
          previousEmailContent.remove();
      }
        const recipients = document.querySelector('#compose-recipients');
        const subject = document.querySelector('#compose-subject');
        const body = document.querySelector('#compose-body');
        recipients.value = `${email.sender}`;
        recipients.disabled = true;
        if(email.subject.includes('RE:')){
          subject.value = email.subject
        }else{
          subject.value = `RE: ${email.subject}`;
        }
        body.value = `
------------------------------------------------------------
        ${email.body}
        `;
        
      })     
      })

      document.querySelector('#emails-view').append(element)
    }
});


  document.querySelector('#emails-view').innerHTML = `<h3 class="mailbox_title">${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
  }
  
  


