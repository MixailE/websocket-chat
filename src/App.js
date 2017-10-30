import React, { Component } from 'react';
import logo from './logo.svg';
import './App.css';

class App extends Component {
  state = {
    socketStatus: 0,
    messages: [],
    text: '',
    user: null
  }

  connetWebSocket = () => {
    this.socket = new WebSocket('ws://localhost:34567');
    this.socket.onerror = this.socketError;
    this.socket.onopen = this.socketConnected;
    this.socket.onmessage = this.socketMessage;
    this.socket.onclose = this.socketClose;
  }

  componentWillMount() {
    this.connetWebSocket();
  }

  socketError = (error) => {
    console.error('Websocket Error' + error);
    this.setState({
      socketStatus: 2,
      statusMessage: 'Websocket Error'
    })
  }

  socketConnected = (event) => {
    this.setState({
      socketStatus: 1,
      statusMessage: `Connected to: ${event.currentTarget.url}`
    })
  }

  socketClose = (event) => {
    this.setState({
      socketStatus: 0,
      statusMessage: 'Disconnected from WebSocket'
    })
  }

  socketMessage = (event) => {
    const data = JSON.parse(event.data);
    if (data.type == 'message') {
      this.setState({
        messages: [...this.state.messages, data]
      })
    } else if (data.type == 'login') {
      this.setState({
        user: data
      })
    }
  }

  socketSend = (text, e) => {
    e.preventDefault();
    if (this.state.socketStatus != 1 || !text) {
      return false;
    }
    const msg = { text, userId: this.state.user.id };

    this.socket.send(JSON.stringify(msg));
    this.setState({
      text: '',
      messages: [...this.state.messages, msg]
    })
  }

  renderMessages = () => {
    const user = this.state.user;
    return this.state.messages.map((msg, key) => (
      <li className={msg.userId != user.id ? 'received' : 'sent'} key={key}>
        <span>
          {msg.userId}
        </span>
        {msg.text}
      </li>
      )
    )
  }

  closeConnection = (e) => {
    e.preventDefault();
    this.socket.close();
  }

  handleChangeInput = (e) => {
    const text = e.target.value;
    this.setState({
      text
    })
  }

  render() {
    return (
      <div id="page-wrapper">
        <h1>WebSockets</h1>
        <div id="status">{this.state.statusMessage}</div>
        
        <ul id="messages">
          {this.renderMessages()}
        </ul>
        
        <form id="message-form">
          <textarea 
            value={this.state.text}
            id="message" 
            placeholder="Write your message here..." 
            onChange={this.handleChangeInput}></textarea>
          <button
            className="send"
            disabled={this.state.socketStatus != 1}
            onClick={(e) => this.socketSend(this.state.text, e)}>Send Message</button>
          { 
            this.state.socketStatus == 1 && 
            <button 
              id="close" 
              onClick={this.closeConnection}>Close Connection
            </button>
          }
          { 
            this.state.socketStatus != 1 && 
            <button 
              id="open" 
              onClick={this.connetWebSocket}>Connect
            </button>
          }
        </form>
      </div>
    );
  }
}

export default App;
