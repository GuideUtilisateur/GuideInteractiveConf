//Qu'est ce qu'un websocket ?
//Le protocole WebSocket vise à développer un canal de communication full-duplex sur un socket TCP pour les navigateurs et les serveurs web.

const express = require("express");
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);
const PORT = process.env.PORT || 5000;
var ent = require('ent'); // Permet de bloquer les caractères HTML (sécurité équivalente à htmlentities en PHP)
/*
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/";

//-----connection et insertion de 1 message avec mongoDB--//
MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var dbo = db.db("mydb");
  var myobj = { texte: "ceci est un message", date: "date du jour" };
  dbo.collection("messages").insertOne(myobj, function(err, res) {
    if (err) throw err;
    console.log("1 message insérré");
    db.close();
  });
});
*/
//----------------Fin-----------------------------------//


//Routage de base (racine) qui prend le contenu html (et autres fichiers) du repertoire home
app.use('/', express.static('home'));

//Lancer le serveur http et écoute les connection sur le port indiqué
http.listen(PORT, function(){
// Ecrit dans la console sur quel port le serveur écoute
  console.log('listening on *:' + PORT);
});

var roomno=[];

io.on('connection', function(socket){
  socket.on('creation_room', function() {// aleeeed  : alors ça marche sauf que ça ce relance pas tout seul, à voi pour l'optimisation
    var tempoId;
    var check = false;
    while(check!=true){
      var tempo = (Math.floor(Math.random() * 1000)+1);// +1 parce que il y a un problème avec l'id: 0 quand on veut rejoindre
          if (!roomno.includes(tempo)) {
            check=true;
            tempoId=tempo;
          }
    }
    roomno.push(tempoId);
    socket.join(tempoId);
    console.log("Creation d'une room ID: "+tempoId);
    io.sockets.in(tempoId).emit('connectToRoom', tempoId);
  });

  socket.on('join_room', function(id) {
    var tempoId = id;
    var check = false;
    for(var i = 0; i<roomno.length;i++){
      if(roomno[i]==id){
        console.log(roomno[i]);
        check = true;
      }
    }
    if(check) {
      console.log("join une room");
      socket.join(id)
      io.sockets.in(id).emit('connectToRoom', id);
    } else {
      console.log("pas de room avec cette id");
    }

  });

// Dès qu'on nous donne un pseudo, on le stocke en variable de session et on informe les autres personnes
  socket.on('nouveau_client', function(pseudo) {
          pseudo = ent.encode(pseudo);
          socket.pseudo = pseudo;
          socket.broadcast.emit('nouveau_client', pseudo);

      });

  //Ecrit dans la console lorsqu'un utilisateur se connecte
  console.log("un utilisateur s'est connecté");

  //Lors de l'evenement "disconnect", le socket lance la fonction
  socket.on('disconnect', function(){
    //Ecrit dans la console lorsqu'un utilisateur se déconnecte
    console.log("un utilisateur s'est déconnecté");
  });

  //Lors de l'evenement "chat message", le socket lance la fonction
  socket.on('chat message', function(id, message){
    //Ecrit dans la console le msg
    console.log(id+": "+message);
    // Dès qu'on reçoit un message, on récupère le pseudo de son auteur et on le transmet aux autres personnes
    message = ent.encode(message);
    socket.broadcast.to(id).emit('message', {pseudo: socket.pseudo, message: message});
  });

  socket.on('leave_room', function(idRoom){
    console.log("la gamin");
    socket.leave();
    console.log("Un utilisateur a quitté la room: "+idRoom);
  });

  //Sactive lors de l'appuie d'un bouton de vote
  socket.on('votes', function(pseudo, btn) {
                                                                           //temporaire, à remplacer quand la bd sera implémentée
    DicoDesVotes.add(btn, pseudo);                                           //value,key
    var tmp = DicoDesVotes.entries();                                        //
    var tmp2 = DicoDesVotes.entries();                                       //
    while (tmp.next().value != null) {                                       //
      console.log("tmp = lesVotes.entries() : tmp : " + tmp2.next().value);  //
    }                                                                        //

    socket.broadcast.emit('votes', pseudo, btn);

      });

});
