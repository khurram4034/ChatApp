var currentUserKey = '';
var chatKey = '';
//////////////////////////////////////////////////////////////////
function StartChat(friendKey, friendName, friendPhoto) {    
    var friendList = { friedId: friendKey, userId: currentUserKey };

    var db = firebase.database().ref('friend_list');
    var flag = false;
    db.on('value', function (friends) {
        friends.forEach(function (data) {
            var user = data.val();
            if ((user.friedId === friendList.friedId && user.userId === friendList.userId) || ((user.friedId === friendList.userId && user.userId === friendList.friedId))) {
                flag = true;
                chatKey =data.key;
            }
        });
        if (flag === false) {
            chatKey = firebase.database().ref('friend_list').push(friendList, function (error) {
                if (error) alert(error);
                else {
                    document.getElementById('chatPanel').removeAttribute('style');
                    document.getElementById('divStart').setAttribute('style', 'display:none');
                    hideChatList();
                }
            }).getKey();
        }
        else {
            document.getElementById('chatPanel').removeAttribute('style');
            document.getElementById('divStart').setAttribute('style', 'display:none');
            hideChatList();
        }

        /////////////////////////////////////
        /// display friendname and photo

        document.getElementById('divChatName').innerHTML = friendName;
        document.getElementById('imgChat').src = friendPhoto;

        document.getElementById('messages').innerHTML = "";

        onKeyDown();
        document.getElementById('textMessage').value = "";
        document.getElementById('textMessage').focus();
        /////////////////////////////////////
        /// Display the Chat messages

        LoadChatMessages(chatKey, friendPhoto);
    });
}



//////////////////////////////////////////////////////////////////

function LoadChatMessages(chatKey, friendPhoto){
    var db = firebase.database().ref('chatMessages').child(chatKey);
    db.on('value', function(chats){
        chats.forEach(function(data){
            var messageDisplay = "";
            var chat = data.val();
            var dateTime = chat.dateTime.split(",");

            if(chat.userId !== currentUserKey){
                messageDisplay += `<div class="row">
                <div class="col-2 col-sm-1 col-md-1">
                    <img src="${friendPhoto}" class="chat-pic rounded-circle">
                </div>
                <div class="col-6 col-sm-7 col-md-7">
                    <p class="receive">
                        ${chat.msg}
                        <span class="time" title="${dateTime[0]}">${dateTime[1]}</span>
                    </p>
                    </div>
                </div>`;
            }
            else{
                messageDisplay += `<div class="row justify-content-end">
                <div class="col-6 col-sm-7 col-md-7">
                    <p class="sent">
                        ${chat.msg}
                        <span class="time" title="${dateTime[0]}">${dateTime[1]}</span>
                    </p>
                    </div>
                    <div class="col-2 col-sm-1 col-md-1">
                        <img src="${firebase.auth().currentUser.photoURL}" class="rounded-circle chat-pic">
                    </div>
                </div>`;
            }


        document.getElementById('messages').innerHTML += messageDisplay;    
        document.getElementById('messages').scrollTo(0, document.getElementById('messages').scrollHeight);

        });
    });
}


function showChatList() {
    document.getElementById('side-1').classList.remove('d-none', 'd-md-block');
    document.getElementById('side-2').classList.add('d-none');
}


function hideChatList() {
    document.getElementById('side-1').classList.add('d-none', 'd-md-block');
    document.getElementById('side-2').classList.remove('d-none');
}


///////////////////////////////////////////////////////////////////////
// Message Sending Functuon 
///////////////////////////////////////////////////////////////////////

function onKeyDown() {
    document.addEventListener('keydown', function (key) {
        if (key.which === 13) {
            SendMessage();
        }
    });
}

function SendMessage() {
    var chatMessage = {
        userId: currentUserKey,
        msg: document.getElementById('textMessage').value,
        dateTime: new Date().toLocaleString()
    };
    firebase.database().ref('chatMessages').child(chatKey).push(chatMessage, function(error){
        if(error) alert(error);
        else{
        // var message = `<div class="row justify-content-end">
        //  <div class="col-6 col-sm-7 col-md-7">
        //      <p class="sent">
        //          ${document.getElementById('textMessage').value}
        //          <span class="time">1:10PM</span>
        //      </p>
        //      </div>
        //     <div class="col-2 col-sm-1 col-md-1">
        //         <img src="${firebase.auth().currentUser.photoURL}" class="rounded-circle chat-pic">
        //     </div>
        //  </div>`;
    
        //  document.getElementById('messages').innerHTML += message;
        document.getElementById('textMessage').value = '';
        document.getElementById('textMessage').focus();
    
    
        // document.getElementById('messages').scrollTo(0, document.getElementById('messages').scrollHeight);
    }
    });

}


///////////////////////////////////////////////////////////////////////
// Sign In Function
///////////////////////////////////////////////////////////////////////

function LoadChatList(){
    var db = firebase.database().ref('friend_list');
    db.on('value', function (lists){
        document.getElementById('lstChat').innerHTML = `<li class="list-group-item" style="background-color: #f8f8f8;">
        <input type="text" placeholder="   Search or new chat " class="from-control form-rounded"> 
    </li>`;
        lists.forEach(function (data){
            var lst = data.val();
            var friendKey = '';
            if(lst.friedId === currentUserKey){
                friendKey = lst.userId;
            }
            else if (lst.userId === currentUserKey){
                friendKey = lst.friedId;
            }
            if(friendKey !== ""){

                firebase.database().ref('users').child(friendKey).on('value', function(data){
                    var user = data.val();
                    document.getElementById('lstChat').innerHTML += `<li class="list-group-item list-group-item-action" onclick="StartChat('${data.key}', '${user.name}', '${user.photoURL}')">
                    <div class="row">
                        <div class="col-md-2">
                            <img src="${user.photoURL}" class="friend-pic rounded-circle" />
                        </div>
                        <div class="col-md-10" style="cursor: pointer;">
                            <div class="name">${user.name}</div>
                            <div class="under-name">This is some message</div>
                        </div>
                    </div>
                </li>`;
                });
            }

        });
    });
}

function PopulateFriendList() {
    document.getElementById('lstFriend').innerHTML = `<div class="text-center"> 
                                                        <span class="spinner-border text-primary mt-5" style="width:7rem;height:7rem"></span>     
                                                    </div>`;

    var db = firebase.database().ref('users');
    var lst = '';
    db.on('value', function (users) {
        if (users.hasChildren()) {
            lst = `<li class="list-group-item" style="background-color: #f8f8f8;">
            <input type="text" placeholder="   Search or new chat " class="from-control form-rounded"> 
        </li>`
        }
        users.forEach(function (data) {
            var user = data.val();
            if (user.email !== firebase.auth().currentUser.email) {
                lst += `  <li class="list-group-item list-group-item-action" data-dismiss="modal" onclick="StartChat('${data.key}', '${data.name}', '${data.photoURL}')">
                <div class="row">
                    <div class="col-md-2">
                        <img src="${user.photoURL}" class=" rounded-circle friend-pic" />
                    </div>
                    <div class="col-md-10" style="cursor: pointer;">
                        <div class="name">${user.name}</div>
                    </div>
                </div>
            </li>`;
            }

        });
        document.getElementById('lstFriend').innerHTML = lst;
    });
}




function signIn() {
    var provider = new firebase.auth.GoogleAuthProvider();
    firebase.auth().signInWithPopup(provider);
}


function signOut() {
    firebase.auth().signOut();
}

function onFirebaseStateChanged() {
    firebase.auth().onAuthStateChanged(onStateChanged);
}

function onStateChanged(user) {
    if (user) {
        //alert(firebase.auth().currentUser.email + '\n' + firebase.auth().currentUser.displayName);

        var userProfile = { email: '', name: '', photoURL: '' };
        userProfile.email = firebase.auth().currentUser.email;
        userProfile.name = firebase.auth().currentUser.displayName;
        userProfile.photoURL = firebase.auth().currentUser.photoURL;

        var db = firebase.database().ref('users');
        var flag = false;
        db.on('value', function (users) {
            users.forEach(function (data) {
                var user = data.val();
                if (user.email === userProfile.email) {
                    currentUserKey = data.key;
                    flag = true;
                }

            });

            if (flag === false) {
                firebase.database().ref('users').push(userProfile, callback);
            }
            else {
                document.getElementById('imageProfile').src = firebase.auth().currentUser.photoURL;
                document.getElementById('imageProfile').title = firebase.auth().currentUser.displayName;


                document.getElementById('lnkSingnIn').style = 'display:none';
                document.getElementById('lnkSingnOut').style = '';
            }
            document.getElementById('lnkNewChat').classList.remove('disabled');

            LoadChatList();
        });

    }
    else {
        document.getElementById('imageProfile').src = 'pics/person-icon.png';
        document.getElementById('imageProfile').title = '';

        document.getElementById('lnkSingnIn').style = '';
        document.getElementById('lnkSingnOut').style = 'display:none';

        document.getElementById('lnkNewChat').classList.add('disabled');
    }
}


function callback(error) {
    if (error) {
        alert(error)
    }
    else {
        document.getElementById('imageProfile').src = firebase.auth().currentUser.photoURL;
        document.getElementById('imageProfile').title = firebase.auth().currentUser.displayName;


        document.getElementById('lnkSingnIn').style = 'display:none';
        document.getElementById('lnkSingnOut').style = '';
    }
}




///////////////////////////////////////////////////////////////////////
// Call Auth State Function
///////////////////////////////////////////////////////////////////////


onFirebaseStateChanged();