import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { allUserRoutes, host } from '../utils/APIRoutes';
import ContactsList from '../components/ContactsList';
import WelcomeMessage from '../components/WelcomeMessage';
import ChatContainer from '../components/ChatContainer';
import { io } from 'socket.io-client';

const ChatPage = () => {
  const socket = useRef();
  const navigate = useNavigate();
  const [contacts, setContacts] = useState([]);
  const [currentUser, setCurrentUser] = useState(undefined);
  const [currentChat, setCurrentChat] = useState(undefined);
  const [isLoaded, setIsLoaded] = useState(false);

  const checkCurrentUser = async () => {
    if (!localStorage.getItem('chat-app-user')) {
      navigate('/login');
    } else {
      setCurrentUser(await JSON.parse(localStorage.getItem('chat-app-user')));
      setIsLoaded(true);
    }
  };

  useEffect(() => {
    checkCurrentUser();
  }, []);

  useEffect(() => {
    if (currentUser) {
      socket.current = io(host);
      socket.current.emit('add-user', currentUser._id);
    }
  }, [currentUser]);

  const checkUserRegistration = async () => {
    if (currentUser) {
      if (currentUser.isAvatarImageSet) {
        const { data } = await axios.get(`${allUserRoutes}/${currentUser._id}`);
        setContacts(data);
      } else {
        navigate('/setAvatar');
      }
    }
  };

  useEffect(() => {
    checkUserRegistration();
  }, [currentUser]);

  const handleChatChange = (chat) => {
    setCurrentChat(chat);
  };

  return (
    <Container>
      <div className="container">
        <ContactsList
          contacts={contacts}
          currentUser={currentUser}
          changeChat={handleChatChange}
        />
        {isLoaded && currentChat === undefined ? (
          <WelcomeMessage currentUser={currentUser} />
        ) : (
          currentUser && (
            <ChatContainer
              currentChat={currentChat}
              currentUser={currentUser}
              socket={socket}
            />
          )
        )}
      </div>
    </Container>
  );
};

const Container = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 1rem;
  align-items: center;
  background-color: #131324;
  .container {
    height: 85vh;
    width: 85vw;
    background-color: #00000076;
    display: grid;
    grid-template-columns: 25% 75%;
    @media screen and (min-width: 720px) and (max-width: 1080px) {
      grid-template-columns: 35% 65%;
    }
  }
`;

export default ChatPage;
