const Sauce = require('../models/sauce.js');
const fs = require('fs');

exports.getAllSauces = (req, res, next) => {
  Sauce.find()
    .then(sauces => res.status(200).json(sauces))
    .catch(error => res.status(400).json({ error }));
};

exports.getOneSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => res.status(200).json(sauce))
    .catch(error => res.status(404).json({ error }));
};

exports.createSauce = (req, res, next) => {
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  const sauce = new Sauce({
    ...sauceObject,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    likes: 0,
    dislikes: 0,
    usersLiked: [],
    usersDisliked: []
  });
  sauce.save()
    .then(() => res.status(201).json({ message: 'Sauce enregistrée !'}))
    .catch(error => res.status(400).json({ error }));
};

exports.modifySauce = (req, res, next) => {
  const sauceObject = req.file ?
    {
      ...JSON.parse(req.body.sauce),
      imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
    } : { ...req.body };
  Sauce.updateOne({ _id: req.params.id }, { ...sauceObject, _id: req.params.id })
    .then(() => res.status(200).json({ message: 'Sauce modifiée !'}))
    .catch(error => res.status(400).json({ error }));
};

exports.deleteSauce = (req, res, next) => {
  Sauce.findOne({ _id: req.params.id })
    .then(sauce => {
      const filename = sauce.imageUrl.split('/images/')[1];
      fs.unlink(`images/${filename}`, () => {
        Sauce.deleteOne({ _id: req.params.id })
          .then(() => res.status(200).json({ message: 'Sauce supprimée !'}))
          .catch(error => res.status(400).json({ error }));
      });
    })
    .catch(error => res.status(500).json({ error }));
};

exports.likeOrDislikeSauce = (req, res, next) => {
  Sauce.findOne({_id: req.params.id})
    .then((sauce) => {
      if (req.body.like === 1 && !sauce.userLiked.includes(req.body.userId)){
        Sauce.updateOne({ _id: req.params.id },{ $inc: { likes: +1 }, $push: {userLiked: req.body.userId} })
          .then(() => res.status(200).json({ message: 'sauce liked' }))
          .catch(error => res.status(400).json({ error }));
      }
      else if (req.body.like === -1 && !sauce.userDisliked.includes(req.body.userId)){
        Sauce.updateOne({ _id: req.params.id },{ $inc: { dislikes: +1 }, $push: {userDisliked: req.body.userId} })
          .then(() => res.status(200).json({ message: 'sauce disliked' }))
          .catch(error => res.status(400).json({ error }));
      }
      else if (req.body.like === 0){
        if (sauce.userLiked.includes(req.body.userId)) {
          Sauce.updateOne({ _id: req.params.id },{ $inc: { likes: -1 }, $pull: {userLiked: req.body.userId} })
            .then(() => res.status(200).json({ message: 'likes - 1' }))
            .catch(error => res.status(400).json({ error }));
        }
        if (sauce.userDisliked.includes(req.body.userId)) {
          Sauce.updateOne({ _id: req.params.id },{ $inc: { dislikes: -1 }, $pull: {userDisliked: req.body.userId} })
            .then(() => res.status(200).json({ message: 'dislikes - 1' }))
            .catch(error => res.status(400).json({ error }));
        }
      }
    })
    .catch(error => res.status(400).json({ error }));
};

/*

  exports.likeOrDislikeSauce = (req,res,next)=>{
    const like = JSON.parse(req.body.like);
    Sauce.findOne({_id : req.params.id})
    .then(sauce=>{
        if (like == 1){ // if like = 1 the user like the sauce
            if (!sauce.usersLiked.includes(req.body.userId)){
                sauce.usersLiked.push(req.body.userId);
                sauce.likes++;
            }
        }
        else if (like == -1){  // if like = -1 the user dislike the sauce
            if (!sauce.usersDisliked.includes(req.body.userId)){
                sauce.usersDisliked.push(req.body.userId);
                sauce.dislikes++;
            }
        }
        else if (like == 0){ // if like = 0 the user change his mind 
            if(sauce.usersLiked.includes(req.body.userId)){
                sauce.usersLiked.splice(sauce.usersLiked.indexOf(req.body.userId),1);
                sauce.likes--;
            }
            else if(sauce.usersDisliked.includes(req.body.userId)){
                sauce.usersDisliked.splice(sauce.usersDisliked.indexOf(req.body.userId),1);
                sauce.dislikes--;
            }
        }
        Sauce.updateOne({_id : sauce._id},{$set:{
            usersLiked:sauce.usersLiked ,
            usersDisliked : sauce.usersDisliked ,
            likes : sauce.likes , 
            dislikes : sauce.dislikes}
        })
        .then(()=> res.status(200).json({ message : 'L`utilisateur a donnée son avis'}))
        .catch(error => res.status(400).json({error}));
    })
    .catch(error => res.status(500).json({error}));
}
*/