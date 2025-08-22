import React from 'react';
import styled from 'styled-components';

const Card = () => {
  return (
    <StyledWrapper>
      <div className="card">
        <div className="background">
        </div>
        <div className="logo">
          Socials
        </div>
        <a href="#"><div className="box box1"><span className="icon"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="svg">
                <path d="M22.675 0h-21.35c-.733 0-1.325.592-1.325 1.325v21.351c0 .733.592 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.894-4.788 4.659-4.788 1.325 0 2.463.099 2.794.143v3.24l-1.918.001c-1.504 0-1.794.715-1.794 1.763v2.312h3.587l-.467 3.622h-3.12v9.293h6.116c.733 0 1.325-.591 1.325-1.324v-21.35c0-.733-.592-1.325-1.325-1.325z"/>
              </svg></span></div></a>
        <a href="##"><div className="box box2"> <span className="icon"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="svg">
                <path d="M12 0c-6.627 0-12 5.373-12 12 0 5.302 3.438 9.8 8.205 11.385-.113-.965-.213-2.448.045-3.495.234-.99 1.513-6.31 1.513-6.31s-.385-.77-.385-1.91c0-1.79 1.037-3.13 2.33-3.13 1.098 0 1.628.823 1.628 1.81 0 1.103-.702 2.75-1.064 4.276-.303 1.283.643 2.33 1.902 2.33 2.282 0 4.037-2.4 4.037-5.86 0-3.065-2.204-5.21-5.354-5.21-3.646 0-5.785 2.73-5.785 5.55 0 1.103.428 2.29.963 2.935.106.13.122.243.09.375-.1.41-.328 1.283-.373 1.46-.06.243-.195.295-.453.18-1.69-.78-2.75-3.22-2.75-5.19 0-4.23 3.073-8.12 8.86-8.12 4.64 0 8.24 3.31 8.24 7.73 0 4.6-2.89 8.3-6.91 8.3-1.35 0-2.62-.7-3.05-1.52l-.83 3.16c-.3 1.18-1.12 2.66-1.68 3.55 1.26.39 2.59.6 3.97.6 6.627 0 12-5.373 12-12s-5.373-12-12-12z"/>
              </svg></span></div></a>
        <a href="###"><div className="box box3"><span className="icon"><svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="svg">
                <path d="M20.52 3.5c-1.3-1.3-3.1-2.1-5-2.1-3.9 0-7.1 3.2-7.1 7.1 0 1.3.3 2.5.9 3.6l-1.1 4.1 4.2-1.1c1 .5 2.2.8 3.5.8 3.9 0 7.1-3.2 7.1-7.1 0-1.9-.8-3.7-2.1-5zm-5 12.6c-1.1 0-2.2-.3-3.1-.8l-2.2.6.6-2.2c-.5-.9-.8-2-.8-3.1 0-3.3 2.7-6 6-6 1.6 0 3.1.6 4.2 1.8 1.1 1.1 1.8 2.6 1.8 4.2 0 3.3-2.7 6-6 6zm3.4-4.5c-.2-.1-1.1-.5-1.2-.5-.2 0-.4-.1-.5.1-.1.2-.5.6-.6.7-.1.1-.2.1-.4 0-.2-.1-.8-.3-1.5-.9-.6-.6-.8-1.3-.9-1.5-.1-.2 0-.3.1-.4.1-.1.2-.2.3-.3.1-.1.1-.2.2-.3.1-.1.1-.2.2-.3.1-.1 0-.2 0-.3 0-.1-.5-1.2-.7-1.6-.2-.4-.3-.3-.4-.3h-.3c-.1 0-.3 0-.4.2-.1.2-.5.5-.5 1.3s.5 1.5.6 1.7c.1.2 1 1.6 2.4 2.2.3.1.5.2.7.3.3.1.6.1.8.1.2 0 .4 0 .5-.1.2-.1 1.1-.5 1.2-1 .1-.2.1-.4 0-.5z"/>
              </svg></span></div></a>
        <div className="box box4" />
      </div>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* Full viewport height to center vertically */
  .card {
    position: relative;
    width: 200px;
    height: 200px;
    background: lightgrey;
    border-radius: 30px;
    overflow: hidden;
    box-shadow: rgba(100, 100, 111, 0.2) 0px 7px 29px 0px;
    transition: all 1s ease-in-out;
    border: 2px solid rgb(255, 255, 255);
  }

  .background {
    position: absolute;
    inset: 0;
    background-color: var(--primary-color);
    background-image: linear-gradient(43deg, var(--primary-color) 0%, var(--accent-1) 46%, var(--accent-2) 100%);
  }

  .logo {
    position: absolute;
    right: 50%;
    bottom: 50%;
    transform: translate(50%, 50%);
    transition: all 0.6s ease-in-out;
    font-size: 1.3em;
    font-weight: 600;
    color: #ffffff;
    letter-spacing: 3px;
  }

  .logo .logo-svg {
    fill: white;
    width: 30px;
    height: 30px;
  }

  .icon {
    display: inline-block;
    width: 20px;
    height: 20px;
  }

  .icon .svg {
    fill: rgba(255, 255, 255, 0.797);
    width: 100%;
    transition: all 0.5s ease-in-out;
  }

  .box {
    position: absolute;
    padding: 10px;
    text-align: right;
    background: rgba(255, 255, 255, 0.389);
    border-top: 2px solid rgb(255, 255, 255);
    border-right: 1px solid white;
    border-radius: 10% 13% 42% 0%/10% 12% 75% 0%;
    box-shadow: rgba(100, 100, 111, 0.364) -7px 7px 29px 0px;
    transform-origin: bottom left;
    transition: all 1s ease-in-out;
  }

  .box::before {
    content: "";
    position: absolute;
    inset: 0;
    border-radius: inherit;
    opacity: 0;
    transition: all 0.5s ease-in-out;
  }

  .box:hover .svg {
    fill: white;
  }

  .box1 {
    width: 70%;
    height: 70%;
    bottom: -70%;
    left: -70%;
  }

  .box1::before {
    background: radial-gradient(circle at 30% 107%, var(--accent-2) 0%, var(--accent-2) 5%, var(--accent-1) 60%, var(--primary-color) 90%);
  }

  .box1:hover::before {
    opacity: 1;
  }

  .box1:hover .icon .svg {
    filter: drop-shadow(0 0 5px white);
  }

  .box2 {
    width: 50%;
    height: 50%;
    bottom: -50%;
    left: -50%;
    transition-delay: 0.2s;
  }

  .box2::before {
    background: radial-gradient(circle at 30% 107%, var(--accent-2) 0%, var(--accent-1) 90%);
  }

  .box2:hover::before {
    opacity: 1;
  }

  .box2:hover .icon .svg {
    filter: drop-shadow(0 0 5px white);
  }

  .box3 {
    width: 30%;
    height: 30%;
    bottom: -30%;
    left: -30%;
    transition-delay: 0.4s;
  }

  .box3::before {
    background: radial-gradient(circle at 30% 107%, var(--accent-2) 0%, var(--accent-1) 90%);
  }

  .box3:hover::before {
    opacity: 1;
  }

  .box3:hover .icon .svg {
    filter: drop-shadow(0 0 5px white);
  }

  .box4 {
    width: 10%;
    height: 10%;
    bottom: -10%;
    left: -10%;
    transition-delay: 0.6s;
  }

  .card:hover {
    transform: scale(1.1);
  }

  .card:hover .box {
    bottom: -1px;
    left: -1px;
  }

  .card:hover .logo {
    transform: translate(70px, -52px);
    letter-spacing: 0px;
  }
`;

export default Card;