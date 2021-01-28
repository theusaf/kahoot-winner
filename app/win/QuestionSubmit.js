module.exports = (k)=>{
  const snark = ["Were you tooooooo fast?","Pure genius or guesswork?","Secret classroom superpowers?","Genius machine?","Classroom perfection?","Pure genius?","Lightning smart?"];
  k.parent.send({message:snark[Math.floor(Math.random() * snark.length)],type:"Message.QuestionSubmit"});
};
