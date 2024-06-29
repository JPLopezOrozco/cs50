document.addEventListener('DOMContentLoaded',function(){
    section = document.querySelector('.section').textContent.trim()
    const current_user = document.querySelector('#current-user').textContent.trim()
    
    console.log(section)
    console.log(current_user)
    fetch('/api/user/')
    .then(response=>response.json())
    .then(users=>{
        console.log(users)
        for(let i=0; i<users.length; i++){
            const user = users[i]
            if(user.username === current_user){
                const current_id = user.id
                show_post(section, current_user, current_id)
            }
        }
    })
    
    
    document.querySelector('.modal_post').addEventListener('click', ()=>{
        document.querySelector('.post_button').addEventListener('click', ()=>{
            post(current_user)
        })
    })
})

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        let cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}



function post(current_user){
    console.log(current_user)
    const csrftoken = getCookie('csrftoken');
    fetch('/api/user')
    .then(response=>response.json())
    .then(users=>{
        const user = users.find(user => user.username === current_user)
        const post_content = document.querySelector('.post_text').value.trim();
        console.log(user.id)
        console.log(user.username)
        console.log(post_content)
        const new_post = {
                username:user.username, 
                user: user.id,
                post_content: post_content
               }
        fetch('/api/post/',{
            method:'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrftoken
            },
            body: JSON.stringify(new_post)
        })
        .then(response=>response.json())
        .then(result=>{
            console.log(result)
            location.reload()
        })
    })

}


function show_post(section, current_user, current_id) {
    const csrftoken = getCookie('csrftoken');
    
    if (section === 'Index') {
        console.log(current_user);
        fetch(`/api/post`)
        .then(response => response.json())
        .then(posts => {
            posts.reverse();
            const postsPerPage = 10;
            let currentPage = 1;
            const totalPages = Math.ceil(posts.length / postsPerPage);

            function displayPosts(pageNumber) {
                const postBody = document.querySelector('#post_body');
                postBody.innerHTML = '';
                
                const startIndex = (pageNumber - 1) * postsPerPage;
                const endIndex = startIndex + postsPerPage;
                const currentPagePosts = posts.slice(startIndex, endIndex);
    
                currentPagePosts.forEach(post => {
                    const container = document.createElement('div');
                    container.className = 'post_container';
                    container.innerHTML = `
                        <a class="post_title user" href="${post.username}">${post.username}</a>
                        <div class="post_edit">
                            <form class="edit_form" action="">
                                <textarea class="edit_textarea">${post.post_content}</textarea>
                                <button type="button" class="btn btn-outline-dark save">Save</button>
                            </form>
                        </div> 
                        <div class="post_view">
                            <p class="post_content">${post.post_content}</p>
                            <p class="post_timestamp">${post.timestamp}</p>
                            <div class="bottom">
                                <div class="like_container">
                                    <svg class="post_like" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart-fill" viewBox="0 0 16 16">
                                        <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"/>
                                    </svg><span id="likes">${post.likes.length}</span>
                                </div>
                                <div class="edit_button">
                                    <button class="btn btn-outline-dark edit">Edit</button>
                                </div>
                            </div>
                        </div>`;
                    container.querySelector('.post_edit').style.display = 'none';
    
                    if (post.username !== current_user) {
                        container.querySelector('.edit_button').style.display = 'none';
                    }
    
                    container.querySelector('.like_container').addEventListener('click', () => {
                        like(post, current_id, csrftoken, container);
                    });
    
                    container.querySelector('.edit').addEventListener('click', () => {
                        edit(container, post, csrftoken);
                    });
    
                    postBody.appendChild(container);
                });
    
                if (currentPage <= totalPages) {
                    const pagination_container = document.createElement('div')
                    const next_button = document.createElement('button');
                    const prev_button = document.createElement('button');
                    pagination_container.className = 'paginator_container'
                    prev_button.className = 'btn btn-primary next_button'
                    prev_button.textContent = 'Previous page';
                    next_button.className = 'btn btn-primary next_button'
                    next_button.textContent = 'Next page';
                
                    prev_button.addEventListener('click', () => {
                        currentPage--;
                        displayPosts(currentPage);
                    })
                
                    next_button.addEventListener('click', () => {
                        currentPage++;
                        displayPosts(currentPage);
                    });
                
                    if (currentPage === 1) {
                        prev_button.style.display = 'none';
                    }
                
                    if (currentPage === totalPages) {
                        next_button.style.display = 'none';
                        
                    }
                    postBody.appendChild(pagination_container);
                    pagination_container.appendChild(prev_button);
                    pagination_container.appendChild(next_button);
                
                }
                
            }
    
            displayPosts(1);
        });
    
    
        
    }else if(section === 'Profile'){
        const user_profile = document.querySelector('#user_profile').textContent.trim()     



        fetch(`/api/post`)
        .then(response => response.json())
        .then(posts => {
            posts.reverse()
            const posts_user = posts.filter(p => p.username === user_profile);
            const id = posts_user[0]
            console.log(posts_user)
            if(id){
                fetch(`/api/user/${id.user}`)
                    .then(response => response.json())
                    .then(user => {
                        console.log(user)
                        const user_title = document.createElement('div')
                        user_title.className = 'user_profile'
                        user_title.innerHTML=`
                        <h2 class="user_title">${user.username}</h2>
                        <div class="profile_features">
                        <div class="buttons">
                        <button type="button" class="btn btn-danger follow_button">Follow</button>
                        </div>
                        <div>
                        <span id="followers">Followers:${user.followers.length}</span>
                        <span id="following">Following:${user.following.length}</span>
                        </div>
                        </div>
                        `
                        if(current_user===user.username){
                            user_title.querySelector('.follow_button').style.display = 'none';
                            
                        }
                        const button_value = user_title.querySelector('.follow_button')
                        user.followers
                        if(user.followers.includes(current_id)){
                            button_value.textContent = 'Unfollow'
                        }else{
                            button_value.textContent = 'Follow'
                        }
                        user_title.querySelector('.follow_button').addEventListener('click',() =>{
                            follow(current_id, user, csrftoken, button_value)
                            
                        })

                        document.querySelector('#username').append(user_title)
                    })


            }else{
                console.log('no tiene ninguna publicacion')
            }
           





            const postBody = document.querySelector('#post_body');
            postBody.innerHTML = '';
            
            const postsPerPage = 10;
            const totalPages = Math.ceil(posts_user.length / postsPerPage);
            let currentPage = 1;
            
            function displayUserPosts(pageNumber) {
                postBody.innerHTML = '';
            
                const startIndex = (pageNumber - 1) * postsPerPage;
                const endIndex = startIndex + postsPerPage;
                const currentPagePosts = posts_user.slice(startIndex, endIndex);
            
                currentPagePosts.forEach(post_user => {
                    const container = document.createElement('div');
                    container.className = 'post_container';
                    container.innerHTML = `
                        <h4 class="post_title user">${post_user.username}</h4>
                        <div class="post_edit">
                            <form class="edit_form" action="">
                                <textarea class="edit_textarea">${post_user.post_content}</textarea>
                                <button type="button" class="btn btn-outline-dark save">Save</button>
                            </form>
                        </div>  
                        <div class="post_view">
                            <p class="post_content">${post_user.post_content}</p>
                            <p class="post_timestamp">${post_user.timestamp}</p>
                            <div class="bottom">
                                <div class="like_container">
                                    <svg class="post_like" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart-fill" viewBox="0 0 16 16">
                                        <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"/>
                                    </svg><span id="likes">${post_user.likes.length}</span>
                                </div>
                                <div class="edit_button">
                                    <button class="btn btn-outline-dark edit">Edit</button>
                                </div>
                            </div>
                        </div>`;
            

            
                    container.querySelector('.post_edit').style.display = 'none';
            
                    if (post_user.username !== current_user) {
                        container.querySelector('.edit_button').style.display = 'none';
                    }
            
                    container.querySelector('.like_container').addEventListener('click', () => {
                        like(post_user, current_id, csrftoken, container);
                    });
            
                    container.querySelector('.edit').addEventListener('click', () => {
                        edit(container, post_user, csrftoken);
                    });
            
                    postBody.appendChild(container);
                });
            

            
                if (currentPage <= totalPages) {
                    const pagination_container = document.createElement('div');
                    const next_button = document.createElement('button');
                    const prev_button = document.createElement('button');
                    pagination_container.className = 'paginator_container';
                    prev_button.className = 'btn btn-primary next_button';
                    prev_button.textContent = 'Previous page';
                    next_button.className = 'btn btn-primary next_button';
                    next_button.textContent = 'Next page';
            
                    prev_button.addEventListener('click', () => {
                        currentPage--;
                        displayUserPosts(currentPage);
                    });
            
                    next_button.addEventListener('click', () => {
                        currentPage++;
                        displayUserPosts(currentPage);
                    });
            
                    if (currentPage === 1) {
                        prev_button.style.display = 'none';
                    }
            
                    if (currentPage === totalPages) {
                        next_button.style.display = 'none';
                    }
                    
                    pagination_container.appendChild(prev_button);
                    pagination_container.appendChild(next_button);
                    postBody.appendChild(pagination_container);
                }
            }
            
            displayUserPosts(1);
            
    });
}else if(section === 'Following'){
        fetch(`/api/user/${current_id}`)
        .then(response=>response.json())
        .then(user=>{
            const following = user.following
            console.log("following: ", following)
            fetch(`/api/post/`)
            .then(response=>response.json())
            .then(following_posts=>{
                following_posts.reverse()
                const posts = following_posts.filter(p => following.includes(p.user))
                for(let i=0; i<following_posts.length; i++){
                    const post = posts[i]
                    const container = document.createElement('div')
                    container.className = 'post_container'
                    container.innerHTML=`
                    <a class="post_title user" href="${post.username}">${post.username}</a>
                    <p class="post_content">${post.post_content}</p>
                    <p class="post_timestamp">${post.timestamp}</p>
                    <div class= bottom>
                    <div class="like_container">
                    <svg class="post_like" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-heart-fill" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M8 1.314C12.438-3.248 23.534 4.735 8 15-7.534 4.736 3.562-3.248 8 1.314"/>
                    </svg><span id="likes">${post.likes.length}</span>
                    </div>
                    <div class="edit_button">
                    <button class="btn btn-outline-dark edit">Edit</button>
                    <div>
                    </div>
                    `
                    if(post.username !== current_user){
                        container.querySelector('.edit_button').style.display = 'none';
                    }
                    container.querySelector('.like_container').addEventListener('click', ()=>{
                        like(post,current_id,csrftoken,container)
                    })
                    
                    document.querySelector('#post_body').append(container)                    
                }
            })
        })

    }
    }


    function like(post_user, current_id, csrftoken, container){
        const like = post_user.likes
        if(like.includes(current_id)){
            console.log('Le sacaste el like')
            const index = like.indexOf(current_id)
            like.splice(index, 1)

            fetch(`/api/post/${post_user.id}/`,{
                method:'PUT',
                headers:{
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrftoken
                },
                body: JSON.stringify({
                    post_content: post_user.post_content,
                    user: post_user.user, 
                    likes: like
                  })
            })
            .then(response=>response.json())
            .then(result=>{
                console.log(`Ahora cuenta con ${like.length}`)
                container.querySelector('#likes').textContent = like.length
                console.log(result)
            })
        }else{
            console.log('Le diste like')
            like.push(current_id)
            
            fetch(`/api/post/${post_user.id}/`,{
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'X-CSRFToken': csrftoken
                },
                body: JSON.stringify({
                    post_content: post_user.post_content,
                    user: post_user.user, 
                    likes: like
                  })
            })
            .then(response=>response.json())
            .then(result=>{
                console.log(`Ahora cuenta con ${like.length}`)
                container.querySelector('#likes').textContent = like.length
                console.log(result)
            })
        }
    }
    function follow(current_id, user, csrftoken, button_value){
        console.log(user.followers)
        console.log(current_id)
        if(user.followers.includes(current_id)){
            const index = user.followers.indexOf(current_id);
            user.followers.splice(index, 1);
            fetch(`/api/user/${user.id}/`,{
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'X-CSRFToken': csrftoken
                },
                body: JSON.stringify({
                    username:user.username,
                    following:user.following,
                    followers:user.followers
                  })   
            })
            .then(response=>response.json())
            .then(results=>{
                console.log(user.followers)
                console.log(`Ya no sigues a ${user.username}`)
                button_value.textContent = 'Follow'
                document.querySelector('#followers').textContent = `Followers:${user.followers.length}`
                console.log(results)
            })
        }else{

            user.followers.push(current_id);
            fetch(`/api/user/${user.id}/`,{
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'X-CSRFToken': csrftoken
                },
                body: JSON.stringify({
                    username:user.username,
                    following:user.following,
                    followers:user.followers
                  })   
            })
            .then(response=>response.json())
            .then(results=>{
                console.log(user.followers)
                console.log(`Estas siguiendo ${user.username}`)
                button_value.textContent = 'Unfollow'
                document.querySelector('#followers').textContent = `Followers:${user.followers.length}`
                console.log(results)
            })


        }
    }
    function edit(container, post, csrftoken){
        const post_edit = container.querySelector('.post_edit')
        const post_view = container.querySelector('.post_view')

        post_edit.style.display = 'block'
        post_view.style.display = 'none'

        container.querySelector('.save').addEventListener('click', ()=>{
            const post_content = container.querySelector('.edit_textarea').value.trim()
            
            fetch(`/api/post/${post.id}/`,{
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  'X-CSRFToken': csrftoken
                },
                body: JSON.stringify({
                    post_content: post_content,
                    user: post.user, 
                    
            })
        })
            .then(response=>response.json())
            .then(result=>{
                post_edit.style.display = 'none'
                post_view.style.display = 'block'
                container.querySelector('.post_content').textContent = result.post_content
            })
    })
    }