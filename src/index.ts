import express from 'express';
// const express = require('express');
import http from 'http';
// const http = require('http');
import socket from 'socket.io';
// const socket = require('socket.io');
import { Player, ClientPlayer } from './types';
import { preparePlayer, registerClientPlayer, instancePlayer } from './utility';
import {
  EVENT_CONNECT,
  EVENT_REGISTER,
  CLIENT_EVENT_CONNECTED,
  CLIENT_EVENT_REGISTERED,
  CLIENT_EVENT_OTHER_REGISTERED
} from './constants';

// alternative port
const port = 7777;

const app = express();
const server = http.createServer(app);
const io = socket(server);

// register server to a port
server.listen(port);
app.get('/', (req, res) => res.send('The Beast Server'));

// variables
const players: Player[] = [];

// start connecting
io.on('connection', socket => {
  let currentPlayer: Player = instancePlayer();
  // connect from client
  socket.on(EVENT_CONNECT, () => {
    console.log(`new player has joined, count: ${players.length}`);
    socket.emit(CLIENT_EVENT_CONNECTED);
  });
  // register player
  socket.on(EVENT_REGISTER, (data: ClientPlayer) => {
    // map ClientPlayer to Player
    const thePlayer = preparePlayer(data);
    // register client player
    registerClientPlayer(players, thePlayer);
    // assign to currentPlayer
    currentPlayer = thePlayer;
    // emit to client registering successully
    socket.emit(CLIENT_EVENT_REGISTERED, currentPlayer);
    // emit to another clients the current player registered successfully
    socket.broadcast.emit(CLIENT_EVENT_OTHER_REGISTERED, currentPlayer);
  });
});

console.log('Server is running...');
