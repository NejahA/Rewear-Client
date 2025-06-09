import React, { useEffect, useState } from "react";
import ScrollToBottom from "react-scroll-to-bottom";
import "./Chat.css"
import {v4 as uuidv4} from 'uuid';

function Chat({ socket, ownerid ,user, room }) {
  const [currentMessage, setCurrentMessage] = useState("");
  const [messageList, setMessageList] = useState([]);
  // const room=`${ownerid}${user._id}`
  const [sent,setSent] = useState(false)
  useEffect (()=>{
    if ( ownerid && user._id ) {
      console.log("room ==>",room);
      // const room = `${ownerid}+${userid}`
      // const userid=user._id
      const username =user.fName
      socket.emit('join_room', {room,username});
    }

  },[])
  const sendMessage = async ( ) => 
  {
  
    if (currentMessage !== "") {
      const messageData = {
        id: uuidv4(),
        room: room,
        author: user.fName,
        message: currentMessage,
        isSent:true,
        time:
          new Date(Date.now()).getHours() +
          ":" +
          new Date(Date.now()).getMinutes(),
        };

      
      await socket.emit("send_message", messageData) ;
      console.log("send socekt",socket);
      setMessageList((list) => [...list, messageData]);
    //   setMessageList(messageList.filter((obj, index, array) =>
    //   array.findIndex((item) => item.id === obj.id) === index
    // ));
  //     setMessageList(messageList.filter((obj, index, self) =>
  //     index === self.findIndex((o) => o[id] === obj[id])
  //   )
  // );
      
      console.log("messageData  ==>" ,messageData);
      setCurrentMessage("");
    }
  };
  
  useEffect(() => {
    socket.on("receive_message", (data) => {
    console.log("receive socket",socket);
    setMessageList((list) => [...list, data]);
  //   setMessageList(messageList.filter((obj, index, array) =>
  //   array.findIndex((item) => item.id === obj.id) !== index
  // )); 
  //   setMessageList(messageList.filter((obj, index, self) =>
  //     index === self.findIndex((o) => o[id] === obj[id])
  //   )
  // );
  });
    
  }, []);

  return (
    <div className="chat-window">
      <div className="chat-header">
        <p>Live Chat</p>
      </div>
      <div className="chat-body">
        
              <div className="chat-body">
        <ScrollToBottom className="message-container">
          {messageList.filter((obj, index, array) =>
      array.findIndex((item) => item.id === obj.id) === index
    ).map((messageContent) => {
            return (
              <div
                className="message"
                id={user.fName === messageContent.author ? "you" : "other"}
              >
                <div>
                  <div className="message-content">
                    <p>{messageContent.message}</p>
                  </div>
                  <div className="message-meta">
                    <p id="time">{messageContent.time}</p>
                    <p id="author">{messageContent.author}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </ScrollToBottom>
      </div>
            
      <div className="chat-footer">
        <input
          type="text"
          value={currentMessage}
          placeholder="Hey..."
          onChange={(event) => {
            setCurrentMessage(event.target.value);
          }}
          onKeyPress={(event) => {
            event.key === "Enter" && sendMessage();
          }}
        />
        <button onClick={sendMessage}>&#9658;</button>
      </div>
    </div>
    </div>
  );
}

export default Chat;
