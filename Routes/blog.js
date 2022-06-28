const fetchuser = require('../middleware/fetchuser');

const express = require('express');

const Blog = require('../models/Blogs');

const router = express.Router();

const User = require('../models/User');

const multer = require('multer');

const upload = require('../middleware/multer_upload')

const fs = require('fs')

router.post('/Addblog', fetchuser, upload.single('blogimage'), async (req,res)=>{

    try {
        const author = await User.findById(req.user.id);

        
        const blogdata = {...req.body}
        
        if(Object.keys(blogdata).length === 0) { return res.status(400).json({status:false,msg:"All fields are required"})}
        
        if(!req.file){
            return res.status(400).json({status:false,msg:"Atleast one image should be selected.."})
        }

        const newblog = new Blog

        ({...req.body,
            author_name:author.name1,
            user:req.user.id,
            blogimg:req.file.filename}
        );
    
        newblog.save();

        if(newblog){

            res.json({status:true,'msg':"blog added successfully!"}) 
        }
    

    } catch (error) {
        res.status(500).json({error:"Some error occured",reason:error.message})
    }

})

router.put('/Update_blog/:id',async (req,res)=>{

    const update_blog = await Blog.findByIdAndUpdate(req.params.id,{$set:{...req.body}})

    res.json({status:true,msg:"Updated sucessfully.."});
})

router.delete('/Delete_blog/:id',async (req,res)=>{
    try {
        const del_blog = await Blog.findByIdAndDelete(req.params.id)
    
        res.json({status:"success","msg":"Your blog has been removed successfully.."})
        
    } catch (error) {
        res.status(400).json({error:error.message}) 
    }
})

router.put('/Addcomments/:id',fetchuser,async(req,res)=>{
    const user = await User.findById(req.user.id);

    const {comment} = req.body;

    if(!comment){return res.status(400).json({status:false,"msg":"plz write something before posting!"})}

    const comm_id = Math.random() * 10; 

    const comm_blog = await Blog.findByIdAndUpdate(req.params.id,{$push:{Comments:{name:user.name1,comment,comm_id,Clikearr:[],Cdislikearr:[],Replyarr:[]}}})
    
    const blog = await Blog.findById(req.params.id);

    res.status(200).json({status:true,msg:"Comment added to this blog sucsessfully!",blog})
})

router.put('/like_Comment/:id',fetchuser,async(req,res)=>{

    try {
        
        const blog_by_id = await Blog.findById(req.params.id);

        const remove_dislike = await Blog.updateOne({"_id":req.params.id,"Comments.comm_id":req.body.comm_id},{$pull:{"Comments.$.Cdislikearr":req.user.id}});

        let  bloglike;

        if(blog_by_id.Comments[req.body.comm_index]["Clikearr"].includes(req.user.id)){
            bloglike = await Blog.updateOne({"_id":req.params.id,"Comments.comm_id":req.body.comm_id},{$pull:{"Comments.$.Clikearr":req.user.id}});
        }
        else{
            bloglike = await Blog.updateOne({"_id":req.params.id,"Comments.comm_id":req.body.comm_id},{$push:{"Comments.$.Clikearr":req.user.id}});

        }

        res.json({bloglike})
    

    } catch (error) {
        res.status(500).json({error:"Some error occured",reason:error.message})
        
    }
})

router.put('/dislike_Comment/:id',fetchuser,async(req,res)=>{

    try {
        
        const blog1 = await Blog.findById(req.params.id);

        const remove_like = await Blog.updateOne({"_id":req.params.id,"Comments.comm_id":req.body.comm_id},{$pull:{"Comments.$.Clikearr":req.user.id}});

        let  blogdislike;

        if(blog1.Comments[req.body.comm_index]["Cdislikearr"].includes(req.user.id)){

            blogdislike = await Blog.updateOne({"_id":req.params.id,"Comments.comm_id":req.body.comm_id},{$pull:{"Comments.$.Cdislikearr":req.user.id}});
        }
        else{

            blogdislike = await Blog.updateOne({"_id":req.params.id,"Comments.comm_id":req.body.comm_id},{$push:{"Comments.$.Cdislikearr":req.user.id}});

        }

        res.json({blogdislike})
    

    } catch (error) {
        res.status(500).json({error:"Some error occured",reason:error.message})
        
    }
})

router.put('/Delete_comment/:id',async (req,res)=>{

    const{comm_id} = req.body

    const del_comm = await Blog.findByIdAndUpdate(req.params.id,{$pull:{ Comments :{comm_id}}})

    console.log(comm_id)

    res.json({status:"success",msg:"Comment deleted successfully"})
})

router.put('/like_Blog/:id',fetchuser,async (req,res)=>{
    const blog = await Blog.findById(req.params.id);

    const remove_dislike = await Blog.findByIdAndUpdate(req.params.id,{$pull:{Bdislikearr:req.user.id}})

    if(blog.Blikearr.includes(req.user.id)){
        const remove_like = await Blog.findByIdAndUpdate(req.params.id,{$pull:{Blikearr:req.user.id}})
    }
    else{
        const add_like = await Blog.findByIdAndUpdate(req.params.id,{$push:{Blikearr:req.user.id}})
    }

    res.json({status:"success",msg:"Liked the blog..."})
})

router.put('/dislike_Blog/:id',fetchuser,async (req,res)=>{
    const blog = await Blog.findById(req.params.id);

    const remove_like = await Blog.findByIdAndUpdate(req.params.id,{$pull:{Blikearr:req.user.id}})

    if(blog.Bdislikearr.includes(req.user.id)){
        const remove_dislike = await Blog.findByIdAndUpdate(req.params.id,{$pull:{Bdislikearr:req.user.id}})
    }
    else{
        const add_dislike = await Blog.findByIdAndUpdate(req.params.id,{$push:{Bdislikearr:req.user.id}})
    }

    res.send("DisLiked the blog...")
})

router.get('/Allblogs',async (req,res)=>{
    const allblogs = await Blog.find({});

    if(!allblogs){ return rea.status(400).json({status:false,msg:"no user has posted the blog yet.."}) }

    res.json({status:true,allblogs})
})

router.get('/blogs_by_category/:category',async(req,res)=>{
    let category = req.params.category;
    const blogs_by_category = await Blog.find({category})

    if(blogs_by_category.length === 0){ return res.status(404).json({status:false,msg:"The blogs of this category is not added yet.."}) }

    res.json({status:true,blogs_by_category})
})

router.get('/blog_by_id/:id',async (req,res)=>{

    // console.log(blogid)
    try {
        const blogid = req.params.id;
        const blog_by_id = await Blog.findById(blogid);
    
        res.json({status:"success",blog_by_id})
        
    } catch (error) {
        res.status(400).json({error:error.message})
    }
})



module.exports = router