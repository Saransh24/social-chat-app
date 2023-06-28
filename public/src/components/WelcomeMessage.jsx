import React from 'react';
import styled from 'styled-components';
import Robot from '../assets/robot.gif';

const WelcomeMessage = ({ currentUser }) => {
  return (
    <Container>
      <img src={Robot} alt="Robot" />
      <h1>
        Welcome, <span>{currentUser.username}!</span>
      </h1>
      <h3>Select a chat to socialize.</h3>
    </Container>
  );
};

const Container = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  color: white;

  img {
    height: 20rem;
  }

  span {
    color: #4e00ff;
  }
`;

export default WelcomeMessage;
